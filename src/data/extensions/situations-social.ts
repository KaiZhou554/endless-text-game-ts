import type { Situations } from '../../types'

/**
 * 情景扩展 — 社交/剧情类遭遇
 * 新增情景在此文件追加即可
 */
export const situations_social: Situations = {
  cries_for_help: {
    id: 'cries_for_help',
    name: '求救声',
    baseText: '你听到远处传来微弱的求救声——一个女人在哭喊。声音来自一栋半塌的建筑，入口被瓦砾堵住了一半。',
    options: [
      {
        id: 'investigate',
        text: '进去救人',
        risk: '[可能是陷阱] [消耗体力]',
        tags: ['救援', '高风险'],
        successRate: 0.5,
      },
      {
        id: 'ignore',
        text: '装作没听见',
        risk: '[理智-10] [安全]',
        tags: ['冷漠'],
        sanityEffect: -10,
        successRate: 1.0,
      },
      {
        id: 'shout',
        text: '大声回应，让对方自己出来',
        risk: '[可能引来丧尸]',
        tags: ['噪音'],
        successRate: 0.4,
      },
    ],
    danger: 3,
  },
  survivor_camp: {
    id: 'survivor_camp',
    name: '幸存者营地',
    baseText: '一队幸存者在相对完好的建筑里扎了营。从远处能看到篝火的光和岗哨的身影。他们看起来装备精良但警惕性极高。',
    options: [
      {
        id: 'approach',
        text: '举起双手慢慢靠近',
        risk: '[可能被攻击] [可能交易]',
        tags: ['社交', '高风险'],
        successRate: 0.5,
      },
      {
        id: 'observe',
        text: '用望远镜观察',
        risk: '[安全] [消耗时间]',
        tags: ['侦查'],
        requireItems: ['binoculars'],
        successRate: 1.0,
      },
      {
        id: 'avoid',
        text: '绕过他们的营地',
        risk: '[安全] [错过机会]',
        tags: ['回避'],
        successRate: 1.0,
      },
    ],
    danger: 2,
  },
  radio_signal: {
    id: 'radio_signal',
    name: '广播信号',
    baseText: '附近某处传来了断断续续的广播声，一个男声在说："这里是...救援点查理...每周二、四正午...直升机...坐标..."信号夹杂着杂音，听不太清楚。',
    options: [
      {
        id: 'listen',
        text: '靠近声源仔细听，尽力记住内容',
        risk: '[可能听清部分信息] [理智-3:信号在你脑中萦绕]',
        tags: ['信息'],
        successRate: 0.7,
      },
      {
        id: 'record',
        text: '用对讲机接收并记录下频率和坐标',
        risk: '[获得完整信息] [需要:对讲机]',
        tags: ['信息'],
        requireItems: ['radio'],
        successRate: 1.0,
      },
      {
        id: 'respond',
        text: '用对讲机尝试回复',
        risk: '[需要:对讲机] [可能暴露位置]',
        tags: ['通讯'],
        requireItems: ['radio'],
        successRate: 0.3,
      },
    ],
    danger: 1,
  },
  dog_encounter: {
    id: 'dog_encounter',
    name: '流浪狗',
    baseText: '一只瘦骨嶙峋的德国牧羊犬站在废墟间，警惕地看着你。它的脖子上有一个项圈，但没有主人。',
    options: [
      {
        id: 'approach_dog',
        text: '慢慢靠近，伸手让它闻',
        risk: '[可能获得同伴] [可能被咬]',
        tags: ['社交', '动物'],
        successRate: 0.4,
      },
      {
        id: 'share_food',
        text: '扔一些食物给它',
        risk: '[消耗食物] [赢得信任]',
        tags: ['友善'],
        requireTags: ['食物'],
        successRate: 0.8,
      },
      {
        id: 'ignore_dog',
        text: '绕开它继续前进',
        risk: '[安全]',
        tags: ['回避'],
        successRate: 1.0,
      },
    ],
    danger: 1,
  },
  helicopter_flyby: {
    id: 'helicopter_flyby',
    name: '直升机飞过',
    baseText: '天空传来引擎的轰鸣——一架黑鹰直升机从低空飞过，方向朝西北方。它飞得很低，你甚至能看到机身上的编号。',
    options: [
      {
        id: 'signal',
        text: '挥舞信号弹或亮色衣物',
        risk: '[需要:信号弹] [可能被救援] [可能引来丧尸]',
        tags: ['信号'],
        requireItems: ['flare'],
        successRate: 0.4,
      },
      {
        id: 'radio_call',
        text: '用对讲机呼叫',
        risk: '[需要:对讲机+频率密码本] [高概率救援]',
        tags: ['通讯', '结局'],
        requireItems: ['radio', 'radio_frequency'],
        successRate: 0.8,
      },
      {
        id: 'hide',
        text: '躲起来避免被发现',
        risk: '[安全] [错过救援]',
        tags: ['隐藏'],
        successRate: 1.0,
      },
    ],
    danger: 1,
  },
  blood_trail: {
    id: 'blood_trail',
    name: '血迹追踪',
    baseText: '地面上有一条新鲜的血迹，拖成一条断续的线，延伸到一扇半开的防火门后面。',
    options: [
      {
        id: 'follow',
        text: '沿着血迹追踪',
        risk: '[可能找到幸存者] [可能遭遇危险]',
        tags: ['追踪'],
        successRate: 0.5,
      },
      {
        id: 'avoid_trail',
        text: '往反方向走',
        risk: '[安全] [错过线索]',
        tags: ['回避'],
        successRate: 1.0,
      },
    ],
    danger: 3,
  },
  satellite_phone: {
    id: 'satellite_phone',
    name: '应急信标',
    baseText: '路边一根歪斜的灯柱上挂着一个橙色应急信标，太阳能板还在工作，小红灯有节奏地闪烁。底座上刻着一行编号和二维码，大概是某个救援组织的标记。',
    options: [
      {
        id: 'scan_qr',
        text: '用手机扫描二维码看看（虽然没信号）',
        risk: '[安全] [可能获得情报]',
        tags: ['信息'],
        successRate: 0.7,
      },
      {
        id: 'take_beacon',
        text: '把信标拆下来带走，也许能改装成报警器',
        risk: '[安全] [获得物品]',
        tags: ['搜索'],
        successRate: 0.8,
      },
      {
        id: 'ignore_beacon',
        text: '一个没电的手机没什么用，继续赶路',
        risk: '[安全]',
        tags: ['回避'],
        successRate: 1.0,
      },
    ],
    danger: 0,
  },
  music_playing: {
    id: 'music_playing',
    name: '诡异的音乐',
    baseText: '远处的建筑里传来循环播放的音乐——是《蓝色多瑙河》，从一个破旧的录音机里飘出来。是谁在播？为什么？',
    options: [
      {
        id: 'investigate_music',
        text: '循着音乐声去查看',
        risk: '[可能遭遇幸存者或陷阱]',
        tags: ['探索'],
        successRate: 0.4,
      },
      {
        id: 'turn_off',
        text: '想方设法关掉音乐——它会引来丧尸',
        risk: '[安全] [减少区域危险]',
        tags: ['清除威胁'],
        successRate: 0.8,
      },
    ],
    danger: 3,
  },
}
