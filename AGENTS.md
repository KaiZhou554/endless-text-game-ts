# 丧尸末日生存 · 纯文字冒险

Vue 3 (Composition API) + Tailwind CSS v4 单页文字冒险游戏。终端护眼暗色风格，响应式（手机/桌面）。**已从 JavaScript 迁移至 TypeScript**。

## Commands

```bash
npm run dev      # 开发服务器 → http://localhost:5173
npm run build    # 类型检查 + 生产构建 → dist/
npm run type-check  # 仅类型检查（vue-tsc --build）
npm run preview  # 预览生产构建
```

## Architecture

三层架构：**数据层 → 引擎层 → 组件层**，数据与逻辑严格分离。

```
src/
├── main.ts                    # Vue 入口，挂载 #app
├── types.ts                   # 核心类型定义（Item, GameState, Scene, Opportunity 等）
├── App.vue                    # 主组件 — 流程编排、事件循环、面板切换、机遇系统
├── assets/main.css            # 全局样式：CSS 变量、字体、滚动条、响应式
├── data/                      # ─── 纯数据层（无逻辑，仅供引擎引用）───
│   ├── index.ts               #   顶层桶文件，统一导出所有数据
│   ├── items.ts               #   桶文件，从 extensions/ 聚合物品
│   ├── scenes.ts              #   23 场景，按 id 索引
│   ├── situations.ts          #   桶文件，从 extensions/ 聚合情景
│   ├── modifiers.ts           #   时间/天气/状态/标签等修饰条件
│   ├── endings.ts             #   8 个结局条件 + 结局文本
│   ├── opportunities.ts       #   15+ 机遇（通用 + 场景特有）
│   ├── world.ts               #   兼容桶文件
│   ├── npcs.ts                #   兼容桶文件
│   ├── npcs/                  # ─── NPC 独立文件目录 ───
│   │   ├── index.ts           #   桶文件，聚合所有 NPC 为 npcDB
│   │   ├── lena.ts            #   莉娜（前急诊科护士）
│   │   ├── marcus.ts          #   马库斯（前建筑工人）
│   │   ├── stranger_mask.ts   #   戴防毒面具的人（掠夺者）
│   │   └── child_anna.ts      #   安娜（九岁女孩）
│   └── extensions/            # ─── 扩展目录（按主题拆分）───
│       ├── items-weapons.ts   #   武器 & 弹药
│       ├── items-supplies.ts  #   消耗品（食物/饮品/医疗）
│       ├── items-equipment.ts #   装备（防具/工具/杂项）
│       ├── items-key.ts       #   关键道具
│       ├── situations-combat.ts   #   战斗/危险类遭遇
│       ├── situations-social.ts   #   社交/剧情类遭遇
│       ├── situations-scavenge.ts #   搜索/物资类遭遇
│       └── situations-explore.ts  #   探索/环境类遭遇
├── game/                      # ─── 引擎层（纯函数，无 Vue 依赖）───
│   ├── state.ts               #   响应式状态管理 (Vue reactive)，含 slot 占位系统
│   ├── engine.ts              #   核心：事件生成、选项解析、d20 战斗、对话、叙事、机遇
│   ├── utils.ts               #   工具：随机、加权选择、格式化
│   ├── item-utils.ts          #   物品查询/筛选/随机选择函数
│   ├── world-utils.ts         #   时间/天气/玩家状态修饰计算
│   ├── npc-utils.ts           #   NPC 对话节点查询
│   └── ending-utils.ts        #   结局检查
└── components/                # ─── 组件层（Vue SFC）───
    ├── StartScreen.vue        #   开始画面 + 模式选择
    ├── StatusBar.vue          #   5 指标状态栏 + 时段/疲劳显示（响应式）
    ├── NarrativeArea.vue      #   主叙事滚动区，打字机效果，队列显示
    ├── OptionsPanel.vue       #   选项按钮列表
    ├── ActionBar.vue          #   底部快捷栏（背包/日志/地图/存档）
    ├── EndingScreen.vue       #   结局画面 + 统计
    ├── InventoryDrawer.vue    #   背包侧边抽屉（slot 占位显示）
    ├── JournalPanel.vue       #   日志独立面板（时间线反转）
    ├── DialogPanel.vue        #   NPC 对话树
    ├── MapPanel.vue           #   地图快速旅行（逐步解锁）
    └── CombatPanel.vue        #   （内嵌在 App.vue）战斗全屏界面
```

