/**
 * 游戏引擎 — 丧尸末日生存
 * 选项解析、叙事生成、生存衰减、对话
 */

import { scenes, situations, itemDB, npcDB } from '../data/index.js'
import { getLootPool, getRandomItem } from './item-utils.js'
import { getTimeModifier, getRandomWeather, getPlayerStatusModifiers } from './world-utils.js'
import { getNPCDialogue, getDialogueNode } from './npc-utils.js'
import { checkEndings } from './ending-utils.js'
import { opportunities } from '../data/opportunities.js'
import {
  randInt, randFloat, chance, randomPick,
  rollSuccess, clamp,
  hasItem, hasItemWithTag,
} from './utils.js'
import {
  addToInventory, removeFromInventory, modifyStat,
  addJournalEntry, getEffectiveCapacity, getUsedSlots, processEvents,
} from './state.js'

// 子模块
import { generateEvent, rebuildCurrentOptions } from './engine/events.js'
import { getCombatStrategies, generateCombat, resolveCombatRound, fleeCombat, autoResolveCombat } from './engine/combat.js'

// 重新导出（供 App.vue 使用）
export { generateEvent, rebuildCurrentOptions }
export { getCombatStrategies, generateCombat, resolveCombatRound, fleeCombat, autoResolveCombat }

// ==================== 生存衰减 ====================

export function applySurvivalDecay(state) {
  state.dayCount += 1 / 24  // 每行动1小时
  state.actionCount++

  const hungerDecay = randInt(2, 4)
  state.hunger = clamp(state.hunger - hungerDecay, 0, state.maxHunger)

  const thirstDecay = randInt(2, 5)
  state.thirst = clamp(state.thirst - thirstDecay, 0, state.maxThirst)

  if (state.infection > 0) {
    state.infection = clamp(state.infection + randInt(1, 2), 0, state.maxInfection)
  }

  let sanityDecay = 0
  const timeMod = getTimeModifier(state.dayCount)
  if (timeMod.sanityDrain) sanityDecay += timeMod.sanityDrain
  const statusMods = getPlayerStatusModifiers(state)
  for (const mod of statusMods) {
    if (mod.sanityDrain) sanityDecay += mod.sanityDrain
  }
  state.sanity = clamp(state.sanity - sanityDecay, 0, state.maxSanity)

  // 睡眠不足惩罚（每行动 +1h）
  state.hoursAwake = (state.hoursAwake || 0) + 1
  if (state.hoursAwake >= 12) {
    const fatiguePenalty = 4
    state.sanity = clamp(state.sanity - fatiguePenalty, 0, state.maxSanity)
    state.hp = clamp(state.hp - 2, 0, state.maxHp)
    if (state.hoursAwake >= 12 && state.hoursAwake <= 12.5) {
      addJournalEntry(state, '<span class="dim">⊗ 你已经超过12小时没休息了，视线开始模糊，脚步踉跄。再不休息你会垮掉的。</span>', 'warning')
    }
  } else if (state.hoursAwake >= 10) {
    const fatiguePenalty = 2
    state.sanity = clamp(state.sanity - fatiguePenalty, 0, state.maxSanity)
    state.hp = clamp(state.hp - 1, 0, state.maxHp)
  } else if (state.hoursAwake >= 8) {
    const fatiguePenalty = 1
    state.sanity = clamp(state.sanity - fatiguePenalty, 0, state.maxSanity)
    if (state.hoursAwake >= 8 && state.hoursAwake <= 8.5) {
      addJournalEntry(state, '<span class="dim">⊗ 你已经连续行动8小时了，体力开始下降。最好找个地方休息一下。</span>', 'warning')
    }
  }

  if (state.hunger <= 0) {
    state.hp = clamp(state.hp - randInt(3, 6), 0, state.maxHp)
    if (!state.journal.find(j => j.text.includes('饥饿') && j.id > state.actionCount - 5)) {
      addJournalEntry(state, '<span class="dim">⊗ 你感到极度的饥饿，身体开始消耗自己。</span>', 'warning')
    }
  } else if (state.hunger < 20 && chance(0.3)) {
    state.hp = clamp(state.hp - 1, 0, state.maxHp)
  }
  if (state.thirst <= 0) {
    state.hp = clamp(state.hp - randInt(4, 8), 0, state.maxHp)
    if (!state.journal.find(j => j.text.includes('脱水') && j.id > state.actionCount - 5)) {
      addJournalEntry(state, '<span class="dim">⊗ 严重脱水，你的嘴唇开裂，视野模糊。</span>', 'warning')
    }
  } else if (state.thirst < 20 && chance(0.3)) {
    state.hp = clamp(state.hp - 2, 0, state.maxHp)
  }

  // ===== 超重检查 =====
  const used = getUsedSlots(state)
  const cap = getEffectiveCapacity(state)
  if (used > cap) {
    if (state._isOverweight) {
      let msg = '⊗ 你的背包终于撑不住了，有些东西损坏了。'
      const backpacks = state.inventory.filter(i => i.id === 'backpack')
      for (const bp of backpacks) {
        removeFromInventory(state, bp.id)
      }
      let tries = 0
      while (getUsedSlots(state) > cap && tries < 50) {
        const idx = Math.floor(Math.random() * state.inventory.length)
        if (idx >= 0 && idx < state.inventory.length) {
          removeFromInventory(state, state.inventory[idx].id)
        }
        tries++
      }
      addJournalEntry(state, '<span class="dim">' + msg + '</span>', 'danger')
      state._isOverweight = false
    } else {
      addJournalEntry(state, '<span class="dim">⊗ 背包快装不下了，用掉或丢弃一些东西腾出空间。</span>', 'warning')
      state._isOverweight = true
    }
  } else {
    state._isOverweight = false
  }
}

