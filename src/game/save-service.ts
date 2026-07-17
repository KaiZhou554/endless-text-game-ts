/**
 * 存档服务 — 基于 localStorage 的游戏进度持久化
 *
 * 设计要点：
 * - 双自动存档槽位（循环覆盖，降低损坏风险）
 * - 简单模式额外提供手动存档槽位
 * - 排除纯 UI 状态和运行时引用，只持久化游戏数据
 * - 版本号用于未来存档格式兼容
 */

import type { GameState } from '../types'

// ==================== 常量 ====================

/** 存档格式版本 — 不兼容时修改此值 */
const SAVE_VERSION = 1

/** localStorage 键名前缀 */
const KEY_PREFIX = 'etg'

export const SAVE_KEYS = {
  autosave0: `${KEY_PREFIX}_autosave_0`,
  autosave1: `${KEY_PREFIX}_autosave_1`,
  manual: `${KEY_PREFIX}_manual_save`,
} as const

// ==================== 类型 ====================

/** 存入 localStorage 的持久化数据（排除 UI 和运行时状态） */
export interface SaveData {
  version: number
  timestamp: number        // 保存时的 Unix 毫秒时间戳
  mode: 'roguelike' | 'easy'

  // 核心指标
  hp: number
  maxHp: number
  hunger: number
  maxHunger: number
  thirst: number
  maxThirst: number
  sanity: number
  maxSanity: number
  infection: number
  maxInfection: number

  // 时间
  dayCount: number
  actionCount: number

  // 背包
  inventory: any[]
  maxInventory: number

  // 场景
  currentScene: string | null
  currentSituation: string | null
  lastSituationId: string | null
  currentModifiers: any[]
  currentEventText: string
  sceneActionCount: number
  scenesVisited: string[]

  // 日志（最近 30 条）
  journal: any[]

  // 笔记线索
  clues: any[]

  // 标记
  legacyTags: string[]

  // NPC
  npcsMet: string[]
  npcRelations: Record<string, number>

  // 统计
  kills: number
  itemsCollected: number
  npcsHelped: number
  distanceTraveled: number
  undergroundActions: number
  safeZoneActions: number

  // 特殊标记
  sacrificeTriggered: boolean
  safeZoneJoined: boolean
  radioContactMade: boolean
  boatRepaired: boolean
  labDiscovered: boolean

  // 休息/疲劳
  hoursAwake: number

  // 扩展字段（不使用但可能丢失的数据不丢弃）
  [key: string]: any
}

/** 存档元信息（用于 UI 展示，不加载完整存档） */
export interface SaveMeta {
  key: string
  timestamp: number
  mode: string
  dayCount: number
  sceneName: string
}

// ==================== 序列化 ====================

/** 需要排除的字段：UI 状态 + 运行时引用 + 战斗瞬时状态 */
const EXCLUDE_KEYS = new Set([
  // UI 状态
  'showInventory', 'showJournal', 'showMap',
  // 运行时引用
  'currentEnding', 'currentDialogue', 'saveSlot',
  // 战斗瞬时状态
  'inCombat', 'combatState', 'currentOptions',
  // 内部瞬时标记
  '_combatNextRoundBonus', '_isOverweight', '_pendingScene',
  '_targetScene', '_bleeding', '_serumReady',
  // 不应保存的阶段
  'phase',
])

/**
 * 从 GameState 提取可持久化的数据
 */
