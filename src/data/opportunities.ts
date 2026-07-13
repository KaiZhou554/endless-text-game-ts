/**
 * 机遇数据库 — 每个场景都可能触发的机遇
 * 通用机遇 = 无 sceneTags，场景特定机遇 = sceneTags 匹配当前场景
 */
import type { Opportunity } from '../types'
import { opportunities_extras } from './extensions/opportunities-extras'
import { opportunities_medical_sleep } from './extensions/opportunities-medical-sleep'
import { opportunities_generic_medical } from './extensions/opportunities-generic-medical'
import { opportunities_endings } from './extensions/opportunities-endings'
import { opportunities_guns } from './extensions/opportunities-guns'

export const opportunities: Opportunity[] = [

  // ==================== 通用机遇（骰子） ====================

  {
    id: 'sudden_rain',
    baseText: '天空毫无预兆地暗了下来。豆大的雨点砸在地面的尘土上，激起一片细密的水雾。你环顾四周，没有能避雨的地方——只能硬着头皮继续走。雨势在几分钟内就会把你浇透。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '雨水浸透了你的衣服和背包里的东西。你浑身发抖，每一步都变得沉重。', effects: { hp: -5, sanity: -3, hunger: -3 }, lootItem: 'dirty_water' },
      { min: 3, max: 4, text: '你把外套裹紧了些。虽然淋了雨，但不算太糟。', nothing: true },
      { min: 5, max: 6, text: '你发现雨水冲开了一堆瓦砾，露出了一个被遗忘的储物箱。里面居然还有几样东西没被拿走。', lootItem: 'canned_beans' },
    ],
  },
  {
    id: 'distant_explosion',
    baseText: '远处传来一声沉闷的爆炸声，连你脚下的地面都微微震了一下。爆炸的方向升起一股黑烟，在半空中缓缓扩散。有几只鸟从那个方向惊飞而起。',
    type: 'narrative',
    delay: 4,
  },
  {
    id: 'strange_smell',
    baseText: '一阵怪异的气味飘了过来——像是烧焦的塑料混合着某种化学品。你无法判断来源，但这气味让你的眼睛微微发涩。你加快了脚步，想要离开这个区域。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你感到一阵头晕，视线变得模糊。有毒气体！你赶紧捂住口鼻跑开，但还是吸入了一些。', effects: { hp: -8, sanity: -3 } },
      { min: 3, max: 5, text: '气味虽然刺鼻，但你屏住呼吸快速穿过了这片区域，没有大碍。', nothing: true },
      { min: 6, max: 6, text: '你循着气味找到了源头——一辆侧翻的化学运输车，后厢门开着，里面散落着一些急救物资。', lootItem: 'bandage' },
    ],
  },
  {
    id: 'footprints_path',
    baseText: '地面上有一串新鲜的脚印，沿着小路延伸向前方。脚印很新，边缘还没有被风吹平。从间距来看，留下脚印的人走得不紧不慢。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '脚印把你引向了一具倒在路边的尸体——是饿死的。你翻找了他的口袋，什么有用的都没找到。', effects: { sanity: -5 } },
      { min: 3, max: 4, text: '你沿着脚印走了一段，但它们在碎石地上消失了。你在周围转了转，什么也没发现。', nothing: true },
      { min: 5, max: 6, text: '脚印的主人似乎在这里休息过——在一处背风的墙角，你发现了一个被草草掩埋的塑料袋，里面装着一些补给。', lootItem: 'energy_bar' },
    ],
  },
  {
    id: 'crows_circle',
    baseText: '一群乌鸦在你前方上空盘旋，发出沙哑的叫声。它们在某个地方反复绕圈——那是食腐动物发现食物的信号。也许是一具尸体，也许是什么别的东西。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你决定不去看那里有什么。在这种时候，好奇心不值得冒险。', nothing: true },
      { min: 3, max: 4, text: '你绕开那片区域，选择了另一条路。保险起见。', nothing: true },
      { min: 5, max: 6, text: '你小心地靠近，发现是一头被啃食过的野鹿。丧尸袭击的痕迹。但鹿肉大部分还在——你快速割下一些能带走的肉。', lootItem: 'dried_meat' },
    ],
  },

  // ==================== 通用机遇（纯剧情） ====================

  {
    id: 'wind_chimes',
    baseText: '风穿过一栋废弃公寓楼的走廊，带动了某户人家阳台上挂着的风铃。叮叮当当的声音在空荡荡的街道上显得异常清晰。你抬头看了一眼那扇半开的窗户，窗帘被风吹得鼓起来，又落下去。',
    type: 'narrative',
    delay: 4,
  },
  {
    id: 'graffiti_wall',
    baseText: '一面砖墙上被人用喷漆涂满了各种信息。大部分是看不懂的标记和符号，但有一行字格外清晰："这儿没水了。往东走，河边能取水。"落款日期是两个月前。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你按照提示往东走了一段，但河岸已经被污染了，水面上漂着油污和杂物。白跑一趟。', effects: { hunger: -3, thirst: -5 } },
      { min: 3, max: 5, text: '你在河边找到了一个相对干净的取水点。虽然水需要煮沸才能喝，但总算是个好兆头。', nothing: true },
      { min: 6, max: 6, text: '河水冲刷出了一段浅滩，你在一处凹陷的岩石旁发现了一个被人遗忘的防水袋，里面装着一些密封的食物。', lootItem: 'crackers' },
    ],
  },
  {
    id: 'abandoned_car',
    baseText: '一辆车窗全碎的小轿车歪斜地停在路中间，车门敞开着。后座上散落着地图和空水瓶。手套箱被人翻过，但驾驶座底下似乎有什么东西。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '手套箱里有只老鼠窝。你被吓了一跳，手肘撞在方向盘上。又酸又痛。', effects: { hp: -3 } },
      { min: 3, max: 4, text: '你翻遍了整辆车，除了一些废纸和空瓶子外什么都没找到。', nothing: true },
      { min: 5, max: 6, text: '座位下面有一把掉落的折叠刀，卡在座位轨道里。虽然不起眼，但在末日里任何工具都有用。', lootItem: 'knife' },
    ],
  },

  // ==================== 医疗区域机遇 ====================

  {
    id: 'med_cabinet',
    baseText: '你经过一面半开的柜门——看起来像是某个小诊所的药品柜。大部分药品已经被拿走了，但最上层隔板后面似乎还有东西。',
    type: 'dice',
    sceneTags: ['医疗'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你踮脚去够的时候碰倒了旁边的空玻璃瓶。碎了一地。好在没有引来什么东西。', effects: { sanity: -3 } },
      { min: 3, max: 5, text: '隔板后面只有一些过期很久的维生素片，已经变色了。你扔了回去。', nothing: true },
      { min: 6, max: 6, text: '你摸到了一盒还没开封的抗生素。生产日期是去年的——还在有效期内。', lootItem: 'antibiotics' },
    ],
  },

  // ==================== 武器相关场景机遇 ====================

  {
    id: 'shooting_range',
    baseText: '你路过一个废弃的室内靶场。隔音墙上的弹孔密密麻麻，地上散落着用过的弹壳。柜台后面的玻璃碎了，展示柜里的东西早就被一扫而空。',
    type: 'dice',
    sceneTags: ['武器'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你踢到了一个空罐头，声音在室内回荡了许久。你赶紧躲到墙后等了五分钟，确认没东西被引来才离开。', effects: { sanity: -5 } },
      { min: 3, max: 5, text: '你在柜台下面找到了几发落单的弹药。虽然不多，但有总比没有好。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '一个被人遗忘的储物柜没锁紧。你拉开一看——里面有一把保养得不错的M9手枪和一个备用弹匣。', lootItem: 'pistol' },
    ],
  },

  // ==================== 住宅区机遇 ====================

  {
    id: 'rooftop_garden',
    baseText: '一栋居民楼的天台上有人种过菜。几块泡沫箱里，泥土已经干裂，但有一株番茄藤居然还活着，挂着几颗青色的果子。旁边有一个积满了雨水的塑料桶。',
    type: 'dice',
    sceneTags: ['住宅'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '番茄还没熟透，但你太饿了。你摘了一颗咬了一口——又酸又涩。', effects: { hunger: 3, sanity: -2 } },
      { min: 3, max: 5, text: '你用桶里的雨水洗了把脸。水很凉，但让人清醒了不少。', nothing: true },
      { min: 6, max: 6, text: '泡沫箱的土里埋着一个防水保鲜盒，里面居然还有几块巧克力。虽然有点化了，但还能吃。', lootItem: 'chocolate' },
    ],
  },
  {
    id: 'flooded_basement',
    baseText: '一栋房子的地下室楼梯口有积水，水面泛着油光。水面上漂浮着一些杂物碎片。水里可能有东西，也可能没有。',
    type: 'dice',
    sceneTags: ['住宅', '黑暗'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '你踩进水里时惊动了藏在里面的老鼠。一大群老鼠从暗处涌出，从你脚边窜过。你被吓得差点摔倒。', effects: { sanity: -8 } },
      { min: 4, max: 5, text: '你用一根棍子探了探水深，决定不下去。不值得冒险。', nothing: true },
      { min: 6, max: 6, text: '水下的台阶上绊到了什么东西——一个防水背包。你捞起来打开，里面的东西居然还是干的。', lootItem: 'mre' },
    ],
  },

  // ==================== 户外自然机遇 ====================

  {
    id: 'fallen_tree',
    baseText: '一棵大树横倒在路中间，巨大的树根翻出地面，带起了一大块泥土。树根之间露出了一些缝隙，里面似乎藏着什么东西。',
    type: 'dice',
    sceneTags: ['自然', '森林'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你靠近时惊动了一窝野蜂。它们不高兴。你的手臂和脖子被蜇了好几处。', effects: { hp: -5, sanity: -3 } },
      { min: 3, max: 5, text: '树根下面的缝隙是空的。你费了半天力气翻过去，继续赶路。', nothing: true },
      { min: 6, max: 6, text: '树根的泥土里嵌着一个徒步旅行者的背包。你把它拽了出来——里面的东西多半不能用，但有一罐蜂蜜完好无损。', lootItem: 'honey_jar' },
    ],
  },

  // ==================== 来自 extensions/opportunities-extras.ts ====================
  ...opportunities_extras,

  // ==================== 来自 extensions/opportunities-medical-sleep.ts ====================
  ...opportunities_medical_sleep,

  // ==================== 来自 extensions/opportunities-generic-medical.ts（通用，无 sceneTags） ====================
  ...opportunities_generic_medical,

  // ==================== 来自 extensions/opportunities-guns.ts（枪械，低概率） ====================
  ...opportunities_guns,

  // ==================== 来自 extensions/opportunities-endings.ts（结局关键道具） ====================
  ...opportunities_endings,
]
