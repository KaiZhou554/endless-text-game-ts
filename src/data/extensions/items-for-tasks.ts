/**
 * 物品扩展 — 专门为事件制作的物品
 * 
 */
import type { ItemDB } from '../../types'

export const taskItems: ItemDB = {
  // ==================== 线索书 — ⛵ 扬帆远航 ====================
  adventure_pulp_novel: {
    id: 'adventure_pulp_novel',
    name: '《怒海逃生》',
    type: 'key',
    desc: `一本在地摊上常见的冒险小说，封面画着暴风雨中的小艇，纸张泛黄、书脊开裂。扉页上有人写了一行奇怪的字：「界以南无信号。」

书的内容讲述了一个被困在环礁湖的水手，用钳子修好废弃渔船的引擎，加上汽油之后，在暴风雨来临前冲出了礁石带。最后他在海上漂了两天，看见了远方陆地的轮廓，但那片陆地始终没有靠近。直到他低头发现船底早已干涸，而引擎从未启动过。`,
    tags: ['关键', '线索', '奇遇'],
    effects: {},
    stackable: false,
    reusable: true,
    slots: 0,
  },

  dirty_water: {
    id: 'dirty_water',
    name: '浑浊的水',
    type: 'drink',
    desc: '没有经过净化的水。贸然饮下可能会得病。',
    tags: ['饮品', '口渴:+4', '生命:-4', '需要净化'],
    effects: { thirst: 4, hp: -4 },
    stackable: true,
    reusable: false,
    slots: 1,
  },
    clean_water: {
    id: 'clean_water',
    name: '干净的水',
    type: 'drink',
    desc: '经过处理的水，喝下去让人心情舒畅。',
    tags: ['饮品', '口渴:+16', '理智:+2'],
    effects: { thirst: 16, sanity: 2 },
    stackable: true,
    reusable: false,
    slots: 1,
    noLoot: true,
  },
}
