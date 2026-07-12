<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import type { GameState, Item, SituationOption, CombatState } from './types'
import { createGameState, resetGameState, addToInventory, removeFromInventory,
         useItem, modifyStat, addJournalEntry } from './game/state.js'
import { generateEvent, resolveOption, applySurvivalDecay, exploreNewArea,
         generateCombat, resolveCombatRound, fleeCombat, rebuildCurrentOptions,
         getCombatStrategies, autoResolveCombat,
         startDialogue as engineStartDialogue, equipWeapon, equipArmor, unequipItem } from './game/engine.js'
import { scenes, itemDB } from './data/index.js'
import { checkEndings } from './game/ending-utils.js'

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
const rollingRound = ref<number | null>(null)  // 正在骰子动画的回合索引
const rollingText = ref('')  // 动画期间的显示文本

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
  addJournalEntry(gameState, `👜 初始物品：水壶、能量棒、${bonusItem ? bonusItem.name : ''}`, 'action')

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

  // 将结果文本写入日志（显示在叙事区）
  addJournalEntry(gameState, result.narrativeText, 'result')
  if (result.loot && result.loot.length > 0) {
    resultLoot.value = result.loot
    const lootNames = result.loot.map(i => i.name).join('、')
    addJournalEntry(gameState, `👜 获得了：${lootNames}`, 'action')
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
    if (result._zombieWarn) {
      // 先显示警告文本，延迟 1.5 秒再进入战斗
      setTimeout(() => {
        combatState.value = result.combat
        const enemy = result.combat?.enemy
        combatStrategies.value = getCombatStrategies(gameState, enemy)
        showCombatUI.value = true
      }, 1500)
    } else {
      combatState.value = result.combat
      const enemy = result.combat?.enemy
      combatStrategies.value = getCombatStrategies(gameState, enemy)
      showCombatUI.value = true
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

  // 骰子动画：对含有 🎲[ 的回合进行摇晃动画
  if (roundIdx >= 0 && combat.rounds[roundIdx].playerText.includes('🎲[')) {
    const realText = combat.rounds[roundIdx].playerText
    const match = realText.match(/🎲\[(\d+)\]/) || realText.match(/🎲\[(\d+)\]/)
    rollingRound.value = roundIdx

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let ticks = 0
    const interval = setInterval(() => {
      ticks++
      const fakeRoll = chars[Math.floor(Math.random() * chars.length)] +
                       chars[Math.floor(Math.random() * chars.length)]
      rollingText.value = realText
        .replace(/🎲\[[^\]]+\]/, `🎲[${fakeRoll}]`)
        .replace(/\d+ 点伤害/, '?? 点伤害')
      combatState.value = { ...combat }

      if (ticks >= 12) {
        clearInterval(interval)
        rollingRound.value = null
        rollingText.value = ''
        combatState.value = { ...combat }
      }
    }, 70)
  }

  combatState.value = { ...combat }

  const delay = combat.rounds?.length ? Math.min(600 + combat.rounds.length * 200, 2000) : 600

  setTimeout(() => {
    if (combat.result === 'victory' || combat.result === 'fled') {
      showCombatUI.value = false
      combatState.value = null
      checkAndTriggerEnding()
      if (gameState.phase !== 'ending') {
        const event = generateEvent(gameState)
        currentEventText.value = event.text
        currentOptions.value = event.options
        resultLoot.value = []
      }
    } else if (combat.result === 'death') {
      showCombatUI.value = false
      checkAndTriggerEnding()
    }
  }, delay)
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
    let useText = `使用了 ${item.name}。`
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
    addJournalEntry(gameState, `丢弃了 ${item.name}。`, 'action')
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

function hoverBg(e: Event, color: string) {
  const el = e.currentTarget as HTMLElement | null
  if (el) el.style.background = color
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

      <!-- 对话模式 -->
      <DialogPanel
        v-if="gameState.phase === 'dialogue'"
        :gameState="gameState"
        @dialogue-result="handleDialogueResult"
      />

      <!-- 战斗模式（全屏覆盖，类似对话） -->
      <div
        v-else-if="showCombatUI && combatState"
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

        <!-- 战斗日志（类似对话历史） -->
        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-2">
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
                 :style="{ color: rollingRound === idx ? '#5a6a7a' : '#9ACD9D' }">
              <span class="text-[10px]" style="color: #5a6a7a;">你:</span>
              <p class="mt-0.5">
                <template v-if="rollingRound === idx">{{ rollingText }}</template>
                <template v-else>{{ round.playerText }}</template>
              </p>
            </div>
            <!-- 敌人行动（左对齐） -->
            <div v-if="round.enemyText" class="mt-1" style="color: #c4746e;">
              <span class="text-[10px] font-bold" style="color: #5a6a7a;">
                {{ combatState.enemy.name }}:
              </span>
              <p class="mt-0.5">{{ round.enemyText }}</p>
            </div>
          </div>
        </div>

        <!-- 策略选项（类似对话选项） -->
        <div v-if="!combatState.result" class="border-t px-2 py-2 space-y-1" style="border-color: #2a3a3a;">
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
              <div style="color: #5a6a7a; font-size: 10px;">{{ s.desc }}</div>
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
        <div v-else class="border-t px-4 py-3 text-center" style="border-color: #2a3a3a;">
          <p v-if="combatState.result === 'victory'" class="text-sm font-bold" style="color: #9ACD9D;">💀 战斗胜利！</p>
          <p v-else-if="combatState.result === 'fled'" class="text-sm" style="color: #E6C37C;">🏃 你脱离了战斗。</p>
          <p v-else-if="combatState.result === 'death'" class="text-sm font-bold" style="color: #c4746e;">💀 你倒下了……</p>
        </div>
      </div>

      <!-- 普通模式 -->
      <template v-else>
        <!-- 叙事区 -->
        <NarrativeArea :gameState="gameState" />

        <!-- 选项区 -->
        <OptionsPanel
          v-if="!showCombatUI"
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
