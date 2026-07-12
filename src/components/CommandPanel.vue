<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { itemDB } from '../data/items'
import { addToInventory, modifyStat } from '../game/state'
import type { GameState } from '../types'

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
    const given: string[] = []
    const skipped: string[] = []
    for (const id of args) {
      const item = itemDB[id]
      if (item && addToInventory(props.gameState, item)) {
        given.push(item.name)
      } else {
        skipped.push(id)
      }
    }
    const msgs: string[] = []
    if (given.length) msgs.push('✔ 获得：' + given.join('、'))
    if (skipped.length) msgs.push('✘ 无效或背包满：' + skipped.join('、'))
    result.value = msgs.join(' | ')
  } else if (cmd === 'effect') {
    const applied: string[] = []
    for (const arg of args) {
      const m = arg.match(/^(hp|hunger|thirst|sanity|infection)([+-]\d+)$/)
      if (m) {
        modifyStat(props.gameState, m[1], parseInt(m[2]))
        applied.push(m[1] + m[2])
      } else {
        applied.push('✘' + arg)
      }
    }
    result.value = applied.join(' ')
  } else {
    result.value = '未知命令: /' + cmd + '  (支持: give, effect)'
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
        class="w-full max-w-lg mx-4 mt-4 border rounded-sm p-3 space-y-2"
        style="background: #0D1117; border-color: #2a3a3a; pointer-events: auto;"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold text-white">⌘ 命令面板</span>
          <button
            @click="close"
            class="text-xs px-2 py-1 border rounded-sm transition-colors"
            style="border-color: #c4746e; color: #c4746e; background: none;"
            @mouseenter="(e: MouseEvent) => ((e.target as HTMLElement).style.background = '#1e1a1a')"
            @mouseleave="(e: MouseEvent) => ((e.target as HTMLElement).style.background = 'none')"
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
            class="px-3 py-2 text-sm border rounded-sm min-h-[44px] transition-colors border-[#B0C4DE] text-[#B0C4DE] hover:bg-[#1e2a2a]"
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
