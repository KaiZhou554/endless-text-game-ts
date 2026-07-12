/**
 * 物品工具函数 — 物品查询、筛选、随机选择
 * 引擎层：引用 data/items.js 的纯数据，不持有逻辑数据
 */

import { itemDB } from '../data/items.js'
import { chance } from './utils.js'

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
export function getLootPool(count = 3, inventory: any[] = []) {
  const loot: any[] = []
  const types = ['food', 'drink', 'medical', 'misc', 'tool']

  // 类型内物品权重（默认 1，越高越常见）
  const typeWeights: Record<string, Record<string, number>> = {
    tool: { sleeping_bag: 6 },
  }

  // 收集玩家已有的枪械需要的弹药类型
  const gunAmmos: string[] = []
  for (const item of inventory) {
    if (item.type === 'weapon' && item.effects?.ammo) {
      gunAmmos.push(item.effects.ammo)
    }
  }

  // 加权随机从类型池中选一个物品
  function weightedPickFromPool(pool: any[], weights: Record<string, number> = {}): any {
    const total = pool.reduce((sum, item) => sum + (weights[item.id] || 1), 0)
    let r = Math.random() * total
    for (const item of pool) {
      r -= weights[item.id] || 1
      if (r <= 0) return item
    }
    return pool[pool.length - 1]
  }

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    if (type === 'misc' && gunAmmos.length > 0 && chance(0.5)) {
      // 优先掉落已有枪械的弹药
      const ammoTag = '弹药:' + gunAmmos[Math.floor(Math.random() * gunAmmos.length)]
      const ammoPool = getItemsByTag(ammoTag)
      if (ammoPool.length > 0) {
        loot.push(ammoPool[Math.floor(Math.random() * ammoPool.length)])
        continue
      }
    }
    const pool = getItemsByType(type)
    loot.push(weightedPickFromPool(pool, typeWeights[type]))
  }
  return loot
}
