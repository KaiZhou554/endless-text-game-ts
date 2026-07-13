# 不可达结局分析

> 分析日期：2026-07-13
> 状态：4 个结局需引擎改动才能触发，留待后续补全

---

## 结局 7：🕯️ 牺牲 — `sacrificeTriggered` 永不设置

**条件**: `state.sacrificeTriggered === true`

**根因**: 全代码库中 `sacrificeTriggered` 仅在以下三处出现：
- `src/types.ts:276` — 类型声明
- `src/game/state.ts:73` — 初始化为 `false`
- `src/data/endings.ts:142` — 结局检查

**没有任何代码将其设为 `true`。**

**修复思路**:
1. 在某条情景选项或 NPC 对话分支中，当玩家选择"救助他人"时设置该标记
2. 例如：NPC 莉娜（Lena）危难时玩家的牺牲选项，或马库斯（Marcus）的救援场景
3. 触发条件建议：`state.sanity < 10`（理智极低时的自我牺牲更有叙事张力）

**涉及文件**:
- `src/game/engine.ts` 或 `src/game/engine/events.ts` — 在选项解析时设置标记
- `src/data/extensions/situations-*.ts` — 添加带有牺牲选项的情景
- `src/game/state.ts` — 如果需要新增 `processEvents` 事件

---

## 结局 8：🏘️ 新家园 — `safeZoneJoined` 永不设置

**条件**: `state.safeZoneJoined === true && state.dayCount >= 7`

**根因**: 全代码库中 `safeZoneJoined` 仅在以下三处出现：
- `src/types.ts:277` — 类型声明
- `src/game/state.ts:74` — 初始化为 `false`
- `src/data/endings.ts:162` — 结局检查

**没有任何代码将其设为 `true`。**

**修复思路**:
1. 创建与"安全区"相关的情景或 NPC 对话，选择加入后设置标记
2. 可关联现有的 `survivor_journal` 物品（已提及"安全区"位置）
3. 建议关联莉娜（Lena）或某个新 NPC 的对话结局

**涉及文件**:
- `src/game/engine.ts` — 在对话/选项解析时设置标记
- `src/data/extensions/situations-social.ts` — 添加安全区相关情景
- `src/data/npcs/lena.ts` — 可在莉娜对话中加入"加入安全区"分支

---

## 结局 9：📻 永不消逝的电波 — `broadcasting` 标签永不设置

**条件**: `state.legacyTags.includes('broadcasting') && state.dayCount >= 21`

**根因 — 两层问题**:

### 问题 A：标签从未被 push
全代码库搜索 `broadcasting`，仅出现在 `src/data/endings.ts:183` 的结局检查中。
没有任何代码执行 `state.legacyTags.push('broadcasting')`。

### 问题 B：`updateLegacyTags()` 每行动清空
`src/game/engine.ts:253-258`:
```ts
function updateLegacyTags(state, option, success) {
  state.legacyTags = []  // ← 每行动清空！
  if (option.tags) {
    if (option.tags.includes('噪音')) state.legacyTags.push('made_noise')
    if (option.tags.includes('隐蔽') || option.tags.includes('潜行')) state.legacyTags.push('was_stealthy')
  }
}
```

`legacyTags` 被设计为"本行动瞬时追踪器"，在 `resolveOption()` 中每调用一次就清空。即使在某处 push 了 `broadcasting`，下一次行动也会被擦除。

**修复思路**:

**方案 A（推荐）**: 改用独立的 `state` 布尔字段替代 legacyTag
- `state.radioBroadcasting = false` → 在玩家使用广播站持续发信时设为 `true`
- 不需要改动 `legacyTags` 的清空机制
- 修改结局检查为 `state.radioBroadcasting === true && state.dayCount >= 21`

**方案 B**: 修改 `updateLegacyTags()` 不清空持久标签
- 引入"持久标签"概念，清空时保留特定标签
- 复杂度更高，不推荐

**涉及文件**:
- `src/types.ts` — 添加 `radioBroadcasting: boolean`
- `src/game/state.ts` — 初始化 + 设置逻辑
- `src/data/endings.ts` — 修改检查条件
- `src/data/extensions/situations-social.ts` — 添加广播相关情景

---

## 结局 12：🕳️ 地下之王 — `underground_lord` 标签永不设置

**条件**: `state.legacyTags.includes('underground_lord') && state.dayCount >= 25`

**根因 — 与结局 9 完全相同**:
- `underground_lord` 从未被 push 到 `legacyTags`
- `updateLegacyTags()` 每行动清空所有标签

**修复思路**:
与结局 9 同理，推荐方案 A：新增独立布尔字段 `state.undergroundLord`。

触发逻辑建议：玩家在特定地下场景（地铁站 `subway`、地下停车场 `parking_garage`）累计行动一定次数后触发，或通过特定情景选项（如建立地下避难所）。

**涉及文件**:
- `src/types.ts` — 添加 `undergroundLord: boolean`
- `src/game/state.ts` — 初始化 + 设置逻辑
- `src/data/endings.ts` — 修改检查条件
- `src/data/extensions/situations-explore.ts` — 添加地下探索相关情景

---

## 建议实施顺序

| 优先级 | 结局 | 理由 |
|--------|------|------|
| 1 | 🕯️ 牺牲 | 最直接 — 只需一个标记 + 一个情景选项 |
| 2 | 🏘️ 新家园 | 同上，且与已有 NPC/物品有关联 |
| 3 | 📻 电台之王 | 需配合遗留标签机制重构，或改用独立字段 |
| 4 | 🕳️ 地下之王 | 同上 |

## 相关背景

此前的分析发现了另外 6 个不可达结局。其中 2 个（🚁 直升机救援、🧬 血清研制）已通过新增 `opportunities-endings.ts` 中的机遇解决（commit `8fd9140`）。其余 5 个结局（尸变、精神崩溃、力竭而亡、孤独幸存者、清道夫）从一开始就是可达的。
