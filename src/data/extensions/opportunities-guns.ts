/**
 * 机遇扩展 — 枪械获取（低概率）
 * 含通用机遇（无 sceneTags）和场景特有（有 sceneTags）
 */
import type { Opportunity } from '../../types'

export const opportunities_guns: Opportunity[] = [

  // ==========================================
  // 场景特有 — 军事/武器区域
  // ==========================================

  {
    id: 'armory_floorboard',
    baseText: '军械库的地面上有一块松动的水泥地砖，边缘有被撬过的痕迹。你踩上去时感觉下面有空响——地砖下面是空的。',
    type: 'dice',
    sceneTags: ['军事', '武器'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '你撬开地砖——下面是一个空的铁盒。早就被人发现了，里面只剩灰尘和一颗生锈的螺丝。', nothing: true },
      { min: 4, max: 5, text: '铁盒里是一盒封装完好的弹药，保存状态不错。可惜枪不在里面。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '铁盒里用油布裹着一把双管猎枪，枪身上过油，保养得极好。旁边还有一小盒霰弹。这是某个士兵私下藏的个人武器。', lootItem: 'shotgun' },
    ],
  },

  {
    id: 'police_armory_remains',
    baseText: '警局武器库的防盗门被炸开了，墙上焦黑的痕迹还残留着火药味。库房里的步枪架已经空了，但在翻倒的铁柜和散落的弹壳之间，似乎还有东西被压在废墟底下。',
    type: 'dice',
    sceneTags: ['官方', '武器'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '你在废墟里翻了二十分钟——只有空弹匣和用过的枪套。这里被清理得很彻底。', nothing: true },
      { min: 4, max: 5, text: '铁柜下面压着一盒没开封的弹药，包装还是军规的牛皮纸。至少弹药进了你的口袋。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '一个翻倒的枪架底下卡着一把M9手枪，弹匣还在枪里。枪身上有划痕但机械结构完好——大概是撤离时掉在地上没人顾上捡。', lootItem: 'pistol' },
    ],
  },

  {
    id: 'guard_tower_stash',
    baseText: '一座废弃的瞭望塔底层，墙上的挂钩还挂着一件防弹背心。墙角堆着几个沙袋，其中一个沙袋破了一个口子，从裂口里露出了一截枪管。',
    type: 'dice',
    sceneTags: ['军事'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '枪管连着的是半截被炸断的枪身——剩下的部分不知飞到哪里去了。只是一块废铁。', nothing: true },
      { min: 4, max: 5, text: '枪管和枪身都在，但枪机卡死了。你在沙袋旁边找到了几发弹药，至少还能用。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '沙袋里藏着一把完好的M9手枪和两个备用弹匣。枪被仔细地用防水布裹了好几层——藏它的人显然是打算回来取的。', lootItem: 'pistol' },
    ],
  },

  {
    id: 'hunting_blind',
    baseText: '森林深处有一个用树枝和伪装网搭成的狩猎掩体，已经荒废了很久。掩体里的折叠椅上放着一个上了锁的塑料枪箱，箱子表面爬满了藤蔓。',
    type: 'dice',
    sceneTags: ['自然', '隐蔽'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '你用石头砸开塑料锁扣——枪箱是空的。只有发霉的海绵内衬和一张过期的狩猎许可证。', nothing: true },
      { min: 4, max: 5, text: '枪箱里没有枪，但海绵垫下面压着一盒弹药，保存得相当完好。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '枪箱里是一把现代复合弩，弓弦松开了但完好无损。箱盖内侧贴着保养说明和使用注意事项——前主人是个认真的人。', lootItem: 'crossbow' },
    ],
  },

  {
    id: 'hardware_store_backroom',
    baseText: '五金店后面的员工休息室里，一个金属工具柜被挪到了墙角挡着通往地下室的门。地下室不大，堆满了退货和待维修的商品——其中有一个长条形的硬塑箱。',
    type: 'dice',
    sceneTags: ['工业', '物资'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '硬塑箱里是一台坏掉的链锯。有趣但不实用——你需要的不是伐木工具。', nothing: true },
      { min: 4, max: 5, text: '硬塑箱旁边有几盒弹药，包装完好。运气不错。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '硬塑箱里是一把改装过的工地钉枪，安全开关被拆掉了，射速快得出奇。标签上写着"顾客退货——故障品"，但你知道这不是故障。', lootItem: 'nail_gun' },
    ],
  },

  {
    id: 'train_yard_crate',
    baseText: '铁路货场的一节敞篷车厢里堆满了木条箱，大部分被撬开了，里面装的是瓷砖和卫浴设备。但有一个标记着"机械零件"的箱子钉得严严实实，摇晃时里面有金属碰撞声。',
    type: 'dice',
    sceneTags: ['工业', '交通'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '你撬开木条箱——里面是生锈的水管阀门和几包螺丝。金属碰撞声来自散落的螺母。', nothing: true },
      { min: 4, max: 5, text: '箱子里的机械零件之间夹着一盒弹药，大概是从别的货物里滑进去的。意外收获。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '在阀门和管道下面，有人藏了一把猎枪和一小盒霰弹。这显然不是随机的货物——是某个铁路工人偷偷塞进去的私人物品。', lootItem: 'shotgun' },
    ],
  },

  {
    id: 'parking_trunk',
    baseText: '地下停车场里有一辆车的后备箱虚掩着，锁扣坏了。车厢里积了一层灰，但后备箱的橡胶密封条挡住了大部分灰尘。里面有一个黑色的工具包和一个上了锁的小铁盒。',
    type: 'dice',
    sceneTags: ['交通', '地下'],
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '铁盒里是车主的行车文件和一串没用的钥匙。工具包里只有千斤顶和扳手。', nothing: true },
      { min: 4, max: 5, text: '铁盒里没有武器，但工具包夹层里有一盒自卫用的弹药。车主显然考虑过安全问题。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '铁盒里是一把上了油的M9手枪和一个备用弹匣。后备箱藏枪——标准的守法公民行为，但在末日里这意味着你多了一条命。', lootItem: 'pistol' },
    ],
  },

  // ==========================================
  // 通用（无 sceneTags）— 低概率
  // ==========================================

  {
    id: 'pawn_shop_display',
    baseText: '路边一家典当行的橱窗被砸碎了，展示柜里的东西横七竖八倒了一地。大部分值钱的东西——首饰、手表、电子产品——早就被拿光了。但柜台后面的墙上还挂着几样没人要的东西。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '墙上挂着的是几把生锈的菜刀和一把断柄的锤子。典当行收的东西本来就良莠不齐。', nothing: true },
      { min: 4, max: 5, text: '墙上挂着一把旧气枪和几盒铅弹。气枪打丧尸没用，但你拆开枪托时发现里面塞了一小包弹药——前主人大概是在黑市上混的。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '柜台底下的保险柜被撬了一半就放弃了。你补了几锤子——里面是一把典当的M9手枪，当票还贴在上面："贷款金额：$300。赎回期限：已过期。"', lootItem: 'pistol' },
    ],
  },

  {
    id: 'fallen_soldier',
    baseText: '一具穿着迷彩服的尸体靠在墙根下，头盔滚在脚边。尸体的手还保持着握枪的姿势，但枪已经不在了——大概是被其他幸存者捡走了。战术背心上还有几个没被翻过的口袋。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '你翻遍了所有口袋——空的。连身份牌都被人摘走了。先来的人清理得很干净。', nothing: true },
      { min: 4, max: 5, text: '在一个你差点漏掉的腿袋里，你找到了两盒弹药。大概是备用弹药，塞在不容易够到的位置。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '尸体背后压着一个帆布枪袋，因为被身体挡住所以没有被拿走。里面是一把保养过的双管猎枪，枪托上贴了一张写有维护记录的胶带。', lootItem: 'shotgun' },
    ],
  },

  {
    id: 'overturned_jeep',
    baseText: '一辆军用吉普车翻倒在路边的沟里，车顶朝下。驾驶室已经被洗劫过了，但车底的杂物箱因为被压在下面很难够到，可能还有东西。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 2, text: '你趴在泥地里掏了半天，从杂物箱里只摸出了一把生锈的扳手和一个空弹匣。不值得弄一身泥。', nothing: true },
      { min: 3, max: 5, text: '杂物箱里有一个防水弹药盒，里面整齐码着几十发弹药。车子翻了以后没人愿意趴在地上够这个位置。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '杂物箱深处有一个枪套，里面是一把标准配发的M9手枪。枪上配了战术手电和备用弹匣——这是一线作战人员的配置。', lootItem: 'pistol' },
    ],
  },

  {
    id: 'storm_drain_stash',
    baseText: '一个排水管口被一块写着"危险"的铁皮半遮着。你探头往里看时，发现管壁上挂了一个用铁链固定的防水袋。铁链上挂了一把小锁——但锁扣已经锈断了。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '防水袋里是一套干净的换洗衣服和几包过期的零食。大概是无家可归者的个人储物——不是你要找的东西。', nothing: true },
      { min: 4, max: 5, text: '防水袋里有衣服、零食，还有一盒用塑料袋裹了好几层的弹药。保存状态不错。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '防水袋里有一把拆开的十字弩，弓片和弩身分开放着，都涂了防锈油。还有一张纸条写着组装步骤——显然是为长期储存做的准备。', lootItem: 'crossbow' },
    ],
  },

  {
    id: 'fire_station_garage',
    baseText: '消防站的车库里，消防车已经不见了。工具墙上还挂着几把斧头和撬棍，但角落里的一个红色储物柜引起了你的注意——柜门上用粉笔写了一个潦草的"武器"二字。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '储物柜里只有两把消防斧和一卷消防水带。你在期待什么？消防员又不是警察。', nothing: true },
      { min: 4, max: 5, text: '储物柜的夹层里有一个上了锁的小型保险箱，撬开后里面是一盒弹药和一张射击俱乐部的会员卡。看来有消防员业余爱好是打猎。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '保险箱里不仅有霰弹，还有一把折叠枪托的短管猎枪——这种配置在城市环境里比长枪管实用得多。这是某个消防员自己改装的私人武器。', lootItem: 'shotgun' },
    ],
  },

  {
    id: 'construction_trailer',
    baseText: '工地上的临时办公室拖车里，桌子抽屉被翻得乱七八糟。但墙角那个落了灰的铁柜似乎被人忽略了——柜门关着，外面堆了几袋水泥挡住了视线。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '铁柜里是工程图纸和几盒过期的方便面。大概是工地看门人的应急储备，没有任何武器。', nothing: true },
      { min: 4, max: 5, text: '铁柜最下层有几盒弹药和一卷备用气管。虽然没有枪，但如果你手头有对应的武器的话弹药就够了。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '在图纸和文件的最底层，你摸到了一个硬塑工具箱——里面是一把改装钉枪，手柄上缠了防滑胶带。工地的安全主管大概没想到这东西在末日里比手枪还实用。', lootItem: 'nail_gun' },
    ],
  },

  {
    id: 'abandoned_checkpoint',
    baseText: '一个用沙袋和铁丝网搭成的临时检查站已经被废弃了。桌子上还摊着没吃完的干粮和一本翻开的日志。椅子旁边倒着一个打开的弹药箱，里面的东西被翻得乱七八糟。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '弹药箱里只剩几发散落的子弹——不同的口径混在一起，大概是最后走的人倒进去的。你用不了这些杂弹。', nothing: true },
      { min: 4, max: 5, text: '你在沙袋缝隙里找到了一个掉落的弹匣，里面压满了弹药。大概是换弹时手滑掉进去的，匆忙中没人顾上捡。', events: ['smart_ammo'] },
      { min: 6, max: 6, text: '桌子底下有一个被人踢到角落里的枪袋——拉链开着，但里面的手枪还在。大概是撤离时过于混乱，枪从桌上滑到地上后没人注意到。', lootItem: 'pistol' },
    ],
  },

  {
    id: 'derelict_boat',
    baseText: '河岸边搁浅着一艘小渔船，船舱里积了半尺深的雨水。船舱角落的储物格里有一个用防水布裹着的长条形包裹，用尼龙绳扎了好几道。',
    type: 'dice',
    delay: 4,
    diceRanges: [
      { min: 1, max: 3, text: '防水布里面是一根船桨和一卷渔网。渔民的工具——在水上是必需品，在陆地上没什么用。', nothing: true },
      { min: 4, max: 5, text: '防水布裹着的是一把鱼叉枪和三支备用鱼叉。用来在水下捕鱼的装备，但在末日里改装一下也能当武器。', lootItem: 'harpoon_gun' },
      { min: 6, max: 6, text: '鱼叉枪旁边还有一个密封的塑料筒，里面是一把上了油的十字弩和一盒弩箭。这艘船的船长显然准备了不止一种求生装备。', lootItem: 'crossbow' },
    ],
  },
]
