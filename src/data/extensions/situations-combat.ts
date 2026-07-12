import type { Situations } from '../../types'

/**
 * 情景扩展 — 战斗/危险类遭遇
 * 新增情景在此文件追加即可
 */
export const situations_combat: Situations = {
  zombie_horde: {
    id: 'zombie_horde',
    name: '尸群徘徊',
    baseText: '前方有{count}只丧尸在无目的地徘徊。它们还没发现你，但任何响动都可能引起注意。',
    options: [
      {
        id: 'sneak',
        text: '悄悄绕过它们',
        risk: '[需要隐蔽手段] [可能失败]',
        tags: ['隐蔽', '潜行'],
        requireItems: [],
        requireTags: [],
        forbidTags: ['噪音:高'],
        successRate: 0.6,
      },
      {
        id: 'fight',
        text: '正面迎战',
        risk: '[战斗] [消耗体力] [可能受伤]',
        tags: ['战斗', '高风险'],
        requireItems: [],
        combat: true,
      },
      {
        id: 'distract',
        text: '扔东西引开它们',
        risk: '[消耗物品] [可能失败]',
        tags: ['投掷', '转移注意'],
        requireItems: [],
        requireTags: ['可投掷'],
        successRate: 0.8,
      },
      {
        id: 'retreat',
        text: '退回上一个安全点',
        risk: '[安全] [消耗时间]',
        tags: ['撤退'],
        successRate: 1.0,
      },
    ],
    danger: 4,
  },
  trap: {
    id: 'trap',
    name: '陷阱',
    baseText: '你脚下突然一软——一个用树枝和落叶伪装的陷阱！下面是一排削尖的木桩。',
    options: [
      {
        id: 'dodge',
        text: '拼命跳开',
        risk: '[敏捷判定] [可能受伤]',
        tags: ['敏捷'],
        successRate: 0.6,
      },
      {
        id: 'grab',
        text: '抓住旁边的树枝',
        risk: '[力量判定]',
        tags: ['力量'],
        successRate: 0.5,
      },
    ],
    danger: 3,
  },
  ambush: {
    id: 'ambush',
    name: '遭遇伏击',
    baseText: '一群丧尸从阴影中猛地冲出来！它们显然被你的动静吸引了——不，它们一直在等你。',
    options: [
      {
        id: 'stand_ground',
        text: '迎战',
        risk: '[战斗] [高风险]',
        tags: ['战斗'],
        combat: true,
      },
      {
        id: 'flashlight_blind',
        text: '用手电强光晃它们然后跑',
        risk: '[需要:手电筒] [有机会逃脱]',
        tags: ['敏捷', '逃跑'],
        requireItems: ['flashlight'],
        successRate: 0.7,
      },
      {
        id: 'desperate_run',
        text: '拼命往出口跑',
        risk: '[可能受伤] [理智-5]',
        tags: ['逃跑', '高风险'],
        successRate: 0.4,
        sanityEffect: -5,
      },
    ],
    danger: 5,
  },
  zombie_nest: {
    id: 'zombie_nest',
    name: '丧尸巢穴',
    baseText: '地面上有一个被挖开的大洞，周围堆满了骨头和腐烂的肉块。某种粘稠的暗色液体从洞口渗出。这不是普通的丧尸聚集地——是它们的巢穴。',
    options: [
      {
        id: 'destroy',
        text: '用燃烧瓶/手榴弹摧毁巢穴',
        risk: '[需要:燃烧瓶或手榴弹] [高风险] [可能获得稀有物资]',
        tags: ['破坏', '火焰'],
        requireItems: ['molotov', 'grenade'],
        successRate: 0.7,
      },
      {
        id: 'flee',
        text: '迅速逃离这个区域',
        risk: '[安全] [理智-5:恐惧]',
        tags: ['逃跑'],
        sanityEffect: -5,
        successRate: 1.0,
      },
    ],
    danger: 7,
  },
  cult_gathering: {
    id: 'cult_gathering',
    name: '废弃的临时营地',
    baseText: '一处被匆忙遗弃的临时营地，帐篷还立着，睡袋散落一地。地上有几个踩扁的罐头和一本被水泡烂的笔记。主人显然走得很急——也可能根本没机会离开。',
    options: [
      {
        id: 'search_camp',
        text: '搜索营地里的剩余物资',
        risk: '[搜索物资] [可能需要时间]',
        tags: ['搜索'],
        successRate: 0.7,
      },
      {
        id: 'examine_notes',
        text: '捡起那本泡烂的笔记看看写了什么',
        risk: '[安全] [可能找到线索]',
        tags: ['信息'],
        successRate: 0.9,
      },
      {
        id: 'avoid_camp',
        text: '不碰任何东西，继续赶路',
        risk: '[安全]',
        tags: ['回避'],
        successRate: 1.0,
      },
    ],
    danger: 1,
  },

  // ==================== 更多战斗情景 ====================

  rooftop_chase: {
    id: 'rooftop_chase',
    name: '天台追逐',
    baseText: '你爬上天台，却发现{count}只丧尸已经堵住了唯一的退路。身后是六层楼高的边缘。风很大，吹得人站不稳。',
    options: [
      {
        id: 'fight_rooftop',
        text: '利用天台狭窄地形各个击破',
        risk: '[战斗] [地形优势]',
        tags: ['战斗'],
        combat: true,
      },
      {
        id: 'jump_adjacent',
        text: '跳到相邻建筑的阳台',
        risk: '[敏捷判定] [可能坠落受伤]',
        tags: ['敏捷'],
        successRate: 0.5,
      },
      {
        id: 'climb_down',
        text: '从防火梯爬下去',
        risk: '[安全] [可能被追上]',
        tags: ['撤退'],
        successRate: 0.7,
      },
    ],
    danger: 4,
  },
  sewer_encounter: {
    id: 'sewer_encounter',
    name: '下水道动静',
    baseText: '下水道的积水在晃动，水面下有什么东西在移动。突然，一只变异丧尸从污水中猛地冒了出来。',
    options: [
      {
        id: 'fight_sewer',
        text: '在下水道里应战',
        risk: '[战斗] [空间狭小] [可能感染]',
        tags: ['战斗', '高风险'],
        combat: true,
      },
      {
        id: 'retreat_ladder',
        text: '往最近的井梯跑，爬回地面',
        risk: '[可能被拉下来] [安全]',
        tags: ['撤退'],
        successRate: 0.6,
      },
      {
        id: 'lure_current',
        text: '引它进入急流区冲走',
        risk: '[智力判定] [可能失败]',
        tags: ['计谋', '环境'],
        successRate: 0.5,
      },
    ],
    danger: 5,
  },
  fog_ambush: {
    id: 'fog_ambush',
    name: '雾中身影',
    baseText: '浓雾笼罩了街道，能见度不足三米。雾中有人影在蹒跚移动——不是一个，是{count}个。它们还没注意到你，但雾太浓了，你不知道哪里是安全方向。',
    options: [
      {
        id: 'silent_retreat',
        text: '靠着墙慢慢后退，利用雾气掩护',
        risk: '[需要隐蔽手段] [可能撞上更多丧尸]',
        tags: ['隐蔽', '潜行'],
        requireTags: [],
        forbidTags: ['噪音:高', '噪音:极高'],
        successRate: 0.5,
      },
      {
        id: 'wait_out',
        text: '躲进旁边的废弃车辆，等雾散',
        risk: '[安全] [消耗时间] [雾可能几小时才散]',
        tags: ['等待'],
        successRate: 0.8,
      },
      {
        id: 'lure_away',
        text: '往远处扔东西引开注意力',
        risk: '[消耗物品] [需要投掷物]',
        tags: ['投掷', '转移注意'],
        requireTags: ['可投掷'],
        successRate: 0.7,
      },
    ],
    danger: 3,
  },
  burning_building: {
    id: 'burning_building',
    name: '燃烧的建筑',
    baseText: '一栋公寓楼正在熊熊燃烧，黑色的浓烟直冲天空。火光吸引了周围{count}只丧尸，它们正摇摇晃晃地往这边聚拢。火焰中似乎有东西在动——可能是困在里面的幸存者。',
    options: [
      {
        id: 'rush_in',
        text: '冲进火场搜寻幸存者',
        risk: '[高风险] [可能死亡] [可能获得稀有物资/同伴]',
        tags: ['救援', '极高风险'],
        successRate: 0.3,
      },
      {
        id: 'use_fire',
        text: '利用火灾引开丧尸，趁机搜索周围',
        risk: '[安全] [利用环境]',
        tags: ['搜索'],
        successRate: 0.8,
      },
      {
        id: 'flee_fire',
        text: '远离火场，火焰只会引来更多丧尸',
        risk: '[安全] [错失机会]',
        tags: ['撤退'],
        successRate: 1.0,
      },
    ],
    danger: 4,
  },
}
