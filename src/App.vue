<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import type { GameState, Item, SituationOption, CombatState } from './types'
import { createGameState, resetGameState, addToInventory, removeFromInventory,
         useItem, modifyStat, addJournalEntry } from './game/state.js'
import { generateEvent, resolveOption, applySurvivalDecay, exploreNewArea,
         generateCombat, resolveCombatRound, fleeCombat, rebuildCurrentOptions,
         getCombatStrategies, autoResolveCombat, getOpportunities,
         startDialogue as engineStartDialogue, equipWeapon, equipArmor, unequipItem } from './game/engine.js'
import { scenes, itemDB } from './data/index.js'
import { checkEndings } from './game/ending-utils.js'
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

// ==================== 游戏状态 ====================
const gameState: GameState = createGameState()

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
let _pendingSceneChange = false  // 机遇打断时暂存的场景切换标记
const cmdVisible = ref(false)
const cmdInput = ref('')
const cmdResult = ref('')
const cmdInputRef = ref<HTMLInputElement | null>(null)

// 返回物品稀有度对应的 CSS class
function itemRarityClass(item: any): string {
  if (item.tags && item.tags.includes('极稀有')) return 'item-rare'
  if (item.tags && item.tags.includes('稀有')) return 'item-epic'
  return ''
}
// 根据物品列表返回带特效的日志文本（整行动画）
function buildLootText(items: any[]): string {
  const names = items.map(i => i.name).join('、')
  let cls = ''
  if (items.some(i => i.tags && i.tags.includes('极稀有'))) cls = 'item-rare'
  else if (items.some(i => i.tags && i.tags.includes('稀有'))) cls = 'item-epic'
  return cls ? `<span class="${cls}">✢ 获得了：${names}</span>` : `✢ 获得了：${names}`
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
  addJournalEntry(gameState, `✢ 初始物品：水壶、能量棒、${bonusItem ? bonusItem.name : ''}`, 'action')

  // 生成第一个事件
  generateFirstEvent()
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

  // 检查结局
  if (result.ending) {
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

const combatRewardPools = {
  small: ['bandage', 'canned_beans', 'energy_bar', 'water_bottle', 'painkillers'],
  big: ['pistol', 'shotgun', 'first_aid_kit', 'antibiotics', 'antidote', 'military_rations', 'crossbow', 'axe'],
}

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
  } else if (roll <= 5) {
    const pool = combatRewardPools.small
    const itemId = pool[Math.floor(Math.random() * pool.length)]
    const item = itemDB[itemId]
    if (item && addToInventory(gameState, item)) {
      combatRewardText.value = `${glyph}你在尸体旁发现了一些有用物资：${item.name}。`
      addJournalEntry(gameState, wrapRewardText(`${glyph} 搜刮尸体：获得 `, item, '。'), 'action')
    } else {
      combatRewardText.value = `${glyph}你翻找了一番，但背包已经满了。`
      addJournalEntry(gameState, `${glyph} 搜刮尸体：背包满了！`, 'action')
    }
    setTimeout(() => finishCombatReward(), 2000)
  } else {
    const pool = combatRewardPools.big
    const itemId = pool[Math.floor(Math.random() * pool.length)]
    const item = itemDB[itemId]
    if (item && addToInventory(gameState, item)) {
      combatRewardText.value = `${glyph}你仔细搜索，找到了一件好东西：${item.name}！`
      addJournalEntry(gameState, wrapRewardText(`${glyph} 搜刮尸体：获得 `, item, '！'), 'action')
    } else {
      combatRewardText.value = `${glyph}你发现了好东西，但背包已经放不下了！`
      addJournalEntry(gameState, `${glyph} 搜刮尸体：背包满了！`, 'action')
    }
    setTimeout(() => finishCombatReward(), 2500)
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
    finishOpportunities()
    return
  }
  const opp = oppQueue.value[idx]
  opportunityMode.value = true
  currentOpp.value = opp
  oppDiceRolled.value = false
  oppDiceResult.value = 0

  addJournalEntry(gameState, opp.baseText, 'narrative')

  if (opp.type === 'narrative') {
    setTimeout(() => showOpportunity(idx + 1), opp.delay * 1000)
  } else if (opp.type === 'narrative_result') {
    if (opp.resultEffects) {
      for (const [k, v] of Object.entries(opp.resultEffects)) {
        modifyStat(gameState, k, v)
      }
    }
    if (opp.resultItem && itemDB[opp.resultItem]) {
      addToInventory(gameState, itemDB[opp.resultItem])
    }
    setTimeout(() => showOpportunity(idx + 1), opp.delay * 1000)
  }
  // dice type waits for player to click roll
}

