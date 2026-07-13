/**
 * 游戏状态管理 — 丧尸末日生存
 * 使用 Vue 3 reactive 集中管理所有游戏状态
 */

import { reactive, computed } from 'vue'
import { clamp, randInt } from './utils.js'
import { scenes } from '../data/index.js'
import type { GameState, Item } from '../types'

/**
 * 创建初始游戏状态
 */
export function createInitialState(): GameState {
  return {
    // === 游戏阶段 ===
    phase: 'start',         // 'start' | 'playing' | 'dialogue' | 'ending'
    mode: 'roguelike',      // 'roguelike' | 'easy'
    saveSlot: null,         // 简单模式的存档数据

    // === 核心指标 ===
    hp: 100,
    maxHp: 100,
    hunger: 80,
    maxHunger: 100,
    thirst: 85,
    maxThirst: 100,
    sanity: 90,
    maxSanity: 100,
    infection: 0,
    maxInfection: 100,

    // === 时间 ===
    dayCount: 0,            // 游戏内天数（小数，0.5 = 半天）
    actionCount: 0,         // 行动次数

    // === 背包 ===
    inventory: [],          // [{...item}, ...]
    maxInventory: 12,        // 基础容量（背包可额外拓展）

    // === 当前场景 ===
    currentScene: null,     // 当前场景 id
    currentSituation: null, // 当前情况 id
    lastSituationId: null,  // 上次情况 id（避免重复）
    currentModifiers: [],   // 当前生效的修饰条件
    currentOptions: [],     // 当前可用选项
    currentEventText: '',   // 当前事件完整文本
    sceneActionCount: 0,    // 当前场景已触发的行动次数
    scenesVisited: [],      // 已访问过的场景 id 列表（避免短时间重复）

    // === 日志 ===
    journal: [],            // [{text, time, type}, ...] 最近 30 条

    // === 遗留标签（影响后续事件） ===
    legacyTags: [],

    // === NPC 相关 ===
    npcsMet: [],            // 遇到过的 NPC id 列表
    npcRelations: {},       // {npcId: trustValue}
    currentDialogue: null,  // 当前对话 {npcId, nodeId}

    // === 战斗 ===
    inCombat: false,
    combatState: null,      // {enemy, playerHP, enemyHP, ...}

    // === 统计 ===
    kills: 0,
    itemsCollected: 0,
    npcsHelped: 0,
    distanceTraveled: 0,

    // === 特殊标记 ===
    sacrificeTriggered: false,
    safeZoneJoined: false,
    radioContactMade: false,
    labDiscovered: false,

    // === 休息/疲劳 ===
    hoursAwake: 0,          // 累计清醒小时数（需休息）

    // === UI 状态 ===
    showInventory: false,
    showJournal: false,
    showMap: false,

    // === 战斗内部 ===
    _combatNextRoundBonus: 1.0,
    _isOverweight: false,
  }
}

/**
 * 创建游戏状态并返回
 */
export function createGameState(): GameState {
  return reactive(createInitialState()) as unknown as GameState
}

/**
 * 重置游戏状态（新游戏）
 */
export function resetGameState(state) {
  const fresh = createInitialState()
  Object.assign(state, fresh)
}

/**
 * 获取当前有效背包容量
 */
export function getEffectiveCapacity(state) {
  let capacity = state.maxInventory
  const backpacks = state.inventory.filter(i => i.id === 'backpack')
  capacity += backpacks.reduce((sum, bp) => sum + (bp.effects.capacityBonus || 0) - 1, 0)
  return capacity
}

/** 计算当前背包已用格数（基于物品 slots × 数量） */
export function getUsedSlots(state) {
  let used = 0
  for (const item of state.inventory) {
    used += (item.slots ?? 2) * (item._count || 1)
  }
  return used
}

/**
 * 添加物品到背包（基于占格数判断）
 */
