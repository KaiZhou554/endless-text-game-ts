/**
 * 物品扩展 — 专门为事件制作的物品
 * 
 */
import type { ItemDB } from '../../types'

export const taskItems: ItemDB = {
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