function handleOppDice() {
  const opp = currentOpp.value
  if (!opp || opp.type !== 'dice' || !oppRollReady.value) return  // 打字中禁用
  const roll = Math.floor(Math.random() * 6) + 1
  oppDiceResult.value = roll
  oppDiceRolled.value = true

  const diceGlyphs = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
  const range = opp.diceRanges?.find(r => roll >= r.min && roll <= r.max)
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
    modifyStat(gameState, k, v)
  }
  if (range?.lootItem && itemDB[range.lootItem]) {
    addToInventory(gameState, itemDB[range.lootItem])
    addJournalEntry(gameState, `✢ 获得了：${itemDB[range.lootItem].name}`, 'action')
  }

  const nextIdx = oppQueue.value.indexOf(opp) + 1
  setTimeout(() => showOpportunity(nextIdx), 2000)
}

function finishOpportunities() {
  // 机遇推进 1h，但不计疲劳
  gameState.dayCount += 1 / 24
  gameState.actionCount++
  opportunityMode.value = false
  currentOpp.value = null
  oppQueue.value = []
  oppIndex.value = 0
  isResolving.value = false
  // 生成下一个事件
  setTimeout(() => {
    const event = generateEvent(gameState, _pendingSceneChange)
    _pendingSceneChange = false
    currentEventText.value = event.text
    currentOptions.value = event.options
    resultLoot.value = []
    combatState.value = null
    isResolving.value = false
  }, 500)
}

function checkAndTriggerEnding() {
  const ending = checkEndings(gameState)
  if (ending) {
    gameState.phase = 'ending'
    gameState.currentEnding = ending
  }
}

// ==================== 对话 ====================

let _dialogueEnding = false

function handleDialogueResult(result: any) {
  if (!result) return
  // 防止重复触发
  if (_dialogueEnding) return
  if (result.dialogueEnded) {
    _dialogueEnding = true
    // 强制标记当前情景为已用，避免重复
    gameState.lastSituationId = gameState.currentSituation
    // 检查结局并生成新事件
    checkAndTriggerEnding()
    if (gameState.phase !== 'ending') {
      const event = generateEvent(gameState)
      currentEventText.value = event.text
      currentOptions.value = event.options
      resultLoot.value = []
    }
    _dialogueEnding = false
  }
  if (result.rewardItems) {
    resultLoot.value = [...(resultLoot.value || []), ...result.rewardItems]
  }
}

// ==================== 背包操作 ====================

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
}

function handleDropItem(itemId: string) {
  const item = gameState.inventory.find(i => i.id === itemId)
  if (item) {
    removeFromInventory(gameState, itemId)
    addJournalEntry(gameState, `✽ 丢弃了 ${item.name}。`, 'action')
  }
  // 刷新选项（背包空出后搜索按钮恢复）
  currentOptions.value = rebuildCurrentOptions(gameState)
}

function handleEquipWeapon(itemId: string) {
  if (equipWeapon(gameState, itemId)) {
    // 装备成功
  }
}

function handleEquipArmor(itemId: string) {
  if (equipArmor(gameState, itemId)) {
    // 装备成功
  }
}

function handleUnequip(slot: string) {
  unequipItem(gameState, slot)
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
}

// ==================== 存档 ====================

function handleSave() {
  const saveData = JSON.parse(JSON.stringify(gameState))
  // 移除函数和Vue响应式引用
  delete saveData.currentEnding
  delete saveData.currentDialogue
  gameState.saveSlot = saveData
  addJournalEntry(gameState, '💾 游戏已存档。', 'action')
}

