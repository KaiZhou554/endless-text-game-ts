/**
 * 机遇扩展 — 通用医疗物品 & 睡袋
 * 无 sceneTags = 任何场景都可能触发
 */
import type { Opportunity } from '../../types'

export const opportunities_generic_medical: Opportunity[] = [

  // ==================== 医疗类（通用） ====================

  {
    id: 'discarded_backpack_medical',
    baseText: '路边的排水沟里躺着一个被丢弃的帆布背包，半边泡在泥水里。背包侧面有一个褪色的红十字标记——大概是某个医护人员的装备。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '背包里的东西被泥水泡烂了——绷带发霉、药品受潮。你翻了半天只找到一卷勉强还能用的医用胶布。', nothing: true },
      { min: 3, max: 5, text: '背包的内袋是防水的——里面有几卷无菌纱布绷带和一小瓶碘伏，保存状态不错。', lootItem: 'bandage' },
      { min: 6, max: 6, text: '背包底层有一个密封的防水袋，装着完整的急救包。夹层里还有一张手写的急救指南，字迹已经模糊但还能辨认。', lootItem: 'first_aid_kit' },
    ],
  },

  {
    id: 'roadside_memorial',
    baseText: '路边立着一个用石块堆成的简易标记，石堆顶上压着一束已经干枯的野花。石块下面塞了一个透明的密封袋，里面似乎装着什么东西。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '密封袋里是一张照片和一张手写卡片。不是你该碰的东西。你小心地把石堆恢复原样。', effects: { sanity: -5 } },
      { min: 4, max: 5, text: '密封袋里除了照片，还有几板崭新的止痛药。大概是留在这里给需要的人的——某种无声的善意。', lootItem: 'painkillers' },
      { min: 6, max: 6, text: '密封袋里有全套急救用品，用橡皮筋扎得整整齐齐。石堆背面刻了一行小字："拿你需要的，留下你多余的。"', lootItem: 'first_aid_kit' },
    ],
  },

  {
    id: 'overturned_cart',
    baseText: '人行道上翻倒着一辆超市购物车，里面的东西散落一地。大部分是踩烂的零食包装和空水瓶，但车篮底部的夹层里塞了一个带拉链的防水小包。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '防水包里是空的。大概是被前主人拿出来用掉了。拉链上还挂着一个没了药的空药瓶。', nothing: true },
      { min: 3, max: 5, text: '防水包里有一板布洛芬和一卷弹性绷带。不是什么稀有药品，但头痛发烧的时候没有比这更管用的了。', lootItem: 'painkillers' },
      { min: 6, max: 6, text: '防水包里有几板完好的抗生素和一管没拆封的缝合线。生产日期显示是半年前的——还在有效期内。', lootItem: 'antibiotics' },
    ],
  },

  {
    id: 'half_buried_box',
    baseText: '一棵被风刮倒的大树根下露出了一个塑料储物箱的一角，箱子上压着厚厚一层泥土和落叶。箱子表面有被动物啃过的痕迹，但箱体没有破裂。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你挖开泥土打开箱子——里面是一窝刚出生的小老鼠。你把盖子重新盖上，决定不去打扰它们。', nothing: true },
      { min: 3, max: 5, text: '箱子里有几件旧衣服和一个没开封的急救包。衣服被虫蛀了几个洞，但急救包的塑封完好。', lootItem: 'first_aid_kit' },
      { min: 6, max: 6, text: '箱子里整整齐齐码着医疗用品：绷带、止血带、抗生素、一次性注射器。这是一份专门为野外生存准备的医疗储备，保存状况堪称完美。', lootItem: 'antibiotics' },
    ],
  },

  {
    id: 'park_bench_supplies',
    baseText: '公园长椅上放着一个鼓鼓囊囊的塑料袋，袋口用晾衣夹封着。袋子上用马克笔写了一行字："拿走吧，我用不上了。"字迹歪歪扭扭，但写的人显然很认真。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '塑料袋里是几件旧T恤和一双破了洞的运动鞋。你翻了翻，还有半包过期的止咳糖。不是你想要的东西。', nothing: true },
      { min: 4, max: 5, text: '塑料袋里有几板没有标签的药片和一卷纱布。凭味道你判断是某种消炎药——在末日里，有就比没有强。', lootItem: 'painkillers' },
      { min: 6, max: 6, text: '塑料袋里有整盒的抗生素和一张纸条。纸条上只写了用法用量——每日两次，每次一粒，连服一周。一看就是懂行的人留的。', lootItem: 'antibiotics' },
    ],
  },

  {
    id: 'dumpster_find',
    baseText: '一个翻倒的垃圾桶旁边散落着各种废弃物——旧家具、撕烂的书本、踩扁的塑料桶。在垃圾堆的边缘，有一个完好无损的纸箱，上面印着"社区医疗包"的字样。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '纸箱被人翻过了，里面的东西被挑拣过。剩下的只有过期的止咳糖浆和两片用过的创可贴。', nothing: true },
      { min: 4, max: 5, text: '纸箱里还有几卷没被拿走的纱布绷带和一瓶医用酒精。酒精擦伤口很疼，但能防止感染。', lootItem: 'bandage' },
      { min: 6, max: 6, text: '纸箱的夹层里有一个被忽略的拉链包，里面装着完整的缝合套装——弯针、缝合线、持针器，还附了一张使用说明。', lootItem: 'suture_kit' },
    ],
  },

  {
    id: 'smashed_vending_machine',
    baseText: '一台自动售货机被人用重物砸碎了玻璃。里面的零食和饮料早就被搬空，但机器底部有一个卡住的格子——大概是出货时机械故障，里面的东西掉在了别人够不到的位置。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '你伸手进去掏了半天——空的。那个格子的东西大概还是被人想办法拿走了，玻璃碎片划破了你的手指。', effects: { hp: -3 } },
      { min: 4, max: 5, text: '你从卡住的格子里掏出了一个小急救包。大概是司机或建筑工人应急用的那种——放在手套箱里的标准配置。', lootItem: 'bandage' },
      { min: 6, max: 6, text: '急救包旁边竟然还有一小瓶没开封的止痛药和一支肾上腺素注射笔。售货机里为什么会有这些东西是个谜——但你不打算深究。', lootItem: 'adrenaline_shot' },
    ],
  },

  {
    id: 'rusty_locker',
    baseText: '一栋废弃建筑的走廊里排着一排铁皮储物柜，大部分柜门敞开着。有一个柜子锁着——锁头是那种便宜的挂锁，已经锈得不成样子。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你用重物砸开挂锁——柜子里只有一个发霉的午餐盒和几张泛黄的排班表。', nothing: true },
      { min: 3, max: 5, text: '柜子里有一件叠得整整齐齐的工作服和一个小药箱。药箱里有感冒药和几板综合维生素片。', lootItem: 'vitamin_pills' },
      { min: 6, max: 6, text: '柜子里有一个上锁的小铁盒，撬开后里面全是药品——抗生素、止痛药、抗过敏药，一应俱全。这是某个有远见的人囤的应急储备。', lootItem: 'antibiotics' },
    ],
  },

  // ==================== 睡袋类（通用） ====================

  {
    id: 'abandoned_tent',
    baseText: '一片空地上支着一顶已经被风吹塌了半边的帐篷，地钉松了，帐篷布在风中拍打着支架。帐篷里面堆着枯叶和尘土，但露营装备似乎没有完全被搬走。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '帐篷里的睡袋被雨水泡过，内衬发霉结块，一股腐臭味。拉开拉链时里面还爬出了几只西瓜虫。没法用了。', nothing: true },
      { min: 3, max: 5, text: '帐篷角落里有一条用防水袋装着的睡袋，外面虽然潮湿但防水袋里面是干的。前主人走的时候大概觉得太重了没有带走。', lootItem: 'sleeping_bag' },
      { min: 6, max: 6, text: '睡袋旁边还有一个压缩气罐和一个小炉头——前主人把整个露营系统留在了这里。你只拿走了睡袋，但心里记下了这个位置。', lootItem: 'sleeping_bag' },
    ],
  },

  {
    id: 'car_trunk_camp',
    baseText: '一辆撞在护栏上的SUV后厢盖弹开着，里面的行李散落到路面上。其中有一个军绿色的帆布行李袋，拉链崩开了，露出一角蓬松的填充物。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '行李袋里是一床普通的棉被，已经吸满了雨水变得死沉。你费了半天力气也没能把它拧干。', nothing: true },
      { min: 3, max: 5, text: '行李袋里除了棉被还有一条压缩好的睡袋，因为放在防水收纳袋里所以没有受潮。这辆车的主人显然是有户外经验的人。', lootItem: 'sleeping_bag' },
      { min: 6, max: 6, text: '行李袋里整整齐齐地收纳着一条四季通用睡袋和一张防潮垫。前主人把装备保养得很仔细，收纳袋上还贴着使用说明。', lootItem: 'sleeping_bag' },
    ],
  },

  {
    id: 'under_bridge_bedding',
    baseText: '一座立交桥下的水泥平台上，有人铺了几层硬纸板当床。纸板上放着一个卷起来的睡袋和几个空水瓶。周围没有人——这个临时床位已经被遗弃了至少几天。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '睡袋上沾满了不明来源的污渍，内衬已经磨破了，填充物结成了硬块。你碰了一下，一股酸臭味飘出来。', nothing: true },
      { min: 4, max: 6, text: '睡袋虽然旧但还算干净，折叠得整整齐齐。前主人把它维护得不错——大概这是为数不多还能让他们感到体面的东西。你拿走了它。', lootItem: 'sleeping_bag' },
    ],
  },

  {
    id: 'construction_site_trailer',
    baseText: '工地的临时办公室拖车被撬开了，里面翻得一片狼藉。桌上散落着图纸和烟灰缸，铁柜的抽屉全被拉开了。角落里有一个没人注意到的行李包，上面盖着掉下来的窗帘布。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '行李包里是几件沾了油漆的工装和一双破旧的安全鞋。不值钱的个人物品。', nothing: true },
      { min: 3, max: 5, text: '行李包里有一个卷起来的睡袋，标签上写着工地配发用品。虽然薄了点，但在室内过夜完全够了。', lootItem: 'sleeping_bag' },
      { min: 6, max: 6, text: '行李包里有睡袋和一套干净的工作服。还有一张手写纸条："值夜班用的，别拿。——王队。"不过王队大概不会回来了。', lootItem: 'sleeping_bag' },
    ],
  },

  {
    id: 'bus_station_locker',
    baseText: '长途汽车站的候车大厅里，一排自助储物柜的电源早就断了。有几个柜门被撬开，物品散在地上。其中一个储物柜里的东西还完好——被人塞在最里面，不容易够到。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '你踮脚在储物柜里摸了半天——空的。大概早有人把你想到的每个角落都掏过了。', nothing: true },
      { min: 4, max: 6, text: '你从储物柜深处掏出一个压缩睡袋。标签上印着某户外品牌的Logo，看起来是旅客遗忘在车站的行李。几个月过去了，没人来认领。', lootItem: 'sleeping_bag' },
    ],
  },
]
