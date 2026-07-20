/**
 * 情景扩展 — 装备/工具相关遭遇
 *
 * 为 flashlight + batteries 和 electronic_component 提供使用场景。
 * 同时也包含不需要特殊物品的通用选项，确保这些情境对所有玩家都有意义。
 */
import type { Situations } from "../../types";

export const situations_equipment: Situations = {
  // ==================== 光源/探索 ====================

  abandoned_shelter: {
    id: "abandoned_shelter",
    name: "废弃临时住处",
    baseText:
      "一间用防水布和旧家具搭成的临时窝棚，地面铺着几床发霉的被子。墙角有一只锈迹斑斑的铁桶，桶底还粘着半截烧剩的蜡烛。空气里有布料受潮后的气味，不算好闻，至少表明这里不久前还有人住过。",
    options: [
      {
        id: "flashlight_check",
        text: "用手电筒仔细检查每个角落",
        risk: "[需要:手电筒+电池] [大概率发现物资]",
        tags: ["搜索", "照明"],
        requireItems: ["flashlight"],
        requireTags: ["电池"],
        successRate: 0.85,
        onSuccess: {
          text: "手电筒的白光扫过窝棚的每一个角落。你在被褥下面发现了一个藏在塑料袋里的小急救包，铁桶背后还塞着几包压缩饼干。塑料布和墙壁之间的缝隙里卡着一把折叠小刀。临走时你关掉手电筒，电池的电量明显消耗了一截。",
          loseItem: "batteries",
          events: ["random_medical", "random_food"],
          effects: { sanity: 2 },
        },
        onFailure: {
          text: "手电筒的光柱在窝棚里转了一圈，只照出了满地的旧报纸和空塑料瓶。你弯腰翻看了被褥下面和铁桶内部，除了灰尘和蜡烛残渣什么也没找到。电池倒是实打实地消耗了。",
          loseItem: "batteries",
        },
      },
      {
        id: "blind_search",
        text: "摸黑翻找，也许有什么能用的东西",
        risk: "[低概率发现物资] [可能被杂物绊倒]",
        tags: ["搜索"],
        successRate: 0.3,
        onSuccess: {
          text: "你在黑暗中用手摸索着地面和墙角。手指碰到了被褥边缘的塑料包装袋，顺着撕开口摸进去，里面是几块独立包装的压缩饼干。你还摸到了一只半满的塑料水瓶，瓶盖拧得很紧。眼睛看不到东西的时候，触觉反而变得格外敏锐。",
          events: ["random_food", "random_drink"],
        },
        onFailure: {
          text: "你弯着腰往前摸索，膝盖撞上了一只看不见的铁桶。铁桶翻倒时发出一声空洞的巨响，里面残留的半截蜡烛滚到了你脚边。你捂着撞疼的膝盖蹲了好一会儿，等到耳朵里的嗡嗡声消退才站起来。这地方不适合摸黑探索。",
          effects: { hp: -3 },
        },
      },
      {
        id: "leave_shelter",
        text: "这个地方看起来已经被搜刮过了，离开",
        risk: "[安全]",
        tags: ["回避"],
        isMoveOn: true,
        successRate: 1.0,
        onSuccess: {
          text: "窝棚的结构不太稳固，防水布在风里啪啪作响。烧剩的蜡烛说明前一个住客离开时天色已暗，他没带走的东西大概也没什么价值。你退出窝棚，把入口的塑料布重新拉好，留给下一个需要避风的人。",
        },
        onFailure: {
          text: "你转身要走，塑料布的边角被你的背包勾住，整块布嘶啦一声撕开了一道半米长的口子。你花了些时间把撕开的塑料布重新固定好，不然这个窝棚下一次起风就会被掀掉顶。",
        },
      },
    ],
    danger: 2,
    sceneTags: ["室内"],
  },

  dark_corridor: {
    id: "dark_corridor",
    name: "黑暗走廊",
    baseText:
      "走廊深处一片漆黑，两侧的门紧闭着。黑暗中传来窸窣的声响，分不清是老鼠还是别的什么。脚下的地板偶尔发出吱呀的呻吟，让你每一步都走得格外小心。",
    options: [
      {
        id: "flashlight_forward",
        text: "打开手电筒照明前进",
        risk: "[需要:手电筒+电池] [安全通过]",
        tags: ["照明", "前进"],
        requireItems: ["flashlight"],
        requireTags: ["电池"],
        successRate: 0.8,
        onSuccess: {
          text: "手电筒的光束切开黑暗，走廊的轮廓显现出来。两侧是紧闭的门，门牌上的字迹已经褪色。地面上散落着纸张和翻倒的垃圾桶，光束照到走廊尽头一扇半开的防火门。你快步通过时，光柱扫过墙角一只蹲伏的老鼠，嗖地钻进了踢脚线的破洞里。",
          loseItem: "batteries",
          events: ["random_food"],
        },
        onFailure: {
          text: "手电筒在走廊中央闪了两下，电池接触不良。你站在原地拍了两下筒身，光柱恢复了但亮度明显下降。就在灯光闪烁的那几秒黑暗里，走廊深处有什么东西移动了一下。你加快脚步通过了剩余的路段，没有回头去看。",
          loseItem: "batteries",
          effects: { sanity: -3 },
        },
      },
      {
        id: "blind_walk",
        text: "贴着墙壁摸黑走过去",
        risk: "[高风险] [黑暗中可能遭遇丧尸]",
        tags: ["前进", "高风险", "黑暗"],
        successRate: 0.5,
        onSuccess: {
          text: "你左手贴着墙壁，每一步都先伸出一只脚试探地面。走廊比想象中长，中途你的手指碰到了一扇冰凉的金属门把手，让你停了两秒。那些窸窣声始终在你前方几步远的地方，等你走到那个位置时声音又出现在更前面。走出走廊时你的瞳孔已经放到最大，外面的微光刺得你眯起了眼。",
          effects: { sanity: -2 },
        },
        onFailure: {
          text: "你走了大约二十步，脚下踩到了什么软而韧的东西。你的大脑用了不到一秒完成触感辨识：一只手臂。黑暗中响起了喉咙深处的呜咽。你拼命往后跳，后背撞在墙壁上，后脑勺磕了一下墙上的消防栓箱。丧尸在黑暗中不需要视力，它靠的是声音和气味。",
          combat: true,
        },
      },
    ],
    danger: 3,
    sceneTags: ["室内"],
  },

  // ==================== 电子元件/修理 ====================

  broken_purifier: {
    id: "broken_purifier",
    name: "废弃饮水站",
    baseText:
      "一台布满灰尘的社区饮水净化器立在路边，控制面板的指示灯全部熄灭。机器侧面贴着一张褪色的维护说明，上面画着电路板更换的示意图。出水管口下方放着一只水桶，里面接了大半桶浑浊的泥水。",
    options: [
      {
        id: "repair_purifier",
        text: "尝试维修机器",
        risk: "[需要:电子元件] [净化脏水]",
        tags: ["修理", "技术"],
        requireItems: ["electronic_component"],
        successRate: 0.9,
        onSuccess: {
          text: "你拆下烧毁的旧电路板，把电子元件对照图示装了上去。面板上的指示灯亮起。净化器内部传来电机启动的低鸣，你把水桶里的泥水倒进入水口，出水口流出了清澈的水流。电路板安装到位，机器的运转声平稳而规律。",
          loseItem: "electronic_component",
          loot:['clean_water'],
          events: ["purify_water"],
          effects: { sanity: 3 },
        },
        onFailure: {
          text: "你按照图示装上了电子元件，但通电的瞬间元件引脚冒出一缕青烟。旧电路板烧毁时可能损坏了主板上的其他线路。这台净化器的使用寿命到头了。",
          loseItem: "electronic_component",
          effects: { sanity: -2 },
        },
      },
      {
        id: "force_start",
        text: "强行启动，也许还能凑合用一次",
        risk: "[低成功率] [可能触电]",
        tags: ["技术"],
        successRate: 0.2,
        onSuccess: {
          text: "你反复按动启动按钮，用拳头敲了几下机箱侧面。净化器发出一阵刺耳的噪音，像一个被呛到的人咳嗽了几声之后开始运转。出水口断断续续地流出半清不浊的水。过滤效果打了折扣，煮沸之后还能喝。",
          loot:['clean_water'],
        },
        onFailure: {
          text: "你用手掌拍了几下启动按钮，机器内部突然迸出一串蓝白色的电火花。你的手指被电流弹开，整条手臂麻了十几秒才恢复知觉。净化器冒出一股刺鼻的焦糊味，彻底报废了。",
          effects: { hp: -5 },
        },
      },
      {
        id: "leave_purifier",
        text: "这台机器已经报废了，离开",
        risk: "[安全]",
        tags: ["回避"],
        isMoveOn: true,
        successRate: 1.0,
        onSuccess: {
          text: "净化器的状况看起来不太乐观，指示灯全灭说明供电系统已经出了问题。没有替换零件的情况下硬来只会浪费时间和体力。你记下了这个饮水站的位置，也许以后找到合适的零件可以回来修理。",
        },
        onFailure: {
          text: "你刚要离开，脚后跟碰倒了出水口下面的水桶。大半桶泥水泼在了你的鞋子和裤腿上，冰凉的水渗进鞋里让你打了个寒颤。你甩了甩脚上的水，留下翻倒的水桶离开了。",
        },
      },
    ],
    danger: 1,
    sceneTags: ["室外"],
  },


};