// ==================== 选项解析 ====================

export function resolveOption(state, option) {
  let result: any = {
    success: false,
    narrativeText: '',
    effects: {},
    loot: [],
    combat: null,
    dialogue: null,
    ending: null,
    sceneChange: null,
  }

  const baseRate = option.successRate || 0.5
  let rateMod = 0
  if (hasItemWithTag(state, '隐蔽') && option.tags && option.tags.includes('潜行')) rateMod += 0.15
  if (hasItemWithTag(state, '照明') && state.currentModifiers.some(m => m.needsLight)) rateMod += 0.2

  const success = rollSuccess(baseRate, { bonus: rateMod })
  result.success = success

  result.narrativeText = buildResultText(option, success, state)

  // 旧 sanityEffect：仅在没有 onSuccess/onFailure 时生效（向后兼容）
  if (option.sanityEffect && !option.onSuccess && !option.onFailure) {
    modifyStat(state, 'sanity', option.sanityEffect)
    result.effects.sanity = option.sanityEffect
  }

  if (success) {
    result = applySuccessEffects(result, option, state)
  } else {
    result = applyFailureEffects(result, option, state)
  }

  updateLegacyTags(state, option, success)
  applySurvivalDecay(state)

  const ending = checkEndings(state)
  if (ending) {
    result.ending = ending
    state.phase = 'ending'
  }

  const currentSceneData = scenes[state.currentScene]
  if (!option.combat && success && currentSceneData && currentSceneData.danger >= 4 && chance(0.12)) {
    result.combat = generateCombat(state)
  }

  // option.combat：onSuccess 未声明 combat 时由旧逻辑触发战斗
  if (option.combat && success && !option.onSuccess?.combat) {
    result.combat = generateCombat(state)
  }

  if (state.currentScene === 'laboratory' && !state.labDiscovered) {
    state.labDiscovered = true
    addJournalEntry(state, '🔬 你发现了基因治疗研究中心。这里可能藏着关于病毒起源的真相。', 'discovery')
  }

  // 地下场景累计行动计数（结局12：地下之王）
  if (state.currentScene === 'subway' || state.currentScene === 'parking_garage') {
    state.undergroundActions++
  }

  // 安全区累计行动计数（结局8：新家园）
  if (state.safeZoneJoined) {
    state.safeZoneActions++
  }

  if (option.isMoveOn || option.isFallback || option.id === 'fallback_move_on') {
    result.sceneChange = true
  }

  return result
}

// ==================== 声明式效果应用（新路径） ====================