export function addToInventory(state, item) {
  const slots = item.slots ?? 2
  const capacity = getEffectiveCapacity(state)
  const hardLimit = capacity + 4
  // 可堆叠物品尝试堆叠
  if (item.stackable) {
    const existing = state.inventory.find(i => i.id === item.id)
    if (existing) {
      if (getUsedSlots(state) + slots > hardLimit) return false
      existing._count = (existing._count || 1) + 1
      state.itemsCollected++
      return true
    }
  }
  if (getUsedSlots(state) + slots > hardLimit) {
    return false
  }
  state.inventory.push({ ...item, _count: item.initialStack || 1 })
  state.itemsCollected++
  return true
}

/**
 * 从背包移除物品
 */
export function removeFromInventory(state, itemId, count = 1) {
  const idx = state.inventory.findIndex(i => i.id === itemId)
  if (idx === -1) return false
  const item = state.inventory[idx]
  if (item.stackable && item._count > count) {
    item._count -= count
  } else {
    state.inventory.splice(idx, 1)
  }
  return true
}

/**
 * 使用物品
 */
/**
 * 处理 events 数组中的事件（供物品使用、机遇、situation 选项共用）
 */
export function processEvents(state, events: string[], effects?: Record<string, any>) {
  for (const evt of events) {
    if (evt === 'clear_fatigue') state.hoursAwake = 0
    if (evt === 'heal_40_percent_missing') {
      const missing = state.maxHp - state.hp
      const heal = Math.ceil(missing * 0.4)
      state.hp = clamp(state.hp + heal, 0, state.maxHp)
      if (effects) effects.hp = heal
    }
    if (evt === 'unlock_all_scenes') {
      for (const id of Object.keys(scenes)) {
        if (!state.scenesVisited.includes(id)) state.scenesVisited.push(id)
      }
    }
    if (evt === 'rest_sleep_hours') {
      const sleepHours = randInt(8, 10)
      state.dayCount += sleepHours / 24
      if (effects) effects.sleepHours = sleepHours
    }
  }
}

export function useItem(state, itemId) {
  const idx = state.inventory.findIndex(i => i.id === itemId)
  if (idx === -1) return null
  const item = state.inventory[idx]
  const effects = { ...item.effects }

  // 应用效果
  if (effects.hp) state.hp = clamp(state.hp + effects.hp, 0, state.maxHp)
  if (effects.hunger) state.hunger = clamp(state.hunger + effects.hunger, 0, state.maxHunger)
  if (effects.thirst) state.thirst = clamp(state.thirst + effects.thirst, 0, state.maxThirst)
  if (effects.sanity) state.sanity = clamp(state.sanity + effects.sanity, 0, state.maxSanity)
  if (effects.infection) state.infection = clamp(state.infection + effects.infection, 0, state.maxInfection)
  if (effects.stopBleeding) state._bleeding = false
  // 处理特殊事件
  if (item.events) processEvents(state, item.events, effects)

  // 非可复用物品移除
  if (!item.reusable) {
    removeFromInventory(state, itemId)
  }

  return effects
}

/**
 * 修改玩家指标
 */
export function modifyStat(state, stat, amount) {
  switch (stat) {
    case 'hp':
      state.hp = clamp(state.hp + amount, 0, state.maxHp)
      break
    case 'hunger':
      state.hunger = clamp(state.hunger + amount, 0, state.maxHunger)
      break
    case 'thirst':
      state.thirst = clamp(state.thirst + amount, 0, state.maxThirst)
      break
    case 'sanity':
      state.sanity = clamp(state.sanity + amount, 0, state.maxSanity)
      break
    case 'infection':
      state.infection = clamp(state.infection + amount, 0, state.maxInfection)
      break
  }
}

/**
 * 添加日志条目
 */
let _journalEntryId = 0
export function addJournalEntry(state, text, type = 'narrative') {
  state.journal.push({
    text,
    time: state.dayCount,
    type,
    id: ++_journalEntryId,
    turnId: state.actionCount,  // 当前回合 ID
  })
  // 只保留最近 30 条
  if (state.journal.length > 30) {
    state.journal.shift()
  }
}
