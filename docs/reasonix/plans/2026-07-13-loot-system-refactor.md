# Loot 系统统一重构

> **For agentic workers:** implement this plan task-by-task — dispatch a fresh subagent per task with the native `task` tool (recommended for quality), or use the superpowers-executing-plans skill to work through it inline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 统一三个独立掉落路径（搜索/战斗/采集）到单一 `getLootPool()` 管线，激活 `scene.lootTypes` 和 `enemy.lootChance` 这两个死数据，并引入 `'非掉落'` 标签排除机制。

**Architecture:** `getLootPool()` 成为所有随机物品生成唯一入口，支持场景类型偏好（`scene.lootTypes` 2x 权重）、品质层级（`normal`/`combat`）、和标签过滤（`'非掉落'` 物品不进入任何随机池）。战斗奖励从硬编码 ID 数组切换为 `getLootPool`。`items-for-tasks.ts` 被接入桶文件，`clean_water` 标记 `'非掉落'`。

**Tech Stack:** TypeScript + Vue 3 响应式状态，纯函数引擎层。

---

### Task 1: 添加 `'非掉落'` 标签过滤到 `getRandomItem` 和 `getLootPool`

**Files:**
- Modify: `src/game/item-utils.ts`

- [ ] **Step 1: 在 getItemsByType 和取值逻辑中加入 noLoot 过滤**

修改 `getLootPool` 的类型取值，过滤掉含 `'非掉落'` 标签的物品。同时修改 `getRandomItem` 的返回逻辑。

`getLootPool` 中 `getItemsByType(type)` 调用后，过滤 `'非掉落'`：

```ts
// 在 getLootPool 的 for 循环中，line 73 附近
const pool = getItemsByType(type).filter(item => !item.tags.includes('非掉落'))
if (pool.length === 0) continue  // 该类型无可掉落物品，跳过
loot.push(weightedPickFromPool(pool, typeWeights[type]))
```

`getRandomItem` 中也加过滤：

```ts
export function getRandomItem(type: any = null) {
  let pool = type ? getItemsByType(type) : Object.values(itemDB)
  pool = pool.filter((item: any) => !item.tags.includes('非掉落'))
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}
```

同样的过滤也要加到弹药智能掉落的 `getItemsByTag(ammoTag)` 之后（line 67）：

```ts
const ammoPool = getItemsByTag(ammoTag).filter(item => !item.tags.includes('非掉落'))
```

- [ ] **Step 2: 类型检查**

```bash
npm run type-check
```

Expected: 无新增类型错误。

---

### Task 2: 接入 `items-for-tasks.ts` + 标记 `clean_water`

**Files:**
- Modify: `src/data/extensions/items-for-tasks.ts`
- Modify: `src/data/items.ts`

- [ ] **Step 1: 重命名导出避免冲突**

`items-for-tasks.ts` 当前导出 `extras`，与 `items-extras.ts` 重名。改为 `taskItems`：

```ts
// src/data/extensions/items-for-tasks.ts
// 将 export const extras 改为：
export const taskItems: ItemDB = {
  dirty_water: {
    // ... 保持不变
  },
  clean_water: {
    // ... 添加 '非掉落' 标签
    tags: ['饮品', '口渴:+16', '理智:+2', '非掉落'],
    // ... 其余保持不变
  },
}
```

- [ ] **Step 2: 在桶文件中接入**

```ts
// src/data/items.ts — 添加 import 并展开
import { taskItems } from './extensions/items-for-tasks'

export const itemDB: ItemDB = {
  ...weapons,
  ...supplies,
  ...equipment,
  ...keyItems,
  ...extras,
  ...taskItems,
} as ItemDB
```

- [ ] **Step 3: 类型检查**

```bash
npm run type-check
```

Expected: `dirty_water` 和 `clean_water` 现在可被 `itemDB` 引用，类型无报错。

---

### Task 3: `getLootPool` 支持场景类型偏好

**Files:**
- Modify: `src/game/item-utils.ts`

- [ ] **Step 1: 扩展 `getLootPool` 签名，加入可选 `options` 参数**

```ts
interface LootOptions {
  scene?: { lootTypes: string[] }  // 场景对象（只需 lootTypes 字段）
  quality?: 'normal' | 'combat'     // 品质层级
}

export function getLootPool(count = 3, inventory: any[] = [], options: LootOptions = {}) {
  const loot: any[] = []
  const baseTypes = ['food', 'drink', 'medical', 'misc', 'tool']
  const combatTypes = ['weapon', 'armor']
  const types = options.quality === 'combat'
    ? [...baseTypes, ...combatTypes]
    : [...baseTypes]

  // 场景类型偏好权重：lootTypes 中匹配的类型权重 x2
  const typeWeights: Record<string, number> = {}
  if (options.scene?.lootTypes) {
    for (const t of types) {
      typeWeights[t] = options.scene.lootTypes.includes(t) ? 2 : 1
    }
  }
  // ... 其余逻辑，用 types 和 typeWeights
```

- [ ] **Step 2: 修改类型随机选择逻辑，使用加权**

将原来的 `const type = types[Math.floor(Math.random() * types.length)]` 替换为加权选择：

```ts
// 加权随机选类型
function pickWeightedType(types: string[], weights: Record<string, number>): string {
  const total = types.reduce((sum, t) => sum + (weights[t] || 1), 0)
  let r = Math.random() * total
  for (const t of types) {
    r -= weights[t] || 1
    if (r <= 0) return t
  }
  return types[types.length - 1]
}

// 在 for 循环中使用
const type = pickWeightedType(types, typeWeights)
```

