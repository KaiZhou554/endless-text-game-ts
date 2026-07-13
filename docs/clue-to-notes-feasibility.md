# 剧情线索从背包迁移至笔记 — 可行性分析

> 分析日期：2026-07-13

## 一、现状

### 1.1 「笔记」当前是什么

`JournalPanel.vue` 展示的是 `state.journal` —— 一个**游戏操作日志**数组：

```ts
// types.ts
interface JournalEntry {
  text: string    // 日志文本（含 HTML 标签）
  time: number    // 游戏内时间
  type: string    // 'narrative'|'warning'|'danger'|'combat'|'discovery'|...
  id: number      // 自增 ID
  turnId: number  // 回合数
}

// state.ts — journal 初始化
journal: []   // 最近 30 条（超过则 shift 丢弃旧条目）
```

它**不是**一个线索存储系统 — 它是时序日志，有 30 条上限，旧条目会被丢弃。

### 1.2 关键道具当前如何存储

所有 `type='key'` 的物品（共 11 件，`items-key.ts`）走标准背包流程：

```
获得途径                    → addToInventory(state, item)
  ├─ 机遇 lootItem         → App.vue:451
  ├─ NPC 对话 reward       → engine.ts:428
  ├─ 战利品 getLootPool    → engine.ts:194
  └─ 初始物品              → App.vue:97 (仅 crowbar_weapon 等武器)

检查途径                    → 搜索 state.inventory
  ├─ 情景选项 requireItems → hasItem(inventory, itemId)      — events.ts:197
  ├─ 情景选项 requireTags  → hasItemWithTag(inventory, tag)  — events.ts:207
  ├─ NPC 对话 requireItems → inventory.some(...)              — DialogPanel.vue:35
  ├─ NPC 对话 requireTags  → inventory.some(...)              — DialogPanel.vue:41
  └─ 结局条件              → state.inventory.some(...)        — endings.ts:76-78
```

关键道具占用背包格子（默认 2 格/件），参与超重判定。

### 1.3 关键道具总览

| 物品 ID | 名称 | 可消耗? | 有效果? | 纯信息? |
|---------|------|---------|---------|---------|
| `survivor_journal` | 幸存者日记 | 否 | 无 | ✅ |
| `serum_sample` | 血清样本 | 否 | 无 | ❌ 物理 |
| `map_fragment` | 地图碎片 | 否 | 无 | ✅ |
| `research_notes` | 研究笔记 | 否 | 无 | ✅ |
| `veteran_tag` | 战友铭牌 | reusable:false | sanityOneTime:15 | ❌ 物理+效果 |
| `military_id` | 军人身份牌 | 否 | 无 | ❌ 物理 |
| `radio_frequency` | 频率密码本 | 否 | 无 | ✅ |
| `lab_keycard` | 实验室门禁卡 | 否 | 无 | ❌ 物理 |
| `military_map` | 军方战术地图 | usable:true | events:['unlock_all_scenes'] | ✅ |
| `blood_sample_kit` | 血样采集套装 | 否 | 无 | ❌ 物理 |
| `encrypted_drive` | 加密U盘 | 否 | 无 | ❌ 物理 |

---

## 二、方案设计

### 2.1 核心思路

新增 `state.clues: Clue[]` 数组，存储剧情线索。当物品类型为 `key` 时，`addToInventory()` 自动重定向到 `addClue()`。

从「背包」中移除 → 从「笔记」中可见。**线索不占背包格子、不受 30 条上限限制。**

### 2.2 数据结构

```ts
// types.ts — 新增
interface Clue {
  id: string       // 对应物品 ID
  name: string     // 显示名称
  desc: string     // 描述文本
  tags: string[]   // 标签（供 hasItemWithTag 搜索）
  time: number     // 获得时间
}

// GameState — 新增字段
clues: Clue[]
```

### 2.3 物品路由规则

```
addToInventory(state, item)
  ├─ item.type === 'key'  →  addClue(state, item)   ← 新路径
  └─ 其他类型              →  正常加入背包（不变）
```

### 2.4 物品检查统一

所有检查函数**同时搜索背包和线索**：

```ts
// utils.ts — 修改
function hasItem(state, itemId) {
  return state.inventory.some(i => i.id === itemId)
      || state.clues.some(c => c.id === itemId)
}

function hasItemWithTag(state, tag) {
  return state.inventory.some(i => i.tags?.includes(tag))
      || state.clues.some(c => c.tags?.includes(tag))
}
```

### 2.5 可消耗 Key 物品的处理

`veteran_tag` (`reusable: false`, `sanityOneTime: 15`) 和 `military_map` (`usable: true`, `events: ['unlock_all_scenes']`) 有使用效果。迁移到线索后：

- **获得时自动触发** effects 和 events
- 线索列表中不再显示「使用」按钮（已是已获得状态）
- 如果后续需要"从笔记中使用物品"，可扩展但非 MVP

### 2.6 UI 变化

**InventoryDrawer**：过滤掉 `type='key'` 的物品，不显示在背包中。

**JournalPanel**：拆分为两个区域：
```
┌─ 📖 笔记 ────────────────────────┐
│  [线索]  [记录]                   │  ← Tab 切换
│                                   │
│  📋 实验室门禁卡                   │  ← 线索区：
│     BSL-4 授权 — 基因治疗...       │     名称 + 描述
│     获得于 D3 14:00               │
│  ──────────────────────────       │
│  📋 频率密码本                     │
│     记录了各个救援频率...           │
│     获得于 D2 09:00               │
│  ──────────────────────────       │
│  ...                              │
└───────────────────────────────────┘
```

