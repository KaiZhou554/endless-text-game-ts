/**
 * 结局系统 — 丧尸末日生存
 *
 * 每个结局包含检查函数和结局文本
 * 结局检查在每次行动后触发
 */

import type { Ending } from '../types'

export const endingChecks: Ending[] = [

  // 1. 尸变结局（感染值达到 100）
  {
    id: 'zombification',
    name: '尸变',
    check(state) {
      return state.infection >= 100
    },
    title: '🧟 尸变',
    subtitle: '第 {days} 天 — 你变成了你最害怕的东西',
    text: `你的体温持续升高，伤口周围的黑色纹路像藤蔓一样蔓延到了胸口。理智在一点点消失，取而代之的是一种原始的饥饿。

你最后的人类意识记录下一个画面：夕阳下，你站在空无一人的街道上，嘴里发出不属于自己的低吼。

你曾是猎人。现在，你是猎物。

—— 丧尸病毒潜伏期比你想象的要短。你成为了城市里又一具没有名字的行尸走肉。`,
    stats: ['days', 'kills', 'itemsCollected'],
    isDeath: true,
  },

  // 2. 精神崩溃（理智归零）
  {
    id: 'insanity',
    name: '精神崩溃',
    check(state) {
      return state.sanity <= 0
    },
    title: '💀 精神崩溃',
    subtitle: '第 {days} 天 — 你的心智已经走到了尽头',
    text: `墙上的影子不再只是影子。它们在对你说话——用你记忆中那些已逝同伴的语气。

你对着空气开枪，对着镜子里的自己尖叫。最后，你坐在一间空荡荡的公寓里，抱着一个你觉得是活人的泰迪熊，轻声哼着童谣。

外面的丧尸没有杀死你。是你的大脑杀死了自己。

—— 在末日中，最可怕的敌人有时住在你的脑子里。`,
    stats: ['days', 'kills', 'itemsCollected'],
    isDeath: true,
  },

  // 3. 生命耗尽
  {
    id: 'death_hp',
    name: '力竭而亡',
    check(state) {
      return state.hp <= 0
    },
    title: '🩸 力竭而亡',
    subtitle: '第 {days} 天 — 你的身体终于支撑不住了',
    text: `失血、饥饿、脱水、伤口感染——身体在最后几天里向每一个方向发出痛苦的信号。你靠意志力撑到了最后一刻。

倒下的时候，天空开始下雨。雨滴打在脸上，冰冷得像是世界在提醒你：你还活着，但已经不会太久了。

—— 死亡是残酷的。这在末世里对于每一个人都稀松平常。`,
    stats: ['days', 'kills', 'itemsCollected'],
    isDeath: true,
  },

  // 4. 直升机救援（存活 14 天 + 对讲机 + 频率密码本）
  {
    id: 'helicopter_rescue',
    name: '直升机救援',
    check(state) {
      if (state.dayCount < 14) return false
      return state.radioContactMade === true
    },
    title: '🚁 获救',
    subtitle: '第 {days} 天 — 救援终于来了',
    text: `对讲机里传来了清晰的声音："幸存者，我们收到了你的信号。保持当前位置，直升机将在十分钟后到达。"

直升机降落在天台上的时候，螺旋桨掀起的风吹散了你积攒了两周的灰尘。舱门打开，一双戴着手套的手把你拉了上去。

从空中俯视，城市像是被某种瘟疫啃噬过的尸体。但你已经不在其中了。

—— 你带着对讲机、密码本，和十五天来积累的每一道伤疤，活着离开了。`,
    stats: ['days', 'kills', 'npcsMet', 'itemsCollected'],
    isDeath: false,
  },

  // 5. 血清研制（收集血清样本+研究笔记 → 实验室地点 + 门禁卡）
  {
    id: 'serum_created',
    name: '血清研制',
    check(state) {
      if (state.currentScene !== 'laboratory') return false
      return state._serumReady === true
    },
    title: '🧬 希望',
    subtitle: '第 {days} 天 — 你可能是人类的救星',
    text: `实验室的离心机开始转动。你按照研究笔记中的步骤，将血清样本注入培养基。屏幕上的数据显示：ZM-07 原型在体外实验中成功抑制了病毒复制。

这不是治愈——还不是。但这是人类找到的第一缕曙光。

你将数据通过实验室的卫星上行链路发送了出去。也许在某个地方，有人正在接收。

—— 一个普通人，在末日里拒绝放弃。这本身就是一种英雄主义。`,
    stats: ['days', 'kills', 'npcsMet', 'itemsCollected'],
    isDeath: false,
  },

  // 6. 孤独终老（存活超过 30 天，某项资源耗尽后继续存活）
  {
    id: 'hermit_ending',
    name: '孤独的幸存者',
    check(state) {
      return state.dayCount >= 30
    },
    title: '🏕️ 独行侠',
    subtitle: '第 {days} 天 — 你已经习惯了末日',
    text: `生活变成了某种日常。早起检查陷阱，收集雨水，避开尸群——这些已经像以前坐地铁上班一样自然。

你不再需要闹钟来叫醒自己。恐惧成了你的闹钟。警惕成了你的早餐。

城市在衰败，自然在回收。你在天台种了番茄，用废弃的太阳能板给手电充电。这不是生活，但这是在活着。

—— 你不是最后一个人类，但有时候，你感觉像是。`,
    stats: ['days', 'kills', 'npcsMet', 'itemsCollected'],
    isDeath: false,
  },

  // 7. 牺牲结局（理智低于 10 时选择救助他人）
  {
    id: 'sacrifice',
    name: '牺牲',
    check(state) {
      return state.sacrificeTriggered === true
    },
    title: '🕯️ 最后的烛光',
    subtitle: '第 {days} 天 — 你以另一种方式活了下来',
    text: `在最后那一刻，你选择了推开别人。你放弃了活下去的机会，把它让给了伙伴。

也许这就是人类在末日里最了不起的地方：即使世界崩塌了，还有人愿意为别人挡下致命的一击。

你的名字也许没人会记得。但被你救下的人会替你看到日出。

—— "真正的死亡，是被遗忘。"你不会被遗忘。`,
    stats: ['days', 'kills', 'npcsHelped', 'itemsCollected'],
    isDeath: true,
  },

  // 8. 安全区结局（在安全区累计行动12次以上，状态良好）
  {
    id: 'safe_zone',
    name: '新家园',
    check(state) {
      if (!state.safeZoneJoined) return false
      if (state.safeZoneActions < 8) return false
      return state.hp > 50 && state.sanity > 50
    },
    title: '🏘️ 避风港',
    subtitle: '第 {days} 天 — 围墙之内，日子安静地叠加',
    text: `围墙在你到来之后又加高了一截。大家轮流巡逻，十分尽职尽责，有人在院子里种了番茄，竟然真的结出了果实。

没有人再提起最初几周的事情。那些让你在漫漫长夜里反复推演的问题，如今堆在脑海深处，像褪色的旧报纸，被饱腹感和上锁的房门隔在了触碰不到的距离。

围墙外，世界按自己的节奏继续腐烂，无人打扰。灾难的布局者还在某处呼吸，他们的事业从未中断。

你找到了安宁。安宁和你想象的一模一样。`,
    stats: ['days', 'kills', 'npcsMet', 'npcsHelped', 'itemsCollected'],
    isDeath: false,
  },


  // ==================== 更多结局 ====================

  // 9. 电台之王（在广播站，第28-29天，拥有对讲机）
  {
    id: 'radio_king',
    name: '永不消逝的电波',
    check(state) {
      if (state.currentScene !== 'radio_station') return false
      if (state.dayCount < 28 || state.dayCount >= 30) return false
      return state.inventory.some(i => i.id === 'radio')
    },
    title: '📻 空中灯塔',
    subtitle: '第 {days} 天 — 你的声音传遍了废墟',
    text: "你的广播持续了三周。起初只有杂音，然后是断断续续的回复，最后——各个角落的幸存者开始向你的坐标集结。\n\n几十个、上百个信号回应了你。每一条都代表一个还在呼吸的人。你成了这座死城的心跳。\n\n三周后，你所在的天台上升起了一面旗帜。从直升机上看下去，那是废墟中唯一的色彩。\n\n—— 一个人加上一台对讲机，点亮了整座城市的求生网络。",
    stats: ['days', 'kills', 'npcsMet', 'npcsHelped', 'itemsCollected'],
    isDeath: false,
  },

  // 10. 海上逃亡
  {
    id: 'boat_escape',
    name: '扬帆远航',
    check(state) {
      return state.boatRepaired === true
    },
    title: '⛵ 驶向未知',
    subtitle: '第 {days} 天 — 你用一艘小船离开了这座死城',
    text: "河边那艘小渔船在水里泡了很久，但引擎奇迹般地还能发动。你用最后一桶汽油灌满了油箱，把物资扔进船舱，推离了河岸。\n\n城市的轮廓在晨雾中渐渐缩小。河风带着湿润的泥土味，水鸟在头顶盘旋——这是末日以来第一次，你看见了没有丧尸的风景。\n\n下游那边是新的陆地、新的消息、新的可能。你回头看了一眼这座死城，然后转头向前。\n\n—— 有些人选择在废墟中扎根。你选择了航行，去寻找远方的答案。",
    stats: ['days', 'kills', 'npcsMet', 'itemsCollected'],
    isDeath: false,
  },

  // 11. 丧尸屠夫（清道夫结局）
  {
    id: 'zombie_slayer',
    name: '清道夫',
    check(state) {
      return state.kills >= 80
    },
    title: '⚰️ 清道夫',
    subtitle: '第 {days} 天 — 丧尸危机结束了，而你一路杀到了最后',
    text: "城市恢复了寂静——不是死亡的寂静，而是重建前的那份等待的安静。\n\n你数不清自己杀了多少只。八十？一百？数字在某个节点之后就不再重要了。重要的是你还在呼吸，而它们不再动弹。\n\n从第一根棒球棍裂开的那一刻起，你就知道这不是一场能靠逃跑赢得的战争。你一路从街道杀到医院，从商场杀到地铁隧道。每一处都留下了你的印记——和它们永远不会再爬起来的躯体。\n\n幸存者们叫你\"清道夫\"。不是因为你清扫垃圾，而是因为你清扫了这座城市里的怪物。你是从丧尸危机爆发一直战斗到结束的少数人之一。当其他人躲藏、逃跑、绝望的时候，你选择了握紧武器。\n\n现在，危机结束了。阳光穿过不再是灰色的天空，照在空旷的街道上。远处有烟升起——有人在生火做饭，而不是求救信号。\n\n你坐到一辆废弃汽车的前盖上，把武器横放在膝盖上。第一次，你允许自己真正地呼吸。\n\n—— 你不是英雄。你只是一个拒绝倒下的人。而有时候，这就足够了。",
    stats: ['days', 'kills', 'itemsCollected'],
    isDeath: false,
  },

  // 12. 地下之王（在地铁站或地下停车场累计行动多次，第28-29天，生命良好）
  {
    id: 'underground_king',
    name: '地下之王',
    check(state) {
      if (state.currentScene !== 'subway' && state.currentScene !== 'parking_garage') return false
      if (state.dayCount < 28 || state.dayCount >= 30) return false
      if (state.hp < 50) return false
      return state.undergroundActions >= 5
    },
    title: '🕳️ 深渊领主',
    subtitle: '第 {days} 天 — 地下成了你的王国',
    text: "当所有人都往上跑的时候，你选择往下走。地铁隧道、下水道、防空洞——地下世界在你手中变成了一座要塞。\n\n你用荧光棒标出了安全路径，用陷阱封锁了丧尸通道。地下有水源、有蘑菇、有成群的老鼠可以吃。头顶偶尔传来地面的震动，但你已不在意。\n\n有一天你在隧道交叉口看到了涂鸦——\"地下人不欢迎地上客——除非你会带电池来换蘑菇。\"\n\n你笑了笑。地下王国有了自己的规矩和幽默感。也许不算最好的生活，但这是你自己建造的。\n\n—— 文明不需要阳光。只需要一群愿意向下挖的人。",
    stats: ['days', 'kills', 'itemsCollected'],
    isDeath: false,
  },
];
