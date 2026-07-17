<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import type { GameState, Item, SituationOption, CombatState } from './types'
import { createGameState, resetGameState, addToInventory, removeFromInventory,
         useItem, modifyStat, addJournalEntry, processEvents, flushDeferredEvents } from './game/state.js'
import { generateEvent, resolveOption, applySurvivalDecay, exploreNewArea,
         generateCombat, resolveCombatRound, fleeCombat, rebuildCurrentOptions,
         getCombatStrategies, autoResolveCombat, getOpportunities,
         startDialogue as engineStartDialogue } from './game/engine.js'
import { scenes, itemDB } from './data/index.js'
import { getLootPool } from './game/item-utils.js'
import { checkEndings } from './game/ending-utils.js'
import { saveToLocalStorage, loadFromLocalStorage, SAVE_KEYS, deleteAllAutosaves, getLatestSaveKey } from './game/save-service.js'
import type { Opportunity } from './types'

import StartScreen from './components/StartScreen.vue'
import StatusBar from './components/StatusBar.vue'
import NarrativeArea from './components/NarrativeArea.vue'
import OptionsPanel from './components/OptionsPanel.vue'
import ActionBar from './components/ActionBar.vue'
import EndingScreen from './components/EndingScreen.vue'
import InventoryDrawer from './components/InventoryDrawer.vue'
import JournalPanel from './components/JournalPanel.vue'
import DialogPanel from './components/DialogPanel.vue'
import MapPanel from './components/MapPanel.vue'
import CommandPanel from './components/CommandPanel.vue'
import type { ComponentPublicInstance } from 'vue'

// ==================== 游戏状态 ====================
const gameState: GameState = createGameState()

// ==================== 自动存档 ====================
let _autoSaveTimer: ReturnType<typeof setTimeout> | null = null
let _lastAutoSaveSlot = 0

/** 防抖自动保存：500ms 内有新调用则重置计时器，交替写入双槽位 */
function triggerAutoSave() {
  if (_autoSaveTimer) clearTimeout(_autoSaveTimer)
  _autoSaveTimer = setTimeout(() => {
    // 不在战斗/对话/结局/开始界面时保存
    if (gameState.phase !== 'playing' || gameState.inCombat) return
    _lastAutoSaveSlot = _lastAutoSaveSlot === 0 ? 1 : 0
    const key = _lastAutoSaveSlot === 0 ? SAVE_KEYS.autosave0 : SAVE_KEYS.autosave1
    saveToLocalStorage(key, gameState)
  }, 500)
}

// ==================== 当前叙事 ====================
const currentEventText = ref('')
const currentOptions = ref<SituationOption[]>([])
const isResolving = ref(false)
const resultLoot = ref<any[]>([])       // 获得的物品
const combatState = ref<CombatState | null>(null)    // 战斗状态
const showCombatUI = ref(false)
const combatStrategies = ref<any[]>([])  // 可用战斗策略
const combatLogRef = ref<HTMLElement | null>(null)  // 战斗日志滚动容器
const showCombatScrollBtn = ref(false)
const rollingRound = ref<number | null>(null)  // 正在骰子动画的回合索引
const rollingText = ref('')  // 动画期间的显示文本
const pendingCombatResult = ref<string | null>(null)  // 动画期间暂存的战斗结果
const opportunityMode = ref(false)  // 机遇模式
const currentOpp = ref<any>(null)  // 当前机遇
const oppDiceRolled = ref(false)  // 已掷骰
const oppDiceResult = ref(0)
const oppRollReady = ref(true)  // 骰子按钮可用
const oppQueue = ref<any[]>([])
const oppIndex = ref(0)
const combatRewardActive = ref(false)  // 战后奖励掷骰
const combatRewardRolled = ref(false)
const combatRewardRoll = ref(0)
const combatRewardText = ref('')
const commandPanelRef = ref<ComponentPublicInstance<{ toggle: () => void }> | null>(null)
let _pendingSceneChange = false  // 机遇打断时暂存的场景切换标记

