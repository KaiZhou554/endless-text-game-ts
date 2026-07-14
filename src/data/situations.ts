/**
 * 情况数据库 — 桶文件
 *
 * 从各扩展文件聚合所有遭遇，合并为单一的 situations。
 * 新增情况类别时：
 *   1. 在 src/data/extensions/ 下新建文件，导出 Partial<Situations>
 *   2. 在此文件 import 并展开到 situations 中
 */

import type { Situations } from '../types'
import { situations_combat } from './extensions/situations-combat'
import { situations_social } from './extensions/situations-social'
import { situations_scavenge } from './extensions/situations-scavenge'
import { situations_explore } from './extensions/situations-explore'
import { situations_extras } from './extensions/situations-extras'
import { situations_tasks } from './extensions/situations-for-tasks'
import { situations_endings } from './extensions/situations-for-endings'
import { situations_lab } from './extensions/situations-lab'

export const situations: Situations = {
  ...situations_combat,
  ...situations_social,
  ...situations_scavenge,
  ...situations_explore,
  ...situations_extras,
  ...situations_tasks,
  ...situations_endings,
  ...situations_lab,
} as Situations
