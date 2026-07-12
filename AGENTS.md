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
├── types.ts                   # 核心类型定义（Item, GameState, Scene 等）
├── App.vue                    # 主组件 — 流程编排、事件循环、面板切换
├── assets/main.css            # 全局样式：CSS 变量、字体、滚动条、响应式
├── data/                      # ─── 纯数据层（无逻辑，仅供引擎引用）───
│   ├── index.ts               #   顶层桶文件，统一导出所有数据
│   ├── items.ts               #   60+ 物品，按 id 索引的 itemDB 对象
│   ├── scenes.ts              #   23 场景，按 id 索引
│   ├── situations.ts          #   34 情况/遭遇，按 id 索引
│   ├── modifiers.ts           #   时间/天气/状态/标签等修饰条件
│   ├── endings.ts             #   8 个结局条件 + 结局文本
│   ├── world.ts               #   兼容桶文件（重新导出 scenes/situations/modifiers）
│   ├── npcs.ts                #   兼容桶文件（重新导出 npcs/index.ts）
│   └── npcs/                  # ─── NPC 独立文件目录 ───
│       ├── index.ts           #   桶文件，聚合所有 NPC 为 npcDB
│       ├── lena.ts            #   莉娜（前急诊科护士）
│       ├── marcus.ts          #   马库斯（前建筑工人）
│       ├── stranger_mask.ts   #   戴防毒面具的人（掠夺者）
│       └── child_anna.ts      #   安娜（九岁女孩）
├── game/                      # ─── 引擎层（纯函数，无 Vue 依赖）───
│   ├── state.ts               #   响应式状态管理 (Vue reactive)
│   ├── engine.ts              #   核心：事件生成、选项解析、战斗、对话、叙事
│   ├── utils.ts               #   工具：随机、加权选择、格式化
│   ├── item-utils.ts          #   物品查询/筛选/随机选择函数
│   ├── world-utils.ts         #   时间/天气/玩家状态修饰计算
│   ├── npc-utils.ts           #   NPC 对话节点查询
│   └── ending-utils.ts        #   结局检查
└── components/                # ─── 组件层（Vue SFC）───
    ├── StartScreen.vue        #   开始画面 + 模式选择
    ├── StatusBar.vue          #   5 指标状态栏 + 时段/疲劳显示（响应式）
    ├── NarrativeArea.vue      #   主叙事滚动区，渲染 gameState.journal
    ├── OptionsPanel.vue       #   选项按钮列表
    ├── ActionBar.vue          #   底部快捷栏（背包/日志/地图/存档）
    ├── EndingScreen.vue       #   结局画面 + 统计
    ├── InventoryDrawer.vue    #   背包侧边抽屉
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
    → engine.generateEvent() 生成下一事件（同场景或换场景）
      → selectScene / selectSituation / buildEventText / buildOptions

使用物品（从背包）
  → handleUseItem() → useItem() 应用效果
  → rebuildCurrentOptions() 刷新选项（背包满状态变化）