function handleLoad() {
  if (!gameState.saveSlot) return
  const saveData = gameState.saveSlot
  // 恢复状态
  Object.keys(saveData).forEach(key => {
    if (key !== 'saveSlot' && key in gameState) {
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

// ==================== 命令面板 ====================

function handleCmd() {
  const text = cmdInput.value.trim()
  cmdResult.value = ''
  if (!text.startsWith('/')) { cmdResult.value = '命令必须以 / 开头'; return }

  const parts = text.slice(1).split(/\s+/)
  const cmd = parts[0]
  const args = parts.slice(1)

  if (cmd === 'give') {
    const given: string[] = []
    const skipped: string[] = []
    for (const id of args) {
      const item = itemDB[id]
      if (item && addToInventory(gameState, item)) {
        given.push(item.name)
      } else {
        skipped.push(id)
      }
    }
    const msgs: string[] = []
    if (given.length) msgs.push('✔ 获得：' + given.join('、'))
    if (skipped.length) msgs.push('✘ 无效或背包满：' + skipped.join('、'))
    cmdResult.value = msgs.join(' | ')
  } else if (cmd === 'effect') {
    const applied: string[] = []
    for (const arg of args) {
      const m = arg.match(/^(hp|hunger|thirst|sanity|infection)([+-]\d+)$/)
      if (m) {
        modifyStat(gameState, m[1], parseInt(m[2]))
        applied.push(m[1] + m[2])
      } else {
        applied.push('✘' + arg)
      }
    }
    cmdResult.value = applied.join(' ')
  } else {
    cmdResult.value = '未知命令: /' + cmd + '  (支持: give, effect)'
  }
}

// Ctrl+P 快捷键
function onKeydown(e) {
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault()
    cmdVisible.value = !cmdVisible.value
    if (cmdVisible.value) { cmdInput.value = ''; cmdResult.value = ''; nextTick(() => cmdInputRef.value?.focus()) }
  }
  if (e.key === 'Escape' && cmdVisible.value) {
    cmdVisible.value = false
  }
}

// \u6302\u8F7D/\u5378\u8F7D\u952E\u76D8\u4E8B\u4EF6
import { onMounted, onUnmounted } from 'vue'
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

function hoverBg(e: Event, color: string) {
  const el = e.currentTarget as HTMLElement | null
  if (el) el.style.background = color
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
  <div class="h-full flex flex-col max-w-lg mx-auto w-full" style="background: #0D1117;">

    <!-- ========== 开始画面 ========== -->
    <StartScreen
      v-if="gameState.phase === 'start'"
      :gameState="gameState"
      @start-game="handleStartGame"
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
      <StatusBar :gameState="gameState" />

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
        class="flex-1 flex flex-col overflow-hidden"
        style="background: #0D1117;"
      >
        <!-- 敌人信息头部 -->
        <div class="border-b px-4 py-2" style="border-color: #2a3a3a;">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-bold" style="color: #c4746e;">
                ⚔️ {{ combatState.enemy.name }} x{{ combatState.enemy.count }}
              </span>
              <span class="text-xs ml-2" style="color: #5a6a7a;">
                HP: {{ Math.max(0, combatState.enemy.actualHp) }}/{{ combatState.enemy.maxHp }}
              </span>
              <span class="text-[10px] ml-2" style="color: #5a6a7a;">
                {{ combatState.enemy.desc || '' }}
              </span>
          </div>
        </div>
      </div>

        <!-- 战斗日志 -->
        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-2 relative"
             ref="combatLogRef"
             @scroll="checkCombatScroll">
          <!-- 丧尸描述（左侧） -->
          <div v-if="combatState.enemyDesc" class="text-sm leading-relaxed" style="color: #c4746e;">
            <span class="text-[10px] font-bold" style="color: #5a6a7a;">{{ combatState.enemy.name }}:</span>
            <p class="mt-0.5">{{ combatState.enemyDesc }}</p>
          </div>
          <div
            v-for="(round, idx) in combatState.rounds"
            :key="idx"
            class="text-sm leading-relaxed"
          >
            <!-- 玩家行动（右对齐） -->
            <div v-if="round.playerText" class="text-right"
                 :style="{ color: rollingRound === idx ? '#5a6a7a' : (round.isCrit ? '#FFD700' : '#9ACD9D') }">
              <span class="text-[10px]" style="color: #5a6a7a;">你:</span>
              <p class="mt-0.5" :class="{ 'crit-scan': round.isCrit && rollingRound !== idx }">
                <template v-if="rollingRound === idx">{{ rollingText }}</template>
                <template v-else>{{ round.playerText }}</template>
              </p>
            </div>
            <!-- 敌人行动（左对齐）：骰子动画期间隐藏 -->
            <div v-if="round.enemyText && rollingRound !== idx" class="mt-1" style="color: #c4746e;">
              <span class="text-[10px] font-bold" style="color: #5a6a7a;">
                {{ combatState.enemy.name }}:
              </span>
              <p class="mt-0.5">{{ round.enemyText }}</p>
            </div>
          </div>

          <!-- 战斗日志回到底部按钮 -->
          <button
            v-if="showCombatScrollBtn"
            @click="scrollCombatLog"
            class="sticky bottom-2 z-10 text-xs px-3 py-1 border rounded-sm mx-auto block"
            style="background: #1a1f1f; border-color: #E6C37C; color: #E6C37C;"
            @mouseenter="e => (e.target as HTMLElement).style.background = '#2a3535'"
            @mouseleave="e => (e.target as HTMLElement).style.background = '#1a1f1f'"
          >↓ 回到底部</button>

          <!-- 底部留空避免按钮遮挡日志 -->
          <div class="h-16"></div>
        </div>

        <!-- 策略选项（骰子动画期间隐藏，保留占位） -->
        <div :class="{ 'invisible': combatState.result || rollingRound !== null }" class="border-t px-2 py-2 space-y-1" style="border-color: #2a3a3a;">
          <button
            v-for="s in combatStrategies"
            :key="s.id"
            @click="handleCombatAction(s.id)"
            class="w-full text-left px-3 py-2 text-xs border min-h-[44px] rounded-sm transition-colors"
            :style="{
              borderColor: '#2a3a3a',
              color: '#B0C4DE',
              background: '#0D1117',
            }"
            @mouseenter="hoverBg($event, '#1e2a2a')"
            @mouseleave="hoverBg($event, '#0D1117')"
          >
            <div class="leading-tight">
              <span>{{ s.name }}</span>
              <div v-if="s.isWeapon" style="color: #5a6a7a; font-size: 10px;" v-html="s.desc"></div>
              <div v-else style="color: #5a6a7a; font-size: 10px;">{{ s.desc }}</div>
            </div>
          </button>
          <!-- 逃跑 + 一键 同一行 -->
          <div class="flex gap-2">
            <button
              @click="handleCombatAction('flee')"
              class="flex-1 px-2.5 py-2 text-xs border rounded-sm min-h-[44px] transition-colors text-center"
              style="border-color: #E6C37C; color: #E6C37C; background: #0D1117;"
              @mouseenter="hoverBg($event, '#1e2a2a')"
              @mouseleave="hoverBg($event, '#0D1117')"
            >🏃 逃跑</button>
            <button
              @click="handleCombatAction('auto')"
              class="flex-1 px-2.5 py-2 text-xs border rounded-sm min-h-[44px] transition-colors text-center"
              style="border-color: #2a3a3a; color: #5a6a7a; background: #0D1117;"
              @mouseenter="hoverBg($event, '#1e2a2a')"
              @mouseleave="hoverBg($event, '#0D1117')"
            >⚡ 一键</button>
          </div>
        </div>

        <!-- 战斗结果 -->
        <div :class="{ 'invisible': !combatState.result && rollingRound === null }" class="border-t px-4 py-3 text-center" style="border-color: #2a3a3a;">
          <p v-if="combatState.result === 'victory' && !combatRewardActive" class="text-sm font-bold" style="color: #9ACD9D;">💀 战斗胜利！</p>
          <p v-else-if="combatState.result === 'fled'" class="text-sm" style="color: #E6C37C;">🏃 你脱离了战斗。</p>
          <p v-else-if="combatState.result === 'death'" class="text-sm font-bold" style="color: #c4746e;">💀 你倒下了……</p>

          <!-- 战后奖励：搜刮尸体 -->
          <div v-if="combatRewardActive" class="mt-1">
            <template v-if="!combatRewardRolled">
              <p class="text-xs mb-2" style="color: #B0C4DE;">搜索尸体看看有什么可用的……</p>
              <button
                @click="handleCombatRewardDice"
                class="w-full py-2.5 px-4 text-sm border rounded-sm transition-colors min-h-[44px]"
                style="border-color: #E6C37C; color: #E6C37C; background: #0D1117;"
                @mouseenter="hoverBg($event, '#1e2a2a')"
                @mouseleave="hoverBg($event, '#0D1117')"
              >🎲 搜刮战利品</button>
            </template>
            <template v-else>
              <p class="text-sm leading-relaxed" style="color: #B0C4DE;">{{ combatRewardText }}</p>
            </template>
          </div>
        </div>
      </div>

      <!-- 机遇模式（骰子判定） -->
      <div v-if="opportunityMode && currentOpp && currentOpp.type === 'dice' && !oppDiceRolled"
           class="border-t px-4 py-3" style="border-color: #2a3a3a;">
        <div class="text-center">
          <button
            @click="handleOppDice"
            class="w-full py-3 px-4 text-sm border rounded-sm transition-colors min-h-[44px]"
            :disabled="!oppRollReady"
            :style="{ borderColor: oppRollReady ? '#E6C37C' : '#2a3a3a', color: oppRollReady ? '#E6C37C' : '#5a6a7a', background: '#0D1117' }"
            @mouseenter="hoverBg($event, '#1e2a2a')"
            @mouseleave="hoverBg($event, '#0D1117')"
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
        @toggle-inventory="toggleInventory"
        @toggle-journal="toggleJournal"
        @toggle-map="toggleMap"
        @save-game="handleSave"
        @load-game="handleLoad"
      />
    </template>

    <!-- ========== 命令面板 ========== -->
    <div v-if="cmdVisible"
         class="fixed inset-x-0 top-0 z-50 flex justify-center pt-4 px-3"
         style="pointer-events: none;">
      <div class="w-full max-w-lg border rounded-sm p-4"
           style="background: #0D1117; border-color: #2a3a3a; pointer-events: auto;">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-bold" style="color: #E6C37C;">⌘ 命令面板</span>
          <button @click="cmdVisible = false" class="text-xs px-2 py-1 border rounded-sm"
                  style="border-color: #c4746e; color: #c4746e; background: none;"
                  @mouseenter="e => (e.target as HTMLElement).style.background = '#1e1a1a'"
                  @mouseleave="e => (e.target as HTMLElement).style.background = 'none'">✕ 关闭</button>
        </div>
        <div class="flex gap-2">
          <input ref="cmdInputRef" v-model="cmdInput"
                 @keydown.enter="handleCmd"
                 class="flex-1 px-2 py-1.5 text-sm border rounded-sm outline-none"
                 style="background: #1a1f1f; border-color: #2a3a3a; color: #B0C4DE;">
          <button @click="handleCmd"
                  class="px-3 py-2 text-sm border rounded-sm min-h-[44px]"
                  style="border-color: #E6C37C; color: #E6C37C; background: #0D1117;"
                  @mouseenter="e => (e.target as HTMLElement).style.background = '#1e2a2a'"
                  @mouseleave="e => (e.target as HTMLElement).style.background = '#0D1117'">⏎</button>
        </div>
        <div v-if="cmdResult" class="mt-2 text-sm leading-relaxed" style="color: #9ACD9D;">{{ cmdResult }}</div>
      </div>
    </div>

    <!-- ========== 面板覆盖层 ========== -->
    <InventoryDrawer
      v-if="gameState.showInventory"
      :gameState="gameState"
      @close="gameState.showInventory = false"
      @use-item="handleUseItem"
      @drop-item="handleDropItem"
      @equip-weapon="handleEquipWeapon"
      @equip-armor="handleEquipArmor"
      @unequip="handleUnequip"
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
