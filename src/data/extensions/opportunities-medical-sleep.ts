/**
 * 机遇扩展 — 医疗物品 & 睡袋专项
 * 所有机遇均设有专门 sceneTags，无通用条目
 */
import type { Opportunity } from '../../types'

export const opportunities_medical_sleep: Opportunity[] = [

  // ==========================================
  // 医疗类 — sceneTags: ['医疗'] 匹配医院/药房
  // ==========================================

  {
    id: 'supply_closet',
    baseText: '走廊尽头有一扇标着"清洁用品"的门，但你推开后发现里面其实是医护人员的储物柜。柜门有几扇虚掩着，里面的白大褂还挂在衣架上。',
    type: 'dice',
    sceneTags: ['医疗'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你翻了几件白大褂的口袋，只找到一支漏墨的圆珠笔和几张揉成团的纸巾。', nothing: true },
      { min: 3, max: 5, text: '一件白大褂的内袋里有几卷还没拆封的纱布绷带。虽然不是贵重药品，但止血总是用得上的。', lootItem: 'bandage' },
      { min: 6, max: 6, text: '最里面那扇柜门后面藏了一个上锁的小急救箱。锁已经生锈，轻轻一撬就开了——里面是一整套没动过的急救用品。', lootItem: 'first_aid_kit' },
    ],
  },

  {
    id: 'medicine_cabinet',
    baseText: '一间诊室的墙上挂着老式的木质药柜，玻璃门碎了一扇。里面的药瓶东倒西歪，大部分标签已经模糊。但最底层有一排棕色玻璃瓶整齐排列着，瓶盖上的封蜡完好无损。',
    type: 'dice',
    sceneTags: ['医疗'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你把棕色瓶子拿出来一看——标签上写的是生理盐水。有用但不值钱。', nothing: true },
      { min: 3, max: 5, text: '其中两瓶是碘伏和外用消毒液。你挑了一瓶能用的装进包里。至少能清理伤口。', lootItem: 'bandage' },
      { min: 6, max: 6, text: '最后一瓶的封蜡上压了一个红色的十字印章——军用标准配给品。里面是没开封的广谱抗生素。', lootItem: 'antibiotics' },
    ],
  },

  {
    id: 'dental_chair',
    baseText: '牙科诊室里的治疗椅还保持着半躺的姿势，器械盘上的工具散落一地。角落的柜子里传来一股淡淡的薄荷味——漱口水和消毒液混合的气味。',
    type: 'dice',
    sceneTags: ['医疗'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '器械盘上的东西基本上都摔坏了。没有找到什么有用的东西。', nothing: true },
      { min: 4, max: 5, text: '柜子里有几板布洛芬止痛药，可能是给拔牙病人开的。剂量不大但够用一阵。', lootItem: 'painkillers' },
      { min: 6, max: 6, text: '在最里层的抽屉里，你发现了一支还封着无菌包装的牙科麻醉注射剂。在野外医疗中这东西的价值远超牙科范畴。', lootItem: 'sedative' },
    ],
  },

  {
    id: 'nurse_station',
    baseText: '护士站的柜台后面散落着病历夹和空咖啡杯。治疗推车上盖了一块蓝色的无菌布，布下面鼓鼓囊囊的，似乎还有东西没被拿走。',
    type: 'dice',
    sceneTags: ['医疗'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '无菌布下面只有用过的纱布和空注射器。你的手不小心被一根暴露的针头划了一下。', effects: { hp: -3 } },
      { min: 3, max: 5, text: '推车上有几个没开封的缝合包。虽然不是稀有药品，但处理深度伤口时不可或缺。', lootItem: 'suture_kit' },
      { min: 6, max: 6, text: '推车下层的金属托盘里整齐排列着预装好的注射器——肾上腺素、抗过敏药和止痛针各一支。你用布把它们裹好收了起来。', lootItem: 'adrenaline_shot' },
    ],
  },

  {
    id: 'pharmacy_shelf',
    baseText: '药房深处有一排货架被翻倒的柜子挡住了入口，大部分寻宝者嫌麻烦没有翻进去。你从柜子侧面的缝隙挤进去后，发现这排货架上的药品几乎没被动过。',
    type: 'dice',
    sceneTags: ['医疗', '物资'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '货架上的药瓶被老鼠啃过，铝箔包装上全是牙印。你挑了几颗看起来还完好的药片，但实在不放心。', effects: { sanity: -3 } },
      { min: 3, max: 5, text: '你找到了一瓶综合维生素片，包装完好。在食物匮乏的时候，微量元素补充比想象中更重要。', lootItem: 'vitamin_pills' },
      { min: 6, max: 6, text: '货架最底层有一个上了锁的冷藏箱，锁扣已经被撬坏了但没人打开过。里面是几支需要低温保存的注射用药剂——包括一支标注着"实验性"的抗病毒血清。', lootItem: 'antidote' },
    ],
  },

  {
    id: 'overturned_crash_cart',
    baseText: '抢救室的角落里倒着一辆翻倒的急救推车，除颤仪的电极片还贴在推车侧面。推车底部的抽屉被压住了打不开，但从缝隙里能看到里面有塑封包装的反光。',
    type: 'dice',
    sceneTags: ['医疗'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '你费力把推车扶正，拉开抽屉——里面是空的，只剩下几张撕开的包装纸。', nothing: true },
      { min: 4, max: 5, text: '抽屉里有几块没用过的止血海绵和一卷弹性绷带。你挑了一些装进包里。', lootItem: 'tourniquet' },
      { min: 6, max: 6, text: '推车底下还压着一个没被发现的急救包。拉链卡住了，但里面的东西看起来完好——无菌纱布、止血钳、缝合针，一应俱全。', lootItem: 'first_aid_kit' },
    ],
  },

  {
    id: 'medical_lab_freezer',
    baseText: '实验室角落里一台小型超低温冰箱还在运转，压缩机发出低沉的轰鸣声。冰箱门上贴了一张黄色标签："生物样本，非授权人员勿动"。',
    type: 'dice',
    sceneTags: ['医疗', '科学'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你拉开冰箱门，一股冷气扑面而来。里面的试管架东倒西歪，样本瓶碎了好几个。剩下的标签模糊不清，你不知道哪个能用。', nothing: true },
      { min: 3, max: 5, text: '冰箱里有一个密封的金属盒子，里面装着几支标注着"ZM-07 原型"的注射器。考虑到外面那些感染者的存在，这东西或许是你最大的希望。', lootItem: 'antidote' },
      { min: 6, max: 6, text: '金属盒子里不仅有血清样本，还有一份折叠整齐的研究摘要。虽然大部分术语你看不懂，但附录里的剂量指南非常详细——这是完整的治疗方案。', lootItem: 'antidote' },
    ],
  },

  {
    id: 'ambulance_garage',
    baseText: '医院地下的救护车库停着几辆救护车，后门都敞开着。其中一辆的担架上还放着没来得及卸下的医疗背包，带子上沾了干涸的血迹。',
    type: 'dice',
    sceneTags: ['医疗', '交通'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '医疗背包里的药品已经被高温烤坏了——注射液变了色，药片粘成了一坨。夏天的车厢就是烤箱。', nothing: true },
      { min: 3, max: 5, text: '背包里有几根没拆封的止血带和一卷医用胶布。虽然大部分东西坏了，但止血带是橡胶的，不会过期。', lootItem: 'tourniquet' },
      { min: 6, max: 6, text: '你在驾驶座后面的夹层里发现了一个完整的急救包，标签上写着"备用——不随车使用"。看来是司机自己藏的私货。', lootItem: 'first_aid_kit' },
    ],
  },

  // ==========================================
  // 睡袋类 — 不同场景标签分别匹配
  // ==========================================

  {
    id: 'attic_storage',
    baseText: '老式居民楼的阁楼入口是一块可以推开的天花板，拉下折叠梯后，一阵陈旧的樟脑丸气味飘了下来。阁楼里堆满了住户留下的纸箱和旧家具，灰尘厚得能写字。',
    type: 'dice',
    sceneTags: ['住宅'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '阁楼里闷热得让人窒息。你翻了几个纸箱——旧衣服、破台灯、发黄的杂志。全是搬不走也不值钱的东西。', nothing: true },
      { min: 3, max: 5, text: '一个帆布收纳袋里塞着一条羽绒填充的睡袋，虽然有点霉味但完好无损。在这种时候，一条睡袋就意味着不用在冰冷的地面上过夜。', lootItem: 'sleeping_bag' },
      { min: 6, max: 6, text: '睡袋旁边还有一顶折叠帐篷和几张防潮垫。你只拿了睡袋——帐篷太占地方了。但这条睡袋的成色几乎全新，压缩后只有水壶大小。', lootItem: 'sleeping_bag' },
    ],
  },

  {
    id: 'rooftop_camp',
    baseText: '天台的水塔后面有一个用防水布搭成的简易窝棚，周围用砖头压着边角。窝棚里铺着几层硬纸板，角落里放了一个鼓鼓囊囊的防水袋。这里显然有人住过。',
    type: 'dice',
    sceneTags: ['安全', '高处'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '防水袋里是一堆已经发臭的衣物和半包受潮的饼干。住在这里的人走得很匆忙，但值钱的东西一件没留。', nothing: true },
      { min: 4, max: 6, text: '防水袋里有一条卷得整整齐齐的睡袋，用压缩带捆着。睡袋外层是防水材料，内衬是抓绒的——这是专为户外设计的款式。前任主人把它保护得很好。', lootItem: 'sleeping_bag' },
    ],
  },

  {
    id: 'shelter_cot',
    baseText: '避难所看台下方的一排折叠行军床之间，有几条被遗落的毯子和个人物品。其中一张行军床的床垫下面压着一个军绿色的收纳袋，不仔细看根本注意不到。',
    type: 'dice',
    sceneTags: ['避难所'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '收纳袋里只有一条薄毯子和一双破洞的袜子。大概是被故意藏在这里的，但藏的东西不值得拿。', nothing: true },
      { min: 4, max: 6, text: '收纳袋里是一条军规睡袋，温标标着零下五度。侧面有一小块烧焦的痕迹，但填充物没有漏出来。可能是某个撤离的士兵落下的。', lootItem: 'sleeping_bag' },
    ],
  },

  {
    id: 'hidden_cache',
    baseText: '一条不起眼的干枯排水渠里，有人用石块垒了一个小隔间。隔间入口用一块褪色的广告牌挡着，从外面完全看不出来。里面空间不大，但足够一个人蜷缩着休息。',
    type: 'dice',
    sceneTags: ['隐蔽'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '隔间里空荡荡的，只有地面上铺着的几张报纸和一个踩扁的易拉罐。有人曾经在这里短暂停留过，但什么也没留下。', nothing: true },
      { min: 3, max: 5, text: '角落里放着一个卷起来的睡袋，用塑料袋包了好几层防潮。旁边还有半截蜡烛和一小包火柴——前主人给后来者留了完整的过夜装备。', lootItem: 'sleeping_bag' },
      { min: 6, max: 6, text: '睡袋旁边有一张手写的便条："我往北走了，装备留着给需要的人。记住：白天赶路，天黑前找掩体。——C"睡袋是全新的，吊牌还没拆。', lootItem: 'sleeping_bag' },
    ],
  },

  {
    id: 'lost_found_room',
    baseText: '教学楼走廊尽头的失物招领室，架子上整齐地排列着各种被遗忘的物品——水壶、饭盒、雨伞、运动鞋。角落里堆着几个大号的编织袋，其中一个袋口松开了，露出一角蓬松的织物。',
    type: 'dice',
    sceneTags: ['教育'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '编织袋里是学校露营社团的装备——几个坏掉的帐篷杆和一条被老鼠咬穿的睡袋内胆。棉絮漏了一地，没法用了。', nothing: true },
      { min: 4, max: 6, text: '编织袋最底下有一条完好的睡袋，装在自带的收纳袋里。标签显示这是学校活动用品，但现在的使用者不会介意这个。', lootItem: 'sleeping_bag' },
    ],
  },

  {
    id: 'guard_quarters',
    baseText: '警察局后面的值班休息室里，上下铺的铁架床上堆着几床凌乱的被子。储物柜的门都开着，其中一个柜子里放着一个军绿色的背包，背带上的反光条已经磨得发白。',
    type: 'dice',
    sceneTags: ['官方'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '背包里只有一套换洗的制服和一双皮鞋。大概是某个警员撤离前留下的私人物品，没什么能用的。', nothing: true },
      { min: 3, max: 5, text: '背包底层有一条压缩好的睡袋，是警方配发的应急装备。虽然薄了点，但春秋季完全够用。', lootItem: 'sleeping_bag' },
      { min: 6, max: 6, text: '睡袋旁边还有一张塑封的城区地图和一把备用钥匙。看来这位警员在山里露营的经验比在警局里多。', lootItem: 'sleeping_bag' },
    ],
  },
]
