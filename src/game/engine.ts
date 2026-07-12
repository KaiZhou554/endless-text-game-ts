/**
 * 游戏引擎 — 丧尸末日生存
 * 事件生成、选项解析、战斗、对话、生存衰减、丰富叙事
 */

import { scenes, situations, itemDB, npcDB } from '../data/index.js'
import { getLootPool, getRandomItem } from './item-utils.js'
import { getTimeModifier, getRandomWeather, getPlayerStatusModifiers } from './world-utils.js'
import { getNPCDialogue, getDialogueNode } from './npc-utils.js'
import { checkEndings } from './ending-utils.js'
import {
  randInt, randFloat, chance, randomPick, randomSample,
  weightedPick, rollSuccess, calcDamage, clamp,
  hasItem, hasItemWithTag, findItem, shuffle, uniqueId, formatDays,
} from './utils.js'
import {
  addToInventory, removeFromInventory, useItem, modifyStat,
  addJournalEntry, getEffectiveCapacity,
} from './state.js'

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
    const fatiguePenalty = 8
    state.sanity = clamp(state.sanity - fatiguePenalty, 0, state.maxSanity)
    state.hp = clamp(state.hp - 2, 0, state.maxHp)
    if (state.hoursAwake >= 12 && state.hoursAwake <= 12.5) {
      addJournalEntry(state, '⚠️ 你已经超过12小时没休息了，视线开始模糊，脚步踉跄。再不休息你会垮掉的。', 'warning')
    }
  } else if (state.hoursAwake >= 10) {
    const fatiguePenalty = 4
    state.sanity = clamp(state.sanity - fatiguePenalty, 0, state.maxSanity)
    state.hp = clamp(state.hp - 1, 0, state.maxHp)
  } else if (state.hoursAwake >= 8) {
    const fatiguePenalty = 2
    state.sanity = clamp(state.sanity - fatiguePenalty, 0, state.maxSanity)
    if (state.hoursAwake >= 8 && state.hoursAwake <= 8.5) {
      addJournalEntry(state, '⚠️ 你已经连续行动8小时了，体力开始下降。最好找个地方休息一下。', 'warning')
    }
  }

  if (state.hunger <= 0) {
    state.hp = clamp(state.hp - randInt(3, 6), 0, state.maxHp)
    if (!state.journal.find(j => j.text.includes('饥饿') && j.id > state.actionCount - 5)) {
      addJournalEntry(state, '⚠️ 你感到极度的饥饿，身体开始消耗自己。', 'warning')
    }
  } else if (state.hunger < 20 && chance(0.3)) {
    state.hp = clamp(state.hp - 1, 0, state.maxHp)
  }
  if (state.thirst <= 0) {
    state.hp = clamp(state.hp - randInt(4, 8), 0, state.maxHp)
    if (!state.journal.find(j => j.text.includes('脱水') && j.id > state.actionCount - 5)) {
      addJournalEntry(state, '⚠️ 严重脱水！你的嘴唇开裂，视野模糊。', 'warning')
    }
  } else if (state.thirst < 20 && chance(0.3)) {
    state.hp = clamp(state.hp - 2, 0, state.maxHp)
  }
}

// ==================== 事件生成 ====================

export function generateEvent(state, forceNewScene = false) {
  const needNewScene = forceNewScene || !state.currentScene || state._pendingScene
  let scene

  if (needNewScene) {
    scene = selectScene(state)
    state.currentScene = scene.id
    state.sceneActionCount = 0
    if (!state.scenesVisited.includes(scene.id)) {
      state.scenesVisited.push(scene.id)
    }
    addJournalEntry(state, `📍 你来到了${scene.name}。`, 'location')
    addJournalEntry(state, scene.desc, 'narrative')
  } else {
    scene = scenes[state.currentScene]
    if (!scene) {
      scene = selectScene(state)
      state.currentScene = scene.id
      state.sceneActionCount = 0
    }
  }

  const situation = selectSituation(scene, state)
  state.lastSituationId = state.currentSituation  // 记录上次情况，避免重复
  state.currentSituation = situation.id
  state.sceneActionCount++

  state.currentModifiers = collectModifiers(state, scene)
  const eventText = buildEventText(scene, situation, state.currentModifiers, state)
  state.currentEventText = eventText

  const options = buildOptions(scene, situation, state.currentModifiers, state)

  if (state.sceneActionCount >= 3) {
    options.push({
      id: 'move_on',
      text: randomPick([
        '收拾行装，前往下一个地点',
        '这里已经没什么可搜的了，继续赶路',
        '是时候离开了——天黑前得找到更好的地方',
        '继续待下去不安全了，转移阵地',
      ]),
      risk: '[离开当前场景] [饱腹-3~6] [口渴-2~4]',
      tags: ['前进', '移动'],
      available: true,
      disabledReason: null,
      situationId: situation.id,
      successRate: 1.0,
      isMoveOn: true,
    })
  }

  state.currentOptions = options
  addJournalEntry(state, eventText, 'narrative')

  return { scene, situation, modifiers: state.currentModifiers, options, text: eventText }
}