// 返回物品稀有度对应的 CSS class
function itemRarityClass(item: any): string {
  if (item.rarity === 'legendary') return 'item-legendary'
  if (item.rarity === 'rare') return 'item-rare'
  return ''
}
// 根据物品列表返回带特效的日志文本（整行动画）
function buildLootText(items: any[], glyph: string = ''): string {
  const names = items.map(i => i.name).join('、')
  let cls = ''
  if (items.some(i => i.rarity === 'legendary')) cls = 'item-legendary'
  else if (items.some(i => i.rarity === 'rare')) cls = 'item-rare'
  const text = glyph
    ? `${glyph}搜刮尸体：获得 ${names}。`
    : `✢ 获得了：${names}`
  return cls ? `<span class="${cls}">${text}</span>` : text
}
// 包裹单个物品的日志文本（整行动画）
function wrapRewardText(prefix: string, item: any, suffix: string): string {
  const cls = itemRarityClass(item)
  const text = `${prefix}${item.name}${suffix}`
  return cls ? `<span class="${cls}">${text}</span>` : text
}

// ==================== 游戏流程 ====================

function handleStartGame(mode: string) {
  resetGameState(gameState)
  gameState.phase = 'playing'
  gameState.mode = mode as 'roguelike' | 'easy'

  // 随机开局时间（早晨 6-10 点 或 傍晚 16-20 点）
  const startHour = Math.random() < 0.6 ? 6 + Math.floor(Math.random() * 4) : 16 + Math.floor(Math.random() * 4)
  gameState.dayCount = startHour / 24

  // 初始物品：水壶 + 能量棒 + 随机武器（确保新手有自卫能力）
  const starterItems = ['water_bottle', 'energy_bar']
  for (const itemId of starterItems) {
    const item = itemDB[itemId]
    if (item) addToInventory(gameState, item)
  }
  // 随机给一把初始武器
  const starterWeapons = ['bat', 'knife', 'crowbar_weapon', 'machete']
  const bonusItem = itemDB[starterWeapons[Math.floor(Math.random() * starterWeapons.length)]]
  if (bonusItem) {
    addToInventory(gameState, bonusItem)
  }

  addJournalEntry(gameState, '你在一栋废弃公寓的浴室里醒来。窗外是燃烧的城市，远处传来警笛和尖叫。你必须生存下去。', 'narrative')
  addJournalEntry(gameState, wrapRewardText('✢ 初始物品：水壶、能量棒、', bonusItem, ''), 'action')

  // 生成第一个事件
  generateFirstEvent()
}

function handleContinue(saveKey?: string) {
  const key = saveKey || getLatestSaveKey()
  if (!key) return

  const saveData = loadFromLocalStorage(key)
  if (!saveData) return

  // 恢复状态到 gameState
  Object.keys(saveData).forEach(k => {
    if (k === 'version' || k === 'timestamp') return
    if (k in gameState) {
      (gameState as any)[k] = saveData[k]
    }
  })
  gameState.phase = 'playing'

  addJournalEntry(gameState, '📂 游戏已加载。', 'action')

  // 恢复 UI
  const event = generateEvent(gameState)
  currentEventText.value = event.text
  currentOptions.value = event.options
  resultLoot.value = []
  showCombatUI.value = false
  combatState.value = null
}

function generateFirstEvent() {
  const event = generateEvent(gameState)
  currentEventText.value = event.text
  currentOptions.value = event.options
  resultLoot.value = []
  combatState.value = null
  showCombatUI.value = false
}

// ==================== 选择选项 ====================

