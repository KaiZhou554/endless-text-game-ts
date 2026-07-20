# 丧尸末日生存 · 纯文字冒险

Vue 3 + TypeScript + Tailwind CSS v4 单页文字冒险游戏。

## Architecture

项目采用严格三层架构：

```
Data → Engine → Components
```

### Data (`src/data`)

- 纯数据。
- 不包含业务逻辑。
- 所有游戏内容（物品、场景、NPC、机遇、结局等）均放在这里。
- 新内容优先放入 `extensions/`，保持文件按主题拆分。

### Engine (`src/game`)

- 游戏规则与业务逻辑。
- 必须保持纯 TypeScript。
- 不依赖 Vue 组件。
- 能写成纯函数就不要依赖全局状态。

### Components (`src/components`)

- 负责 UI。
- 不实现业务逻辑。
- 不直接修改游戏规则。

---

## Development Rules

修改代码时遵循以下原则：

- 优先复用已有实现。
- 不重复实现已有功能。
- 保持数据驱动。
- 保持类型安全。
- 尽量减少修改范围。

新增功能优先：

1. 扩展数据
2. 扩展 Engine
3. 最后修改 UI

不要因为一个需求重构整个系统。

---

## Data Rules

新增内容时：

- 优先追加，而不是修改已有内容。
- 保持现有数据结构一致。
- 使用已有字段。
- 特殊行为统一走 `events`。
- 不新增重复的数据格式。

如果已有工具函数能够完成需求，请直接复用。

---

## UI Rules

所有颜色统一来自：

```
src/assets/main.css
```

禁止：

- 硬编码颜色
- JS Hover
- Shadow
- Blur
- Gradient
- 高饱和颜色
- 纯白文字

统一要求：

- Hover 使用 Tailwind `hover:*`
- Button 使用已有样式
- 保持响应式布局
- 保持终端风格 UI

不要直接操作 DOM。

---

## Style

保持项目已有代码风格：

- Composition API
- TypeScript
- Tailwind CSS
- 小函数
- 数据驱动
- 少副作用

命名保持现有风格，不要自行创造新的命名体系。

---

## When Adding Features

新增功能时优先检查：

- 是否已有类似实现？
- 是否已有工具函数？
- 是否已有数据结构？
- 是否已有事件系统可以复用？

只有确实无法扩展时才新增新的结构。

---

## Before Refactoring

不要主动重构。

除非满足以下情况：

- 用户明确要求。
- 明显 Bug。
- 明显重复代码。
- 能减少复杂度且不改变行为。

否则保持原有实现。

---

## Notes

- 所有源文件使用 TypeScript。
- 核心类型定义位于 `src/types.ts`。
- Engine 不依赖 Vue。
- Data 不包含逻辑。
- Components 不包含游戏规则。
- 修改时优先保持兼容。
- 优先阅读已有代码，再开始实现。