function selectScene(state) {
  if (state._pendingScene) {
    const pending = state._pendingScene
    state._pendingScene = null
    if (scenes[pending]) return scenes[pending]
  }

  const sceneList = Object.values(scenes)
  const weights = sceneList.map(s => {
    let w = 10 - s.danger
    if (state._targetScene && s.id === state._targetScene) w += 20
    if (!state.scenesVisited || !state.scenesVisited.includes(s.id)) w += 8
    if (s.id === state.currentScene) w -= 5
    return { value: s, weight: Math.max(1, w) }
  })
  return weightedPick(weights)
}

function selectSituation(scene, state) {
  const situationList = Object.values(situations)
  const weights = situationList.map(sit => {
    let w = 5
    const st = scene.tags || []
    if (st.includes('医疗') && sit.id.includes('pharmacy')) w += 8
    if (st.includes('医疗') && sit.id.includes('injured')) w += 6
    if (st.includes('食物') && sit.id.includes('food')) w += 8
    if (st.includes('食物') && sit.id.includes('supplies')) w += 5
    if (st.includes('黑暗') && sit.id.includes('sleep')) w += 4
    if (st.includes('关键地点') && sit.id.includes('radio')) w += 10
    if (st.includes('关键地点') && sit.id.includes('satellite')) w += 10
    if (st.includes('自然') && sit.id.includes('garden')) w += 8
    if (st.includes('自然') && sit.id.includes('plant')) w += 6
    if (state.hunger < 30 && sit.id.includes('food')) w += 5
    if (state.thirst < 30 && sit.id.includes('water')) w += 5
    if (state.hp < 30 && sit.id.includes('sleep')) w += 5
    if (state.infection > 40 && sit.id.includes('pharmacy')) w += 5
    if (state.legacyTags.includes('made_noise') && sit.id.includes('horde')) w += 6
    if (state.legacyTags.includes('was_stealthy') && sit.id.includes('cache')) w += 4
    if (scene.danger >= 5 && sit.danger >= 5) w += 3
    if (sit.id === state.currentSituation || sit.id === state.lastSituationId) {
      // 刚经历过的情景大幅降权
      w = Math.max(1, w - 12)
    }
    // 夜晚和疲劳时更可能找到休息处
    if (sit.id.includes('sleep')) {
      const hour = (state.dayCount * 24) % 24
      if (hour >= 20 || hour < 6) w += 8
      const awake = state.hoursAwake || 0
      if (awake >= 8) w += 8
      if (awake >= 10) w += 12
      if (awake >= 12) w += 20
    }
    return { value: sit, weight: Math.max(1, w) }
  })
  return weightedPick(weights)
}

function collectModifiers(state, scene) {
  const mods: any[] = []
  const timeMod = getTimeModifier(state.dayCount)
  mods.push(timeMod)
  const weatherMod = getRandomWeather()
  mods.push(weatherMod)
  const statusMods = getPlayerStatusModifiers(state)
  mods.push(...statusMods)
  for (const tag of state.legacyTags) {
    if (tag === 'made_noise') {
      mods.push({ id: 'made_noise', name: '发出了巨响', textPrefix: '刚才的响声还在空气中回荡。', dangerMod: 2 })
    }
    if (tag === 'was_stealthy') {
      mods.push({ id: 'was_stealthy', name: '保持了隐蔽', dangerMod: -1 })
    }
  }
  return mods
}

function buildEventText(scene, situation, modifiers, state) {
  let text = ''
  if (state.sceneActionCount <= 1) {
    text += `你在${scene.name}。`
    // 修饰条件（时间/天气/遗留标签）只在场景首次展示
    for (const mod of modifiers) {
      if (mod.textPrefix) text += ' ' + mod.textPrefix
    }
  }
  text += '\n\n'
  let sitText = situation.baseText
  sitText = sitText.replace('{count}', randInt(2, 6))
  text += sitText + '\n'
  // 玩家状态后缀始终展示（因为状态会变化）
  for (const mod of modifiers) {
    if (mod.textSuffix) text += '\n' + mod.textSuffix
  }
  if (state.sanity < 30 && chance(0.4)) {
    const hallucinations = [
      '\n（墙角的阴影似乎在移动……不，那只是你的幻觉。）',
      '\n（你听到有人在叫你的名字——但周围没有人。）',
      '\n（那些尸体……它们刚才是不是动了一下？）',
      '\n（你觉得有人在背后看着你。你回头，什么都没有。）',
    ]
    text += '\n' + randomPick(hallucinations)
  }
  return text
}