function handleSelectOption(option: any) {
  if (isResolving.value) return
  isResolving.value = true
  resultLoot.value = []

  // 解析选项
  const result: any = resolveOption(gameState, option)
  _pendingSceneChange = result.sceneChange ?? false

  // 将结果文本写入日志（显示在叙事区）
  addJournalEntry(gameState, result.narrativeText, 'result')
  if (result.loot && result.loot.length > 0) {
    resultLoot.value = result.loot
    addJournalEntry(gameState, buildLootText(result.loot), 'action')
  }
  // 线索物品的事件延后到战利品日志之后处理
  flushDeferredEvents(gameState)

  // 检查结局
  if (result.ending) {
    // Roguelike 模式死亡时清除所有自动存档
    if (gameState.mode === 'roguelike' && result.ending.isDeath) {
      deleteAllAutosaves()
    }
    gameState.phase = 'ending'
    gameState.currentEnding = result.ending
    isResolving.value = false
    return
  }

  // 检查战斗
  if (result.combat) {
    // 先加入战斗日志条目（结果文本已在上方加入，保证正确顺序）
    if (result._zombieWarn) {
      addJournalEntry(gameState, '⚠️ 你的行动惊动了附近的丧尸！它们朝你冲了过来！即将进入战斗……', 'danger')
    }
    addJournalEntry(gameState, `✽ 进入战斗！遭遇了 ${result.combat.enemy.count} 只${result.combat.enemy.name}。`, 'combat')

    if (result._zombieWarn) {
      setTimeout(() => {
        combatState.value = result.combat
        const enemy = result.combat?.enemy
        combatStrategies.value = getCombatStrategies(gameState, enemy)
        showCombatUI.value = true
      }, 4000)
    } else {
      // 非丧尸触发也有短暂延迟，让玩家看到日志
      setTimeout(() => {
        combatState.value = result.combat
        const enemy = result.combat?.enemy
        combatStrategies.value = getCombatStrategies(gameState, enemy)
        showCombatUI.value = true
      }, 1500)
    }
    isResolving.value = false
    return
  }

  // 检查对话
  if (result.dialogue) {
    engineStartDialogue(gameState, result.dialogue.npcId)
    isResolving.value = false
    return
  }

  // 检查机遇
  const opps = getOpportunities(gameState)
  if (opps.length > 0) {
    oppQueue.value = opps
    oppIndex.value = 0
    setTimeout(() => showOpportunity(0), 800)
    return
  }

  // 生成下一个事件
  setTimeout(() => {
    const event = generateEvent(gameState, result.sceneChange ?? false)
    currentEventText.value = event.text
    currentOptions.value = event.options
    resultLoot.value = []
    combatState.value = null
    isResolving.value = false
    triggerAutoSave()
  }, 800)
}

// ==================== 战斗 ====================

function handleCombatAction(strategyId: string) {
  let combat
  if (strategyId === 'auto') {
    combat = autoResolveCombat(gameState)
  } else {
    combat = resolveCombatRound(gameState, strategyId)
  }
  const roundIdx = combat.rounds ? combat.rounds.length - 1 : -1

  // 骰子动画：对含有 🎲[ 的回合进行摇晃动画（逃跑/自动不触发）
  if (strategyId !== 'flee' && strategyId !== 'auto' && roundIdx >= 0 && combat.rounds[roundIdx].playerText.includes('🎲[')) {
    const realText = combat.rounds[roundIdx].playerText
    rollingRound.value = roundIdx

    // 暂存敌人反击文本和战斗结果，动画期间隐藏
    const realEnemyText = combat.rounds[roundIdx].enemyText
    const realResult = combat.result
    combat.rounds[roundIdx].enemyText = ''
    combat.result = null
    if (realResult) pendingCombatResult.value = realResult

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let ticks = 0
    const interval = setInterval(() => {
      ticks++
      const fakeRoll = chars[Math.floor(Math.random() * chars.length)] +
                       chars[Math.floor(Math.random() * chars.length)]
      rollingText.value = realText
        .replace(/🎲\[[^\]]+\]/, `🎲[${fakeRoll}]`)
        .replace(/\d+ 点伤害/, '?? 点伤害')
        .replace(/打出必杀一击！💥/, '造成了 ?? 点伤害')
        .replace(/，但攻击落空了！/, '造成了 ?? 点伤害')
      combatState.value = { ...combat }

      if (ticks >= 12) {
        clearInterval(interval)
        rollingRound.value = null
        rollingText.value = ''
        // 动画结束，恢复敌人文本和战斗结果
        combat.rounds[roundIdx].enemyText = realEnemyText
        if (pendingCombatResult.value) {
          combat.result = pendingCombatResult.value
          pendingCombatResult.value = null
        }
        combatState.value = { ...combat }
      }
    }, 70)
  }

  combatState.value = { ...combat }

  const delay = combat.rounds?.length ? Math.min(600 + combat.rounds.length * 200, 2000) : 600

  setTimeout(() => {
    // 每回合后刷新策略（弹药可能已消耗）
    if (!combat.result) {
      combatStrategies.value = getCombatStrategies(gameState, combatState.value?.enemy)
    }
    if (combat.result === 'victory') {
      // 胜利后延迟 1 秒让玩家看到击杀描述，然后显示奖励掷骰
      setTimeout(() => {
        if (gameState.hp > 0) {
          combatRewardActive.value = true
          combatRewardRolled.value = false
          combatRewardRoll.value = 0
          combatRewardText.value = ''
          nextTick(() => scrollCombatNow())
        } else {
          finishCombatReward()
        }
      }, 1000)
    } else if (combat.result === 'fled') {
      showCombatUI.value = false
      combatState.value = null
      checkAndTriggerEnding()
      if (gameState.phase !== 'ending') {
        const event = generateEvent(gameState, _pendingSceneChange)
        _pendingSceneChange = false
        currentEventText.value = event.text
        currentOptions.value = event.options
        resultLoot.value = []
        triggerAutoSave()
      }
    } else if (combat.result === 'death') {
      setTimeout(() => {
        showCombatUI.value = false
        checkAndTriggerEnding()
      }, 2000) // 死亡后延时 2 秒
    }
  }, Math.max(delay, 900)) // 确保延迟大于骰子动画(840ms)
}