### 数据流

```
用户点击选项
  → App.handleSelectOption()
    → engine.resolveOption(state, option)
      → 判定成功/失败
      → buildResultText() 生成叙事段落
      → applySuccess/FailureEffects() 修改 state
      → applySurvivalDecay() 衰减指标（+1h，疲劳惩罚）
      → checkEndings() 检查结局
      → 高危险场景 12% 概率触发战斗
    → addJournalEntry() 写入日志（显示在 NarrativeArea）
    → [可选] getOpportunities() 0-3 个机遇
    → engine.generateEvent() 生成下一事件（同场景或换场景）

使用物品（从背包）
  → handleUseItem() → useItem() 应用效果
  → rebuildCurrentOptions() 刷新选项（背包满状态变化）

战斗（d20 全屏对话式界面）
  → 玩家选择武器（≤2 件背包武器）或策略（4 中随机 2）
  → resolveCombatRound() → d20 骰子检定 + 命中区间计算伤害
  → 玩家消息显示在右侧，丧尸反击/死状显示在左侧
  → 可一键跳过（单次检定）或逃跑（概率递增）
```

## Data Format

### 物品 (items.ts)

```js
itemDB = {
  itemId: {
    id: 'itemId',
    name: '显示名称',
    type: 'weapon' | 'armor' | 'food' | 'drink' | 'medical' | 'tool' | 'key' | 'misc',
    desc: '描述文本',
    tags: ['标签1', '标签2'],   // 用于选项条件判定
    effects: { damage: 3, noise: 1 },  // 实际效果数值
    stackable: false,           // 可堆叠（同类物品数量叠加）
    reusable: true,             // 使用后不消耗
    slots: 1,                   // 占位格数（默认 2，小件 1）
  }
}
```

**type 对应的 effects 字段：**
- `weapon`: `damage` (影响命中区间分配), `noise` (1-10), `durability`
- `armor`: `damageReduction` (0-1), `durability`, `headProtection`, `gasProtection`
- `food`: `hunger` (正值增加), `thirst` (可能为负), `sanity`
- `drink`: `thirst`, `hunger`, `sanity`
- `medical`: `hp`, `infection` (负值降低), `sanity`, `stopBleeding`
- `tool`/`key`/`misc`: 通常无 effects，靠 tags 驱动判定

### 武器命中区间 (hitRanges)

武器战斗使用 d20，不同武器根据 `effects.damage` 值自动分配命中区间：

```ts
function getHitRanges(wd: number): Array<{min, max, dmg}>
// wd=3: 2-7→+5, 8-16→+10, 17-19→+13
// wd=5: 2-6→+6, 7-16→+11, 17-19→+14
// wd=8: 2-5→+8, 6-14→+13, 15-19→+17
```

伤害公式：`基础 4 + 区间加成`。骰出 1 = 失误，骰出 20 = 必杀。

### 场景 (scenes.ts)

```js
scenes = {
  sceneId: {
    id: 'sceneId',
    name: '显示名称',
    desc: '场景描述文本（到达时显示）',
    tags: ['室内', '医疗', '黑暗'],  // 影响情况选择权重和机遇匹配
    danger: 3,                      // 1-6，影响场景选择和危险程度、战斗触发概率
    lootTypes: ['medical', 'food'], // 倾向的战利品类型
  }
}
```

### 情况 (situations.ts)