export function rebuildCurrentOptions(state) {
  const scene = scenes[state.currentScene]
  const situation = state.currentSituation ? situations[state.currentSituation] : null
  if (!scene || !situation) return []
  return buildOptions(scene, situation, state.currentModifiers || [], state)
}

function buildOptions(scene, situation, modifiers, state) {
  const options: any[] = []
  for (const opt of situation.options) {
    let available = true
    let disabledReason: string | null = null
    if (opt.requireItems && opt.requireItems.length > 0) {
      const hasAll = opt.requireItems.every(itemId => hasItem(state.inventory, itemId))
      if (!hasAll) {
        const hasAny = opt.requireItems.some(itemId => hasItem(state.inventory, itemId))
        if (opt.requireItems.length === 1 || !hasAny) {
          available = false
          disabledReason = `[需要: ${opt.requireItems.map(id => itemDB[id]?.name || id).join(' 或 ')}]`
        }
      }
    }
    if (opt.requireTags && opt.requireTags.length > 0 && available) {
      const hasTag = opt.requireTags.some(tag => hasItemWithTag(state.inventory, tag))
      if (!hasTag) {
        available = false
        disabledReason = `[需要物品标签: ${opt.requireTags.join(' 或 ')}]`
      }
    }
    if (opt.forbidTags && opt.forbidTags.length > 0 && available) {
      const hasForbidden = opt.forbidTags.some(tag =>
        hasItemWithTag(state.inventory, tag) || state.legacyTags.includes(tag)
      )
      if (hasForbidden) {
        available = false
        disabledReason = `[需要安静的环境]` as any
      }
    }
    // 背包满时阻止搜索/采集类行动
    if (available && opt.tags && (opt.tags.includes('搜索') || opt.tags.includes('采集'))) {
      const cap = getEffectiveCapacity(state)
      if (state.inventory.length >= cap) {
        available = false
        disabledReason = '⚠️ 背包已满，无法携带更多物品' as any
      }
    }
    options.push({ ...opt, available, disabledReason, situationId: situation.id })
  }

  const anyAvailable = options.some(o => o.available)
  if (!anyAvailable) {
    options.push({
      id: 'fallback_move_on',
      text: '这里没什么可做的，继续前进',
      risk: '[安全] [消耗时间]',
      tags: ['前进'],
      available: true,
      disabledReason: null,
      situationId: situation.id,
      successRate: 1.0,
      isFallback: true,
    })
  }
  return options
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
  if (hasItemWithTag(state.inventory, '隐蔽') && option.tags && option.tags.includes('潜行')) rateMod += 0.15
  if (hasItemWithTag(state.inventory, '照明') && state.currentModifiers.some(m => m.needsLight)) rateMod += 0.2

  const success = rollSuccess(baseRate, { bonus: rateMod })
  result.success = success

  result.narrativeText = buildResultText(option, success, state)

  if (option.sanityEffect) {
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

  // 高危险场景有一定几率直接触发战斗
  const currentSceneData = scenes[state.currentScene]
  if (!option.combat && success && currentSceneData && currentSceneData.danger >= 4 && chance(0.12)) {
    result.combat = generateCombat(state)
  }

  if (option.combat && success && chance(0.7)) {
    result.combat = generateCombat(state)
  }

  if (state.currentScene === 'laboratory' && !state.labDiscovered) {
    state.labDiscovered = true
    addJournalEntry(state, '🔬 你发现了基因治疗研究中心。这里可能藏着关于病毒起源的真相。', 'discovery')
  }

  // 如果是"离开"选项，标记需要换场景
  if (option.isMoveOn || option.isFallback || option.id === 'fallback_move_on') {
    result.sceneChange = true
  }

  return result
}

function applySuccessEffects(result: any, option: any, state: any) {
  // 只有明确标记为"搜索"的行动才会获得物资
  const lootChance = option.tags && option.tags.includes('搜索') ? 0.9 : 0
  if (chance(lootChance)) {
    const lootCount = randInt(1, 3)
    const loot = getLootPool(lootCount)
    for (const item of loot) {
      if (addToInventory(state, item)) result.loot.push(item)
    }
  }
  if (option.id === 'rest') {
    modifyStat(state, 'hp', 10)
    modifyStat(state, 'sanity', 15)
    state.hoursAwake = 0  // 休息后清醒时间归零
    // 休息额外跳过 6-8 小时
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
    // 转移阵地消耗饱腹和口渴
    const moveHunger = randInt(3, 6)
    const moveThirst = randInt(2, 4)
    modifyStat(state, 'hunger', -moveHunger)
    modifyStat(state, 'thirst', -moveThirst)
    result.effects.moveHunger = moveHunger
    result.effects.moveThirst = moveThirst
  }
  return result
}

function applyFailureEffects(result: any, option: any, state: any) {
  const dmg = randInt(5, 15)
  modifyStat(state, 'hp', -dmg)
  result.effects.hp = -dmg
  // 大部分失败触发丧尸战斗，小概率直接受伤
  if (chance(0.8) && !state.inCombat) {
    result.combat = generateCombat(state)
    const warnText = '⚠️ 你的行动惊动了附近的丧尸！它们朝你冲了过来！即将进入战斗……'
    addJournalEntry(state, warnText, 'danger')
    result.narrativeText += '\n' + warnText
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
  const scene = scenes[state.currentScene]
  const sceneName = scene ? scene.name : '这里'
  const atmArr = sceneAtmosphere[state.currentScene] || sceneAtmosphere.default
  const atm = randomPick(atmArr)

  // 离开场景
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

  // 潜行
  if (id === 'sneak' || tags.includes('潜行')) {
    return success
      ? `你屏住呼吸，背靠冰冷的墙壁，一步一步地挪动。${atm}。你能听到自己心脏跳动的声音——太响了，你觉得全世界都能听到。但丧尸没有。你慢慢移出了它们的感知范围，直到确认安全才敢大口呼吸。汗水已经浸透了你的衣领。`
      : `你小心翼翼地迈出一步——脚下踩到了一块碎玻璃。清脆的响声在寂静中像一声惊雷。${atm}。所有丧尸同时转向你的方向。糟了。你不得不拔腿就跑。`
  }

  // 战斗
  if (id === 'fight' || tags.includes('战斗')) {
    const wn = state.equippedWeapon ? state.equippedWeapon.name : '拳头'
    return success
      ? `你握紧${wn}迎了上去。${atm}。第一个丧尸扑过来的时候你侧身躲过，反手一击——暗色的血液溅在墙上。战斗持续了几分钟，但感觉像过了几个小时。当最后一个丧尸倒下时，你的手臂在发抖，但你站着。你活下来了。`
      : `你冲了上去，但丧尸比你预估的要多。${atm}。你被包围了，每一次挥击都越来越吃力。最终你杀出一条血路冲了出来，但代价让你几乎站立不稳。鲜血从你身上的伤口渗出。`
  }

  // 搜索
  if (id === 'loot' || id === 'search_deep' || id === 'take' || id === 'check_back' || id === 'loot_food' || tags.includes('搜索')) {
    return success
      ? `你弯下腰，仔细翻找每一个角落。${atm}。大部分东西都被人拿走了，但你在一堆杂物下面发现了一些被遗漏的物资——也许慌乱中掉落，也许故意藏起来留给后来的人。在末日里，每一次发现都是一个小小的胜利。`
      : `你花了很长时间翻找，但这里早就被洗劫过了。${atm}。除了一些没用的空包装和碎玻璃，什么都没找到。你直起腰，感到一阵失望。`
  }

  // 休息
  if (id === 'rest') {
    return success
      ? `你找了一个相对安全的角落，用能找到的东西堵住门窗。${atm}。你靠着墙坐下，闭上眼睛。睡眠很浅——每一个声响都会让你惊醒——但几个小时后，你感觉身体和精神都恢复了一些。末日里，能闭上眼睛安心睡一觉是最大的奢侈。`
      : `你刚闭上眼睛不到半小时，远处传来的撞击声就把你惊醒了。${atm}。有一群丧尸正在附近徘徊。你不得不提前结束休息，匆忙收拾东西准备应对可能的威胁。`
  }

  // 救援/帮助
  if (id === 'help' || id === 'give_antibiotics' || id === 'offer_bandage' || id === 'investigate' || id === 'rescue' || tags.includes('救援')) {
    return success
      ? `你小心翼翼地靠近，随时准备应对最坏的情况。${atm}。幸运的是，这次你的判断是对的。在末日里伸出援手需要勇气——因为你永远不知道对方是人还是陷阱。你帮助了需要帮助的人，这种善意也许会在未来某个时刻得到回报。`
      : `你试图帮忙，但情况比想象中复杂。${atm}。有时候，即使出于善意，结果也不尽如人意。你默默希望自己已经尽力了。`
  }

  // 交易
  if (id === 'trade' || id === 'trade_open' || id === 'trade_med') {
    return success
      ? `你警惕地靠近对方，一只手始终放在武器旁边。${atm}。交易过程很简短——双方都不想多停留。你得到了需要的东西，对方也一样。在末日里，信任是奢侈品，但交易是必需品。`
      : `你伸出手想进行交易，但对方突然改变了主意。${atm}。也许他们看到了什么，也许只是改变了想法。你空手而归。`
  }

  // 采集
  if (id === 'harvest') {
    return success
      ? `你蹲下来仔细辨认哪些东西还能吃、哪些已经坏了。${atm}。大自然在末日里依然慷慨——只要你知道去哪里找。你采摘了一些可以食用的东西，小心地装进背包。`
      : `你满怀希望地开始采摘，但很快就发现大部分东西都已经腐烂或被人摘走了。${atm}。你只找到很少的东西。`
  }

  // 撬锁/破门
  if (id === 'pick' || id === 'force') {
    return success
      ? `你小心地操作着工具。${atm}。咔哒一声——门开了。里面可能有好东西，也可能什么都没有。你深吸一口气，推门而入。`
      : `你试了又试，但门纹丝不动。${atm}。也许你需要不同的工具，也许这道门后面根本没有什么值得费这么大劲的东西。`
  }

  // 观察/回避/绕路
  if (id === 'avoid' || id === 'observe' || id === 'car_check' || id === 'avoid_trail' || id === 'avoid_plant' || id === 'avoid_cult' || id === 'avoid_mil') {
    return success
      ? `你选择保持距离，先观察清楚。${atm}。谨慎在末日里不是懦弱——它是让你活到明天的关键。你默默地记住了这里的情况，然后继续前行。`
      : `你试图保持距离，但意外的响动暴露了你的存在。${atm}。你不得不匆忙改变计划。`
  }

  // 撤退/逃跑
  if (id === 'retreat' || id === 'flee' || id === 'run' || id === 'leave') {
    return `你迅速做出决定——撤退。${atm}。有时候，活下去的关键不在于你打赢了多少战斗，而在于你避开了多少场。你退回安全的方向，重新计划下一步。`
  }

  // 投掷/转移注意
  if (id === 'distract' || tags.includes('投掷')) {
    return success
      ? `你捡起一件没用的东西，用力扔向远处。撞击声在寂静中回荡。${atm}。丧尸们被声音吸引，蹒跚着朝那个方向走去。你趁机从另一边溜了过去。`
      : `你扔出了东西，但声音不够大——或者丧尸群太大。${atm}。只有一部分丧尸被引开，剩下的依然堵在路上。`
  }

  // 呼唤/回应/通讯
  if (id === 'shout' || id === 'respond' || id === 'call' || id === 'radio_call') {
    return success
      ? `你的声音在空气中回荡。${atm}。回应来得比你预期的快——虽然不是每次回应都代表好消息，但至少你得到了某种联系。在这个孤独的末日里，任何回应都是珍贵的。`
      : `你喊了出去，但回应你的只有回声。${atm}。也许你的声音传得不够远，也许根本没有人——或者没有人愿意回应。`
  }

  // 监听/记录
  if (id === 'listen' || id === 'record') {
    return success
      ? `你屏住呼吸，全神贯注。${atm}。在末日里，信息有时候比食物更重要。你捕捉到了关键的线索，把它牢牢记在心里。`
      : `你努力想听清楚，但噪音太大了——或者信号太弱。${atm}。信息像沙子一样从指缝间溜走。你只捕捉到了只言片语。`
  }

  // 社交接近（幸存者营地、NPC 初次接触）
  if (id === 'approach' || id === 'infiltrate' || tags.includes('社交')) {
    return success
      ? `你深吸一口气，把武器放在显眼但够不到的位置，举起双手慢慢靠近。${atm}。对面的人打量了你很久——他们的眼神里有警惕，也有疲惫。最后，一个人点了点头：「进来吧。别耍花样。」你被允许进入了他们的营地。`
      : `你刚靠近几步，对方就举起了武器。「站住！再往前走一步就开枪了！」${atm}。你只能慢慢后退，举起双手示意没有恶意。这条路走不通了。`
  }

  // 默认
  return success
    ? `你谨慎地行动。${atm}。幸运的是，这次你的判断是对的。在这个崩塌的世界里，每一次正确的决定都是一个小小的胜利。你环顾四周，确认没有新的威胁。`
    : `事情没有按预期发展。${atm}。你不得不临时调整计划。末日里没有万无一失的方案——重要的是随机应变，以及活下去。`
}

// ==================== 战斗系统 ====================

// 战斗策略（4个基础策略）
const combatStrategies = [
  {
    id: 'assault',
    name: '⚔️ 正面强攻',
    desc: '不管三七二十一，正面硬刚！',
    defMod: 1.0,
    sanityCost: 0,
    counterBonus: {},
  },
  {
    id: 'precise',
    name: '🎯 精准打击',
    desc: '瞄准要害之处，力求一击制敌。（对庞大/缓慢型 +2）',
    defMod: 1.0,
    sanityCost: 5,
    sanityReq: 30,
    counterBonus: { '庞大': 2, '缓慢': 2 },
  },
  {
    id: 'defensive',
    name: '🛡️ 防守反击',
    desc: '先架住攻击，再找机会反击。（受伤减半）',
    defMod: 0.5,
    sanityCost: 0,
    counterBonus: { '快速': 1, '灵敏': 1 },
  },
  {
    id: 'find_weakness',
    name: '🔍 寻找弱点',
    desc: '仔细观察对手，寻找致命破绽。（骰 4+ 伤害翻倍）',
    defMod: 1.2,
    sanityCost: 8,
    sanityReq: 40,
    counterBonus: { '变异': 3, '狡猾': 2 },
    highRisk: true,
  },
]

function getEnemyDescription(enemy) {
  const t = enemy.traits || []
  if (t.includes('快速') && t.includes('灵敏')) return '这头被感染的生物异常敏捷，你几乎看不清它的移动轨迹。'
  if (t.includes('快速')) return '这具丧尸行动异常敏捷，你很难瞄准它的要害。'
  if (t.includes('庞大') && t.includes('缓慢')) return '这只丧尸体型巨大，皮肤坚硬如革，但行动迟缓。'
  if (t.includes('庞大')) return '这具丧尸体型臃肿，皮糙肉厚，普通攻击恐怕效果不大。'
  if (t.includes('变异')) return '这具丧尸的身体发生了可怕的变异，扭曲的肢体让它看起来不像任何活物。'
  if (t.includes('脆弱') || t.includes('噪音')) return '这只丧尸看起来身体脆弱，但它的尖叫声会引来更多同伴。'
  if (t.includes('人型') || t.includes('狡猾')) return '虽然看起来还是人形，但那眼中的疯狂告诉你它早已不是人类。'
  if (t.includes('集群')) return '一群丧尸漫无目的地徘徊着，它们还没发现你。'
  return `一只${enemy.name}正朝你逼近，你必须立刻做出反应。`
}

function getBestWeapon(state) {
  const w = state.inventory.filter(i => i.type === 'weapon')
  return w.length ? w.reduce((a, b) => ((a.effects.damage||0) > (b.effects.damage||0) ? a : b)) : null
}

function d6() { return Math.floor(Math.random() * 6) + 1 }

export function getCombatStrategies(state, enemy) {
  const r: any[] = []
  const weapons = state.inventory.filter(i => i.type === 'weapon')
  for (const w of randomSample(weapons, Math.min(2, weapons.length))) {
    r.push({ id: 'weapon_'+w.id, name: w.name, desc: '掷骰 d6 + '+ (w.effects.damage||0), isWeapon: true, weaponId: w.id, weaponDmg: w.effects.damage||0 })
  }
  if (r.length === 0) {
    // 无武器时不显示拳头选项，玩家只能选策略
  }
  const avail = combatStrategies.filter(s => !s.sanityReq || state.sanity >= s.sanityReq)
  for (const s of randomSample(avail, Math.min(2, avail.length))) {
    r.push({ id: s.id, name: s.name, desc: s.desc, isWeapon: false, defMod: s.defMod, sanityCost: s.sanityCost, counterBonus: s.counterBonus, highRisk: s.highRisk })
  }
  return r
}

export function generateCombat(state) {
  const enemies = [
    { name: '普通丧尸', hp: 20, damage: 5, noise: 1, lootChance: 0.4, traits: ['集群'] },
    { name: '跑尸', hp: 15, damage: 8, noise: 0, lootChance: 0.3, desc: '速度极快', traits: ['快速'] },
    { name: '臃肿丧尸', hp: 35, damage: 10, noise: 2, lootChance: 0.6, desc: '皮糙肉厚', traits: ['庞大', '缓慢'] },
    { name: '尖叫者', hp: 10, damage: 3, noise: 6, lootChance: 0.2, desc: '刺耳尖叫', traits: ['脆弱', '噪音'] },
    { name: '丧尸犬', hp: 12, damage: 6, noise: 1, lootChance: 0.1, desc: '快速凶猛', traits: ['快速', '灵敏'] },
    { name: '变异丧尸', hp: 50, damage: 15, noise: 3, lootChance: 0.8, desc: '扭曲肢体', traits: ['庞大', '变异'] },
    { name: '邪教徒', hp: 25, damage: 7, noise: 2, lootChance: 0.5, desc: '疯狂活人', traits: ['人型', '狡猾'] },
    { name: '孢子丧尸', hp: 18, damage: 4, noise: 1, lootChance: 0.4, desc: '身体布满真菌，死后释放毒气', traits: ['集群', '毒气'] },
    { name: '爬行者', hp: 12, damage: 5, noise: 0, lootChance: 0.2, desc: '下半身已断，在地上无声爬行', traits: ['快速', '灵敏', '隐蔽'] },
    { name: '自爆者', hp: 8, damage: 20, noise: 9, lootChance: 0.1, desc: '腹部肿胀发光，靠近即爆', traits: ['脆弱', '自爆'] },
    { name: '潜行者', hp: 14, damage: 7, noise: 0, lootChance: 0.3, desc: '擅长从阴影中突袭', traits: ['隐蔽', '狡猾', '快速'] },
    { name: '巨臂丧尸', hp: 45, damage: 14, noise: 4, lootChance: 0.5, desc: '右臂肿胀成巨大棍棒', traits: ['庞大', '缓慢', '重击'] },
    { name: '丧尸乌鸦', hp: 5, damage: 3, noise: 3, lootChance: 0.1, desc: '成群的感染乌鸦，从空中俯冲', traits: ['快速', '飞行', '集群'] },
    { name: '融合体', hp: 60, damage: 12, noise: 5, lootChance: 0.7, desc: '多具丧尸融为一体的恐怖肉团', traits: ['庞大', '变异', '再生'] },
  ]
  const enemy = randomPick(enemies)
  const count = randInt(1, 3)
  state.inCombat = true
  state.combatState = {
    enemy: { ...enemy, actualHp: enemy.hp * count, maxHp: enemy.hp * count, count },
    playerHp: state.hp, rounds: [], result: null,
    _defending: false, enemyDesc: getEnemyDescription(enemy),
  }
  addJournalEntry(state, `⚔️ 进入战斗！遭遇了 ${count} 只${enemy.name}。`, 'combat')
  return state.combatState
}

export function resolveCombatRound(state, actionId) {
  const combat = state.combatState
  if (!combat) return null
  if (actionId === 'flee') {
    if (chance(0.55)) { combat.result = 'fled'; state.inCombat = false; return combat }
    const dmg = randInt(5, 12)
    state.hp = clamp(state.hp - dmg, 0, state.maxHp)
    combat.playerHp = state.hp
    combat.rounds.push({ action: 'flee', playerDmg: 0, enemyDmg: dmg, playerText: '你试图逃跑……', enemyText: `逃跑失败！被追击受到 ${dmg} 点伤害。` })
    if (state.hp <= 0) { combat.result = 'death'; state.inCombat = false }
    return combat
  }
  let round
  const isWeapon = actionId.startsWith('weapon_')
  let playerText = '', enemyText = '', playerDmg = 0, enemyDmg = 0
  if (isWeapon) {
    const wid = actionId.replace('weapon_', '')
    let wd = 0, wn = '拳头'
    if (wid !== 'fists') {
      const w = state.inventory.find(i => i.id === wid && i.type === 'weapon')
      if (w) { wd = w.effects.damage||0; wn = w.name }
    }
    const roll = d6()
    playerDmg = roll + wd
    playerText = `你挥动${wn}，骰出了 ${roll} 点，加上 ${wd} 点武器加成，造成 ${playerDmg} 点伤害。`
  } else {
    const s = combatStrategies.find(x => x.id === actionId)
    let roll = d6(), bonus = 0
    if (s && s.counterBonus) {
      for (const [t, v] of Object.entries(s.counterBonus)) {
        if ((combat.enemy.traits||[]).includes(t)) { bonus += v; break }
      }
    }
    let mult = 1
    if (s && s.highRisk && roll >= 4) mult = 2
    if (s && s.sanityCost) modifyStat(state, 'sanity', -s.sanityCost)
    playerDmg = Math.max(1, (roll + bonus) * mult)
    playerText = bonus > 0
      ? `你使出${(s as any).name}，骰出了 ${roll} 点！特征克制 +${bonus}，共 ${playerDmg} 点伤害！`
      : `你使出${(s as any).name}，骰出了 ${roll} 点，造成 ${playerDmg} 点伤害。`
    if (mult > 1) playerText += ' 弱点暴露！伤害翻倍！'
    if (s && s.defMod < 1) combat._defending = true
  }
  combat.enemy.actualHp -= playerDmg
  const wn = isWeapon ? (state.inventory.find(i => i.id === actionId.replace('weapon_','') && i.type === 'weapon')?.effects.noise||0) : 0
  if (wn >= 3 && chance(0.3)) {
    combat.enemy.actualHp += randInt(5, 15); combat.enemy.count += randInt(1, 2)
    playerText += ' ⚠️ 噪音引来了更多丧尸！'
  }
  if (combat.enemy.actualHp <= 0) {
    combat.result = 'victory'; state.inCombat = false
    state.kills += combat.enemy.count
    enemyText = `${combat.enemy.name}被击败了！`
    if (chance(combat.enemy.lootChance)) {
      const li = getRandomItem()
      if (addToInventory(state, li)) enemyText += ` 尸体旁找到：${li.name}。`
    }
    round = { action: actionId, playerDmg, enemyDmg: 0, playerText, enemyText }
    addJournalEntry(state, `⚔️ 战斗胜利！击败了 ${combat.enemy.count} 只${combat.enemy.name}。`, 'combat')
    return combat
  }
  let defMod = combat._defending ? 0.5 : 1.0
  combat._defending = false
  enemyDmg = Math.round(calcDamage(combat.enemy.damage, 0.2) * defMod)
  const armor = state.equippedArmor
  if (armor && armor.effects.damageReduction) {
    enemyDmg = Math.floor(enemyDmg * (1 - armor.effects.damageReduction))
    if (armor.effects.durability && --armor.effects.durability <= 0) { removeFromInventory(state, armor.id); enemyText += ` ⚠️${armor.name}损坏！` }
  }
  round = { action: actionId, playerDmg, enemyDmg, playerText, enemyText: enemyText + ` ${combat.enemy.name}反击，${enemyDmg} 点伤害。` + (enemyDmg <= 0 ? '（被格挡）' : '') }
  state.hp = clamp(state.hp - enemyDmg, 0, state.maxHp)
  combat.playerHp = state.hp
  if (chance(0.2)) { const ia = randInt(5,10); state.infection = clamp(state.infection+ia,0,state.maxInfection); round.enemyText += ` ⚠️咬伤感染 +${ia}` }
  if (state.hp <= 0) { combat.result = 'death'; state.inCombat = false; round.enemyText += ' 💀 你倒下了……' }
  combat.rounds.push(round)
  return combat
}

export function fleeCombat(state) { return resolveCombatRound(state, 'flee') }

export function autoResolveCombat(state) {
  const combat = state.combatState
  if (!combat) return null
  const weapon = getBestWeapon(state) || { effects: { damage: 1 } }
  const bd = weapon.effects.damage||1, hp = combat.enemy.actualHp
  const rounds = Math.ceil(hp / (3.5+bd)), ok = chance(0.5+bd*0.05-combat.enemy.damage*0.02)
  if (ok) {
    combat.result = 'victory'; state.inCombat = false; state.kills += combat.enemy.count
    const d = randInt(3,8)*rounds; state.hp = clamp(state.hp-d,0,state.maxHp)
    addJournalEntry(state, `⚡ 自动战斗！使用${weapon.name} ${rounds}回合击败${combat.enemy.count}只${combat.enemy.name}，损失${d}HP。`, 'combat')
    if (chance(combat.enemy.lootChance)) {
      const li = getRandomItem()
      if (addToInventory(state, li)) addJournalEntry(state, `👜 获得：${li.name}`, 'action')
    }
  } else {
    const d = randInt(8,15)*rounds; state.hp = clamp(state.hp-d,0,state.maxHp)
    if (state.hp <= 0) { combat.result='death';state.inCombat=false;addJournalEntry(state,`💀 自动战斗失败！倒下了。`,'danger') }
    else { combat.result='fled';state.inCombat=false;addJournalEntry(state,`🏃 自动战斗失利，损失${d}HP。`,'combat') }
  }
  return combat
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
    const hasAll = option.requireItems.every(id => hasItem(state.inventory, id))
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
    const hasAny = option.requireItems.some(id => hasItem(state.inventory, id))
    if (!hasAny) return false
  }
  if (option.requireTags && option.requireTags.length > 0) {
    const hasAnyTag = option.requireTags.some(tag => hasItemWithTag(state.inventory, tag))
    if (!hasAnyTag) return false
  }
  return true
}

// ==================== 特殊行动 ====================

export function exploreNewArea(state) {
  applySurvivalDecay(state)
  return generateEvent(state)
}

export function equipWeapon(state, itemId) {
  const item = findItem(state.inventory, itemId)
  if (!item || item.type !== 'weapon') return false
  if (state.equippedWeapon) addToInventory(state, state.equippedWeapon)
  removeFromInventory(state, itemId)
  state.equippedWeapon = item
  addJournalEntry(state, `⚔️ 装备了 ${item.name}。`, 'action')
  return true
}

export function equipArmor(state, itemId) {
  const item = findItem(state.inventory, itemId)
  if (!item || item.type !== 'armor') return false
  if (state.equippedArmor) addToInventory(state, state.equippedArmor)
  removeFromInventory(state, itemId)
  state.equippedArmor = item
  addJournalEntry(state, `🛡️ 装备了 ${item.name}。`, 'action')
  return true
}

export function unequipItem(state, slot) {
  if (slot === 'weapon' && state.equippedWeapon) {
    if (addToInventory(state, state.equippedWeapon)) {
      addJournalEntry(state, `卸下了 ${state.equippedWeapon.name}。`, 'action')
      state.equippedWeapon = null
    }
  }
  if (slot === 'armor' && state.equippedArmor) {
    if (addToInventory(state, state.equippedArmor)) {
      addJournalEntry(state, `卸下了 ${state.equippedArmor.name}。`, 'action')
      state.equippedArmor = null
    }
  }
}
