/**
 * 物品数据库 — 桶文件
 *
 * 从各扩展文件聚合所有物品，合并为单一的 itemDB。
 * 新增物品类别时：
 *   1. 在 src/data/extensions/ 下新建文件，导出 Partial<ItemDB>
 *   2. 在此文件 import 并展开到 itemDB 中
 */

import type { ItemDB } from '../types'
import { weapons } from './extensions/items-weapons'
import { supplies } from './extensions/items-supplies'
import { equipment } from './extensions/items-equipment'
import { keyItems } from './extensions/items-key'

export const itemDB: ItemDB = {
  ...weapons,
  ...supplies,
  ...equipment,
  ...keyItems,
} as ItemDB
