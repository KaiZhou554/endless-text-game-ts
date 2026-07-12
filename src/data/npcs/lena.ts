/**
 * NPC: 莉娜 — 前急诊科护士
 */

export const lena = {
  id: 'lena',
  name: '莉娜',
  title: '前急诊科护士',
  desc: '一个三十出头的女人，棕色的短发沾满了灰尘。她的眼神锐利而疲惫，手里紧握着一把沾血的手术刀。',
  trust: 50,  // 初始信任值 0-100
  dialogueTree: {
    start: {
      id: 'start',
      npcText: '"别动。先告诉我——你有没有被咬？我在医院见过太多人隐瞒伤口了。"',
      options: [
        {
          id: 'honest_no',
          text: '"我没有被咬。我只是在寻找物资和活着的人。"',
          trustChange: 10,
          nextNode: 'trust_start',
        },
        {
          id: 'show_wound',
          text: '[展示身上的伤口] "这里被抓了一下，但不是丧尸，是铁丝网。"',
          trustChange: 5,
          nextNode: 'trust_start',
        },
        {
          id: 'defensive',
          text: '"这不关你的事。你一个人在这？"',
          trustChange: -5,
          nextNode: 'defensive_reply',
        },
      ],
    },
    trust_start: {
      id: 'trust_start',
      npcText: '"好吧……我叫莉娜。末日前在圣玛丽急诊科。这里的情况你也看到了——整个城市都沦陷了。我在找一个地方：基因治疗研究中心。你听说过吗？"',
      options: [
        {
          id: 'heard_lab',
          text: '"听说过。但我不知道具体在哪。"',
          nextNode: 'lab_talk',
        },
        {
          id: 'have_keycard',
          text: '"我有实验室的门禁卡。"[需要:实验室门禁卡]',
          requireItems: ['lab_keycard'],
          trustChange: 20,
          nextNode: 'lab_keycard_share',
        },
        {
          id: 'why_lab',
          text: '"为什么要去那里？那里有什么？"',
          nextNode: 'lab_why',
        },
      ],
    },
    defensive_reply: {
      id: 'defensive_reply',
      npcText: '"脾气不小啊。算了——末日里谁也不欠谁的。如果你改变了态度，可以来找我。我在圣玛丽后面的药房活动。"',
      options: [
        {
          id: 'apologize',
          text: '"等等，抱歉。我刚才太紧张了。"',
          trustChange: 5,
          nextNode: 'trust_start',
        },
        {
          id: 'leave',
          text: '点头离开。',
          nextNode: null,  // 对话结束
        },
      ],
    },
    lab_talk: {
      id: 'lab_talk',
      npcText: '"据说那里有关于病毒的原始数据。如果能拿到，也许能找到治愈的方法。我打算明天出发。如果你愿意的话……一起？"',
      options: [
        {
          id: 'agree',
          text: '"好，我们一起去。多一个人多一份生存机会。"',
          trustChange: 15,
          nextNode: 'alliance_formed',
        },
        {
          id: 'decline',
          text: '"不了，我有自己的路要走。"',
          trustChange: -5,
          nextNode: null,
        },
      ],
    },
    lab_keycard_share: {
      id: 'lab_keycard_share',
      npcText: '"你真的有门禁卡？！太好了！听着——这个实验室可能藏着关于丧尸病毒的原始研究。如果我们能找到它，也许能制造出真正的解药。"',
      options: [
        {
          id: 'team_up',
          text: '"那就一起去。两个人比一个人强。"',
          trustChange: 25,
          nextNode: 'alliance_formed',
        },
      ],
    },
    lab_why: {
      id: 'lab_why',
      npcText: '"我在医院看到了第一个被送来的感染者。他的血液里有一种……异常。后来军方接管了医院，把所有样本都送到了那个研究中心。那里有答案——也许还有解药。"',
      options: [
        {
          id: 'interested',
          text: '"听起来值得一试。你有具体计划吗？"',
          trustChange: 10,
          nextNode: 'lab_talk',
        },
        {
          id: 'skeptical',
          text: '"就算有解药，一个人也改变不了什么。"',
          trustChange: -5,
          nextNode: null,
        },
      ],
    },
    alliance_formed: {
      id: 'alliance_formed',
      npcText: '"好。明天天亮在这里碰头。带上你能找到的任何医疗用品。如果运气好的话，我们也许能成为这个末日里第一个带来好消息的人。"',
      options: [
        {
          id: 'confirm',
          text: '"一言为定。保重，莉娜。"',
          trustChange: 10,
          nextNode: null,
          outcome: 'alliance',  // 触发结盟
        },
      ],
    },
  },
}
