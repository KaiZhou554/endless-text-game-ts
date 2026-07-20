/**
 * 物品扩展 — 额外物品
 * 新增物品在此文件追加即可
 */
import type { ItemDB } from '../../types'

export const extras: ItemDB = {
  // ==================== 武器 ====================

  sledgehammer: {
    id: 'sledgehammer',
    name: '大锤',
    type: 'weapon',
    desc: '一把工地用的大锤，锤头沾着干掉的水泥。每次挥动都需要两只手和足够的力量，但被它砸到的东西基本没有第二次机会。',
    tags: ['近战', '噪音:中', '耐久:12', '破门', '慢速'],
    effects: { damage: 9, noise: 3, durability: 12 },
    stackable: false,
    reusable: true,
  },
  improvised_bomb: {
    id: 'improvised_bomb',
    name: '土制炸药',
    type: 'weapon',
    desc: '用化肥和燃油混合制成的简易爆炸物，引信用的是旧闹钟的电路板。极其不稳定，但在需要制造混乱时无出其右。',
    tags: ['投掷', '噪音:极高', '一次性', '范围伤害', '不稳定'],
    effects: { damage: 18, noise: 10 },
    stackable: true,
    reusable: false,
  },
  harpoon_gun: {
    id: 'harpoon_gun',
    name: '鱼叉枪',
    type: 'weapon',
    desc: '一把改装过的水下鱼叉枪，用压缩气体发射。陆地上也能用，精度不错但只能单发。鱼叉可以回收。',
    tags: ['远程', '噪音:低', '需鱼叉', '可回收'],
    effects: { damage: 6, noise: 1, ammo: 'harpoon' },
    hitRanges: [
      { min: 2, max: 5, dmg: 12 },
      { min: 6, max: 14, dmg: 20 },
      { min: 15, max: 19, dmg: 30 },
    ],
    stackable: false,
    reusable: true,
    rarity: 'legendary',
  },

  // ==================== 弹药 ====================

  ammo_harpoon: {
    id: 'ammo_harpoon',
    name: '鱼叉',
    type: 'misc',
    desc: '三支不锈钢鱼叉，尖端有倒刺。用完后可以尝试回收。',
    tags: ['弹药:harpoon'],
    effects: {},
    stackable: true,
    reusable: false,
    slots: 0,
    initialStack: 3,
  },

  // ==================== 食物 ====================

  pickled_vegetables: {
    id: 'pickled_vegetables',
    name: '泡菜罐',
    type: 'food',
    desc: '一大罐家庭自制的腌菜，萝卜和黄瓜泡在酸辣的汤汁里。密封完好，保质期几乎无限。',
    tags: ['食物', '饱腹:+12', '口渴:-6', '易腐:否', '理智:+4'],
    effects: { hunger: 12, thirst: -6, sanity: 4 },
    stackable: true,
    reusable: false,
    slots: 1,
  },

  // ==================== 医疗 ====================

  suture_kit: {
    id: 'suture_kit',
    name: '缝合包',
    type: 'medical',
    desc: '一个无菌缝合包，内含弯针、缝合线和一把小剪刀。处理深度伤口比绷带管用得多。',
    tags: ['医疗', '生命:+25', '止血', '感染:-10'],
    effects: { hp: 25, stopBleeding: true, infection: -10 },
    stackable: true,
    reusable: false,
    slots: 1,
  },
  adrenaline_shot: {
    id: 'adrenaline_shot',
    name: '肾上腺素注射器',
    type: 'medical',
    desc: '一支预装肾上腺素的自动注射笔，标签上写着"急救用 — 心脏骤停"。能在短时间内给你超常的爆发力。',
    tags: ['医疗', '理智:-5', '临时强化'],
    effects: { sanity: -5 },
    events: ['heal_60_percent_missing'],
    stackable: true,
    reusable: false,
    slots: 1,
    rarity: 'rare',
  },

  // ==================== 防具 ====================

  chainmail_gloves: {
    id: 'chainmail_gloves',
    name: '防割手套',
    type: 'armor',
    desc: '一副不锈钢环链手套，原本是屠宰场的装备。能让你在危险近距离操作时多一层保障。',
    tags: ['防具', '减伤:8%', '耐久:10', '防抓咬', '手部防护'],
    effects: { damageReduction: 0.08, durability: 10 },
    stackable: false,
    reusable: true,
    slots: 1,
  },

  // ==================== 工具 ====================

  crowbar: {
    id: 'crowbar',
    name: '短撬棍',
    type: 'tool',
    desc: '一根短柄平头撬棍，专门用来撬门开箱。虽然也能打人，但比不上专门的武器顺手。',
    tags: ['工具', '撬锁', '便携'],
    effects: {},
    stackable: false,
    reusable: true,
    slots: 1,
  },
  fire_extinguisher: {
    id: 'fire_extinguisher',
    name: '灭火器',
    type: 'tool',
    desc: '一个便携式干粉灭火器，压力表还在绿色区域。灭火、制造烟雾屏障或近身自卫都行。',
    tags: ['工具', '灭火', '烟雾'],
    effects: {},
    stackable: false,
    reusable: true,
    slots: 1,
  },
}