---

## 三、波及范围

### 3.1 引擎层（核心逻辑）

| 文件 | 改动 | 风险 |
|------|------|------|
| `src/game/state.ts` | (1) 初始化 `clues: []` (2) 新增 `addClue()` / `removeClue()` (3) `addToInventory()` 中对 `type='key'` 重定向 | **中** — 所有物品获得路径经过此处 |
| `src/game/utils.ts` | `hasItem()` / `hasItemWithTag()` 增加 clues 搜索 | **低** — 纯查询函数，无副作用 |
| `src/game/engine.ts` | `resolveDialogueOption()` 中的 `hasItem()` 自动兼容（已用 utils） | **无** — 透明 |

### 3.2 组件层（UI）

| 文件 | 改动 | 风险 |
|------|------|------|
| `src/components/JournalPanel.vue` | 拆分线索区/记录区，渲染 `state.clues` | **中** — UI 重构，需保持响应式 |
| `src/components/InventoryDrawer.vue` | 过滤 `type='key'` 物品 | **低** — 一行 filter |
| `src/components/DialogPanel.vue` | `checkOptionAvailable()` 中的 `inventory.some()` → 调用 `hasItem()` | **低** — 替换为统一函数 |

### 3.3 数据层（结局/情景检查）

| 文件 | 改动 | 风险 |
|------|------|------|
| `src/data/endings.ts` | 7 处 `state.inventory.some(i => i.id === 'xxx')` → 加上 `state.clues.some(...)` | **低** — 机械替换 |
| `src/data/extensions/` (情景) | `requireItems` 自动兼容（通过 events.ts 中的 `hasItem()`） | **无** — 透明 |
| `src/data/npcs/` (对话) | `requireItems` 自动兼容（通过 engine.ts 中的 `hasItem()`） | **无** — 透明 |

### 3.4 类型层

| 文件 | 改动 | 风险 |
|------|------|------|
| `src/types.ts` | 新增 `Clue` 接口；`GameState` 增加 `clues: Clue[]` | **低** |

### 3.5 无需改动的文件

- `src/game/engine/events.ts` — `buildOptions()` 使用 `hasItem()`（来自 utils），自动兼容
- `src/game/engine/combat.ts` — 不涉及 key 类型物品
- `src/game/item-utils.ts` — 战利品系统已排除 key 类型（`item.type !== 'key'`），线索通过机遇 `lootItem` 直接给予
- `src/game/world-utils.ts` — 不涉及物品
- `src/game/npc-utils.ts` — 不涉及物品检查
- `src/data/scenes.ts` — 不涉及
- `src/data/modifiers.ts` — 不涉及
- `src/App.vue` — `handleOppDice()` 中的 `lootItem` → `addToInventory()` 路径自动兼容

---

## 四、实施步骤（建议顺序）

### Phase 1 — 数据+引擎层（无 UI 变化，可独立测试）

1. **`src/types.ts`** — 添加 `Clue` 接口 + `GameState.clues`
2. **`src/game/state.ts`** — 添加 `clues: []` 初始化 + `addClue()` / `removeClue()` 函数；修改 `addToInventory()` 对 `type='key'` 重定向
3. **`src/game/utils.ts`** — 修改 `hasItem()` / `hasItemWithTag()` 签名（接收 `state` 或 `clues`）
4. **`src/data/endings.ts`** — 更新 7 处物品检查

**里程碑**: 此阶段完成后，获得 key 物品将不再占用背包空间，结局检查仍正常工作。

### Phase 2 — UI 层

5. **`src/components/InventoryDrawer.vue`** — 过滤 key 类型
6. **`src/components/DialogPanel.vue`** — `checkOptionAvailable()` 改用 `hasItem()`
7. **`src/components/JournalPanel.vue`** — 添加线索 Tab/区域

### Phase 3 — 验证

8. 全量 type-check + 手动测试各结局物品检查路径

---

## 五、风险与注意事项

### 5.1 `hasItem()` 签名变更

当前 `hasItem(inventory, itemId)` 只接收背包数组。需要改为 `hasItem(state, itemId)` 以同时访问 `state.clues`。这会影响所有调用点（约 8 处），但改动是机械的。

### 5.2 `hasItemWithTag()` 同理

当前接收 `inventory` 数组，需改为接收 `state`。

### 5.3 `DialogPanel.vue` 的独立检查

该组件目前直接用 `props.gameState.inventory.some(...)` 而非调用 `hasItem()`。这是为了响应式性能（避免导入）。需要同样增加 `clues` 的检查。

### 5.4 战利品系统不受影响

`getLootPool()` 已明确排除 `type='key'`（`item-utils.ts:107`）。Key 物品仅通过 `lootItem`（机遇）和 `reward`（NPC）获得，两者都走 `addToInventory()` → 自动重定向。

### 5.5 不可堆叠但可重复获得的物品

部分 key 物品 `stackable: false`，如果玩家第二次获得同一线索（例如通过不同机遇），`addClue()` 应去重（静默忽略或更新描述）。

### 5.6 与结局 9/12 的 legacyTags 问题无关

此改动不影响 `legacyTags` 机制。结局 9（电台之王）和结局 12（地下之王）仍需独立的引擎修复（见 `docs/unreachable-endings.md`）。

---

## 六、结论

**可行。** 改动约 8 个文件，核心逻辑清晰，数据层自动兼容度较高。最大工作量在 JournalPanel 的 UI 重构。

建议按 Phase 1 → Phase 2 顺序实施，Phase 1 完成后即可验证核心逻辑正确性。