// ==================== 战后奖励 ====================

function handleCombatRewardDice() {
  const roll = Math.floor(Math.random() * 6) + 1
  combatRewardRoll.value = roll
  combatRewardRolled.value = true

  const diceGlyphs = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
  const glyph = diceGlyphs[roll] + ' '

  if (roll <= 3) {
    combatRewardText.value = `${glyph}这具丧尸身上空无一物。你叹了口气，准备离开。`
    addJournalEntry(gameState, `${glyph} 搜刮尸体：什么都没有。`, 'action')
    setTimeout(() => finishCombatReward(), 1500)
  } else {
    // 根据 enemy.lootChance 决定品质和数量
    const enemy = combatState.value?.enemy
    const lootChance = enemy?.lootChance ?? 0.3
    const quality: 'normal' | 'combat' = roll === 6 ? 'combat' : (lootChance > 0.5 ? 'combat' : 'normal')
    const count = lootChance > 0.5 ? 2 : 1

    const loot = getLootPool(count, gameState.inventory, {
      quality,
      rarity: roll === 6 ? '稀有' : undefined,
    })
    if (loot.length > 0) {
      const added: any[] = []
      for (const item of loot) {
        if (addToInventory(gameState, item)) {
          added.push(item)
        }
      }
      if (added.length > 0) {
        const itemNames = added.map((i: any) => i.name).join('、')
        const prefix = roll === 6 ? '你仔细搜索，找到了：' : '你在尸体旁发现了一些物资：'
        combatRewardText.value = `${glyph}${prefix}${itemNames}。`
        addJournalEntry(gameState, buildLootText(added, glyph), 'action')
        flushDeferredEvents(gameState)
      } else {
        combatRewardText.value = `${glyph}你翻找了一番，但背包已经满了。`
        addJournalEntry(gameState, `${glyph} 搜刮尸体：背包满了！`, 'action')
      }
    } else {
      combatRewardText.value = `${glyph}这具丧尸身上空无一物。`
      addJournalEntry(gameState, `${glyph} 搜刮尸体：什么都没有。`, 'action')
    }
    setTimeout(() => finishCombatReward(), roll === 6 ? 2500 : 2000)
  }
}

function finishCombatReward() {
  combatRewardActive.value = false
  showCombatUI.value = false
  combatState.value = null
  checkAndTriggerEnding()
  if (gameState.phase !== 'ending') {
    const event = generateEvent(gameState, _pendingSceneChange)
    _pendingSceneChange = false
    currentEventText.value = event.text
    currentOptions.value = event.options
    resultLoot.value = []
    triggerAutoSave()
  }
}

// 战斗日志新增回合时自动滚动
watch(
  () => combatState.value?.rounds.length,
  () => {
    nextTick(() => {
      if (combatLogRef.value) {
        combatLogRef.value.scrollTop = combatLogRef.value.scrollHeight
      }
    })
  }
)

// ==================== 机遇 ====================

function showOpportunity(idx) {
  if (idx >= oppQueue.value.length) {
    // 机遇队列完成 — 仅推进时间 1h，不计疲劳、不占行动计数
    opportunityMode.value = false
    currentOpp.value = null
    oppQueue.value = []
    gameState.dayCount += 2 / 24
    // 生成下一个事件
    const event = generateEvent(gameState, _pendingSceneChange)
    _pendingSceneChange = false
    currentEventText.value = event.text
    currentOptions.value = event.options
    resultLoot.value = []
    isResolving.value = false
    triggerAutoSave()
    return
  }

  const opp = oppQueue.value[idx]
  currentOpp.value = opp
  oppIndex.value = idx

  if (opp.type === 'narrative') {
    opportunityMode.value = true
    oppDiceRolled.value = true
    // 纯剧情机遇：打字机显示后自动继续
    addJournalEntry(gameState, opp.baseText, 'narrative')
    setTimeout(() => showOpportunity(idx + 1), (opp.delay || 4) * 1000)
  } else if (opp.type === 'narrative_result') {
    opportunityMode.value = true
    oppDiceRolled.value = true
    addJournalEntry(gameState, opp.baseText, 'narrative')
    if (opp.resultEffects) {
      Object.entries(opp.resultEffects).forEach(([key, val]) => {
        modifyStat(gameState, key, val as number)
      })
    }
    setTimeout(() => showOpportunity(idx + 1), (opp.delay || 4) * 1000)
  } else if (opp.type === 'dice') {
    addJournalEntry(gameState, opp.baseText, 'narrative')
    opportunityMode.value = true
    currentOpp.value = opp
    oppIndex.value = idx
    oppDiceRolled.value = false
    oppDiceResult.value = 0
    oppRollReady.value = true
  }
}

