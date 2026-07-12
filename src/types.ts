/**
 * 游戏核心类型定义
 */

// ==================== 物品 ====================
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
  _count?: number
  hitRanges?: HitRange[]  // d20 武器命中区间，留空则按 effects.damage 自动计算
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

  // 装备
  equippedWeapon: Item | null
  equippedArmor: Item | null
  equippedHelmet: Item | null

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
  currentEnding?: Ending | null
}