function applyOutcomeEffects(result: any, outcome: any, state: any, isSuccess: boolean) {
  // 1. 直接 stat 变化
  if (outcome.effects) {
    const eff = outcome.effects
    if (eff.hp !== undefined) { modifyStat(state, 'hp', eff.hp); result.effects.hp = eff.hp }
    if (eff.hunger !== undefined) { modifyStat(state, 'hunger', eff.hunger); result.effects.hunger = eff.hunger }
    if (eff.thirst !== undefined) { modifyStat(state, 'thirst', eff.thirst); result.effects.thirst = eff.thirst }
    if (eff.sanity !== undefined) { modifyStat(state, 'sanity', eff.sanity); result.effects.sanity = eff.sanity }
    if (eff.infection !== undefined) { modifyStat(state, 'infection', eff.infection); result.effects.infection = eff.infection }
    if (eff.hoursAwake !== undefined) { state.hoursAwake = eff.hoursAwake }
    if (eff.dayIncrement !== undefined) { state.dayCount += eff.dayIncrement / 24 }
  }

  // 2. 固定物品奖励
  if (outcome.loot) {
    for (const itemId of outcome.loot) {
      const item = itemDB[itemId]
      if (item && addToInventory(state, item)) result.loot.push(item)
    }
  }

  // 3. 随机战利品
  if (outcome.lootRandom && chance(outcome.lootRandom.chance ?? 0.9)) {
    const count = outcome.lootRandom.count ?? randInt(1, 3)
    const currentScene = state.currentScene ? scenes[state.currentScene] : undefined
    const loot = getLootPool(count, state.inventory, { scene: currentScene })
    for (const item of loot) {
      if (addToInventory(state, item)) result.loot.push(item)
    }
  }

  // 4. 事件（仅此结果触发）
  if (outcome.events) processEvents(state, outcome.events)

  // 5. 战斗
  if (outcome.combat || (outcome.combatChance && chance(outcome.combatChance))) {
    result.combat = generateCombat(state)
    if (!isSuccess) result._zombieWarn = true
  }

  // 6. 物品丢失
  if (outcome.loseItem) {
    removeFromInventory(state, outcome.loseItem)
    result.effects.lostItem = outcome.loseItem
  }
  if (outcome.loseRandomItem && state.inventory.length > 0) {
    const lost = randomPick(state.inventory)
    removeFromInventory(state, lost.id)
    result.effects.lostItem = lost
  }

  // 7. 额外日志
  if (outcome.journalEntry) {
    addJournalEntry(state, outcome.journalEntry, isSuccess ? 'result' : 'danger')
  }

  return result
}

function applySuccessEffects(result: any, option: any, state: any) {
  // 新声明式路径
  if (option.onSuccess) {
    return applyOutcomeEffects(result, option.onSuccess, state, true)
  }

  // === 以下为旧硬编码逻辑（向后兼容） ===
  const lootChance = option.tags && option.tags.includes('搜索') ? 0.9 : 0
  if (chance(lootChance)) {
    const lootCount = randInt(1, 3)
    const currentScene = state.currentScene ? scenes[state.currentScene] : undefined
    const loot = getLootPool(lootCount, state.inventory, { scene: currentScene })
    for (const item of loot) {
      if (addToInventory(state, item)) result.loot.push(item)
    }
  }
  if (option.id === 'rest' || option.id === 'rest_here') {
    modifyStat(state, 'hp', 10)
    modifyStat(state, 'sanity', 15)
    state.hoursAwake = 0
    const sleepHours = randInt(6, 8)
    state.dayCount += sleepHours / 24
    result.effects.hp = 10
    result.effects.sanity = 15
    result.effects.sleepHours = sleepHours
  }
  if (option.id === 'harvest') {
    const food = getRandomItem('food')
    if (food && addToInventory(state, food)) result.loot.push(food)
    const drink = getRandomItem('drink')
    if (drink && addToInventory(state, drink)) result.loot.push(drink)
  }
  if (option.isMoveOn || option.isFallback || option.id === 'fallback_move_on' || option.id === 'move_on') {
    const moveHunger = randInt(3, 6)
    const moveThirst = randInt(2, 4)
    modifyStat(state, 'hunger', -moveHunger)
    modifyStat(state, 'thirst', -moveThirst)
    result.effects.moveHunger = moveHunger
    result.effects.moveThirst = moveThirst
  }
  if (option.events) processEvents(state, option.events)
  return result
}