- [ ] **Step 3: 弹药智能掉落逻辑保持不变**（line 64-71，misc 替换逻辑仍然生效）

- [ ] **Step 4: 类型检查**

```bash
npm run type-check
```

---

### Task 4: `engine.ts` 搜索路径传递场景信息

**Files:**
- Modify: `src/game/engine.ts`

- [ ] **Step 1: 在搜索 loot 生成处传入当前场景**

在 `applySuccessEffects` 中（line 188-194），将场景信息传给 `getLootPool`：

```ts
function applySuccessEffects(result: any, option: any, state: any) {
  const lootChance = option.tags && option.tags.includes('搜索') ? 0.9 : 0
  if (chance(lootChance)) {
    const lootCount = randInt(1, 3)
    const currentScene = state.currentScene ? scenes[state.currentScene] : null
    const loot = getLootPool(lootCount, state.inventory, { scene: currentScene })
    for (const item of loot) {
      if (addToInventory(state, item)) result.loot.push(item)
    }
  }
  // ... harvest 部分不变（getRandomItem 内部已过滤 '非掉落'）
```

注意 `scenes` 已在 line 6 import。

- [ ] **Step 2: 类型检查**

```bash
npm run type-check
```

---

### Task 5: 战斗奖励切换到 `getLootPool`

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: 添加 import**

在 App.vue 顶部添加 `getLootPool` import：

```ts
import { getLootPool } from './game/item-utils.js'
```

- [ ] **Step 2: 删除 `combatRewardPools` 常量**

删除 lines 294-297：
```ts
// 删除以下内容
const combatRewardPools = {
  small: ['bandage', 'canned_beans', 'energy_bar', 'water_bottle', 'painkillers'],
  big: ['pistol', 'shotgun', 'first_aid_kit', 'antibiotics', 'antidote', 'military_rations', 'crossbow', 'axe'],
}
```

- [ ] **Step 3: 重写 `handleCombatRewardDice()`**

使用 `getLootPool` 替代硬编码池，并利用 `enemy.lootChance`：

```ts
function handleCombatRewardDice() {
  const roll = Math.floor(Math.random() * 6) + 1
  combatRewardRoll.value = roll
  combatRewardRolled.value = true

  const diceGlyphs = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
  const glyph = diceGlyphs[roll] + ' '

  if (roll <= 3) {
    combatRewardText.value = `${glyph}这具丧尸身上空无一物。你叹了口气，准备离开。`
    addJournalEntry(gameState, `${glyph} 搜刮尸体：什么都没有。`, 'action')
    setTimeout(() => finishCombatReward(), 1500)
  } else {
    // 根据 enemy.lootChance 决定品质和数量
    const enemy = combatState.value?.enemy
    const lootChance = enemy?.lootChance ?? 0.3
    const quality: 'normal' | 'combat' = roll === 6 ? 'combat' : (lootChance > 0.5 ? 'combat' : 'normal')
    const count = lootChance > 0.5 ? 2 : 1

    const loot = getLootPool(count, gameState.inventory, { quality })
    if (loot.length > 0) {
      const added: any[] = []
      for (const item of loot) {
        if (addToInventory(gameState, item)) {
          added.push(item)
        }
      }
      if (added.length > 0) {
        const itemNames = added.map((i: any) => i.name).join('、')
        const prefix = roll === 6 ? '你仔细搜索，找到了：' : '你在尸体旁发现了一些物资：'
        combatRewardText.value = `${glyph}${prefix}${itemNames}。`
        for (const item of added) {
          addJournalEntry(gameState, wrapRewardText(`${glyph} 搜刮尸体：获得 `, item, '。'), 'action')
        }
      } else {
        combatRewardText.value = `${glyph}你翻找了一番，但背包已经满了。`
        addJournalEntry(gameState, `${glyph} 搜刮尸体：背包满了！`, 'action')
      }
    } else {
      combatRewardText.value = `${glyph}这具丧尸身上空无一物。`
      addJournalEntry(gameState, `${glyph} 搜刮尸体：什么都没有。`, 'action')
    }
    setTimeout(() => finishCombatReward(), roll === 6 ? 2500 : 2000)
  }
}
```

- [ ] **Step 4: 类型检查**

```bash
npm run type-check
```

---

### Task 6: 全量类型检查 + 验证

**Files:**
- (验证，不改代码)

- [ ] **Step 1: 全量类型检查**

```bash
npm run type-check
```

Expected: 0 errors。

- [ ] **Step 2: 生产构建验证**

```bash
npm run build
```

Expected: 构建成功，`dist/` 生成。

---

### 验证检查清单

构建通过后手动验证以下场景：

1. **`clean_water` 不在搜索掉落中** — 确认标签 `'非掉落'` 生效
2. **`dirty_water` 仍在搜索掉落中** — 确认它没有 `'非掉落'` 标签且 type=`drink` 仍在池中
3. **场景 `lootTypes` 生效** — 在药房（`lootTypes: ['medical']`）搜索更倾向于出医疗物品
4. **战斗奖励正常** — d6=4-5 出常规物品，d6=6 可能出武器
5. **高 `lootChance` 敌人**（如变异丧尸 0.8、融合体 0.7）掉更好的战利品
