# 掉落系统

所有随机物品掉落走同一条管线：`getLootPool()`（`src/game/item-utils.ts`）。

## 快速参考

```ts
import { getLootPool } from './game/item-utils.js'

// 搜索掉落：1-3 件常规物品，带场景偏好
getLootPool(randInt(1, 3), state.inventory, { scene: currentScene })

// 战斗奖励：1-2 件，可能出武器/护甲
getLootPool(count, state.inventory, { quality: 'combat' })
```

## 参数

| 参数 | 默认 | 作用 |
|------|------|------|
| `count` | 3 | 掉落物品数量 |
| `inventory` | `[]` | 玩家背包，用于弹药智能掉落（持枪时 50% 概率掉匹配弹药） |
| `options.scene` | — | 场景对象，`lootTypes` 匹配的类型权重 2x |
| `options.quality` | `'normal'` | `'normal'` = food / drink / medical / misc / tool；`'combat'` = 再加 weapon / armor（weapon/armor 权重 3x） |
| `options.rarity` | — | `'稀有'` 时忽略类型，直接从全物品稀有+池中抽取（匹配 `'稀有'` / `'极稀有'` 标签） |

## 排除物品

在物品定义里设置 `noLoot: true`，该物品排除出所有随机掉落：

```ts
clean_water: {
  id: 'clean_water',
  name: '干净的水',
  type: 'drink',
  // ...
  noLoot: true,  // 只能通过配方制作获得
}
```

`getRandomItem()` 同样过滤 `noLoot` 物品。

## 三个调用点

| 路径 | 位置 | 调用方式 |
|------|------|------|
| 搜索（选项 tags 含 `'搜索'`） | `src/game/engine.ts:192` | `getLootPool(lootCount, state.inventory, { scene: currentScene })` |
| 采集（`option.id === 'harvest'`） | `src/game/engine.ts:207-209` | `getRandomItem('food')` / `getRandomItem('drink')` |
| 战斗胜利后搜刮 | `src/App.vue:314` | `getLootPool(count, gameState.inventory, { quality, rarity })` |

## 战斗奖励逻辑

- d6 = 1-3：空手
- d6 = 4-5：1-2 件，品质取决于 `enemy.lootChance > 0.5`
- d6 = 6：1-2 件，强制 `rarity: '稀有'`——只从稀有+物品池中抽取（保证至少紫色品质）
- `enemy.lootChance > 0.5` → 额外多掉 1 件 + 解锁 combat 品质

## 场景 lootTypes（场景偏好）

场景的 `lootTypes` 字段已被激活。匹配类型的物品权重为 2x，其他类型为 1x。

| 示例 | 效果 |
|------|------|
| `lootTypes: ['medical']` | 医疗物品 2x |
| `lootTypes: ['tool', 'misc']` | 工具和杂物 2x |
| `lootTypes: ['food', 'drink', 'medical']` | 食物、饮品、医疗 2x |

要为新场景添加掉落偏好，在 `src/data/scenes.ts` 中设置 `lootTypes` 即可，无需改动引擎。

## 敌人 lootChance

| 敌人 | lootChance | 效果 |
|------|-----------|------|
| 普通丧尸 | 0.3 | 1 件 normal |
| 变异丧尸 | 0.8 | 2 件 combat |
| 融合体 | 0.7 | 2 件 combat |
| 丧尸犬 | 0.1 | 1 件 normal |
| 臃肿丧尸 | 0.6 | 2 件 combat |

## 添加新物品时的清单

1. 在 `src/data/extensions/items-*.ts` 添加物品定义
2. 如果是配方/任务专属物品 → 加 `noLoot: true`
3. 如果物品有弹药需求 → 设置 `effects.ammo`，确保有对应 `'弹药:xxx'` 标签的弹药物品
4. 运行 `npm run type-check` 确认无类型错误
