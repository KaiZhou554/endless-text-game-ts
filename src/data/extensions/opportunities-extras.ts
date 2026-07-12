/**
 * 机遇扩展 — 额外机遇
 * 新增机遇在此文件追加即可
 */
import type { Opportunity } from '../../types'

export const opportunities_extras: Opportunity[] = [

  // ==================== 通用机遇（骰子） ====================

  {
    id: 'broken_crate',
    baseText: '路边倒着一个破损的木板箱，上面的货运标签已经看不清了。箱子被撬开了一半，盖子歪在一旁，里面塞着发黄的泡沫填充物。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '泡沫下面只有一堆碎玻璃和空的塑料瓶。有人先来过了。', nothing: true },
      { min: 3, max: 4, text: '你在泡沫深处摸到了一个硬物——一把没有生锈的多功能工具钳。虽然不值钱，但很实用。', lootItem: 'multitool' },
      { min: 5, max: 6, text: '箱子底层有一整盒防水火柴和几包压缩饼干。显然是被遗忘的应急物资储备。', lootItem: 'matches' },
    ],
  },

  {
    id: 'stray_cat',
    baseText: '一只瘦骨嶙峋的橘猫从墙头跳下来，蹲在路中间盯着你看。它的项圈上挂了一个小小的胶囊吊坠——里面似乎塞了什么东西。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '你靠近一步，猫转身就跑了，消失在围墙那头。你连项圈上的字都没看清。', nothing: true },
      { min: 4, max: 5, text: '猫没有躲开。你小心地解下吊坠，里面有一小卷钞票。在末日里没什么用。', effects: { sanity: 2 } },
      { min: 6, max: 6, text: '吊坠里是一把小型钥匙和一张纸条："B12号储物柜，密码0412。里面有一周的补给。——如果你是个好人，别伤害它。"', lootItem: 'lockpick' },
    ],
  },

  {
    id: 'lost_backpack',
    baseText: '一棵行道树的枝杈上挂着一个背包，离地约三米。背包的肩带缠在了树枝上，看样子是被人从高处甩上去挂住的。包面沾了鸟粪但看上去没破。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你跳了几次都够不着。树枝太细不敢爬上去。只能作罢。', nothing: true },
      { min: 3, max: 5, text: '你用一根长杆把背包捅了下来。里面有几件换洗衣服和一条毛巾——不算没用，但也不是你急需的。', nothing: true },
      { min: 6, max: 6, text: '背包掉下来时摔开了。里面除了一条毛巾外，还有一包没拆封的军用口粮和一个水壶。', lootItem: 'mre' },
    ],
  },

  {
    id: 'traffic_light',
    baseText: '一个十字路口的交通信号灯竟然还在工作，红绿交替闪烁。路口中央躺着一辆撞毁的摩托车，碎片散了一地。头盔滚到了人行道上。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你翻遍了摩托车周围的碎片，除了被压扁的空塑料瓶外什么都没找到。', nothing: true },
      { min: 3, max: 4, text: '头盔里垫着的缓冲棉还算干净。你把棉垫拆下来，以后可以当简易绷带或抹布用。', nothing: true },
      { min: 5, max: 6, text: '摩托车侧箱里有一个完好无损的工具包，里面有扳手、螺丝刀和一卷强力胶带。', lootItem: 'duct_tape' },
    ],
  },

  {
    id: 'bird_feeder',
    baseText: '一个庭院里挂着几只鸟食笼，里面的谷物已经发霉，但有一只笼子下方被人绑了一个塑料防水盒。盒子用橡皮筋固定在铁架上。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '你打开盒子——空的。大概本来就是个备用容器，还没来得及装东西。', nothing: true },
      { min: 4, max: 5, text: '盒子里有几块用保鲜膜包好的压缩饼干，保存得不错。', lootItem: 'crackers' },
      { min: 6, max: 6, text: '盒子底部压了一小袋咖啡豆和一包速溶咖啡粉。在末日里这点奢侈比什么都珍贵。', lootItem: 'coffee_beans' },
    ],
  },

  {
    id: 'cracked_pipe',
    baseText: '一根地下水管破裂了，清水从路面裂缝中涌出来，在人行道上形成了一小片清澈的水洼。水看起来很干净，可能是从上游的蓄水池来的。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你捧起水尝了一口——一股铁锈味。水管内部可能已经腐蚀了。喝下去胃里不舒服。', effects: { hp: -3, thirst: 8 } },
      { min: 3, max: 5, text: '水很凉也很清。你洗了把脸，精神好了不少。', nothing: true },
      { min: 6, max: 6, text: '你在水洼旁发现了一个被人遗落的不锈钢水壶，里面还装着大半壶干净的水。', lootItem: 'water_bottle' },
    ],
  },

  {
    id: 'newspaper_stack',
    baseText: '一摞旧报纸被压在石墩下面，纸张已经泛黄，边角卷了起来。最上面那张的头版标题写着"紧急状态：全国进入宵禁"，日期是三个月前。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你翻开报纸——除了过时的新闻什么都没有。还沾了一手油墨。', nothing: true },
      { min: 3, max: 5, text: '报纸里夹着一张手绘的城区地图，标注了几个物资点的位置。虽然有些潦草但信息有用。', nothing: true },
      { min: 6, max: 6, text: '报纸下面压着一个被遗忘的信封，里面有几张对折的钞票和一块黑巧克力。', lootItem: 'chocolate' },
    ],
  },

  // ==================== 通用机遇（纯剧情） ====================

  {
    id: 'torn_banner',
    baseText: '一栋商场外墙上挂着巨大的横幅，已经被风雨撕成了布条，在风中啪啪作响。只能看清最后几个字："……坚持住。"横幅下方的地面上积了一层碎玻璃，在阳光下闪闪发光。',
    type: 'narrative',
    delay: 4,
  },

  {
    id: 'stray_dog_passing',
    baseText: '一只脏兮兮的灰色流浪犬从你前方二十米处小跑穿过街道，嘴里叼着什么看不清楚的东西。它停下来看了你一眼，然后继续跑进了一条小巷。巷口传来几声低吠。',
    type: 'narrative',
    delay: 4,
  },

  {
    id: 'lone_bicycle',
    baseText: '一辆崭新的山地自行车靠在路边的公交站牌上，后轮还在慢慢转动。车锁绕在车架上——没锁。周围没有人。这辆车明显是刚刚才被放在这里的。',
    type: 'narrative',
    delay: 4,
  },

  // ==================== 通用机遇（剧情+效果） ====================

  {
    id: 'falling_star',
    baseText: '你抬头看夜空时，一颗流星划过。在城市灯光全部熄灭之后，夜空变得比以往任何时候都更加清晰。你能看到以前从未注意过的星座。流星转瞬即逝，但那个瞬间让你想起了文明还在时抬头看天的感觉。',
    type: 'narrative_result',
    delay: 4,
    resultEffects: { sanity: 5 },
  },

  // ==================== 医疗区域机遇 ====================

  {
    id: 'hospital_cart',
    baseText: '走廊角落里停着一辆被遗弃的医用推车，上面还铺着蓝色的无菌布。推车抽屉半开着，里面有些瓶瓶罐罐在晃动。地上散落着几个用过的注射器包装。',
    type: 'dice',
    sceneTags: ['医疗'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '抽屉里的药瓶都是空的，针管用过了。唯一完整的是半瓶医用酒精——消毒还行，不能喝。', nothing: true },
      { min: 3, max: 5, text: '你找到了两卷没拆封的纱布绷带。虽然不是稀有药品，但总比没有强。', lootItem: 'bandage' },
      { min: 6, max: 6, text: '推车最底层的抽屉里有一整盒没开封的急救包。标签显示它是从军方配给中分出来的。', lootItem: 'first_aid_kit' },
    ],
  },

  // ==================== 武器/军事区域机遇 ====================

  {
    id: 'checkpoint_remains',
    baseText: '一个废弃的军事检查站——沙袋工事后面倒着一挺拆卸了一半的机枪。弹药箱散落在沙袋之间，有些还盖着防水布。血迹在沙袋上干成了暗褐色。',
    type: 'dice',
    sceneTags: ['武器', '军事'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你掀开防水布——下面的弹药箱已经被雨水泡烂了，里面的子弹锈得没法用。', nothing: true },
      { min: 3, max: 5, text: '你在沙袋缝隙里找到了两盒没被泡过的9mm子弹。虽然不多，但每发在末日里都金贵。', lootItem: 'ammo_9mm' },
      { min: 6, max: 6, text: '工事后面有一个被遗忘的绿色铁箱，锁已经被砸开了。里面是一把保养良好的双管猎枪和一小盒霰弹。', lootItem: 'shotgun' },
    ],
  },

  // ==================== 食物/超市/厨房区域机遇 ====================

  {
    id: 'kitchen_pantry',
    baseText: '一家餐馆后厨的储藏室里，货架上的罐头被翻得乱七八糟，但最下层的一个纸箱被压在翻倒的货架下面，只露出一个角。纸箱上印着"紧急储备 — 勿动"。',
    type: 'dice',
    sceneTags: ['食物', '物资'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你费力搬开货架，打开纸箱——里面是一堆过期的调味包。番茄酱已经变成了褐色。', nothing: true },
      { min: 3, max: 5, text: '纸箱里是几罐完整的金枪鱼罐头，标签完好，拉环也没生锈。', lootItem: 'canned_tuna' },
      { min: 6, max: 6, text: '箱子底层压着一罐蜂蜜和几包密封的风干肉条，保存状态完美。不知道是谁藏在这里的。', lootItem: 'honey_jar' },
    ],
  },

  // ==================== 自然/户外区域机遇 ====================

  {
    id: 'berry_bush',
    baseText: '灌木丛里长着一大片野生浆果，深紫色的果实挂满了枝条。一些果子已经被鸟啄过，但大部分都完好。你认出了这是黑莓——野外可食用的品种。',
    type: 'dice',
    sceneTags: ['自然', '森林', '采集'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 1, text: '你摘了一大把塞进嘴里，但有几颗已经发酵了。酸涩的味道让你一阵反胃。', effects: { hunger: 5, hp: -5 } },
      { min: 2, max: 4, text: '你吃了几颗垫垫肚子。虽然不多，但野果的酸甜滋味让你感到片刻的愉快。', effects: { hunger: 8, sanity: 3 } },
      { min: 5, max: 6, text: '你摘了满满一捧，够吃一阵了。浆果新鲜饱满，是这几天来最好的天然食物。', lootItem: 'trail_mix' },
    ],
  },

  // ==================== 住宅区域机遇 ====================

  {
    id: 'mailbox_flag',
    baseText: '一户人家的邮箱上竖起了红色取件旗——说明里面有未取的信件。在这个被遗弃的社区里，这个信号看起来格外突兀。邮箱盖子被胶带封了一圈。',
    type: 'dice',
    sceneTags: ['住宅'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你撕开胶带——里面只有一摞水电费账单和广告传单。看来主人在撤离前没顾上收邮件。', nothing: true },
      { min: 3, max: 5, text: '邮箱里有一管防水包装的止痛药和一张手写便条："如果还有人活着，这些拿去用。我们往北走了。"', lootItem: 'painkillers' },
      { min: 6, max: 6, text: '邮箱底部有一个密封塑料袋，里面装着一板抗生素和一串钥匙。钥匙上贴着标签"储物室 B3"。', lootItem: 'antibiotics' },
    ],
  },

  // ==================== 地下/黑暗区域机遇 ====================

  {
    id: 'glow_worms',
    baseText: '隧道的墙壁上有一片淡蓝色的荧光——一群发光的蠕虫附着在潮湿的砖缝里，组成了一个奇怪而美丽的图案。在这片绝对的黑暗中，这点微光就是唯一的光源。',
    type: 'dice',
    sceneTags: ['黑暗', '地下'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你靠近观察时惊动了虫群，荧光瞬间熄灭。你在黑暗中绊了一跤，膝盖磕在铁轨上。', effects: { hp: -5, sanity: -3 } },
      { min: 3, max: 5, text: '你在虫群下方的地面上发现了几颗被遗忘的电池。大概是哪个维修工人掉在这里的。', lootItem: 'batteries' },
      { min: 6, max: 6, text: '荧光照亮了墙上的一个暗格——里面塞了一个防水袋，袋子里有一本手写的隧道巡逻日志和一把开锁器。', lootItem: 'lockpick' },
    ],
  },

  // ==================== 工业/仓库区域机遇 ====================

  {
    id: 'welding_cart',
    baseText: '一辆焊接推车停在车间角落里，气瓶和焊枪还连着管子。旁边的工具柜上有人用粉笔写了一行字："氧气快没了，后面的用手磨机。——下午班"',
    type: 'dice',
    sceneTags: ['工业', '物资'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '推车上的工具基本上都被拿走了，只剩几个用过的砂轮片和一段焊丝。', nothing: true },
      { min: 4, max: 5, text: '工具柜底层的抽屉里有一把还没用过的工兵铲，带着原装的油纸包装。', lootItem: 'shovel' },
      { min: 6, max: 6, text: '你在焊接面罩后面找到了一个被遗忘的工具包——里面有全新的多功能工具钳和一卷铜线。', lootItem: 'multitool' },
    ],
  },

  // ==================== 交通/车辆区域机遇 ====================

  {
    id: 'bus_station',
    baseText: '公交总站的候车室里，自动售票机还在发出低沉的嗡嗡声。屏幕上闪着"故障 — 请使用现金"的字样。旁边的失物招领柜被撬开了，但里面还有几件没人要的东西。',
    type: 'dice',
    sceneTags: ['交通'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '失物招领柜里只有一把断掉的雨伞和一只单只手套。毫无用处。', nothing: true },
      { min: 3, max: 5, text: '你找到了一把带挂绳的口哨和几张过期的优惠券。口哨也许可以用来发信号——如果不怕引来丧尸的话。', nothing: true },
      { min: 6, max: 6, text: '柜子最深处有一个被遗忘的腰包，里面装着能量棒、止咳药片和一张地图碎片。', lootItem: 'energy_bar' },
    ],
  },

  // ==================== 更多剧情机遇 ====================

  {
    id: 'rooftop_light',
    baseText: '远处一栋高楼的天台上，一盏灯闪烁了三下——长、短、长。摩尔斯码。有人在那栋楼上用灯光发信号。信号重复了两遍，然后停了。',
    type: 'narrative',
    sceneTags: ['高处'],
    delay: 4,
  },
]
