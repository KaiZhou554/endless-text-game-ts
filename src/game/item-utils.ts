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
  let pool = type ? getItemsByType(type) : Object.values(itemDB)
  pool = pool.filter((item: any) => !item.noLoot)
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * 获取随机战利品池（用于事件奖励）
 *
 * @param count    掉落物品数量
 * @param inventory 玩家背包（用于弹药智能掉落）
 * @param options  可选：scene（场景类型偏好）、quality（品质层级）
 */
interface LootOptions {
  scene?: { lootTypes: string[] }
  quality?: 'normal' | 'combat'
}

// 加权随机选类型
function pickWeightedType(types: string[], weights: Record<string, number>): string {
  const total = types.reduce((sum, t) => sum + (weights[t] || 1), 0)
  let r = Math.random() * total
  for (const t of types) {
    r -= weights[t] || 1
    if (r <= 0) return t
  }
  return types[types.length - 1]
}

export function getLootPool(count = 3, inventory: any[] = [], options: LootOptions = {}) {
  const loot: any[] = []
  const baseTypes = ['food', 'drink', 'medical', 'misc', 'tool']
  const combatTypes = ['weapon', 'armor']
  const types = options.quality === 'combat'
    ? [...baseTypes, ...combatTypes]
    : [...baseTypes]

  // 类型选择权重：场景 lootTypes 匹配的类型权重 x2
  const typeSelectionWeights: Record<string, number> = {}
  if (options.scene?.lootTypes) {
    for (const t of types) {
      typeSelectionWeights[t] = options.scene.lootTypes.includes(t) ? 2 : 1
    }
  }
  // combat 品质：武器和护甲权重 3x，其余类型 1x
  if (options.quality === 'combat') {
    for (const t of types) {
      typeSelectionWeights[t] = (typeSelectionWeights[t] || 1) * (combatTypes.includes(t) ? 3 : 1)
    }
  }

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
    const type = pickWeightedType(types, typeSelectionWeights)
    if (type === 'misc' && gunAmmos.length > 0 && chance(0.5)) {
      // 优先掉落已有枪械的弹药
      const ammoTag = '弹药:' + gunAmmos[Math.floor(Math.random() * gunAmmos.length)]
      const ammoPool = getItemsByTag(ammoTag).filter((item: any) => !item.noLoot)
      if (ammoPool.length > 0) {
        loot.push(ammoPool[Math.floor(Math.random() * ammoPool.length)])
        continue
      }
    }
    const pool = getItemsByType(type).filter((item: any) => !item.noLoot)
    if (pool.length === 0) continue
    loot.push(weightedPickFromPool(pool, typeWeights[type]))
  }
  return loot
}
