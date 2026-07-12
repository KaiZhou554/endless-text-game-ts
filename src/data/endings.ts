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
    text: `墙上的影子不再只是影子。它们在对你说话——用你已经去世的母亲的语气。

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

—— 生存是残酷的。有时候，不是丧尸杀死了你，而是你自己的身体背叛了自己。`,
    stats: ['days', 'kills', 'itemsCollected'],
    isDeath: true,
  },

  // 4. 直升机救援（存活 14 天 + 对讲机 + 频率密码本）
  {
    id: 'helicopter_rescue',
    name: '直升机救援',
    check(state) {
      if (state.dayCount < 14) return false
      const hasRadio = state.inventory.some(i => i.id === 'radio')
      const hasFrequency = state.inventory.some(i => i.id === 'radio_frequency')
      return hasRadio && hasFrequency
    },
    title: '🚁 获救',
    subtitle: '第 {days} 天 — 救援终于来了',
    text: `对讲机里传来了清晰的声音："幸存者，我们收到了你的信号。保持当前位置，直升机将在十分钟后到达。"

当黑鹰直升机降落在天台上的时候，螺旋桨掀起的风吹散了你积攒了两周的灰尘。舱门打开，一双戴着手套的手把你拉了上去。

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
      const hasSerum = state.inventory.some(i => i.id === 'serum_sample')
      const hasNotes = state.inventory.some(i => i.id === 'research_notes')
      const hasKeycard = state.inventory.some(i => i.id === 'lab_keycard')
      return hasSerum && hasNotes && hasKeycard
    },
    title: '🧬 希望',
    subtitle: '第 {days} 天 — 你可能是人类的救星',
    text: `实验室的离心机开始转动。你按照研究笔记中的步骤，将血清样本注入培养基。屏幕上的数据显示：ZM-07 原型在体外实验中成功抑制了病毒复制。

这不是治愈——还不是。但这是人类找到的第一缕曙光。

你将数据通过实验室的卫星上行链路发送了出去。也许在某个地方，有人正在接收。

—— 你不是战士，不是英雄。你只是一个不愿意放弃的普通人。而这已经足够了。`,
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
    text: `在最后那一刻，你选择了推开别人。不是因为你不想活——而是因为你想让别人活下去。

也许这就是人类在末日里最了不起的地方：即使世界崩塌了，还有人愿意为别人挡下致命的一击。

你的名字也许没人会记得。但被你救下的人会替你看到日出。

—— "真正的死亡，是被遗忘。"你不会被遗忘。`,
    stats: ['days', 'kills', 'npcsHelped', 'itemsCollected'],
    isDeath: true,
  },

  // 8. 安全区结局（找到安全区并帮助建立社区）
  {
    id: 'safe_zone',
    name: '新家园',
    check(state) {
      return state.safeZoneJoined === true && state.dayCount >= 7
    },
    title: '🏘️ 希望的种子',
    subtitle: '第 {days} 天 — 你们一起重建了秩序',
    text: `安全区不是天堂——它有争执、有分配问题、有争吵和泪水。但它有一样东西是所有废墟都没有的：希望。

你们修复了围墙，清理了附近的丧尸，甚至开始在学校操场上种蔬菜。孩子们在阳光下奔跑的声音，比任何广播信号都更有力量。

—— 文明的种子在任何土壤里都能发芽。只要有人在的地方，就有未来。`,
    stats: ['days', 'kills', 'npcsMet', 'npcsHelped', 'itemsCollected'],
    isDeath: false,
  },
]