战斗（全屏对话式界面）
  → 玩家选择武器（≤2 件背包武器）或策略（4 中随机 2）
  → resolveCombatRound() → d6 骰子检定 + 武器/特征加成
  → 玩家消息显示在右侧，丧尸反击显示在左侧
  → 可一键跳过（单次检定）或逃跑
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
  }
}
```

**type 对应的 effects 字段：**
- `weapon`: `damage` (d6 骰子加成), `noise` (1-10), `durability`
- `armor`: `damageReduction` (0-1), `durability`, `headProtection`, `gasProtection`
- `food`: `hunger` (正值增加), `thirst` (可能为负), `sanity`
- `drink`: `thirst`, `hunger`, `sanity`
- `medical`: `hp`, `infection` (负值降低), `sanity`, `stopBleeding`
- `tool`/`key`/`misc`: 通常无 effects，靠 tags 驱动判定

**战斗中的武器**：无需装备，只要在背包中即可在战斗中使用。每回合随机提供 ≤2 件武器作为攻击选项，伤害 = d6 + weapon.effects.damage。

### 场景 (scenes.ts)

```js
scenes = {
  sceneId: {
    id: 'sceneId',
    name: '显示名称',
    desc: '场景描述文本（到达时显示）',
    tags: ['室内', '医疗', '黑暗'],  // 影响情况选择权重
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
        tags: ['搜索', '潜行'],        // 影响遗留标签和叙事类型
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
- 背包满时，`['搜索', '采集']` 标签的选项自动标记为不可用，显示"背包已满"

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

## 战斗系统

全屏对话式界面，类似 DialogPanel 覆盖层。

- **界面布局**：左侧丧尸名称+特征描述，中间战斗日志（玩家右对齐/丧尸左对齐），下方选项区
- **武器选项**：每回合从背包随机取 ≤2 件武器（无需装备），伤害 = d6 骰子 + weapon.effects.damage
- **策略选项**：4 个基础策略中随机 2 个：
  - ⚔️ 正面强攻 — 无特殊加成
  - 🎯 精准打击 — 对庞大/缓慢型 +2，消耗 5 理智，需理智≥30
  - 🛡️ 防守反击 — 受伤减半，对快速/灵敏型 +1
  - 🔍 寻找弱点 — 骰 4+ 伤害翻倍，消耗 8 理智，需理智≥40
- **逃跑 + 一键**：在同一行。一键为单次检定，成功则消耗 HP 结束战斗
- **丧尸反击**：每回合玩家行动后丧尸反击，可能造成感染

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

  // 背包（武器无需装备即可战斗使用）
  inventory: [],      // [{...item, _count}, ...]
  maxInventory: 6,
  equippedWeapon: null,  // 不再用于战斗，仅保留兼容
  equippedArmor: null,

  // 场景
  currentScene: null,    // scenes 中的 id
  sceneActionCount: 0,   // 当前场景行动次数（≥3 出现离开选项）
  lastSituationId: null, // 上次情景 id（避免重复）
  scenesVisited: [],     // 已访问的场景（地图解锁依据）

  // 日志
  journal: [],  // [{text, time, type, id, turnId}, ...] 最近 30 条

  // 剧情标记
  npcsMet: [], npcRelations: {}, legacyTags: [],
  sacrificeTriggered, safeZoneJoined, labDiscovered,
}
```

## 时间系统

- 每行动推进 **1 小时**（`dayCount += 1/24`）
- 开局随机：早晨 6-10 点（60%）或傍晚 16-20 点（40%）
- **疲劳惩罚**（`hoursAwake` 累加）：
  - ≥8h：每行动 -2 理智，8h 警告一次
  - ≥10h：每行动 -4 理智、-1HP
  - ≥12h：每行动 -8 理智、-2HP，12h 警告一次
- **休息**可重置 `hoursAwake = 0`，额外跳过 6-8h
- 夜间（20:00-6:00）和疲劳时，休息事件出现概率提升

## 地图系统

- 仅可传送到 `scenesVisited` 中已探索的场景
- 未探索地点完全隐藏（只显示 `?` + `???`）
- 已解锁地点显示消耗：饱腹 `-N`（红色半透明）+ 口渴 `-M`（蓝色半透明）
- 旅行消耗：饱腹 -3~6 + 口渴 -2~4（基于场景危险度）
- 探索新区域通过"转移阵地"选项随机前往

## How to Extend

### 添加新物品
在 `src/data/items.ts` 的 `itemDB` 中添加新条目，遵循上方 Data Format。物品 id 自动可用于 `requireItems` 判定。type 为 `weapon` 的物品会自动出现在战斗武器选项中。

### 添加新场景
在 `src/data/scenes.ts` 的 `scenes` 对象中添加。如需按区域分组（如"医院剧情组"包含多个相关场景），可创建 `src/data/scenes/hospital.ts` 等文件，然后在 `src/data/scenes.ts` 中 `import` 并合并。

### 添加新情况
在 `src/data/situations.ts` 的 `situations` 对象中添加。选项 id 会被 `buildResultText` 的路由逻辑识别——如需新的叙事类型，在 `engine.ts` 的 `buildResultText` 中追加对应分支。

### 添加新 NPC
1. 在 `src/data/npcs/` 下新建角色文件（如 `dr_smith.ts`），导出完整 NPC 对象（含 `dialogueTree`）。
2. 在 `src/data/npcs/index.ts` 中 `import` 并加入 `npcDB`。
无需修改引擎层或组件层。NPC 通过固定剧情事件触发，不再随机遭遇。

### 添加新结局
在 `src/data/endings.ts` 的 `endingChecks` 数组中追加。`check(state)` 在每次行动后调用。

### 添加新选项类型叙事
`engine.ts` 的 `buildResultText` 函数按 `option.id` 和 `option.tags` 路由到不同叙事模板。新增类型时在此处追加分支。

### 添加全新数据类别
若需全新的数据类别（如"帮派势力"、"派系声望"等）：
1. 在 `src/data/` 下创建纯数据文件（如 `factions.ts`）
2. 在 `src/data/index.ts` 中添加一行 `export { factionDB } from './factions.ts'`（Vite 将 `.ts` 解析为实际文件）
3. 在 `src/game/` 下创建对应的工具函数文件（如 `faction-utils.ts`）

### 添加新战斗策略
在 `engine.ts` 的 `combatStrategies` 数组中追加策略对象，包含：
- `id` / `name` / `desc` 
- `defMod`（受伤倍率）
- `sanityCost` / `sanityReq`
- `counterBonus`（`{ trait: bonus }` 特征克制）
- `highRisk`（d6≥4 翻倍）

### 添加新敌人类型
在 `engine.ts` 的 `generateCombat` 的 `enemies` 数组中追加，包含：
- `name` / `hp` / `damage` / `noise` / `lootChance`
- `traits`（数组，匹配策略的 `counterBonus`）
- `desc`（简短描述，显示在战斗界面顶部）

## UI Conventions

- **配色**：背景 `#0D1117`，主文字 `#B0C4DE`，强调 `#E6C37C`，边框 `#2a3a3a`，hover `#1e2a2a`→`#2a3a3a`
- **按钮**：`min-h-[44px]`，`rounded-sm`，1px border，hover 变背景色
- **禁止**：阴影、渐变、模糊效果、纯白文字、高饱和荧光色
- **响应式**：桌面 `max-w-lg mx-auto`（512px），有四周 16px 边距
- **字体**：`JetBrains Mono, Fira Code, Consolas, monospace`，字号 15px
- **面板**：右侧抽屉（手机全屏/桌面 320px），黑色半透明遮罩关闭
- **战斗**：全屏覆盖（如同对话），左侧丧尸描述 → 右侧玩家行动 → 左侧丧尸反击
- **日志**：最近 5 条 `#15202a` 背景加亮，其余略暗，行高 1.6

## Notes

- 所有源文件使用 `.ts` 扩展名（`data/` 和 `game/` 目录），Vue SFC 的 `<script setup>` 带有 `lang="ts"`
- 核心类型定义在 `src/types.ts`（Item, Scene, Situation, NPC, GameState, Combat 等）
- 引擎函数可引入类型：`import type { GameState, Item } from '../types'`
- 导入路径可保留 `.js` 后缀（Vite 自动解析 `.js` → `.ts`），也可省略扩展名
- 日志条目使用自增 `_journalEntryId` 保证唯一 key，`turnId` 字段标记所属回合
- `rebuildCurrentOptions()` 用于在背包变更后刷新选项状态
- 使用 `getCombatStrategies(state, enemy)` 获取当前回合战斗选项
- 休息事件额外跳过 6-8h（`state.dayCount += sleepHours/24`）
- 无武器时战斗选项只显示策略（不显示"拳头"）
