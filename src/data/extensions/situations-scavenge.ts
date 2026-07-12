import type { Situations } from '../../types'

/**
 * 情景扩展 — 搜索/物资类遭遇
 * 新增情景在此文件追加即可
 */
export const situations_scavenge: Situations = {
  supplies_stash: {
    id: 'supplies_stash',
    name: '物资遗留',
    baseText: '你发现了一个被匆忙遗弃的物资点——几个背包和塑料袋堆在角落里。看起来有人撤离得很急。',
    options: [
      {
        id: 'take',
        text: '拿走有用的东西',
        risk: '[搜索物资] [可能触发警报]',
        tags: ['搜索'],
        successRate: 0.9,
      },
      {
        id: 'trap_check',
        text: '仔细检查是否有陷阱再拿',
        risk: '[安全] [理智-3:疑神疑鬼]',
        tags: ['谨慎'],
        successRate: 1.0,
      },
      {
        id: 'leave',
        text: '不碰别人的东西',
        risk: '[安全] [可能错过重要物资]',
        tags: ['尊重'],
        successRate: 1.0,
      },
    ],
    danger: 1,
  },
  locked_door: {
    id: 'locked_door',
    name: '锁住的门',
    baseText: '一扇厚重的钢门挡住了去路，门上有电子密码锁。从门缝里透出冷气，里面可能有重要物资。',
    options: [
      {
        id: 'pick',
        text: '尝试开锁',
        risk: '[需要:开锁器] [可能失败]',
        tags: ['开锁'],
        requireItems: ['lockpick'],
        successRate: 0.7,
      },
      {
        id: 'force',
        text: '用蛮力撞开',
        risk: '[需要:撬棍或斧头] [噪音]',
        tags: ['破门', '噪音'],
        requireItems: ['crowbar_weapon', 'axe'],
        successRate: 0.8,
      },
      {
        id: 'look_around',
        text: '找找有没有其他入口',
        risk: '[消耗时间] [安全]',
        tags: ['探索'],
        successRate: 0.6,
      },
    ],
    danger: 2,
  },
  scavenge: {
    id: 'scavenge',
    name: '搜索物资',
    baseText: '这里看起来有值得搜索的地方。也许能找到些有用的东西，但总得花些时间翻找。',
    options: [
      {
        id: 'quick_search',
        text: '快速搜索（耗时少，收益低）',
        risk: '[快速] [低收益]',
        tags: ['搜索', '快速'],
        successRate: 0.8,
      },
      {
        id: 'thorough_search',
        text: '仔细搜索（耗时多，收益高）',
        risk: '[耗时] [高收益] [可能遭遇危险]',
        tags: ['搜索', '细致'],
        successRate: 0.6,
      },
    ],
    danger: 2,
  },
  corpse_search: {
    id: 'corpse_search',
    name: '检查尸体',
    baseText: '地上躺着一具穿着军用风衣的尸体，旁边散落着一些物品。他手里还紧紧握着一把带有战术导轨的手枪。',
    options: [
      {
        id: 'search_corpse',
        text: '搜索尸体',
        risk: '[获得物品] [理智-3]',
        tags: ['搜索'],
        sanityEffect: -3,
        successRate: 0.9,
      },
      {
        id: 'bury',
        text: '花点时间把他埋了',
        risk: '[消耗时间] [理智+5]',
        tags: ['尊重'],
        sanityEffect: 5,
        successRate: 1.0,
      },
    ],
    danger: 1,
  },
  military_convoy: {
    id: 'military_convoy',
    name: '军事车队残骸',
    baseText: '一队被摧毁的军用卡车横在路中间，车身上有弹孔和爪痕。货物散落一地，有些箱子还完好。',
    options: [
      {
        id: 'search_crates',
        text: '搜索完好的木箱',
        risk: '[高价值物资] [可能有丧尸]',
        tags: ['搜索', '危险区域'],
        successRate: 0.6,
      },
      {
        id: 'check_cabins',
        text: '检查驾驶室',
        risk: '[可能找到武器] [可能有伤员]',
        tags: ['搜索'],
        successRate: 0.7,
      },
    ],
    danger: 4,
  },
  barricade: {
    id: 'barricade',
    name: '路障',
    baseText: '路中间堆着一道由汽车残骸、铁丝网和沙袋组成的路障。看起来是某个武装组织留下的。',
    options: [
      {
        id: 'climb',
        text: '翻过去',
        risk: '[可能触发警报] [可能受伤]',
        tags: ['攀爬'],
        successRate: 0.7,
      },
      {
        id: 'clear_path',
        text: '清理出一条通道',
        risk: '[耗时] [消耗体力]',
        tags: ['力量'],
        successRate: 0.6,
      },
    ],
    danger: 2,
  },
  pharmacy_raid: {
    id: 'pharmacy_raid',
    name: '药房被洗劫',
    baseText: '一家药房的卷帘门被撬开了。里面的处方药几乎被一扫而空，但翻倒的柜台下面可能还有被遗漏的药瓶。',
    options: [
      {
        id: 'search_deep',
        text: '仔细翻找各个角落',
        risk: '[可能找到稀有药品] [可能遭遇丧尸]',
        tags: ['搜索', '医疗'],
        successRate: 0.6,
      },
      {
        id: 'check_back',
        text: '去后面的配药室查看',
        risk: '[更危险] [更好的药品]',
        tags: ['探索', '医疗'],
        successRate: 0.5,
      },
    ],
    danger: 3,
  },
  cache_found: {
    id: 'cache_found',
    name: '隐藏物资箱',
    baseText: '一个绿色弹药箱藏在通风管道里，上面用胶带贴了张纸条："给需要的人——运气好你还活着。——S"',
    options: [
      {
        id: 'open',
        text: '打开箱子',
        risk: '[获得物资] [安全]',
        tags: ['搜索'],
        successRate: 1.0,
      },
    ],
    danger: 0,
  },
  food_truck: {
    id: 'food_truck',
    name: '翻倒的餐车',
    baseText: '一辆餐车侧翻在路边，"TACO TUESDAY"的霓虹招牌还在闪烁。厨房里的食材散落一地，但冷藏柜还在运转。',
    options: [
      {
        id: 'loot_food',
        text: '搜索冷藏柜',
        risk: '[获得食物] [可能遭遇丧尸]',
        tags: ['搜索', '食物'],
        successRate: 0.8,
      },
    ],
    danger: 1,
  },
}