function applyFailureEffects(result: any, option: any, state: any) {
  // 新声明式路径
  if (option.onFailure) {
    return applyOutcomeEffects(result, option.onFailure, state, false)
  }

  // === 以下为旧硬编码逻辑（向后兼容） ===
  const isCombatOption = option.combat === true
  if (!isCombatOption) {
    const dmg = randInt(5, 15)
    modifyStat(state, 'hp', -dmg)
    result.effects.hp = -dmg
  }
  if (isCombatOption) {
    result.combat = generateCombat(state)
    result._zombieWarn = true
  } else if (chance(0.8) && !state.inCombat) {
    result.combat = generateCombat(state)
    result._zombieWarn = true
  } else if (chance(0.2)) {
    const inf = randInt(5, 15)
    modifyStat(state, 'infection', inf)
    result.effects.infection = inf
    addJournalEntry(state, '⚠️ 你在混乱中被丧尸抓伤了。伤口在发黑……', 'danger')
  }
  if (chance(0.15) && state.inventory.length > 0) {
    const lost = randomPick(state.inventory)
    removeFromInventory(state, lost.id)
    result.effects.lostItem = lost
  }
  if (option.events) processEvents(state, option.events)
  return result
}

function updateLegacyTags(state: any, option: any, success: any) {
  state.legacyTags = []
  if (option.tags) {
    if (option.tags.includes('噪音')) state.legacyTags.push('made_noise')
    if (option.tags.includes('隐蔽') || option.tags.includes('潜行')) state.legacyTags.push('was_stealthy')
  }
}

// ==================== 丰富叙事文本生成 ====================

const sceneAtmosphere = {
  hospital: ['消毒水的气味混合着腐烂', '走廊尽头的应急灯有节奏地闪烁', '翻倒的病床和散落的病历'],
  supermarket: ['踩烂的食品包装在脚下发出窸窣声', '空气里弥漫着变质水果的甜腻气味', '翻倒的货架投下长长的影子'],
  subway: ['远处隧道传来水滴的回声', '月台上散落着匆忙撤离时留下的行李', '墙壁上蔓延着暗色的霉斑'],
  overpass: ['桥下的废弃车龙在暮色中像金属墓碑', '风吹过桥面发出呜呜的响声', '远处城市的轮廓在雾中若隐若现'],
  apartment: ['墙上的挂历蒙着厚厚的灰', '某个房间里传来风吹窗帘的声音', '地板上散落着匆忙打包时掉落的衣物'],
  forest_path: ['松针在脚下发出轻微的碎裂声', '树枝在风中轻轻摇晃', '空气出奇地清新——末日似乎还没蔓延到这里'],
  police_station: ['翻倒的办公桌后面还有未喝完的咖啡', '墙壁上布满了弹孔', '无线电设备还在发出白噪音'],
  default: ['四周一片寂静', '尘埃在微弱的光线中飘浮', '时间仿佛在这里停滞了'],
}

