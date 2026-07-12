/**
 * 世界工具函数 — 时间、天气、玩家状态修饰
 * 引擎层：引用 data/modifiers.js 的纯数据，不持有逻辑数据
 */

import { modifiers } from '../data/modifiers.js'

/**
 * 根据游戏状态选择当前时间修饰
 */
export function getTimeModifier(dayCount) {
  // 游戏内的一天分为：白天 (6-18)、黄昏 (18-20)、夜晚 (20-6)
  const hour = (dayCount * 24) % 24
  if (hour >= 6 && hour < 18) return modifiers.time.day
  if (hour >= 18 && hour < 20) return modifiers.time.dusk
  return modifiers.time.night
}

/**
 * 随机天气
 */
export function getRandomWeather() {
  const weathers = ['clear', 'clear', 'clear', 'rain', 'rain', 'fog', 'storm']
  const key = weathers[Math.floor(Math.random() * weathers.length)]
  return modifiers.weather[key]
}

/**
 * 根据状态获取玩家状态修饰
 */
export function getPlayerStatusModifiers(gameState) {
  const mods: any[] = []
  if (gameState.hp < 40) mods.push(modifiers.playerStatus.injured)
  if (gameState.hunger < 20) mods.push(modifiers.playerStatus.hungry)
  if (gameState.thirst < 20) mods.push(modifiers.playerStatus.thirsty)
  if (gameState.infection > 30) mods.push(modifiers.playerStatus.infected)
  if (gameState.sanity < 30) mods.push(modifiers.playerStatus.insane)
  return mods
}
