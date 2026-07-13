/**
 * 事件生成 — 丧尸末日生存
 * 场景选择、情况选择、选项构建
 */

import { scenes, situations, itemDB } from '../../data/index.js'
import { getTimeModifier, getRandomWeather, getPlayerStatusModifiers } from '../world-utils.js'
import {
  randInt, chance, randomPick,
  weightedPick, hasItem, hasItemWithTag,
} from '../utils.js'
import { addJournalEntry, getEffectiveCapacity, getUsedSlots } from '../state.js'

// ==================== 事件生成 ====================

export function generateEvent(state, forceNewScene = false) {
  const needNewScene = forceNewScene || !state.currentScene || state._pendingScene
  let scene

  if (needNewScene) {
    scene = selectScene(state, forceNewScene)
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
  state.lastSituationId = state.currentSituation
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

function selectScene(state, forceNewScene = false) {
  if (state._pendingScene) {
    const pending = state._pendingScene
    state._pendingScene = null
    if (scenes[pending]) return scenes[pending]
  }

  let candidates = Object.values(scenes)
  if (forceNewScene && state.currentScene) {
    candidates = candidates.filter(s => s.id !== state.currentScene)
  }
  const weights = candidates.map(s => {
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
      w = Math.max(1, w - 12)
    }
    if (sit.id.includes('sleep')) {
      const hour = (state.dayCount * 24) % 24
      if (hour >= 20 || hour < 6) w += 12
      const awake = state.hoursAwake || 0
      if (awake >= 8) w += 8
      if (awake >= 10) w += 12
      if (awake >= 12) w += 20
    }
    const hour = (state.dayCount * 24) % 24
    const isNight = hour >= 20 || hour < 6
    if (isNight) {
      if (sit.danger >= 4) w += 6
      if (sit.id.includes('horde') || sit.id.includes('ambush')) w += 8
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
    for (const mod of modifiers) {
      if (mod.textPrefix) text += ' ' + mod.textPrefix
    }
  }
  text += '\n\n'
  let sitText = situation.baseText
  sitText = sitText.replace('{count}', randInt(2, 6))
  text += sitText + '\n'
  for (const mod of modifiers) {
    if (mod.textSuffix) text += '\n<span class="dim">' + mod.textSuffix + '</span>'
  }
  if (state.sanity < 30 && chance(0.4)) {
    const hallucinations = [
      '<span class="dim">\n（墙角的阴影似乎在移动……不，那只是你的幻觉。）</span>',
      '<span class="dim">\n（你听到有人在叫你的名字——但周围没有人。）</span>',
      '<span class="dim">\n（那些尸体……它们刚才是不是动了一下？）</span>',
      '<span class="dim">\n（你觉得有人在背后看着你。你回头，什么都没有。）</span>',
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
      const hasAll = opt.requireItems.every(itemId => hasItem(state, itemId))
      if (!hasAll) {
        const hasAny = opt.requireItems.some(itemId => hasItem(state, itemId))
        if (opt.requireItems.length === 1 || !hasAny) {
          available = false
          disabledReason = `[需要: ${opt.requireItems.map(id => itemDB[id]?.name || id).join(' 或 ')}]`
        }
      }
    }
    if (opt.requireTags && opt.requireTags.length > 0 && available) {
      const hasTag = opt.requireTags.some(tag => hasItemWithTag(state, tag))
      if (!hasTag) {
        available = false
        disabledReason = `[需要物品标签: ${opt.requireTags.join(' 或 ')}]`
      }
    }
    if (opt.forbidTags && opt.forbidTags.length > 0 && available) {
      const hasForbidden = opt.forbidTags.some(tag =>
        hasItemWithTag(state, tag) || state.legacyTags.includes(tag)
      )
      if (hasForbidden) {
        available = false
        disabledReason = `[需要安静的环境]` as any
      }
    }
    if (available && opt.tags && (opt.tags.includes('搜索') || opt.tags.includes('采集'))) {
      const cap = getEffectiveCapacity(state)
      if (getUsedSlots(state) >= cap) {
        available = false
        disabledReason = '⊗ 背包已满，无法携带更多物品' as any
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