```js
situations = {
  situationId: {
    id: 'situationId',
    name: '显示名称',
    baseText: '情况描述。可用 {count} 占位（自动替换为随机数）。',
    options: [
      {
        id: 'option_id',
        text: '选项文本',
        risk: '[风险提示]',
        tags: ['搜索', '潜行'],        // '搜索' 标签触发战利品系统
        requireItems: ['itemId'],       // 需要的物品 id（至少一个）
        requireTags: ['食物'],          // 需要的物品标签（至少一个匹配）
        forbidTags: ['噪音:高'],        // 禁止的标签（有任何则禁用）
        successRate: 0.7,              // 基础成功率
        combat: true,                  // 成功时可能触发战斗
        sanityEffect: -10,             // 固定理智变化
      }
    ],
    danger: 3,   // 危险等级，影响权重
  }
}
```

**选项条件判定的关键规则：**
- `requireItems`: 单个 id → 必须有该物品；多个 id → 至少有一个
- `requireTags`: 背包中任意物品的 tags 匹配即通过
- `forbidTags`: 背包物品或遗留标签匹配则禁用
- 全部不可用时引擎自动注入 `fallback_move_on` 兜底选项
- 背包满时（基于 slot 占位），`['搜索', '采集']` 标签的选项自动标记为不可用

### NPC (data/npcs/ — 独立文件，通过 npcs/index.ts 聚合为 npcDB)

```js
npcDB = {
  npcId: {
    id: 'npcId', name: '名称', title: '身份', desc: '初见描述',
    trust: 50,   // 初始信任值 0-100
    dialogueTree: {
      nodeId: {
        id: 'nodeId',
        npcText: 'NPC 说的话',
        options: [{
          id: 'opt_id',
          text: '玩家回答',
          requireItems: ['itemId'],
          trustChange: +10,        // 信任变化
          sanityEffect: -5,
          nextNode: 'nextNodeId',  // null = 对话结束
          outcome: 'alliance',     // 特殊结果标识
          reward: ['itemId'],      // 奖励物品 id 数组
        }],
      }
    }
  }
}
```

NPC 不再随机遭遇，仅通过固定剧情事件触发。

### 机遇 (opportunities.ts)

```ts
opportunities = [{
  id: 'sudden_rain',
  baseText: '描述文字（打字机显示）',
  type: 'dice' | 'narrative' | 'narrative_result',
  sceneTags?: ['医疗', '武器'],  // 为空则通用
  delay: 4,                       // 显示后延时(秒)
  diceRanges?: [                  // 仅 dice 类型
    { min: 1, max: 2, text: '结果描述', effects: { hp: -5 }, lootItem: 'itemId' },
    { min: 3, max: 5, text: '...', nothing: true },
    { min: 6, max: 6, text: '...', lootItem: 'canned_beans' },
  ],
  resultEffects?: { hp: 5 },      // 仅 narrative_result
}]
```

### 结局 (endings.ts)

```js
endingChecks = [{
  id: 'ending_id',
  name: '结局名称',
  check(state) { return state.infection >= 100 },  // 返回 true 触发
  title: '标题', subtitle: '副标题（{days}替换为天数）',
  text: '结局文本（pre 格式，支持换行）',
  stats: ['days', 'kills', 'itemsCollected'],  // 显示的统计项
  isDeath: true,   // true = 死亡结局
}]
```

## 战斗系统 (d20)

全屏对话式界面，类似 DialogPanel 覆盖层。

- **骰子系统**：武器攻击使用 **d20**（1=失误，20=必杀），策略使用 d6
- **命中区间**：每种武器根据 `effects.damage` 自动分配 3 档区间，伤害 = 基础 4 + 区间加成
- **骰子动画**：攻击时 🎲[?] 快速变化约 840ms，伤害数字暂隐后揭晓
- **武器选项**：每回合从背包随机取 ≤2 件武器（无需装备）
- **策略选项**：4 个基础策略中随机 2 个：
  - ⚔️ 正面强攻 — 无特殊加成
  - 🎯 精准打击 — 对庞大/缓慢型 +2，消耗 5 理智，需理智≥30
  - 🛡️ 防守反击 — 受伤减半，对快速/灵敏型 +1
  - 🔍 寻找弱点 — 骰 4+ 伤害翻倍，消耗 8 理智，需理智≥40
