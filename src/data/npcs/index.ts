/**
 * NPC 数据库桶文件 — 聚合所有 NPC 为 npcDB
 *
 * 扩展方式：新增一个 NPC 角色文件，然后在此 import + 加入 npcDB 对象即可，
 * 无需修改 engine.js 或其他文件。
 */

import { lena } from './lena.js'
import { marcus } from './marcus.js'
import { stranger_mask } from './stranger_mask.js'
import { child_anna } from './child_anna.js'

/**
 * NPC 数据库，按 id 索引
 * 每个 NPC 包含：id, name, title, desc, trust, dialogueTree
 */
export const npcDB = {
  lena,
  marcus,
  stranger_mask,
  child_anna,
}
