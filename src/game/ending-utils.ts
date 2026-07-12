/**
 * 结局工具函数 — 结局检查
 * 引擎层：引用 data/endings.js 的纯数据，不持有逻辑数据
 */

import { endingChecks } from '../data/endings.js'

/**
 * 检查所有结局条件，返回触发的结局（如果有多个，取第一个）
 */
export function checkEndings(gameState) {
  for (const ending of endingChecks) {
    if (ending.check(gameState)) {
      return ending
    }
  }
  return null
}