function handleOppDice() {
  if (!oppRollReady.value || !currentOpp.value) return
  oppRollReady.value = false
  const roll = Math.floor(Math.random() * 6) + 1
  oppDiceResult.value = roll
  oppDiceRolled.value = true

  const range = currentOpp.value.diceRanges?.find(
    r => roll >= r.min && roll <= r.max
  )

  const diceGlyphs = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
  const resultText = range?.text || '什么都没发生。'
  const effects = range?.effects || {}

  let out = `${diceGlyphs[roll]} ${resultText}`
  if (effects.hp) out += ` 生命${effects.hp > 0 ? '+' : ''}${effects.hp}`
  if (effects.hunger) out += ` 饱腹${effects.hunger > 0 ? '+' : ''}${effects.hunger}`
  if (effects.thirst) out += ` 口渴${effects.thirst > 0 ? '+' : ''}${effects.thirst}`
  if (effects.sanity) out += ` 理智${effects.sanity > 0 ? '+' : ''}${effects.sanity}`
  if (effects.infection) out += ` 感染${effects.infection > 0 ? '+' : ''}${effects.infection}`

  addJournalEntry(gameState, `<span class="dim">${out}</span>`, 'action')

  // Apply effects
  for (const [k, v] of Object.entries(effects)) {
    modifyStat(gameState, k, v as number)
  }
  if (range?.events) processEvents(gameState, range.events)
  if (range?.lootItem) {
    const item = itemDB[range.lootItem]
    if (item && addToInventory(gameState, item)) {
      addJournalEntry(gameState, wrapRewardText('✢ 获得了：', item, ''), 'action')
      flushDeferredEvents(gameState)
    }
  }

  setTimeout(() => showOpportunity(oppIndex.value + 1), 2000)
}

// ==================== 对话 ====================

function handleDialogueResult(result: any) {
  if (!result) return
  if (result.error) return

  // 记录对话文本到日志
  if (result.npcText) addJournalEntry(gameState, result.npcText, 'dialogue')
  if (result.playerText) addJournalEntry(gameState, `➤ ${result.playerText}`, 'action')

  if (result.rewardItems) {
    for (const item of result.rewardItems) {
      addJournalEntry(gameState, wrapRewardText('✢ 获得：', item, ''), 'action')
    }
    flushDeferredEvents(gameState)
  }

  // 对话结束，生成下一事件
  if (result.dialogueEnded) {
    if (gameState.phase !== 'ending') {
      const event = generateEvent(gameState)
      currentEventText.value = event.text
      currentOptions.value = event.options
      resultLoot.value = []
      triggerAutoSave()
    }
  }
}

// ==================== 结局 ====================

function checkAndTriggerEnding() {
  const ending = checkEndings(gameState)
  if (ending) {
    // Roguelike 模式死亡时清除所有自动存档（保持 permadeath）
    if (gameState.mode === 'roguelike' && ending.isDeath) {
      deleteAllAutosaves()
    }
    gameState.phase = 'ending'
    gameState.currentEnding = ending
  }
}

// ==================== 使用物品 ====================

