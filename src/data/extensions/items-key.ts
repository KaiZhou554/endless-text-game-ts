/**
 * 物品扩展 — 关键道具
 * 新增关键道具在此文件追加即可
 */
import type { ItemDB } from '../../types'

export const keyItems: ItemDB = {
  // ==================== 关键道具 (Key Items) ====================

  survivor_journal: {
    id: 'survivor_journal',
    name: '幸存者日记',
    type: 'key',
    desc: '一本沾满血渍的 Moleskine 笔记本，里面记录了一位叫"莉娜"的幸存者的见闻。最后一页画着一张粗糙的地图，标注了某个"安全区"。',
    tags: ['关键', '剧情:日记', '提示:安全区位置'],
    effects: {},
    stackable: false,
    reusable: true,
  },
  serum_sample: {
    id: 'serum_sample',
    name: '血清样本',
    type: 'key',
    desc: '一个低温保存的金属容器，标签上写着"ZM-07 原型 #3"。这是某个军方实验室的产物，可能是人类最后的机会。',
    tags: ['关键', '结局:血清', '极稀有'],
    effects: {},
    stackable: false,
    reusable: true,
  },
  map_fragment: {
    id: 'map_fragment',
    name: '地图碎片',
    type: 'key',
    desc: '一张撕下来的市区地图，上面用红笔圈出了几个地点——医院、警局、广播站。背面写了一行字："在广播站集合，每72小时一次。"',
    tags: ['关键', '提示:救援点', '可合并'],
    effects: {},
    stackable: false,
    reusable: true,
  },
  research_notes: {
    id: 'research_notes',
    name: '研究笔记',
    type: 'key',
    desc: '一叠从实验室保险柜里找到的研究文件，详细记录了丧尸病毒的基因序列和可能的弱点。科学家们称之为"零号突变"。',
    tags: ['关键', '结局:血清', '提示:病毒弱点'],
    effects: {},
    stackable: false,
    reusable: true,
  },
  family_photo: {
    id: 'family_photo',
    name: '全家福照片',
    type: 'key',
    desc: '一张泛黄的照片，上面是一家三口在游乐园的合影。背面写着："2023年夏天，永远爱你。"它让你想起自己为何要活下去。',
    tags: ['关键', '理智:+15(一次性)'],
    effects: { sanityOneTime: 15 },
    stackable: false,
    reusable: false,
  },
  military_id: {
    id: 'military_id',
    name: '军人身份牌',
    type: 'key',
    desc: '两块金属身份牌用链子穿在一起，上面刻着"J. Martinez, B+, 887-23-4156"。可能在某些场合能派上用场。',
    tags: ['关键', '身份证明'],
    effects: {},
    stackable: false,
    reusable: true,
  },
  radio_frequency: {
    id: 'radio_frequency',
    name: '频率密码本',
    type: 'key',
    desc: '一本小册子，记录了各个救援频率和加密方式。配合对讲机使用可以在正确的时间联系到直升机。',
    tags: ['关键', '结局:直升机', '需要:对讲机'],
    effects: {},
    stackable: false,
    reusable: true,
  },
  lab_keycard: {
    id: 'lab_keycard',
    name: '实验室门禁卡',
    type: 'key',
    desc: '一张白色门禁卡，上面印着"BSL-4 授权 — 基因治疗研究中心"。通往真相的钥匙。',
    tags: ['关键', '通行证:实验室'],
    effects: {},
    stackable: false,
    reusable: true,
  },

}
