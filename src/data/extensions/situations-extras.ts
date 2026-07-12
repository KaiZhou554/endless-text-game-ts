/**
 * 情景扩展 — 额外遭遇
 * 新增情景在此文件追加即可
 */
import type { Situations } from '../../types'

export const situations_extras: Situations = {
  // ==================== 战斗/危险 ====================

  collapsed_tunnel: {
    id: 'collapsed_tunnel',
    name: '隧道坍塌',
    baseText: '你走进一条公路隧道，身后突然传来巨响——隧道顶部的混凝土块崩落下来，堵住了退路。粉尘弥漫中，前方有{count}只丧尸被声响惊醒，摇摇晃晃地站起。',
    options: [
      {
        id: 'fight_through',
        text: '杀出一条路往前冲',
        risk: '[战斗] [高风险]',
        tags: ['战斗'],
        combat: true,
      },
      {
        id: 'climb_debris',
        text: '爬上坍塌的石堆寻找缝隙钻出去',
        risk: '[攀爬] [可能再次坍塌]',
        tags: ['攀爬', '高风险'],
        successRate: 0.5,
      },
      {
        id: 'hide_wait',
        text: '躲进隧道应急通道等待丧尸散去',
        risk: '[安全] [消耗大量时间] [可能没有出口]',
        tags: ['等待', '隐蔽'],
        successRate: 0.6,
      },
    ],
    danger: 5,
  },

  rabid_dog: {
    id: 'rabid_dog',
    name: '狂犬',
    baseText: '一只满身血污的大型犬从瓦砾堆后跃出，嘴角挂着黏稠的唾液，喉咙发出低沉的呜咽。它的眼睛浑浊发红，显然已经感染了丧尸病毒。',
    options: [
      {
        id: 'fight_dog',
        text: '直接迎战',
        risk: '[战斗] [可能被咬伤感染]',
        tags: ['战斗', '高风险'],
        combat: true,
      },
      {
        id: 'throw_meat',
        text: '扔一块肉引开它',
        risk: '[需要:食物类物品] [必定成功]',
        tags: ['转移注意'],
        requireTags: ['食物'],
        successRate: 0.9,
      },
      {
        id: 'climb_escape',
        text: '爬上最近的消防梯或车辆',
        risk: '[敏捷判定] [可能被抓伤]',
        tags: ['攀爬', '敏捷'],
        successRate: 0.6,
      },
    ],
    danger: 3,
  },

  explosive_barrel: {
    id: 'explosive_barrel',
    name: '泄漏的化学品',
    baseText: '一个翻倒的工业储罐正在泄漏刺鼻的透明液体，地面上已经积了一大滩。几只丧尸正穿过那片液体朝你走来，它们的脚踩在水洼中发出嘶嘶声。',
    options: [
      {
        id: 'ignite_spill',
        text: '用火源点燃地上的化学液体',
        risk: '[需要:火源] [大范围消灭丧尸] [可能引燃周围]',
        tags: ['火焰', '环境'],
        requireItems: ['lighter'],
        successRate: 0.8,
      },
      {
        id: 'fight_careful',
        text: '绕过液体区域逐个击破',
        risk: '[安全] [消耗时间]',
        tags: ['战斗'],
        combat: true,
      },
      {
        id: 'retreat_spill',
        text: '化学品太危险，退回另找路线',
        risk: '[安全] [消耗时间]',
        tags: ['撤退'],
        successRate: 1.0,
      },
    ],
    danger: 4,
  },

  frozen_room: {
    id: 'frozen_room',
    name: '冷库',
    baseText: '你推开一扇厚重的保温门，一股刺骨的冷气扑面而来。这是一间还在运转的冷库，挂满了冰冻的肉胴。角落里有什么东西动了一下——一只被冻得动作迟缓的丧尸。',
    options: [
      {
        id: 'use_cold',
        text: '利用低温环境——丧尸动作迟缓，正是解决它的好机会',
        risk: '[环境优势] [轻松解决]',
        tags: ['战斗', '环境'],
        combat: true,
      },
      {
        id: 'loot_meat',
        text: '趁丧尸还没反应过来，快速取走一些冻肉',
        risk: '[搜索物资] [食物] [可能被丧尸追上]',
        tags: ['搜索', '快速'],
        successRate: 0.7,
      },
    ],
    danger: 2,
  },

  beehive_threat: {
    id: 'beehive_threat',
    name: '变异蜂群',
    baseText: '一个巨型蜂巢悬在树枝上，蜂巢表面有不正常的黑色纹理。篮球大小的工蜂在周围嗡嗡盘旋，它们的尾针在阳光下泛着暗绿色的光。',
    options: [
      {
        id: 'sneak_past',
        text: '伏低身体悄悄绕过去',
        risk: '[隐蔽] [可能惊动蜂群]',
        tags: ['隐蔽', '潜行'],
        successRate: 0.5,
      },
      {
        id: 'smoke_bees',
        text: '用烟雾驱散蜂群',
        risk: '[需要:烟雾或火焰工具] [有效驱散]',
        tags: ['工具'],
        requireItems: ['lighter'],
        successRate: 0.7,
      },
      {
        id: 'run_bees',
        text: '憋气冲过去',
        risk: '[必定被蜇] [可能中毒]',
        tags: ['前进', '高风险'],
        successRate: 0.3,
      },
    ],
    danger: 3,
  },

  gunfire_nearby: {
    id: 'gunfire_nearby',
    name: '附近的枪声',
    baseText: '砰砰砰——连续几声枪响打破了寂静，距离很近，可能就在下一个街区。紧接着是几声惨叫，然后一切归于沉寂。',
    options: [
      {
        id: 'investigate_gunfire',
        text: '循着枪声方向摸过去看看',
        risk: '[可能找到武器弹药] [可能遭遇敌对幸存者]',
        tags: ['探索', '高风险'],
        successRate: 0.4,
      },
      {
        id: 'wait_then_search',
        text: '原地等十分钟，确认安全后再过去搜索',
        risk: '[安全] [可能被其他人抢先]',
        tags: ['等待', '搜索'],
        successRate: 0.6,
      },
      {
        id: 'avoid_gunfire',
        text: '往反方向走——枪战不是你能掺和的',
        risk: '[安全]',
        tags: ['撤退'],
        successRate: 1.0,
      },
    ],
    danger: 3,
  },

  // ==================== 搜索/物资 ====================

  overturned_truck: {
    id: 'overturned_truck',
    name: '侧翻的货车',
    baseText: '一辆厢式货车侧翻在路肩上，后厢门被撞开，里面的货物散了一地。有几只丧尸正围着散落的货物转，似乎被什么东西吸引了。',
    options: [
      {
        id: 'distract_then_loot',
        text: '往远处扔东西引开丧尸，然后搜货',
        risk: '[需要:可投掷物] [安全搜索]',
        tags: ['搜索', '转移注意'],
        requireTags: ['可投掷'],
        successRate: 0.8,
      },
      {
        id: 'fight_for_loot',
        text: '解决丧尸再慢慢翻找',
        risk: '[战斗] [完整搜索]',
        tags: ['战斗', '搜索'],
        combat: true,
      },
    ],
    danger: 3,
  },

  mailroom: {
    id: 'mailroom',
    name: '邮件收发室',
    baseText: '一栋写字楼的邮件收发室里堆满了未拆封的包裹和信件。邮戳日期停留在疫情爆发那一周。大部分包裹是网购物，但也有几个贴着"公务 — 机密"的牛皮纸文件袋。',
    options: [
      {
        id: 'open_packages',
        text: '拆开包裹看看有没有有用的东西',
        risk: '[可能找到稀有物品] [耗时]',
        tags: ['搜索'],
        successRate: 0.7,
      },
      {
        id: 'take_classified',
        text: '只拿那几个机密文件袋就走',
        risk: '[快速] [可能找到关键信息]',
        tags: ['搜索', '信息'],
        successRate: 0.6,
      },
      {
        id: 'skip_mail',
        text: '一堆包裹而已，不值得浪费时间',
        risk: '[安全]',
        tags: ['回避'],
        successRate: 1.0,
      },
    ],
    danger: 1,
  },

  rooftop_reservoir: {
    id: 'rooftop_reservoir',
    name: '楼顶水箱',
    baseText: '天台上立着两个巨大的不锈钢水箱，通往水箱的梯子锈迹斑斑。其中一个水箱的盖子掀开着，水面反射着天光。旁边横着一根水管。',
    options: [
      {
        id: 'collect_water',
        text: '用容器取一些水',
        risk: '[获得饮用水] [需要容器] [可能需要过滤]',
        tags: ['采集'],
        requireItems: ['water_bottle'],
        successRate: 0.9,
      },
      {
        id: 'check_inside',
        text: '探头看看水箱里还有什么',
        risk: '[可能发现隐藏物品] [可能水箱里有东西]',
        tags: ['搜索'],
        successRate: 0.5,
      },
    ],
    danger: 1,
  },

  storage_locker: {
    id: 'storage_locker',
    name: '自助储物柜区',
    baseText: '一排自助储物柜沿墙排开，大部分柜门已经被撬开，里面空无一物。但有三个柜子的锁还完好——两个小号、一个大号。',
    options: [
      {
        id: 'pick_small',
        text: '用工具撬开小号储物柜',
        risk: '[需要:撬棍或开锁器] [可能找到个人物品]',
        tags: ['搜索', '开锁'],
        requireItems: ['crowbar_weapon', 'lockpick', 'crowbar'],
        successRate: 0.8,
      },
      {
        id: 'break_large',
        text: '用重型工具砸开大号储物柜',
        risk: '[需要:大锤或消防斧] [噪音大] [可能更好物资]',
        tags: ['搜索', '破门', '噪音'],
        requireItems: ['sledgehammer', 'axe'],
        successRate: 0.7,
      },
      {
        id: 'skip_locker',
        text: '锁着的柜子不是你的，继续赶路',
        risk: '[安全]',
        tags: ['回避'],
        successRate: 1.0,
      },
    ],
    danger: 1,
  },

  fishing_hut: {
    id: 'fishing_hut',
    name: '河边棚屋',
    baseText: '河岸边有一间用波纹铁皮搭的棚屋，门口挂着渔网和几个塑料桶。一张手写的告示贴在门上："出门了，东西看着用，留点给后面的人。——老周"',
    options: [
      {
        id: 'take_some_loot',
        text: '拿一些有用的东西，留下点你不需要的',
        risk: '[获得物资] [交换] [理智+5:善意循环]',
        tags: ['搜索', '尊重'],
        successRate: 1.0,
      },
      {
        id: 'fish_here',
        text: '在屋外的河边试试钓鱼',
        risk: '[需要:钓鱼竿] [可能获得食物] [安全]',
        tags: ['采集:食物'],
        requireItems: ['fishing_rod'],
        successRate: 0.7,
      },
    ],
    danger: 1,
  },

  garbage_dump: {
    id: 'garbage_dump',
    name: '垃圾堆积区',
    baseText: '城市边缘的垃圾堆放场，各种废弃的家具、电器和生活垃圾堆成了小山。有几只野狗在远处翻找食物。气味很差，但在末日里人们扔掉的东西里可能藏着有用的。',
    options: [
      {
        id: 'search_dump',
        text: '翻找可用物资',
        risk: '[可能找到稀有物品] [恶臭] [可能受伤]',
        tags: ['搜索', '高风险'],
        successRate: 0.4,
      },
      {
        id: 'salvage_electronics',
        text: '专注拆电子垃圾——零件和电线总是有用的',
        risk: '[安全] [获得制作材料]',
        tags: ['搜索', '技术'],
        successRate: 0.8,
      },
      {
        id: 'leave_dump',
        text: '太臭了，换个地方',
        risk: '[安全] [错失物资]',
        tags: ['撤退'],
        successRate: 1.0,
      },
    ],
    danger: 1,
  },

  // ==================== 社交/剧情 ====================

  guard_post: {
    id: 'guard_post',
    name: '哨卡',
    baseText: '一道路障横在街口，由沙袋和铁丝网组成。一个穿防暴装备的人从哨塔探出头，用扩音器喊道："停下！报上身份和来意！"语气听起来紧张但不带敌意。',
    options: [
      {
        id: 'honest_answer',
        text: '如实说明自己是幸存者，请求通过',
        risk: '[可能被接纳] [可能被拒绝]',
        tags: ['社交'],
        successRate: 0.6,
      },
      {
        id: 'show_id',
        text: '亮出军人身份牌证明身份',
        risk: '[需要:军人身份牌] [高概率放行]',
        tags: ['社交'],
        requireItems: ['military_id'],
        successRate: 0.9,
      },
      {
        id: 'detour_checkpoint',
        text: '不冒险，绕路过去',
        risk: '[安全] [消耗时间]',
        tags: ['绕路'],
        successRate: 1.0,
      },
    ],
    danger: 2,
  },

  wounded_stranger: {
    id: 'wounded_stranger',
    name: '受伤的陌生人',
    baseText: '一个背着登山包的人靠在墙上，右小腿缠着渗血的绷带。他看到你，艰难地举起一只手示意自己没有武器。"我需要帮助——我的医疗用品在昨天用完了。"他的脸色苍白，但眼神还算清醒。',
    options: [
      {
        id: 'give_supplies',
        text: '给他一些医疗用品',
        risk: '[消耗医疗物品] [可能获得回报/信息]',
        tags: ['社交', '医疗'],
        requireTags: ['医疗'],
        successRate: 0.9,
      },
      {
        id: 'trade_info',
        text: '用信息交换——先告诉我前面有什么',
        risk: '[不消耗物品] [获得情报] [理智-5:袖手旁观]',
        tags: ['社交', '交易'],
        sanityEffect: -5,
        successRate: 0.7,
      },
      {
        id: 'walk_away',
        text: '你帮不了所有人，继续赶路',
        risk: '[理智-8] [安全]',
        tags: ['冷漠'],
        sanityEffect: -8,
        successRate: 1.0,
      },
    ],
    danger: 1,
  },

  barter_stall: {
    id: 'barter_stall',
    name: '路边交易摊',
    baseText: '一张折叠桌上摆满了各种物品——罐头、电池、子弹、绷带，分门别类摆得整整齐齐。桌后坐着一个戴鸭舌帽的人，看到你便举起手挥了挥："以物易物，公平交易。想要什么，拿东西换。"',
    options: [
      {
        id: 'trade_items',
        text: '看看有什么能换的',
        risk: '[消耗物品] [可能获得稀有物资]',
        tags: ['交易', '搜索'],
        successRate: 0.9,
      },
      {
        id: 'ask_info',
        text: '不换东西，打听这附近的情况',
        risk: '[安全] [获得情报]',
        tags: ['社交', '信息'],
        successRate: 0.8,
      },
    ],
    danger: 0,
  },

  night_visitor: {
    id: 'night_visitor',
    name: '夜间接头',
    baseText: '你在一栋废弃居民楼里落脚过夜时，窗外突然传来石子敲玻璃的声音。你往下看——一个人影站在路灯下，朝你打着手势："下来，我有重要的事跟你说。"',
    options: [
      {
        id: 'go_down',
        text: '下楼去见这个人',
        risk: '[可能是陷阱] [可能是重要情报]',
        tags: ['社交', '高风险'],
        successRate: 0.4,
      },
      {
        id: 'talk_window',
        text: '隔着窗子交谈，保持安全距离',
        risk: '[安全] [只能获得有限信息]',
        tags: ['社交', '谨慎'],
        successRate: 0.7,
      },
      {
        id: 'ignore_visitor',
        text: '不理会——半夜敲窗不是好兆头',
        risk: '[安全] [理智-3:错过了什么]',
        tags: ['回避'],
        sanityEffect: -3,
        successRate: 1.0,
      },
    ],
    danger: 3,
  },

  // ==================== 探索/环境 ====================

  overgrown_street: {
    id: 'overgrown_street',
    name: '藤蔓街区',
    baseText: '整条街道被一种暗绿色的藤蔓覆盖，藤蔓从下水道井盖里钻出来，爬满了建筑墙面，甚至包裹了整辆汽车。藤蔓上开着白色的喇叭状小花，在微风中轻轻摇曳。',
    options: [
      {
        id: 'cut_through',
        text: '用刀具开路穿过',
        risk: '[需要:刀具] [可能刺激藤蔓释放孢子]',
        tags: ['前进'],
        requireItems: ['machete', 'knife', 'shovel'],
        successRate: 0.7,
      },
      {
        id: 'sample_vine',
        text: '采集一些藤蔓样本',
        risk: '[可能获得研究材料] [可能中毒]',
        tags: ['采集', '未知'],
        successRate: 0.6,
      },
      {
        id: 'detour_vine',
        text: '绕开这条街区',
        risk: '[安全] [消耗时间]',
        tags: ['绕路'],
        successRate: 1.0,
      },
    ],
    danger: 2,
  },

  elevator_shaft: {
    id: 'elevator_shaft',
    name: '电梯井',
    baseText: '楼梯间被瓦砾堵死了，唯一可行的通道是敞开的电梯井。门框上卡着半截断裂的电梯轿厢，钢缆从上方垂下来，在黑暗中微微晃动。往上看有微光——说明上面有出口。',
    options: [
      {
        id: 'climb_cable',
        text: '抓住钢缆往上爬',
        risk: '[攀爬] [可能坠落] [可能手滑]',
        tags: ['攀爬', '高风险'],
        successRate: 0.5,
      },
      {
        id: 'rope_climb',
        text: '用绳索固定后安全攀爬',
        risk: '[需要:攀岩绳] [安全]',
        tags: ['攀爬'],
        requireItems: ['rope'],
        successRate: 0.9,
      },
    ],
    danger: 4,
  },

  flooded_street: {
    id: 'flooded_street',
    name: '淹没的街道',
    baseText: '前面一整条街被洪水淹没了，水面上飘着垃圾和一只打转的塑料桶。隐约能看到一些车顶露出水面。水很浑浊，不知道有多深，也不知道水下有什么。',
    options: [
      {
        id: 'wade_through',
        text: '蹚水走过去，用一根棍子探路',
        risk: '[可能遭遇水中丧尸] [可能摔倒]',
        tags: ['前进', '高风险'],
        successRate: 0.4,
      },
      {
        id: 'boat_improvise',
        text: '找块大木板或充气物当简易浮具',
        risk: '[安全] [耗时] [需要工具制作]',
        tags: ['制作'],
        successRate: 0.6,
      },
      {
        id: 'find_bridge',
        text: '找别的路——天桥或者楼顶之间的通道',
        risk: '[安全] [消耗大量时间]',
        tags: ['绕路'],
        successRate: 0.8,
      },
    ],
    danger: 3,
  },

  clock_tower: {
    id: 'clock_tower',
    name: '钟楼',
    baseText: '一座老式的市政钟楼矗立在广场中央，钟面的指针停在下午三点四十分。通往顶层的铁门虚掩着，门把上挂了一个牌子："维修中"。',
    options: [
      {
        id: 'climb_tower',
        text: '爬上钟楼顶层——视野一定非常好',
        risk: '[获得周边全图情报] [可能遭遇危险] [消耗体力]',
        tags: ['侦查', '攀爬'],
        successRate: 0.6,
      },
      {
        id: 'ring_bell',
        text: '敲响大钟——也许能引来其他幸存者',
        risk: '[噪音极大] [必然引来丧尸] [可能等来有人]',
        tags: ['信号', '极高风险'],
        successRate: 0.2,
      },
      {
        id: 'search_ground',
        text: '只搜索一楼的房间',
        risk: '[安全] [可能找到物资]',
        tags: ['搜索'],
        successRate: 0.7,
      },
    ],
    danger: 2,
  },

  broken_dam: {
    id: 'broken_dam',
    name: '破损的水坝',
    baseText: '一座小型拦水坝出现了裂口，水流从裂缝中喷射而出，在坝体下方形成了一片泥泞的沼泽。水坝顶部还有一条窄窄的走道，勉强可以通过。',
    options: [
      {
        id: 'cross_dam',
        text: '从坝顶走道上小心通过',
        risk: '[敏捷判定] [水坝可能进一步崩塌]',
        tags: ['前进', '高风险'],
        successRate: 0.4,
      },
      {
        id: 'through_mud',
        text: '从坝下的泥沼趟过去',
        risk: '[安全但慢] [泥沼中可能陷住]',
        tags: ['前进'],
        successRate: 0.6,
      },
      {
        id: 'search_dam',
        text: '检查水坝控制室——也许有应急设备',
        risk: '[可能找到工具] [安全]',
        tags: ['搜索'],
        successRate: 0.8,
      },
    ],
    danger: 3,
  },

  wind_turbine: {
    id: 'wind_turbine',
    name: '风力发电机',
    baseText: '一架风力发电机孤独地立在郊外的山坡上，巨大的叶片还在缓缓转动，发出规律的呼呼声。塔底的检修门开了一条缝，门内有灯光——里面的蓄电池还在运行。',
    options: [
      {
        id: 'enter_turbine',
        text: '进入检修间查看',
        risk: '[可能充电/获得电子设备] [可能有丧尸或幸存者]',
        tags: ['探索', '技术'],
        successRate: 0.6,
      },
      {
        id: 'rest_here',
        text: '在发电机底座旁休息——这里地势高视野好',
        risk: '[安全休息] [恢复理智+8]',
        tags: ['休息'],
        successRate: 0.9,
      },
      {
        id: 'salvage_parts',
        text: '拆一些电子元件和电缆',
        risk: '[安全] [获得制作材料] [破坏发电机]',
        tags: ['搜索', '技术'],
        successRate: 0.8,
      },
    ],
    danger: 1,
  },

  sewer_grate: {
    id: 'sewer_grate',
    name: '下水道井盖',
    baseText: '路中间一个下水道井盖被从下方推开，歪在一边。井口边缘有新鲜的抓痕。一股潮湿的臭味从井口冒出，隐约能听到下面传来水流声和奇怪的回响。',
    options: [
      {
        id: 'go_down',
        text: '爬下井梯探索下水道',
        risk: '[可能发现捷径或物资] [黑暗] [可能遭遇变异丧尸]',
        tags: ['探索', '高风险', '黑暗'],
        successRate: 0.4,
      },
      {
        id: 'cover_grate',
        text: '把井盖盖回去——下面的东西还是别出来了',
        risk: '[安全] [可能封锁了重要通道]',
        tags: ['清除威胁'],
        successRate: 0.9,
      },
      {
        id: 'avoid_sewer',
        text: '绕过井口继续走',
        risk: '[安全]',
        tags: ['回避'],
        successRate: 1.0,
      },
    ],
    danger: 3,
  },

  // ==================== 更多战斗 ====================

  supermarket_siege: {
    id: 'supermarket_siege',
    name: '超市围困',
    baseText: '一家超市的门口聚集了{count}只丧尸，它们正围着一辆触发警报的汽车撞击。车窗玻璃已经裂了，警报声刺耳地在街区回荡。超市里面有大量物资，但这些丧尸堵住了入口。',
    options: [
      {
        id: 'silence_alarm',
        text: '绕到车后关掉警报，让丧尸慢慢散去',
        risk: '[敏捷判定] [需要不惊动丧尸]',
        tags: ['隐蔽', '技术'],
        successRate: 0.5,
      },
      {
        id: 'lure_away',
        text: '往反方向制造更大噪音引开它们',
        risk: '[需要:投掷物或噪音工具] [有效]',
        tags: ['转移注意', '投掷'],
        requireTags: ['可投掷'],
        successRate: 0.7,
      },
      {
        id: 'fight_them',
        text: '直接清理掉这群丧尸',
        risk: '[战斗] [数量多]',
        tags: ['战斗', '高风险'],
        combat: true,
      },
    ],
    danger: 4,
  },
}
