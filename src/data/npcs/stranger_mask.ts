/**
 * NPC: 戴防毒面具的人 — 掠夺者
 */

export const stranger_mask = {
  id: 'stranger_mask',
  name: '戴防毒面具的人',
  title: '掠夺者',
  desc: '一个身材瘦长的身影，脸上戴着俄制防毒面具。他的声音透过过滤器变得低沉而模糊。',
  trust: 10,
  dialogueTree: {
    start: {
      id: 'start',
      npcText: '"哈，又一个迷路的羊羔。把你的背包放下来，我们也许能达成……某种共识。"（他从大衣里掏出一把匕首，但没有举起。）',
      options: [
        {
          id: 'fight_back',
          text: '"我可不是你的羊羔。" 握住武器。',
          trustChange: -10,
          nextNode: 'confrontation',
        },
        {
          id: 'negotiate',
          text: '"你想交易还是抢劫？说清楚。"',
          trustChange: 5,
          nextNode: 'negotiate_talk',
        },
        {
          id: 'run',
          text: '转身就跑。',
          nextNode: null,
          outcome: 'flee',
        },
      ],
    },
    confrontation: {
      id: 'confrontation',
      npcText: '（他笑了，声音透过面具变成诡异的嘶嘶声。）"有趣。这年头有骨气的人不多了。好吧——我今天心情好。留下你一半的食物，然后滚。"',
      options: [
        {
          id: 'give_food',
          text: '放下一些食物然后离开。[消耗:任意食物]',
          requireTags: ['食物'],
          nextNode: null,
          outcome: 'give_half',
        },
        {
          id: 'attack',
          text: '先发制人！',
          nextNode: null,
          outcome: 'combat',
          combat: true,
        },
        {
          id: 'bluff',
          text: '"我后面有三个朋友马上就到。你确定要打？"',
          trustChange: -5,
          nextNode: 'bluff_result',
        },
      ],
    },
    negotiate_talk: {
      id: 'negotiate_talk',
      npcText: '"聪明。听着——我在收集医疗用品。你有抗生素或急救包的话，我可以给你一个好东西。"他拿出一把带消音器的手枪。',
      options: [
        {
          id: 'trade_med',
          text: '"我有抗生素。让我看看那把枪。"[消耗:抗生素]',
          requireItems: ['antibiotics'],
          trustChange: 10,
          nextNode: 'trade_complete',
        },
        {
          id: 'decline_trade',
          text: '"我没有什么医疗用品。让我走吧。"',
          nextNode: null,
        },
      ],
    },
    bluff_result: {
      id: 'bluff_result',
      npcText: '（他犹豫了一下，打量你的表情。）"……算你走运。今天不想节外生枝。"他收起匕首，消失在雾中。',
      options: [
        {
          id: 'relieved',
          text: '长舒一口气，赶紧离开这里。',
          nextNode: null,
          outcome: 'bluff_success',
        },
      ],
    },
    trade_complete: {
      id: 'trade_complete',
      npcText: '"成交。拿着——M9配消音器。别浪费了。"他把手枪推过来，然后迅速带着抗生素消失在阴影中。',
      options: [
        {
          id: 'take_gun',
          text: '拿起手枪。',
          nextNode: null,
          outcome: 'reward',
          reward: ['pistol'],
        },
      ],
    },
  },
}
