/**
 * NPC: 安娜 — 一个九岁的女孩
 */

export const child_anna = {
  id: 'child_anna',
  name: '安娜',
  title: '一个九岁的女孩',
  desc: '一个瘦小的女孩，抱着一个同样脏兮兮的泰迪熊。她的眼睛很大，充满了不属于这个年纪的恐惧。',
  trust: 60,
  dialogueTree: {
    start: {
      id: 'start',
      npcText: '（小女孩躲在翻倒的沙发后面，只露出半张脸。）"你……你是来救我的吗？我爸爸说会有救援队来……他说让我在这里等。"',
      options: [
        {
          id: 'gentle',
          text: '"你爸爸在哪里？你一个人多久了？"',
          trustChange: 10,
          nextNode: 'story',
        },
        {
          id: 'offer_food',
          text: '"给，先吃点东西。"[消耗:任意食物]',
          requireTags: ['食物'],
          trustChange: 20,
          nextNode: 'food_given',
        },
        {
          id: 'lie',
          text: '"是的，我是救援队的。跟我走吧。"',
          trustChange: 5,
          nextNode: 'rescue_attempt',
          sanityEffect: -5,
        },
      ],
    },
    story: {
      id: 'story',
      npcText: '"爸爸两天前出去找食物……然后就没回来。他说如果他不回来，就让我去河边的植物园，那里有好人。但我太害怕了……外面有那些东西。"',
      options: [
        {
          id: 'escort',
          text: '"我带你去找你爸爸，或者带你去植物园。"',
          trustChange: 15,
          nextNode: 'escort_agree',
        },
        {
          id: 'leave_supplies',
          text: '"我没办法带你走，但我会给你留一些食物和水。"[消耗:任意食物]',
          requireTags: ['食物'],
          trustChange: 5,
          nextNode: null,
          outcome: 'leave_supplies',
          sanityEffect: -10,
        },
      ],
    },
    food_given: {
      id: 'food_given',
      npcText: '（她接过食物，狼吞虎咽地吃了起来。）"谢谢你！我爸爸说好人有好报。这个给你——是我在沙发底下找到的。"她递给你一个急救包。',
      options: [
        {
          id: 'take_gift',
          text: '接过急救包，承诺带她找安全地方。',
          nextNode: 'escort_agree',
          outcome: 'reward',
          reward: ['first_aid_kit'],
        },
      ],
    },
    rescue_attempt: {
      id: 'rescue_attempt',
      npcText: '"真的吗？太好了！但是……但是救援队不是应该有很多人吗？为什么只有你一个？"',
      options: [
        {
          id: 'truth',
          text: '"……你说得对。我不是救援队的。但我可以帮你。"',
          trustChange: 15,
          nextNode: 'escort_agree',
        },
        {
          id: 'persist_lie',
          text: '"其他人在外面等着。快跟我走吧。"',
          trustChange: -10,
          nextNode: null,
          outcome: 'failed_lie',
        },
      ],
    },
    escort_agree: {
      id: 'escort_agree',
      npcText: '"好……我跟你走。但能帮我找找我爸爸吗？他叫汤米，穿着蓝色的工作服。他一定还在哪里活着……"',
      options: [
        {
          id: 'promise',
          text: '"我答应你，如果遇到他我会告诉他你在植物园。"',
          trustChange: 20,
          nextNode: null,
          outcome: 'escort_success',
        },
      ],
    },
  },
}