- **逃跑**：概率递增（55% → +15%/次，上限 90%）
- **击杀死状**：每种敌人有专属死亡描述，胜利后延迟 2 秒返回
- **丧尸反击**：每回合玩家行动后丧尸反击，可能造成感染
- **战斗日志**：自动滚动 + 回到底部按钮

## 机遇系统

每次选项后、生成下一事件前，随机触发 **0-3 个机遇**：

- **dice 类型**：玩家点击 🎲 掷骰（d6），不同点数范围产生不同结果（获得/损失物品、属性变化）
- **narrative 类型**：纯剧情文字，打字机显示后自动继续
- **narrative_result 类型**：剧情 + 自动应用效果
- **通用机遇**：任何场景都可能触发
- **场景特有**：匹配场景标签（医疗/武器/住宅/自然等）

## State

`gameState` 由 `src/game/state.ts` 的 `createGameState()` 创建，是一个 Vue `reactive` 对象。

**核心字段：**
```js
{
  phase: 'start' | 'playing' | 'dialogue' | 'ending',
  mode: 'roguelike' | 'easy',

  // 指标
  hp, maxHp, hunger, maxHunger, thirst, maxThirst,
  sanity, maxSanity, infection, maxInfection,

  // 时间（每行动 +1h）
  dayCount: 0,        // 小数，1/24 = 1小时
  actionCount: 0,
  hoursAwake: 0,      // 累计清醒小时数（≥8h 开始惩罚）

  // 背包（slot 占位系统，常规 2 格，小件 1 格）
  inventory: [],      // [{...item, _count, slots}, ...]
  maxInventory: 12,   // 基础容量（背包可拓展）

  // 场景
  currentScene: null, scenesVisited: [],
  lastSituationId: null,

  // 日志
  journal: [],  // [{text, time, type, id, turnId}, ...] 最近 30 条

  // 标记
  npcsMet: [], npcRelations: {}, legacyTags: [],
  sacrificeTriggered, safeZoneJoined, labDiscovered,
}
```

## 时间系统

- 每行动推进 **1 小时**（`dayCount += 1/24`）
- 开局随机：早晨 6-10 点（60%）或傍晚 16-20 点（40%）
- **疲劳惩罚**（`hoursAwake` 累加，以 `<span class="dim">` 显示）：
  - ≥8h：每行动 -2 理智，8h 警告一次
  - ≥10h：每行动 -4 理智、-1HP
  - ≥12h：每行动 -8 理智、-2HP，12h 警告一次
- **休息**可重置 `hoursAwake = 0`，额外跳过 6-8h
- 夜间（20:00-6:00）和疲劳时，休息事件出现概率提升

## 地图系统

- 仅可传送到 `scenesVisited` 中已探索的场景
- 未探索地点完全隐藏（只显示 `?` + `???`）
- 旅行消耗：饱腹 -3~6 + 口渴 -2~4（基于场景危险度）
- 探索新区域通过"转移阵地"选项随机前往

## UI Conventions

- **配色**：背景 `#0D1117`，主文字 `#B0C4DE`，强调 `#E6C37C`，边框 `#2a3a3a`
- **按钮**：`min-h-[44px]`，`rounded-sm`，1px border，hover 变背景色
- **禁止**：阴影、渐变、模糊效果、纯白文字、高饱和荧光色
- **响应式**：桌面 `max-w-lg mx-auto`（512px），有四周 16px 边距
- **字体**：`JetBrains Mono, Fira Code, Consolas, monospace`，字号 15px
- **面板**：右侧抽屉（手机全屏/桌面 320px），黑色半透明遮罩关闭
- **日志**：最近 5 条 `#15202a` 背景加亮，其余略暗，行高 1.6
- **符号**：`✢` 战利品/初始物品，`✽` 战斗/逃跑/使用物品（均暗淡），`➤` 行动提示
- **暗淡文本 (`.dim`)**：状态后缀、幻觉文本、疲劳警告使用 `#658080`
- **输出提示**：`➤ 选择你的行动` 在日志队列空闲时显示