function buildResultText(option: any, success: any, state: any) {
  // 新字段优先
  const successText = option.onSuccess?.text || option.successText
  const failText = option.onFailure?.text || option.failText
  if (successText || failText) {
    return success ? (successText || failText) : (failText || successText)
  }

  const scene = scenes[state.currentScene]
  const sceneName = scene ? scene.name : '这里'
  const atmArr = sceneAtmosphere[state.currentScene] || sceneAtmosphere.default
  const atm = randomPick(atmArr)

  if (option.isMoveOn || option.isFallback || option.id === 'fallback_move_on') {
    return randomPick([
      `你最后环视了一圈${sceneName}。这里已经没有更多东西值得停留了。你紧了紧背包带，推开吱呀作响的门，步入外面的世界。新鲜的空气让你精神一振。`,
      `你在${sceneName}的门口停留了片刻。不知道下一个地方会有什么等着你——也许更糟，也许更好。你迈出了脚步。`,
      `继续待在这里不是办法。你深吸一口气，离开了${sceneName}。街道在眼前延伸，空荡荡的建筑像沉默的观众注视着你一步步走进未知。`,
      `你收拾好从${sceneName}找到的东西，沿着来时的路返回主干道。天色在变化，你需要在下一个夜晚降临前找到安全的地方。`,
    ])
  }

  const id = option.id
  const tags = option.tags || []

  if (id === 'sneak' || tags.includes('潜行')) {
    return success
      ? `你屏住呼吸，背靠冰冷的墙壁，一步一步地挪动。${atm}。你能听到自己心脏跳动的声音——太响了，你觉得全世界都能听到。但丧尸没有。你慢慢移出了它们的感知范围，直到确认安全才敢大口呼吸。汗水已经浸透了你的衣领。`
      : `你小心翼翼地迈出一步——脚下踩到了一块碎玻璃。清脆的响声在寂静中像一声惊雷。${atm}。所有丧尸同时转向你的方向。糟了。你不得不拔腿就跑。`
  }

  if (id === 'fight' || tags.includes('战斗')) {
    const wn = state.inventory.find(i => i.type === 'weapon')?.name || '拳头'
    return success
      ? `你握紧${wn}迎了上去。${atm}。第一个丧尸扑过来的时候你侧身躲过，反手一击——暗色的血液溅在墙上。战斗持续了几分钟，但感觉像过了几个小时。当最后一个丧尸倒下时，你的手臂在发抖，但你站着。你活下来了。`
      : `你冲了上去，但丧尸比你预估的要多。${atm}。你被包围了，每一次挥击都越来越吃力。最终你杀出一条血路冲了出来，但代价让你几乎站立不稳。鲜血从你身上的伤口渗出。`
  }

  if (id === 'loot' || id === 'search_deep' || id === 'take' || id === 'check_back' || id === 'loot_food' || tags.includes('搜索')) {
    return success
      ? `你弯下腰，仔细翻找每一个角落。${atm}。大部分东西都被人拿走了，但你在一堆杂物下面发现了一些被遗漏的物资——也许慌乱中掉落，也许故意藏起来留给后来的人。`
      : `你花了很长时间翻找，但这里早就被洗劫过了。${atm}。除了一些没用的空包装和碎玻璃，什么都没找到。你直起腰，感到一阵失望。`
  }

  if (id === 'rest') {
    return success
      ? `你找了一个相对安全的角落，用能找到的东西堵住门窗。${atm}。你靠着墙坐下，闭上眼睛。睡眠很浅——每一个声响都会让你惊醒——但几个小时后，你感觉身体和精神都恢复了一些。末日里，能闭上眼睛安心睡一觉是最大的奢侈。`
      : `你刚闭上眼睛不到半小时，远处传来的撞击声就把你惊醒了。${atm}。有一群丧尸正在附近徘徊。你不得不提前结束休息，匆忙收拾东西准备应对可能的威胁。`
  }

  if (id === 'help' || id === 'give_antibiotics' || id === 'offer_bandage' || id === 'investigate' || id === 'rescue' || tags.includes('救援')) {
    return success
      ? `你小心翼翼地靠近，随时准备应对最坏的情况。${atm}。幸运的是，这次你的判断是对的。在末日里伸出援手需要勇气——因为你永远不知道对方是人还是陷阱。你帮助了需要帮助的人，这种善意也许会在未来某个时刻得到回报。`
      : `你试图帮忙，但情况比想象中复杂。${atm}。有时候，即使出于善意，结果也不尽如人意。你默默希望自己已经尽力了。`
  }

  if (id === 'trade' || id === 'trade_open' || id === 'trade_med') {
    return success
      ? `你警惕地靠近对方，一只手始终放在武器旁边。${atm}。交易过程很简短——双方都不想多停留。你得到了需要的东西，对方也一样。在末日里，信任是奢侈品，但交易是必需品。`
      : `你伸出手想进行交易，但对方突然改变了主意。${atm}。也许他们看到了什么，也许只是改变了想法。你空手而归。`
  }

  if (id === 'harvest') {
    return success
      ? `你蹲下来仔细辨认哪些东西还能吃、哪些已经坏了。${atm}。大自然在末日里依然慷慨——只要你知道去哪里找。你采摘了一些可以食用的东西，小心地装进背包。`
      : `你满怀希望地开始采摘，但很快就发现大部分东西都已经腐烂或被人摘走了。${atm}。你只找到很少的东西。`
  }

  if (id === 'pick' || id === 'force') {
    return success
      ? `你小心地操作着工具。${atm}。咔哒一声——门开了。里面可能有好东西，也可能什么都没有。你深吸一口气，推门而入。`
      : `你试了又试，但门纹丝不动。${atm}。也许你需要不同的工具，也许这道门后面根本没有什么值得费这么大劲的东西。`
  }

  if (id === 'avoid' || id === 'observe' || id === 'car_check' || id === 'avoid_trail' || id === 'avoid_plant' || id === 'avoid_cult' || id === 'avoid_mil') {
    return success
      ? `你选择保持距离，先观察清楚。${atm}。谨慎在末日里不是懦弱——它是让你活到明天的关键。你默默地记住了这里的情况，然后继续前行。`
      : `你试图保持距离，但意外的响动暴露了你的存在。${atm}。你不得不匆忙改变计划。`
  }

  if (id === 'retreat' || id === 'flee' || id === 'run' || id === 'leave') {
    return `你迅速做出决定——撤退。${atm}。有时候，活下去的关键不在于你打赢了多少战斗，而在于你避开了多少场。你退回安全的方向，重新计划下一步。`
  }

  if (id === 'distract' || tags.includes('投掷')) {
    return success
      ? `你捡起一件没用的东西，用力扔向远处。撞击声在寂静中回荡。${atm}。丧尸们被声音吸引，蹒跚着朝那个方向走去。你趁机从另一边溜了过去。`
      : `你扔出了东西，但声音不够大——或者丧尸群太大。${atm}。只有一部分丧尸被引开，剩下的依然堵在路上。`
  }

  if (id === 'shout' || id === 'respond' || id === 'call' || id === 'radio_call') {
    return success
      ? `你的声音在空气中回荡。${atm}。回应来得比你预期的快——虽然不是每次回应都代表好消息，但至少你得到了某种联系。在这个孤独的末日里，任何回应都是珍贵的。`
      : `你喊了出去，但回应你的只有回声。${atm}。也许你的声音传得不够远，也许根本没有人——或者没有人愿意回应。`
  }

  if (id === 'listen' || id === 'record') {
    return success
      ? `你屏住呼吸，全神贯注。${atm}。在末日里，信息有时候比食物更重要。你捕捉到了关键的线索，把它牢牢记在心里。`
      : `你努力想听清楚，但噪音太大了——或者信号太弱。${atm}。信息像沙子一样从指缝间溜走。你只捕捉到了只言片语。`
  }

  if (id === 'approach' || id === 'infiltrate' || tags.includes('社交')) {
    const sitId = option.situationId
    if (sitId === 'wounded_stranger' && id === 'give_supplies') {
      return success
        ? `你蹲下来，从背包里翻出医疗用品递给他。${atm}。他接过绷带时手在微微颤抖——是失血还是紧张，你分不清。「谢了。我欠你一条命。」他低下头处理伤口，你注意到他登山包侧袋里插着一把带瞄准镜的手弩。`
        : `你找遍了背包，但医疗用品已经用完了。你只能抱歉地摇摇头。他苦笑了一下，「没关系，我理解。」你继续赶路，心里有些不是滋味。`
    }
    if (sitId === 'barter_stall') {
      return success
        ? `你走近摊位，打量着桌上的物品。${atm}。戴鸭舌帽的人敲了敲桌面：「随便看，明码标价。不赊账，不找零。」你点点头，开始考虑用什么来交换。`
        : `你走近想看看桌上的东西，对方立刻警觉地按住了腰间的对讲机。「站住。先让我看看你有什么能换的。」你停下脚步，把手放在他能看到的地方。`
    }
    return success
      ? `你深吸一口气，把武器放在显眼但够不到的位置，举起双手慢慢靠近。${atm}。对面的人打量了你很久，最后认定你没有威胁。`
      : `你刚靠近几步，对方就举起了武器。「站住！再往前走一步就开枪了！」${atm}。你只能慢慢后退，举起双手示意没有恶意。这条路走不通了。`
  }

  return success
    ? `你谨慎地行动。${atm}。幸运的是，这次你的判断是对的。你环顾四周，确认没有新的威胁。`
    : `事情没有按预期发展。${atm}。你不得不临时调整计划。末日里没有万无一失的方案——重要的是随机应变，以及活下去。`
}

