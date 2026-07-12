import type { Situations } from '../../types'

/**
 * 情景扩展 — 探索/环境类遭遇
 * 新增情景在此文件追加即可
 */
export const situations_explore: Situations = {
  rain_shelter: {
    id: 'rain_shelter',
    name: '避雨处',
    baseText: '天空开始飘起小雨，你需要找个地方避雨。前方不远处有一个废弃的报刊亭。',
    options: [
      {
        id: 'shelter',
        text: '进报刊亭躲雨',
        risk: '[安全] [可能找到物品]',
        tags: ['休息'],
        successRate: 1.0,
      },
      {
        id: 'keep_moving_rain',
        text: '冒雨继续前进',
        risk: '[消耗体力] [可能感冒]',
        tags: ['前进'],
        successRate: 1.0,
      },
    ],
    danger: 0,
  },
  sleep_opportunity: {
    id: 'sleep_opportunity',
    name: '安全角落',
    baseText: '你发现了一个相对安全的角落——门窗完好，视野清晰。这可能是难得的休息机会。',
    options: [
      {
        id: 'rest',
        text: '休息4小时恢复体力',
        risk: '[生命+10] [理智+15] [消耗食物和水] [可能遭遇丧尸]',
        tags: ['休息'],
        successRate: 0.7,
      },
      {
        id: 'keep_going',
        text: '继续前进',
        risk: '[安全] [错过恢复机会]',
        tags: ['前进'],
        successRate: 1.0,
      },
    ],
    danger: 2,
  },
  strange_plant: {
    id: 'strange_plant',
    name: '变异植物',
    baseText: '一丛从未见过的植物生长在人行道的裂缝里，藤蔓是暗红色的，散发着腐肉般的气味。花苞有节奏地跳动，像在呼吸。',
    options: [
      {
        id: 'sample',
        text: '采集样本',
        risk: '[可能获得研究材料] [可能有毒]',
        tags: ['采集', '未知'],
        successRate: 0.5,
      },
      {
        id: 'burn',
        text: '用火烧掉它',
        risk: '[需要:火源] [可能引起注意]',
        tags: ['破坏', '火焰'],
        requireItems: ['lighter'],
        successRate: 0.9,
      },
      {
        id: 'avoid_plant',
        text: '远远绕开',
        risk: '[安全]',
        tags: ['回避'],
        successRate: 1.0,
      },
    ],
    danger: 2,
  },
  bridge_collapsed: {
    id: 'bridge_collapsed',
    name: '断桥',
    baseText: '通往前方的桥已经坍塌了，只剩下两端的桥墩。下面是一条湍急的河流。',
    options: [
      {
        id: 'swim',
        text: '游过去',
        risk: '[可能溺水] [消耗体力]',
        tags: ['游泳'],
        successRate: 0.5,
      },
      {
        id: 'rope_cross',
        text: '用绳索和钩子搭一条索道',
        risk: '[需要:攀岩绳] [安全]',
        tags: ['攀爬'],
        requireItems: ['rope'],
        successRate: 0.9,
      },
      {
        id: 'detour',
        text: '绕路走',
        risk: '[消耗大量时间] [安全]',
        tags: ['绕路'],
        successRate: 1.0,
      },
    ],
    danger: 3,
  },
}
