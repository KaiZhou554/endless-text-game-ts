/**
 * 物品工具函数 — 物品查询、筛选、随机选择
 * 引擎层：引用 data/items.js 的纯数据，不持有逻辑数据
 */

import { itemDB } from '../data/items.js'

/**
 * 按类型获取物品列表
 */
export function getItemsByType(type) {
  return Object.values(itemDB).filter(item => item.type === type)
}

/**
 * 按标签筛选物品
 */
export function getItemsByTag(tag) {
  return Object.values(itemDB).filter(item => item.tags.includes(tag))
}

/**
 * 获取随机物品（可按类型过滤）
 */
export function getRandomItem(type: any = null) {
  const pool = type ? getItemsByType(type) : Object.values(itemDB)
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * 获取随机战利品池（用于事件奖励）
 */
export function getLootPool(count = 3) {
  const loot: any[] = []
  const types = ['food', 'drink', 'medical', 'misc']
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    loot.push(getRandomItem(type))
  }
  return loot
}
