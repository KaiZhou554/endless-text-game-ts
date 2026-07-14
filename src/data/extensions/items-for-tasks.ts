/**
 * 物品扩展 — 专门为事件制作的物品
 *
 */
import type { ItemDB } from "../../types";

export const taskItems: ItemDB = {
  // ==================== 线索书 — ⛵ 扬帆远航 ====================
  adventure_pulp_novel: {
    id: "adventure_pulp_novel",
    name: "一本破书",
    type: "clue",
    desc: `地摊上常见的冒险小说，封面画着暴风雨中的小艇，纸张泛黄、书脊开裂。扉页上有人写了一行奇怪的字：「界以南无信号。」

书的内容讲述了一个被困在环礁湖的水手，用钳子修好废弃渔船的引擎，加上汽油之后，在暴风雨来临前冲出了礁石带。最后他在海上漂了两天，看见了远方陆地的轮廓，但那片陆地始终没有靠近。直到他低头发现船底早已干涸，而引擎从未启动过。`,
    tags: ["关键", "线索", "奇遇"],
    effects: {},
    stackable: false,
    reusable: true,
    slots: 0,
  },

  dirty_water: {
    id: "dirty_water",
    name: "浑浊的水",
    type: "drink",
    desc: "没有经过净化的水。贸然饮下可能会得病。",
    tags: ["饮品", "口渴:+4", "生命:-4", "需要净化"],
    effects: { thirst: 4, hp: -4 },
    stackable: true,
    reusable: false,
    slots: 1,
  },
  clean_water: {
    id: "clean_water",
    name: "干净的水",
    type: "drink",
    desc: "经过处理的水，喝下去让人心情舒畅。",
    tags: ["饮品", "口渴:+16", "理智:+2"],
    effects: { thirst: 16, sanity: 2 },
    stackable: true,
    reusable: false,
    slots: 1,
    noLoot: true,
  },

  butter_biscuit: {
    id: "butter_biscuit",
    name: "奶香黄油酥饼",
    type: "food",
    desc: "口感酥脆的黄油小饼干，奶香浓郁，能快速缓解饥饿。",
    tags: ["食物", "饱腹:+9", "口渴:-5"],
    effects: { hunger: 9, thirst: -5 },
    stackable: true,
    reusable: false,
    slots: 1,
  },
  honey_cookie: {
    id: "honey_cookie",
    name: "蜂蜜脆曲奇",
    type: "food",
    desc: "掺入天然蜂蜜烤制的曲奇，甜度适中，充饥效果不错。",
    tags: ["食物", "饱腹:+10", "口渴:-6"],
    effects: { hunger: 10, thirst: -6 },
    stackable: true,
    reusable: false,
    slots: 1,
  },
  grain_crisp: {
    id: "grain_crisp",
    name: "杂粮薄脆饼",
    type: "food",
    desc: "多种谷物混合烘烤的薄脆，粗纤维充足，顶饱耐饿。",
    tags: ["食物", "饱腹:+14", "口渴:-9"],
    effects: { hunger: 14, thirst: -9 },
    stackable: true,
    reusable: false,
    slots: 1,
  },
  fruit_shortbread: {
    id: "fruit_shortbread",
    name: "酥松饼",
    type: "food",
    desc: "夹杂果干碎的酥饼，风味丰富，少量补充体力。",
    tags: ["食物", "饱腹:+7", "口渴:-4"],
    effects: { hunger: 7, thirst: -4 },
    stackable: true,
    reusable: false,
    slots: 1,
  },
  electronic_component: {
    id: "electronic_component",
    name: "电子元件",
    type: "misc",
    desc: "也许以后有用的电子元件。",
    tags: ["电器"],
    effects: {},
    stackable: true,
    reusable: false,
    slots: 1,
  },
};
