/**
 * NPC: 马库斯 — 前建筑工人
 */

export const marcus = {
  id: 'marcus',
  name: '马库斯',
  title: '前建筑工人',
  desc: '一个肌肉发达的非裔男人，带着一顶黄色安全帽，手里握着一把大锤。他的左臂缠着带血的绷带。',
  trust: 30,
  dialogueTree: {
    start: {
      id: 'start',
      npcText: '"嘿！别过来！看到这家伙了没？"（挥舞大锤）"我可不是好惹的。你想干嘛？"',
      options: [
        {
          id: 'friendly',
          text: '"放松，我只是路过。你需要帮忙处理那条手臂吗？"',
          trustChange: 15,
          nextNode: 'wound_talk',
        },
        {
          id: 'trade_open',
          text: '"我想做点交易。你这有大锤——我可以拿东西换。"',
          trustChange: 5,
          nextNode: 'trade_talk',
        },
        {
          id: 'leave_marcus',
          text: '举手示意没有恶意，然后离开。',
          nextNode: null,
        },
      ],
    },
    wound_talk: {
      id: 'wound_talk',
      npcText: '"被钢筋划的，不是丧尸。我自己处理过，但可能是感染了。你有抗生素吗？我可以拿这个跟你换——一根全新的撬棍，我昨天在工地找到的。"',
      options: [
        {
          id: 'give_antibiotics',
          text: '"给，这是抗生素。一天两次，吃三天。"[消耗:抗生素]',
          requireItems: ['antibiotics'],
          trustChange: 30,
          nextNode: 'grateful',
        },
        {
          id: 'offer_bandage',
          text: '"我没有抗生素，但有绷带。至少能帮你止血。"[消耗:绷带]',
          requireItems: ['bandage'],
          trustChange: 15,
          nextNode: 'partial_help',
        },
        {
          id: 'no_help',
          text: '"抱歉，我也没什么能帮你的。"',
          trustChange: -5,
          nextNode: 'no_help_reply',
        },
      ],
    },
    trade_talk: {
      id: 'trade_talk',
      npcText: '"交易？有意思。你想要什么？我这有武器、工具、还有几罐汽油。不过你得先看看我的手臂——这东西开始发臭了。"',
      options: [
        {
          id: 'trade_medical',
          text: '"我用医疗用品跟你换。[需要:绷带或抗生素]',
          requireItems: ['bandage', 'antibiotics'],
          trustChange: 10,
          nextNode: 'grateful',
        },
        {
          id: 'trade_food',
          text: '"我用食物跟你换。[需要:任意食物]',
          requireTags: ['食物'],
          trustChange: 5,
          nextNode: 'trade_done',
        },
      ],
    },
    grateful: {
      id: 'grateful',
      npcText: '"谢谢你！真的，我以为我要挂在这了。拿着——撬棍给你，还有这个对讲机。我在一个死掉的士兵身上找到的，也许你能用上。"',
      options: [
        {
          id: 'accept',
          text: '"收下了。祝你早日康复。"',
          trustChange: 10,
          nextNode: null,
          outcome: 'reward',  // 获得撬棍+对讲机
          reward: ['crowbar_weapon', 'walkie_talkie'],
        },
        {
          id: 'ask_about_area',
          text: '"谢了。这附近有什么地方我该去的或者该避开的吗？"',
          trustChange: 5,
          nextNode: 'area_info',
        },
      ],
    },
    partial_help: {
      id: 'partial_help',
      npcText: '"绷带总比没有好。谢了。我没什么值钱的东西，但我知道一个秘密——广播站地下室里有一台还能用的军用无线电。也许你能联系上什么人。"',
      options: [
        {
          id: 'thanks_info',
          text: '"谢谢你的情报。保重。"',
          nextNode: null,
          outcome: 'info',
        },
      ],
    },
    no_help_reply: {
      id: 'no_help_reply',
      npcText: '"好吧，祝你好运。你最好在我改主意之前离开。"',
      options: [
        {
          id: 'go',
          text: '离开。',
          nextNode: null,
        },
      ],
    },
    trade_done: {
      id: 'trade_done',
      npcText: '"成交。拿着，这是你要的东西。末日里最重要的是——别相信任何人，但有时你得相信交易。"',
      options: [
        {
          id: 'done',
          text: '"有道理。后会无期。"',
          nextNode: null,
          outcome: 'trade',
        },
      ],
    },
    area_info: {
      id: 'area_info',
      npcText: '"往东走有个军械库，但那里丧尸多得像蚂蚁窝。往西走过河是植物园，相对安全。哦对了——如果你看到一个戴防毒面具的独行者，别理他。那家伙是在钓幸存者然后抢东西。"',
      options: [
        {
          id: 'thanks',
          text: '"谢谢你的提醒。祝你早日康复。"',
          nextNode: null,
          outcome: 'info',
        },
      ],
    },
  },
}
