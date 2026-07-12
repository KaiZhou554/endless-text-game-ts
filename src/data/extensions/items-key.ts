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
  veteran_tag: {
    id: 'veteran_tag',
    name: '战友铭牌',
    type: 'key',
    desc: '两块金属身份牌用链子拴在一起，上面刻着"O. Reyes, AB+, NO-MAN-LEFT"。显然是从某个已逝队友身上取下来的，作为信物保留至今。',
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

  // ==================== 更多关键道具 ====================

  military_map: {
    id: 'military_map',
    name: '军方战术地图',
    type: 'key',
    desc: '一张防水战术地图，标注了城市内的重要军事设施、补给点和安全屋。角落盖着"机密"的红章。',
    tags: ['关键', '提示:军事设施', '可合并'],
    effects: {},
    stackable: false,
    reusable: true,
  },
  blood_sample_kit: {
    id: 'blood_sample_kit',
    name: '血样采集套装',
    type: 'key',
    desc: '一个密封的无菌采集包，内含真空采血管和标签贴纸。标签上写着"优先采集：免疫个体"。',
    tags: ['关键', '结局:血清', '提示:免疫研究'],
    effects: {},
    stackable: false,
    reusable: true,
  },
  encrypted_drive: {
    id: 'encrypted_drive',
    name: '加密U盘',
    type: 'key',
    desc: '一个军规加密U盘，外壳坚固防水。插口处贴着"G.R.I.M. — 项目归档 #447"。内容未知，但加密等级说明它很重要。',
    tags: ['关键', '信息', '需要:终端'],
    effects: {},
    stackable: false,
    reusable: true,
  },

}