// ==================== 对话系统 ====================

export function startDialogue(state, npcId) {
  const npc = npcDB[npcId]
  if (!npc) return null
  if (!state.npcsMet.includes(npcId)) state.npcsMet.push(npcId)
  if (!state.npcRelations[npcId]) state.npcRelations[npcId] = npc.trust || 50
  const startNode = getNPCDialogue(npcId)
  if (!startNode) return null
  state.currentDialogue = { npcId, nodeId: startNode.id, npc, currentNode: startNode }
  state.phase = 'dialogue'
  addJournalEntry(state, `💬 遇到了 ${npc.name} — ${npc.title}。`, 'dialogue')
  return state.currentDialogue
}

export function selectDialogueOption(state, optionIndex) {
  const dlg = state.currentDialogue
  if (!dlg) return null
  const option = dlg.currentNode.options[optionIndex]
  if (!option) return null
  if (option.requireItems) {
    const hasAll = option.requireItems.every(id => hasItem(state, id))
    if (!hasAll) return { error: '缺少所需物品' }
  }
  if (option.trustChange && dlg.npcId) {
    state.npcRelations[dlg.npcId] = clamp((state.npcRelations[dlg.npcId] || 50) + option.trustChange, 0, 100)
  }
  if (option.sanityEffect) modifyStat(state, 'sanity', option.sanityEffect)

  const result: any = { npcText: '', playerText: option.text, options: [], outcome: option.outcome || null, reward: option.reward || null, nextNodeId: option.nextNode }
  if (option.reward) {
    for (const itemId of option.reward) {
      const item = itemDB[itemId]
      if (item && addToInventory(state, item)) {
        if (!result.rewardItems) result.rewardItems = []
        result.rewardItems.push(item)
      }
    }
  }
  if (option.nextNode) {
    const nextNode = getDialogueNode(dlg.npcId, option.nextNode)
    if (nextNode) {
      dlg.nodeId = nextNode.id
      dlg.currentNode = nextNode
      result.npcText = nextNode.npcText
      result.options = nextNode.options.map(opt => ({ ...opt, available: checkDialogueOptionAvailable(opt, state) }))
    } else {
      result.npcText = '（对话结束）'
      result.dialogueEnded = true
      state.phase = 'playing'
      state.currentDialogue = null
      applySurvivalDecay(state)
    }
  } else {
    result.npcText = '（对话结束）'
    result.dialogueEnded = true
    state.phase = 'playing'
    state.currentDialogue = null
    applySurvivalDecay(state)
  }
  if (option.outcome === 'alliance') { state.npcsHelped++; addJournalEntry(state, `🤝 你与${dlg.npc.name}结成了联盟。`, 'alliance') }
  if (option.outcome === 'escort_success') { state.npcsHelped++; addJournalEntry(state, `👧 你承诺帮助安娜找到汤姆哥。`, 'promise') }
  if (option.outcome === 'reward' || option.outcome === 'trade') { state.npcsHelped++ }
  return result
}

function checkDialogueOptionAvailable(option, state) {
  if (option.requireItems && option.requireItems.length > 0) {
    const hasAny = option.requireItems.some(id => hasItem(state, id))
    if (!hasAny) return false
  }
  if (option.requireTags && option.requireTags.length > 0) {
    const hasAnyTag = option.requireTags.some(tag => hasItemWithTag(state, tag))
    if (!hasAnyTag) return false
  }
  return true
}

// ==================== 特殊行动 ====================

export function exploreNewArea(state) {
  applySurvivalDecay(state)
  return generateEvent(state)
}

export function getOpportunities(state) {
  const scene = scenes[state.currentScene]
  if (!scene) return []

  const generic = opportunities.filter(o => !o.sceneTags || o.sceneTags.length === 0)
  const matched = opportunities.filter(o => o.sceneTags && o.sceneTags.some(t => scene.tags.includes(t)))

  let pool = [...generic, ...matched]
  const shuffled = pool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(3, Math.floor(Math.random() * 4)))
}