function handleUseItem(itemId: string) {
  const item = gameState.inventory.find(i => i.id === itemId)
  if (!item) return

  const effects = useItem(gameState, itemId)
  if (effects) {
    let useText = `✽ 使用了 ${item.name}。`
    if (effects.hp) useText += ` 生命${effects.hp > 0 ? '+' : ''}${effects.hp}`
    if (effects.hunger) useText += ` 饱腹${effects.hunger > 0 ? '+' : ''}${effects.hunger}`
    if (effects.thirst) useText += ` 口渴${effects.thirst > 0 ? '+' : ''}${effects.thirst}`
    if (effects.sanity) useText += ` 理智${effects.sanity > 0 ? '+' : ''}${effects.sanity}`
    if (effects.infection) useText += ` 感染${effects.infection > 0 ? '+' : ''}${effects.infection}`
    addJournalEntry(gameState, useText, 'action')
  }
  // 刷新选项（背包满状态可能已变）
  currentOptions.value = rebuildCurrentOptions(gameState)
  triggerAutoSave()
}

function handleDropItem(itemId: string) {
  const item = gameState.inventory.find(i => i.id === itemId)
  if (item) {
    const count = item.stackable ? (item._count || 1) : 1
    removeFromInventory(gameState, itemId, count)
    const suffix = count > 1 ? ` x${count}` : ''
    addJournalEntry(gameState, `✽ 丢弃了 ${item.name}${suffix}。`, 'action')
  }
  // 刷新选项（背包空出后搜索按钮恢复）
  currentOptions.value = rebuildCurrentOptions(gameState)
  triggerAutoSave()
}

// ==================== 地图旅行 ====================

function handleTravel(sceneId: string) {
  const scene = (scenes as any)[sceneId]
  if (!scene) return

  // 只有已探索的场景才能通过地图旅行
  if (!gameState.scenesVisited || !gameState.scenesVisited.includes(sceneId)) return
  // 不能传送到当前场景
  if (sceneId === gameState.currentScene) return

  // 旅行消耗体力（基于场景危险度）
  const travelCost = 5 + (scene.danger || 0)
  gameState.hp = Math.max(0, gameState.hp - travelCost)

  gameState._pendingScene = sceneId
  gameState.showMap = false

  // 推进时间 + 生存衰减
  applySurvivalDecay(gameState)
  addJournalEntry(gameState, `🚶 前往 ${scene.name}...（体力 -${travelCost}）`, 'action')

  // 生成新事件
  const event = generateEvent(gameState)
  currentEventText.value = event.text
  currentOptions.value = event.options
  resultLoot.value = []
  triggerAutoSave()
}

// ==================== 存档 ====================

function handleSave() {
  const saveData = JSON.parse(JSON.stringify(gameState))
  // 移除函数和Vue响应式引用
  delete saveData.currentEnding
  delete saveData.currentDialogue
  gameState.saveSlot = saveData
  // easy 模式同时持久化到 localStorage
  if (gameState.mode === 'easy') {
    saveToLocalStorage(SAVE_KEYS.manual, gameState)
  }
  addJournalEntry(gameState, '💾 游戏已存档。', 'action')
}

function handleLoad() {
  // 优先从 localStorage 加载手动存档
  let saveData: any = loadFromLocalStorage(SAVE_KEYS.manual)
  // Fallback: 内存存档（页面未刷新时）
  if (!saveData && gameState.saveSlot) {
    saveData = gameState.saveSlot
  }
  if (!saveData) return

  // 恢复状态
  Object.keys(saveData).forEach(key => {
    if (key !== 'saveSlot' && key !== 'version' && key !== 'timestamp' && key in gameState) {
      (gameState as any)[key] = saveData[key]
    }
  })
  gameState.phase = 'playing'
  addJournalEntry(gameState, '📂 游戏已读档。', 'action')

  // 恢复UI
  const event = generateEvent(gameState)
  currentEventText.value = event.text
  currentOptions.value = event.options
  resultLoot.value = []
  showCombatUI.value = false
  combatState.value = null
}

// ==================== 重新开始 ====================

function handleRestart() {
  gameState.phase = 'start'
  gameState.currentEnding = null
}

// 战斗日志滚动
function checkCombatScroll() {
  if (!combatLogRef.value) return
  const el = combatLogRef.value
  const threshold = 80
  showCombatScrollBtn.value = el.scrollHeight - el.scrollTop - el.clientHeight > threshold
}
function scrollCombatNow() {
    nextTick(() => {
      if (combatLogRef.value) {
        combatLogRef.value.scrollTop = combatLogRef.value.scrollHeight
      }
    })
  }
  function scrollCombatLog() {
  if (combatLogRef.value) {
    combatLogRef.value.scrollTop = combatLogRef.value.scrollHeight
    showCombatScrollBtn.value = false
  }
}

