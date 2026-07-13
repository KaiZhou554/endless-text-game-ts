/**
 * 游戏核心类型定义
 */

// ==================== 机遇 ====================
export type OpportunityType = 'dice' | 'narrative' | 'narrative_result'

export interface DiceRange {
  min: number
  max: number
  text: string  // 结果描述
  effects?: Record<string, number>  // hp/hunger/thirst/sanity/infection
  lootItem?: string  // 给予物品 id
  loseItem?: boolean  // 随机丢失物品
  combat?: boolean  // 触发战斗
  nothing?: boolean  // 无事发生
  events?: string[]  // 触发事件（如 clear_fatigue）
}

export interface Opportunity {
  id: string
  baseText: string  // 描述文字（打字机显示）
  type: OpportunityType
  sceneTags?: string[]  // 场景标签匹配（空=通用）
  diceRanges?: DiceRange[]
  resultEffects?: Record<string, number>
  resultItem?: string
  delay: number  // 显示后延时(秒)
}
export type ItemType = 'weapon' | 'armor' | 'food' | 'drink' | 'medical' | 'tool' | 'key' | 'misc'

export interface Item {
  id: string
  name: string
  type: ItemType
  desc: string
  tags: string[]
  effects: Record<string, any>
  stackable: boolean
  reusable: boolean
  initialStack?: number  // 首次获得时的堆叠数（弹药默认多发）
  _count?: number
  slots?: number  // 占位格数（默认 2，小件物品 1）
  hitRanges?: HitRange[]
  events?: string[]  // 使用时的特殊事件（如 clear_fatigue）
  usable?: boolean   // 可在背包中直接使用的物品
  noLoot?: boolean   // 不进入随机掉落池（如配方制作物品）
}

export interface HitRange {
  min: number   // 骰值下限（含）
  max: number   // 骰值上限（含）
  dmg: number   // 此区间造成的武器伤害加成
}

export interface ItemDB {
  [id: string]: Item
}

// ==================== 场景 ====================
export interface Scene {
  id: string
  name: string
  desc: string
  tags: string[]
  danger: number
  lootTypes: string[]
}

export interface Scenes {
  [id: string]: Scene
}

// ==================== 情况/遭遇 ====================
export interface SituationOption {
  id: string
  text: string
  risk: string
  tags: string[]
  requireItems?: string[]
  requireTags?: string[]
  forbidTags?: string[]
  successRate?: number
  combat?: boolean
  sanityEffect?: number
  isMoveOn?: boolean
  isFallback?: boolean
  available?: boolean
  disabledReason?: string | null
  situationId?: string
  successText?: string   // 自定义成功叙事
  failText?: string      // 自定义失败叙事
  events?: string[]      // 成功/失败均触发的事件
}

export interface Situation {
  id: string
  name: string
  baseText: string
  options: SituationOption[]
  danger: number
}

export interface Situations {
  [id: string]: Situation
}

// ==================== 修饰条件 ====================
export interface Modifier {
  id: string
  name: string
  desc?: string
  visibility?: number
  dangerMod?: number
  textPrefix?: string
  textSuffix?: string
  needsLight?: boolean
  sanityDrain?: number
  soundMasking?: boolean
  combatPenalty?: boolean
  hallucination?: boolean
  npcReactionBonus?: boolean
}

// ==================== NPC ====================
export interface DialogueOption {
  id: string
  text: string
  requireItems?: string[]
  requireTags?: string[]
  trustChange?: number
  sanityEffect?: number
  nextNode: string | null
  outcome?: string
  reward?: string[]
  combat?: boolean
}

export interface DialogueNode {
  id: string
  npcText: string
  options: DialogueOption[]
}

export interface NPC {
  id: string
  name: string
  title: string
  desc: string
  trust: number
  dialogueTree: Record<string, DialogueNode>
}

export interface NPCDB {
  [id: string]: NPC
}

// ==================== 结局 ====================
export interface Ending {
  id: string
  name: string
  check: (state: GameState) => boolean
  title: string
  subtitle: string
  text: string
  stats: string[]
  isDeath: boolean
}

// ==================== 战斗 ====================
export interface CombatEnemy {
  name: string
  hp: number
  damage: number
  noise: number
  lootChance: number
  traits: string[]
  desc?: string
  actualHp: number
  maxHp: number
  count: number
}

export interface CombatRound {
  action: string
  playerDmg: number
  enemyDmg: number
  playerText: string
  enemyText: string
  isCrit?: boolean
}

export interface CombatState {
  enemy: CombatEnemy
  playerHp: number
  rounds: CombatRound[]
  result: string | null
  _defending: boolean
  enemyDesc: string
}

// ==================== 游戏状态 ====================
export interface JournalEntry {
  text: string
  time: number
  type: string
  id: number
  turnId: number
}

export interface DialogueSession {
  npcId: string
  nodeId: string
  npc: NPC
  currentNode: DialogueNode
}

export interface GameState {
  phase: 'start' | 'playing' | 'dialogue' | 'ending'
  mode: 'roguelike' | 'easy'
  saveSlot: any | null

  // 核心指标
  hp: number
  maxHp: number
  hunger: number
  maxHunger: number
  thirst: number
  maxThirst: number
  sanity: number
  maxSanity: number
  infection: number
  maxInfection: number

  // 时间
  dayCount: number
  actionCount: number

  // 背包
  inventory: Item[]
  maxInventory: number

  // 场景
  currentScene: string | null
  currentSituation: string | null
  lastSituationId: string | null
  currentModifiers: Modifier[]
  currentOptions: SituationOption[]
  currentEventText: string
  sceneActionCount: number
  scenesVisited: string[]

  // 日志
  journal: JournalEntry[]

  // 标记
  legacyTags: string[]

  // NPC
  npcsMet: string[]
  npcRelations: Record<string, number>
  currentDialogue: DialogueSession | null

  // 战斗
  inCombat: boolean
  combatState: CombatState | null

  // 统计
  kills: number
  itemsCollected: number
  npcsHelped: number
  distanceTraveled: number

  // 特殊标记
  sacrificeTriggered: boolean
  safeZoneJoined: boolean
  radioContactMade: boolean
  labDiscovered: boolean

  // 休息
  hoursAwake: number

  // UI
  showInventory: boolean
  showJournal: boolean
  showMap: boolean

  // 内部
  _combatNextRoundBonus: number
  _pendingScene?: string | null
  _targetScene?: string | null
  _bleeding?: boolean
  _isOverweight?: boolean
  currentEnding?: Ending | null
}
