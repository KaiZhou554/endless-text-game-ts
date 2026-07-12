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
    name: '邪教集会',
    baseText: '十几个穿着黑袍的人围成一圈，在废弃教堂前做着某种仪式。他们似乎在朝拜一只被绑住的丧尸，口中念着："新世界将至..."',
    options: [
      {
        id: 'infiltrate',
        text: '混进去看看情况',
        risk: '[高风险] [可能获得情报]',
        tags: ['渗透', '社交'],
        successRate: 0.4,
      },
      {
        id: 'attack',
        text: '突袭他们',
        risk: '[战斗] [高风险]',
        tags: ['战斗'],
        combat: true,
        successRate: 0.4,
      },
      {
        id: 'avoid_cult',
        text: '远远绕开这群疯子',
        risk: '[安全]',
        tags: ['回避'],
        successRate: 1.0,
      },
    ],
    danger: 5,
  },
}
