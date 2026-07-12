/**
 * 数据层顶层桶文件 — 统一导出所有游戏数据
 *
 * 使用方式：
 *   import { itemDB, scenes, situations, npcDB, endingChecks } from './data/index.js'
 *
 * 扩展方式（例如添加新剧情组）：
 *   1. 在对应目录下新建文件（如 data/npcs/dr_smith.js）
 *   2. 在对应桶文件中 import + 合并（如 data/npcs/index.js）
 *   3. 如需全新数据类别，在此文件添加一行 export 即可
 *
 * 机制函数（查询/计算/随机选择）请引用 src/game/*-utils.js（引擎层）
 */

// 物品
export { itemDB } from './items.js'

// 世界 — 场景 / 情况 / 修饰条件
export { scenes } from './scenes.js'
export { situations } from './situations.js'
export { modifiers } from './modifiers.js'

// NPC 数据库（自动聚合 data/npcs/ 下所有角色）
export { npcDB } from './npcs/index.js'

// 结局配置
export { endingChecks } from './endings.js'

// 机遇配置
export { opportunities } from './opportunities.js'