export function extractSaveData(state: GameState): SaveData {
  const raw: any = {}

  for (const key of Object.keys(state)) {
    if (EXCLUDE_KEYS.has(key)) continue
    raw[key] = (state as any)[key]
  }

  return {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    mode: state.mode,
    hp: state.hp,
    maxHp: state.maxHp,
    hunger: state.hunger,
    maxHunger: state.maxHunger,
    thirst: state.thirst,
    maxThirst: state.maxThirst,
    sanity: state.sanity,
    maxSanity: state.maxSanity,
    infection: state.infection,
    maxInfection: state.maxInfection,
    dayCount: state.dayCount,
    actionCount: state.actionCount,
    inventory: raw.inventory || [],
    maxInventory: state.maxInventory,
    currentScene: state.currentScene,
    currentSituation: state.currentSituation,
    lastSituationId: state.lastSituationId,
    currentModifiers: raw.currentModifiers || [],
    currentEventText: raw.currentEventText || '',
    sceneActionCount: state.sceneActionCount,
    scenesVisited: raw.scenesVisited || [],
    journal: raw.journal || [],
    clues: raw.clues || [],
    legacyTags: raw.legacyTags || [],
    npcsMet: raw.npcsMet || [],
    npcRelations: raw.npcRelations || {},
    kills: state.kills,
    itemsCollected: state.itemsCollected,
    npcsHelped: state.npcsHelped,
    distanceTraveled: state.distanceTraveled,
    undergroundActions: state.undergroundActions,
    safeZoneActions: state.safeZoneActions,
    sacrificeTriggered: state.sacrificeTriggered,
    safeZoneJoined: state.safeZoneJoined,
    radioContactMade: state.radioContactMade,
    boatRepaired: state.boatRepaired,
    labDiscovered: state.labDiscovered,
    hoursAwake: state.hoursAwake,
  }
}

// ==================== 存储操作 ====================

/**
 * 保存存档到 localStorage
 * @returns true 成功，false 失败（配额溢出等）
 */
export function saveToLocalStorage(key: string, state: GameState): boolean {
  try {
    const data = extractSaveData(state)
    const json = JSON.stringify(data)
    localStorage.setItem(key, json)
    return true
  } catch (e) {
    // 配额溢出 或 序列化失败
    console.warn(`[SaveService] 存档失败 (${key}):`, e)
    return false
  }
}

/**
 * 从 localStorage 读取存档
 * @returns 存档数据，或 null（不存在/版本不兼容/数据损坏）
 */
export function loadFromLocalStorage(key: string): SaveData | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const data = JSON.parse(raw) as SaveData

    // 版本检查
    if (!data || data.version !== SAVE_VERSION) {
      console.warn(`[SaveService] 存档版本不兼容 (${key}): got ${data?.version}, expected ${SAVE_VERSION}`)
      return null
    }

    return data
  } catch (e) {
    console.warn(`[SaveService] 读档失败 (${key}):`, e)
    return null
  }
}

/**
 * 删除指定存档
 */
export function deleteSave(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.warn(`[SaveService] 删除存档失败 (${key}):`, e)
  }
}

/**
 * 删除所有自动存档（Roguelike 死亡时调用）
 */
export function deleteAllAutosaves(): void {
  deleteSave(SAVE_KEYS.autosave0)
  deleteSave(SAVE_KEYS.autosave1)
}

/**
 * 检查指定存档是否存在
 */
export function hasSave(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null
  } catch {
    return false
  }
}

/**
 * 获取存档元信息（用于 UI 展示）
 * 不要求版本完全匹配，能解析出基础字段即可
 */
export function getSaveMeta(key: string): SaveMeta | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const data = JSON.parse(raw)

    // 尝试解析场景名
    let sceneName = '未知'
    if (data.currentScene) {
      // 简单映射：把 scene id 转为可读名
      sceneName = data.currentScene
    }

    return {
      key,
      timestamp: data.timestamp || 0,
      mode: data.mode || 'roguelike',
      dayCount: data.dayCount || 0,
      sceneName,
    }
  } catch {
    return null
  }
}

/**
 * 获取最新的可用存档 key（用于"继续游戏"）
 * 优先手动存档 → 自动存档槽位 0 → 自动存档槽位 1
 */
export function getLatestSaveKey(): string | null {
  // 按优先级检查
  const keys = [SAVE_KEYS.manual, SAVE_KEYS.autosave0, SAVE_KEYS.autosave1]
  let bestKey: string | null = null
  let bestTime = 0

  for (const key of keys) {
    const meta = getSaveMeta(key)
    if (meta && meta.timestamp > bestTime) {
      bestTime = meta.timestamp
      bestKey = key
    }
  }

  return bestKey
}
