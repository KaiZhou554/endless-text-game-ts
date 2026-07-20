/**
 * 修饰条件数据库 — 纯数据，无逻辑
 * 时间、天气、玩家状态、遗留标签等动态修饰
 */

export const modifiers: { time: Record<string, import('../types').Modifier>; weather: Record<string, any>; playerStatus: Record<string, import('../types').Modifier>; legacyTags: Record<string, any> } = {
  time: {
    day: {
      id: 'day',
      name: '白天',
      desc: '阳光提供了良好的视野，丧尸活动较少。',
      visibility: 1.0,
      dangerMod: -1,
      textPrefix: '白天的光线透过破碎的窗户照进来。',
    },
    night: {
      id: 'night',
      name: '黑夜',
      desc: '黑暗中视野极差，丧尸变得更加活跃。',
      visibility: 0.3,
      dangerMod: 2,
      textPrefix: '夜色笼罩了一切，只有微弱的月光勉强照亮前方。',
      needsLight: true,
      sanityDrain: 1,
    },
    dusk: {
      id: 'dusk',
      name: '黄昏',
      desc: '太阳正在落山，光线逐渐暗淡。',
      visibility: 0.6,
      dangerMod: 1,
      textPrefix: '夕阳把天空染成血红色，影子被拉得很长。',
    },
  },
  weather: {
    clear: {
      id: 'clear',
      name: '晴天',
      desc: '天气晴朗，视野良好。',
      visibility: 1.0,
      dangerMod: 0,
      textPrefix: '天空一片晴朗。',
    },
    rain: {
      id: 'rain',
      name: '雨天',
      desc: '雨水遮蔽了声音和气味，但行动变慢。',
      visibility: 0.7,
      dangerMod: -1,
      textPrefix: '雨水拍打在屋顶上，潮湿的空气让一切变得沉闷。',
      soundMasking: true,
    },
    fog: {
      id: 'fog',
      name: '浓雾',
      desc: '厚重的雾限制了视野，但也提供了掩护。',
      visibility: 0.4,
      dangerMod: 0,
      textPrefix: '浓雾像裹尸布一样包裹着街道，十米外什么都看不清。',
      soundMasking: true,
    },
    storm: {
      id: 'storm',
      name: '暴风雨',
      desc: '狂风暴雨，雷声掩盖了一切声音但极端危险。',
      visibility: 0.5,
      dangerMod: 1,
      textPrefix: '暴风雨肆虐，闪电偶尔照亮天空，雷声震耳欲聋。',
      soundMasking: true,
      sanityDrain: 1,
    },
  },
  playerStatus: {
    injured: {
      id: 'injured',
      name: '受伤',
      desc: '你身上有伤，行动不便。',
      textSuffix: '伤口隐隐作痛，每一步都需要额外的意志力。',
      combatPenalty: true,
    },
    hungry: {
      id: 'hungry',
      name: '饥饿',
      desc: '胃里空空如也，注意力难以集中。',
      textSuffix: '胃部传来的空虚感让你难以集中注意力。',
      sanityDrain: 1,
    },
    thirsty: {
      id: 'thirsty',
      name: '口渴',
      desc: '嘴唇干裂，喉咙像砂纸一样。',
      textSuffix: '你舔了舔干裂的嘴唇，对水的渴望开始占据你的脑海。',
      sanityDrain: 1,
    },
    infected: {
      id: 'infected',
      name: '感染中',
      desc: '伤口在变黑，身体在发烧。',
      textSuffix: '身体发冷，感染更严重了。',
      sanityDrain: 2,
    },
    insane: {
      id: 'insane',
      name: '精神恍惚',
      desc: '现实与幻觉的界限开始模糊。',
      textSuffix: '墙上的影子似乎在移动，你听到有人在低语——但那声音来自你的脑子里。',
      hallucination: true,
    },
  },
  legacyTags: {
    made_noise: {
      id: 'made_noise',
      name: '发出了巨响',
      desc: '刚才的动作发出了很大的声音。',
      textPrefix: '刚才的响声还在空气中回荡。',
      dangerMod: 2,
    },
    was_stealthy: {
      id: 'was_stealthy',
      name: '保持了隐蔽',
      desc: '你的行动没有引起注意。',
      dangerMod: -1,
    },
    helped_someone: {
      id: 'helped_someone',
      name: '帮助了他人',
      desc: '你帮助了别人，有人可能在谈论你。',
      npcReactionBonus: true,
    },
    abandoned_someone: {
      id: 'abandoned_someone',
      name: '见死不救',
      desc: '你选择了袖手旁观。',
      sanityDrain: 1,
    },
  },
}
