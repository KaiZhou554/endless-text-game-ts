<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { itemDB } from '../data/items'
import { addToInventory, modifyStat, processEvents, addJournalEntry } from '../game/state'
import type { GameState } from '../types'

function wrapItemName(item: any): string {
  if (!item) return ''
  let cls = ''
  if (item.tags?.includes('极稀有')) cls = 'item-rare'
  else if (item.tags?.includes('稀有')) cls = 'item-epic'
  const text = `✢ 获得了：${item.name}`
  return cls ? `<span class="${cls}">${text}</span>` : text
}

const props = defineProps<{
  gameState: GameState
}>()

const visible = ref(false)
const input = ref('')
const result = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function handleCmd() {
  const text = input.value.trim()
  result.value = ''
  if (!text.startsWith('/')) {
    result.value = '命令必须以 / 开头'
    return
  }

  const parts = text.slice(1).split(/\s+/)
  const cmd = parts[0]
  const args = parts.slice(1)

  if (cmd === 'give') {
    let broadcast = false, merge = false
    const ids: string[] = []
    for (const arg of args) {
      if (arg === '-b' || arg === '--broadcast') { broadcast = true; continue }
      if (arg === '-m' || arg === '--merge') { merge = true; continue }
      ids.push(arg)
    }
    const givenItems: any[] = []
    const given: string[] = []
    const skipped: string[] = []
    for (const id of ids) {
      const item = itemDB[id]
      if (item && addToInventory(props.gameState, item)) {
        given.push(item.name)
        givenItems.push(item)
      } else {
        skipped.push(id)
      }
    }
    // 合并广播：所有物品一条消息，稀有度取最高
    if ((broadcast || merge) && givenItems.length > 0) {
      if (merge) {
        const names = givenItems.map(i => i.name).join('、')
        let cls = ''
        if (givenItems.some(i => i.tags?.includes('极稀有'))) cls = 'item-rare'
        else if (givenItems.some(i => i.tags?.includes('稀有'))) cls = 'item-epic'
        const text = `✢ 获得了：${names}`
        addJournalEntry(props.gameState, cls ? `<span class="${cls}">${text}</span>` : text, 'action')
      } else {
        for (const item of givenItems) {
          addJournalEntry(props.gameState, wrapItemName(item), 'action')
        }
      }
    }
    const msgs: string[] = []
    if (given.length) msgs.push('✔ 获得：' + given.join('、'))
    if (skipped.length) msgs.push('✘ 无效或背包满：' + skipped.join('、'))
    result.value = msgs.join(' | ')
  } else if (cmd === 'event') {
    if (args.length === 0) {
      result.value = '用法: /event <eventId>  可用: clear_fatigue, heal_40_percent_missing, unlock_all_scenes, rest_sleep_hours'
    } else {
      processEvents(props.gameState, args)
      result.value = '✔ 触发事件: ' + args.join(', ')
    }
  } else if (cmd === 'effect') {
    const alias: Record<string, string> = { sm: 'hp', bf: 'hunger', kk: 'thirst', lz: 'sanity', gr: 'infection' }
    const applied: string[] = []
    for (const arg of args) {
      const m = arg.match(/^(hp|hunger|thirst|sanity|infection|sm|bf|kk|lz|gr)[:：]?([+-]?\d+)$/)
      if (m) {
        const stat = alias[m[1]] || m[1]
        modifyStat(props.gameState, stat, parseInt(m[2]))
        applied.push(stat + m[2])
      } else {
        applied.push('✘' + arg)
      }
    }
    result.value = applied.join(' ')
  } else {
    result.value = '未知命令: /' + cmd + '  (支持: give, effect, event)'
  }
}

function open() {
  visible.value = true
  input.value = ''
  result.value = ''
  nextTick(() => inputRef.value?.focus())
}

function close() {
  visible.value = false
}

function toggle() {
  if (visible.value) {
    close()
  } else {
    open()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault()
    toggle()
  }
  if (e.key === 'Escape' && visible.value) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-x-0 top-0 z-50 flex justify-center"
      style="pointer-events: none;"
    >
      <div
        class="w-full max-w-lg mx-4 mt-4 border rounded-sm p-3 space-y-1.5"
        style="background: #0D1117; border-color: #2a3a3a; pointer-events: auto;"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold text-white">⌘ 命令面板</span>
          <button
            @click="close"
            class="text-xs px-2 py-1 border rounded-sm transition-colors border-[#c4746e] text-[#c4746e] hover:bg-[#1e1a1a] active:bg-[#2a1515]"
            style="background: none;"
          >
            ✕
          </button>
        </div>

        <!-- Input row -->
        <div class="flex gap-2">
          <input
            ref="inputRef"
            v-model="input"
            @keydown.enter="handleCmd"
            placeholder="输入命令"
            class="flex-1 px-2 py-1.5 text-sm border rounded-sm outline-none placeholder-gray-600"
            style="background: #1a1f1f; border-color: #2a3a3a; color: #B0C4DE;"
          />
          <button
            @click="handleCmd"
            class="text-xs px-2 py-1 border rounded-sm transition-colors border-[#B0C4DE] text-[#B0C4DE] hover:bg-[#1e2a2a] active:bg-[#253535]"
            style="background: none;"
          >
            ⏎
          </button>
        </div>

        <!-- Result -->
        <div
          v-if="result"
          class="text-sm leading-relaxed"
          style="color: #9ACD9D;"
        >
          {{ result }}
        </div>
      </div>
    </div>
  </Teleport>
</template>