function toggleInventory() { gameState.showInventory = !gameState.showInventory }
function toggleJournal() { gameState.showJournal = !gameState.showJournal }
function toggleMap() { gameState.showMap = !gameState.showMap }
</script>

<template>
  <div class="h-full flex flex-col max-w-lg w-full bg-bg">

    <!-- ========== 开始画面 ========== -->
    <StartScreen
      v-if="gameState.phase === 'start'"
      :gameState="gameState"
      @start-game="handleStartGame"
      @continue-game="handleContinue"
    />

    <!-- ========== 结局画面 ========== -->
    <EndingScreen
      v-else-if="gameState.phase === 'ending'"
      :ending="(gameState as any).currentEnding"
      :gameState="gameState"
      @restart="handleRestart"
    />

    <!-- ========== 游戏主画面 ========== -->
    <template v-else>
      <!-- 状态栏 -->
      <StatusBar :gameState="gameState" @toggle-command="commandPanelRef?.toggle()" />

      <!-- 手机端宽度占位（确保容器宽度不被内容撑缩） -->
      <div class="sm:hidden w-screen h-0 pointer-events-none" aria-hidden="true"></div>

      <!-- 对话模式 -->
      <DialogPanel
        v-if="gameState.phase === 'dialogue'"
        :gameState="gameState"
        @dialogue-result="handleDialogueResult"
      />

      <!-- 叙事区（始终挂载，战斗中隐藏） -->
      <NarrativeArea v-show="!showCombatUI" :gameState="gameState"  />

      <!-- 战斗模式 -->
      <div
        v-if="showCombatUI && combatState"
        class="flex-1 flex flex-col overflow-hidden bg-bg"
      >
        <!-- 敌人信息头部 -->
        <div class="border-b border-border">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-bold text-danger">
                ⚔️ {{ combatState.enemy.name }} x{{ combatState.enemy.count }}
              </span>
              <span class="text-xs ml-2 text-muted">
                HP: {{ Math.max(0, combatState.enemy.actualHp) }}/{{ combatState.enemy.maxHp }}
              </span>
              <span class="text-[10px] ml-2 text-muted">
                {{ combatState.enemy.desc || '' }}
              </span>
          </div>
        </div>
      </div>

        <!-- 战斗日志 -->
        <div class="flex-1 overflow-y-auto space-y-2 relative"
             ref="combatLogRef"
             @scroll="checkCombatScroll">
          <!-- 丧尸描述（左侧） -->
          <div v-if="combatState.enemyDesc" class="text-sm leading-relaxed text-danger">
            <span class="text-[10px] font-bold text-muted">{{ combatState.enemy.name }}:</span>
            <p class="mt-0.5">{{ combatState.enemyDesc }}</p>
          </div>
          <div
            v-for="(round, idx) in combatState.rounds"
            :key="idx"
            class="text-sm leading-relaxed"
          >
            <!-- 玩家行动（右对齐） -->
            <div v-if="round.playerText" class="text-right"
                 :class="rollingRound === idx ? 'text-muted' : (round.isCrit ? 'text-gold' : 'text-success')">
              <span class="text-[10px] text-muted">你:</span>
              <p class="mt-0.5" :class="{ 'crit-scan': round.isCrit && rollingRound !== idx }">
                <template v-if="rollingRound === idx">{{ rollingText }}</template>
                <template v-else>{{ round.playerText }}</template>
              </p>
            </div>
            <!-- 敌人行动（左对齐）：骰子动画期间隐藏 -->
            <div v-if="round.enemyText && rollingRound !== idx" class="mt-1 text-danger">
              <span class="text-[10px] font-bold text-muted">
                {{ combatState.enemy.name }}:
              </span>
              <p class="mt-0.5">{{ round.enemyText }}</p>
            </div>
          </div>

          <!-- 战斗日志回到底部按钮 -->
          <button
            v-if="showCombatScrollBtn"
            @click="scrollCombatLog"
            class="sticky bottom-2 z-10 text-xs border rounded-sm mx-auto block
                   bg-input-bg border-accent text-accent
                   hover:bg-button-hover transition-colors duration-150"
          >↓ 回到底部</button>

          <!-- 底部留空避免按钮遮挡日志 -->
          <div class="h-16"></div>
        </div>

        <!-- 策略选项（骰子动画期间隐藏，保留占位） -->
        <div
          :class="[
            combatState.result ? 'h-0 overflow-hidden' : '',
            rollingRound !== null && !combatState.result ? 'invisible' : '',
            'border-t',
            combatState.result ? 'border-transparent' : 'border-border',
          ]">
          <button
            v-for="s in combatStrategies"
            :key="s.id"
            @click="handleCombatAction(s.id)"
            class="w-full text-left text-xs border min-h-11 rounded-sm
                   border-border text-fore bg-bg
                   hover:bg-hover transition-colors duration-150"
          >
            <div class="leading-tight">
              <span>{{ s.name }}</span>
              <div v-if="s.isWeapon" class="text-muted text-[10px]" v-html="s.desc"></div>
              <div v-else class="text-muted text-[10px]">{{ s.desc }}</div>
            </div>
          </button>
          <!-- 逃跑 + 一键 同一行 -->
          <div class="flex gap-2">
            <button
              @click="handleCombatAction('flee')"
              class="flex-1 text-xs border rounded-sm min-h-11
                     border-accent text-accent bg-bg
                     hover:bg-hover transition-colors duration-150 text-center"
            >🏃 逃跑</button>
            <button
              @click="handleCombatAction('auto')"
              class="flex-1 text-xs border rounded-sm min-h-11
                     border-border text-muted bg-bg
                     hover:bg-hover transition-colors duration-150 text-center"
            >⚡ 一键</button>
          </div>
        </div>

        <!-- 战斗结果 -->
        <div :class="{ 'invisible': !combatState.result && rollingRound === null }"
             class="border-t text-center border-border">
          <p v-if="combatState.result === 'victory' && !combatRewardActive" class="text-sm font-bold text-success">💀 战斗胜利！</p>
          <p v-else-if="combatState.result === 'fled'" class="text-sm text-accent">🏃 你脱离了战斗。</p>
          <p v-else-if="combatState.result === 'death'" class="text-sm font-bold text-danger">💀 你倒下了……</p>

          <!-- 战后奖励：搜刮尸体 -->
          <div v-if="combatRewardActive" class="mt-1">
            <template v-if="!combatRewardRolled">
              <p class="text-xs mb-2 text-fore">搜索尸体看看有什么可用的……</p>
              <button
                @click="handleCombatRewardDice"
                class="w-full text-sm border rounded-sm min-h-11
                       border-accent text-accent bg-bg
                       hover:bg-hover transition-colors duration-150"
              >🎲 搜刮战利品</button>
            </template>
            <template v-else>
              <p class="text-sm leading-relaxed text-fore">{{ combatRewardText }}</p>
            </template>
          </div>
        </div>
      </div>

      <!-- 机遇模式（骰子判定） -->
      <div v-if="opportunityMode && currentOpp && currentOpp.type === 'dice' && !oppDiceRolled"
           class="border-t border-border">
        <div class="text-center">
          <button
            @click="handleOppDice"
            class="w-full text-sm border rounded-sm min-h-11
                   bg-bg
                   hover:bg-hover transition-colors duration-150"
            :disabled="!oppRollReady"
            :class="oppRollReady ? 'border-accent text-accent' : 'border-border text-muted'"
          >🎲 掷骰子</button>
        </div>
      </div>

      <!-- 普通模式 -->
      <template v-else>
        <!-- 选项区 -->
        <OptionsPanel
          v-if="!showCombatUI && !opportunityMode"
          :options="currentOptions"
          :gameState="gameState"
          :disabled="isResolving"
          @select-option="handleSelectOption"
        />
      </template>

      <!-- 底栏 -->
      <ActionBar
        :gameState="gameState"
        :combatActive="showCombatUI"
        @toggle-inventory="toggleInventory"
        @toggle-journal="toggleJournal"
        @toggle-map="toggleMap"
        @save-game="handleSave"
        @load-game="handleLoad"
      />
    </template>

    <!-- ========== 命令面板 ========== -->
    <CommandPanel ref="commandPanelRef" :gameState="gameState" />

    <!-- ========== 面板覆盖层 ========== -->
    <InventoryDrawer
      v-if="gameState.showInventory"
      :gameState="gameState"
      @close="gameState.showInventory = false"
      @use-item="handleUseItem"
      @drop-item="handleDropItem"
    />

    <JournalPanel
      v-if="gameState.showJournal"
      :gameState="gameState"
      @close="gameState.showJournal = false"
    />

    <MapPanel
      v-if="gameState.showMap"
      :gameState="gameState"
      @close="gameState.showMap = false"
      @travel="handleTravel"
    />
  </div>
</template>