## Typewriter Effect

叙事类日志（narrative/location/discovery/result/alliance）使用 **TypewriterJS v2** 逐字打出。
- 打字速度 20ms/字，光标 `▋`
- 打字过程中条目不在日志列表显示，由独立的 `typewriterTarget` div 渲染
- 打字完成后条目加入日志列表
- 非叙事类（action/combat/warning/danger）直接渲染，无动画
- 多个条目按队列顺序逐个显示

## How to Extend

### 扩展工作流
1. 在 `src/data/extensions/` 下找到对应主题的文件，直接追加条目
2. 如果新增的主题没有对应的扩展文件，新建一个并导出对应类型
3. 在桶文件中 import 并展开

### 添加新物品
在对应扩展文件中添加条目。type 为 `weapon` 的物品自动按 damage 值分配 d20 命中区间。小型物品（食物/医疗/弹药）需设置 `slots: 1`。

### 添加新场景
在 `src/data/scenes.ts` 的 `scenes` 对象中添加。如需按区域分组，可创建 `src/data/extensions/scenes-*.ts` 文件。

### 添加新机遇
在 `src/data/opportunities.ts` 数组中追加机遇对象。通用机遇留空 `sceneTags`，场景特有机遇设置对应的场景标签。

### 添加新 NPC
1. 在 `src/data/npcs/` 下新建角色文件，导出完整 NPC 对象
2. 在 `src/data/npcs/index.ts` 中 import 并加入 `npcDB`

### 添加新结局
在 `src/data/endings.ts` 的 `endingChecks` 数组中追加。

### 添加新战斗策略
在 `engine.ts` 的 `combatStrategies` 数组中追加策略对象，包含：
- `id` / `name` / `desc` 
- `defMod`（受伤倍率）
- `sanityCost` / `sanityReq`
- `counterBonus`（`{ trait: bonus }` 特征克制）
- `highRisk`（d6≥4 翻倍）

### 添加新敌人类型
在 `engine.ts` 的 `generateCombat` 的 `enemies` 数组中追加，同时可在击杀处添加专属死亡描述。

## Notes

- 所有源文件使用 `.ts` 扩展名（`data/` 和 `game/` 目录），Vue SFC 的 `<script setup>` 带有 `lang="ts"`
- 核心类型定义在 `src/types.ts`（Item, Scene, Situation, NPC, GameState, Combat, Opportunity 等）
- 引擎函数可引入类型：`import type { GameState, Item } from '../types'`
- 导入路径可保留 `.js` 后缀（Vite 自动解析 `.js` → `.ts`），也可省略扩展名
- 日志条目使用自增 `_journalEntryId` 保证唯一 key，`turnId` 字段标记所属回合
- `rebuildCurrentOptions()` 用于在背包变更后刷新选项状态
- 使用 `getCombatStrategies(state, enemy)` 获取当前回合战斗选项
- 休息事件额外跳过 6-8h（`state.dayCount += sleepHours/24`）
- 无武器时战斗选项只显示策略（不显示"拳头"）
- NarrativeArea 使用队列系统（`processingQueue` / `revealedIds`）按序显示条目，
  叙事类用 TypewriterJS，非叙事类直接渲染；MutationObserver 监听打字区域实现自动滚动
- `action` / `combat` 类型条目始终使用暗淡色（`isRecent` 不将其提亮）
- 战斗日志通过 `combatLogRef` + `scrollCombatNow()` 每回合强制自动滚动
- `getUsedSlots(state)` 计算背包已用格数（`slots × _count`），
  配合 `getEffectiveCapacity(state)` 判断背包空间
