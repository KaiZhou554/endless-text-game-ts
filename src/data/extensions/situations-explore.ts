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

  // ==================== 更多探索情景 ====================

  dense_fog: {
    id: 'dense_fog',
    name: '浓雾弥漫',
    baseText: '一股异常浓密的雾气从东边涌来，带着淡淡的化学气味。能见度骤降到手臂伸出去都看不清手指。GPS 早没信号了，指南针在雾中奇怪地乱转。',
    options: [
      {
        id: 'follow_sound',
        text: '跟着远处的水滴声走——水往低处流，总会有出路',
        risk: '[可能找到水源] [可能迷失方向]',
        tags: ['探索', '听觉'],
        successRate: 0.5,
      },
      {
        id: 'wait_fog',
        text: '原地等雾散，用布蒙住口鼻',
        risk: '[安全] [消耗时间] [化学雾可能持续数小时]',
        tags: ['等待'],
        successRate: 0.9,
      },
      {
        id: 'mask_through',
        text: '戴上防毒面具直接穿过',
        risk: '[需要:防毒面具] [安全]',
        tags: ['前进'],
        requireItems: ['gas_mask'],
        successRate: 0.9,
      },
    ],
    danger: 2,
  },
  abandoned_playground: {
    id: 'abandoned_playground',
    name: '废弃游乐场',
    baseText: '一个空无一人的游乐场，秋千在无风的空气中轻轻摆动。旋转木马上的彩漆已经剥落，露出下面生锈的铁架。售票亭的窗户被砸碎了，里面堆着一些杂物。',
    options: [
      {
        id: 'search_booth',
        text: '搜索售票亭和旁边的储物室',
        risk: '[可能找到物资] [可能有丧尸藏匿]',
        tags: ['搜索'],
        successRate: 0.7,
      },
      {
        id: 'climb_ferris',
        text: '爬上摩天轮顶部俯瞰周围地形',
        risk: '[获得周边情报] [可能坠落] [高处显眼]',
        tags: ['侦查', '高风险'],
        successRate: 0.5,
      },
      {
        id: 'rest_playground',
        text: '在空旷处休息片刻——视野开阔相对安全',
        risk: '[理智+5] [露天暴露]',
        tags: ['休息'],
        onSuccess: {
          effects: { sanity: 5 },
        },
        successRate: 0.9,
      },
    ],
    danger: 1,
  },
  sewage_plant: {
    id: 'sewage_plant',
    name: '污水处理厂',
    baseText: '一座废弃的污水处理厂，巨大的沉淀池表面结了暗绿色的藻类。处理车间的大门半开着，里面有规律的机械敲击声——某种泵还在运转。空气刺鼻。',
    options: [
      {
        id: 'explore_plant',
        text: '深入车间寻找可用物资',
        risk: '[可能找到工业设备] [可能遭遇变异丧尸] [化学危险]',
        tags: ['探索', '高风险'],
        successRate: 0.4,
      },
      {
        id: 'collect_water',
        text: '在净水池收集相对干净的水',
        risk: '[获得水] [需要容器] [水质存疑]',
        tags: ['采集'],
        requireItems: ['water_bottle'],
        successRate: 0.8,
        onSuccess: {
          text: '你蹲在净水池边缘把水壶探进水面。处理厂的沉降工序让水看起来还算清澈——至少没有肉眼可见的悬浮物。你灌满了水壶后又用备用的塑料袋多装了一袋。虽然你不太信任这水的纯度，但在煮沸或过滤之后应该问题不大。',
          effects: { thirst: 10 },
          loot: ['dirty_water'],
        },
        onFailure: {
          text: '你蹲在池边刚把水壶浸入水中就闻到了一股不对劲的味道——水面下有一层暗色的沉积物被你搅动了，浑浊的颗粒从池底翻涌上来。你把水壶收回来看了一眼，水壶口挂着一丝暗绿色的絮状物。这水就算煮沸了你也不想喝。你甩干水壶换了个地方。',
        },
      },
      {
        id: 'fix_pump',
        text: '试着关掉那个还在运转的泵——噪音可能吸引丧尸',
        risk: '[需要:工具] [减少区域危险]',
        tags: ['技术'],
        successRate: 0.6,
      },
    ],
    danger: 3,
  },
  rail_yard: {
    id: 'rail_yard',
    name: '铁路调车场',
    baseText: '货运火车车厢排成几列停在铁轨上，有些车门已经被撬开。车厢之间堆着集装箱，形成了一道天然的屏障。风穿过车厢缝隙发出呜呜的呼啸声。',
    options: [
      {
        id: 'search_containers',
        text: '逐个检查未开封的集装箱',
        risk: '[可能找到大量物资] [可能有丧尸困在里面]',
        tags: ['搜索', '高风险'],
        successRate: 0.5,
      },
      {
        id: 'climb_wagon',
        text: '爬到车厢顶上观察整个调车场布局',
        risk: '[安全] [了解地形] [可能解锁新区域]',
        tags: ['侦查'],
        successRate: 0.8,
      },
      {
        id: 'use_wagon_rest',
        text: '找一节空车厢关上门休息',
        risk: '[安全休息] [恢复生命+5 理智+10]',
        tags: ['休息'],
        onSuccess: {
          effects: { sanity: 10 },
          events: ['rest_light'],
        },
        successRate: 0.9,
      },
    ],
    danger: 2,
  },
}
