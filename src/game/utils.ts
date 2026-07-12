/**
 * 工具函数 — 丧尸末日生存
 * 随机数、加权选择、文本格式化等
 */

/**
 * 区间随机整数 [min, max]
 */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 区间随机浮点数 [min, max)
 */
export function randFloat(min, max) {
  return Math.random() * (max - min) + min
}

/**
 * 按概率返回 true
 */
export function chance(probability) {
  return Math.random() < probability
}

/**
 * 从数组中随机选取一个元素
 */
export function randomPick(arr) {
  if (!arr || arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 从数组中随机选取 n 个不重复元素
 */
export function randomSample(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}

/**
 * 加权随机选择
 * items: [{value: any, weight: number}, ...]
 */
export function weightedPick(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  let r = Math.random() * totalWeight
  for (const item of items) {
    r -= item.weight
    if (r <= 0) return item.value
  }
  return items[items.length - 1].value
}

/**
 * 判定成功率（受物品和状态影响）
 */
export function rollSuccess(baseRate: any, modifiers: any = {}) {
  let rate = baseRate
  if (modifiers.bonus) rate += modifiers.bonus
  if (modifiers.penalty) rate -= modifiers.penalty
  rate = Math.max(0.05, Math.min(0.95, rate))
  return Math.random() < rate
}

/**
 * 生成伤害数值（基础伤害 ± 波动）
 */
export function calcDamage(baseDmg, variance = 0.3) {
  const min = Math.floor(baseDmg * (1 - variance))
  const max = Math.floor(baseDmg * (1 + variance))
  return randInt(Math.max(1, min), max)
}

/**
 * 格式化为百分比
 */
export function percent(value) {
  return Math.round(value * 100) + '%'
}

/**
 * 将游戏内天数转为可读文本
 */
export function formatDays(dayCount) {
  const days = Math.floor(dayCount)
  const hour = Math.floor((dayCount - days) * 24)
  const dayNames = ['一', '二', '三', '四', '五', '六', '日']
  const dayName = dayNames[(days) % 7]
  return `第 ${days + 1} 天 · 星期${dayName} · ${String(hour).padStart(2, '0')}:00`
}

/**
 * 限制数值在范围内
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

/**
 * 判断物品是否在背包中存在
 */
export function hasItem(inventory, itemId) {
  return inventory.some(item => item.id === itemId)
}

/**
 * 判断背包中是否有带有某个标签的物品
 */
export function hasItemWithTag(inventory, tag) {
  return inventory.some(item => item.tags && item.tags.includes(tag))
}

/**
 * 在背包中查找物品
 */
export function findItem(inventory, itemId) {
  return inventory.find(item => item.id === itemId)
}

/**
 * 洗牌数组
 */
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 生成唯一 ID
 */
let _idCounter = 0
export function uniqueId() {
  return 'evt_' + (++_idCounter) + '_' + Date.now().toString(36)
}
