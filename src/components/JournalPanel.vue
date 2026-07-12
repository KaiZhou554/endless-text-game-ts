<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'

const props = defineProps({
  gameState: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const scrollRef = ref(null)

const reversedJournal = computed(() => {
  return [...props.gameState.journal].reverse()
})

function getTextStyle(entry) {
  switch (entry.type) {
    case 'warning': return { color: '#E6C37C' }
    case 'danger': return { color: '#c4746e' }
    case 'combat': return { color: '#c4746e' }
    case 'location': return { color: '#9ACD9D' }
    case 'dialogue': return { color: '#7ab8d4' }
    case 'discovery': return { color: '#E6C37C' }
    case 'alliance': return { color: '#9ACD9D' }
    case 'action': return { color: '#5a6a7a' }
    default: return { color: '#B0C4DE' }
  }
}

function formatTime(dayCount) {
  const days = Math.floor(dayCount) + 1
  const hour = Math.floor((dayCount - Math.floor(dayCount)) * 24)
  return `D${days} ${String(hour).padStart(2, '0')}:00`
}
</script>

<template>
  <!-- 遮罩 -->
  <div
    @click="emit('close')"
    class="fixed inset-0 z-40"
    style="background: rgba(0,0,0,0.5);"
  ></div>

  <!-- 抽屉 -->
  <div
    class="fixed top-0 bottom-0 z-50 flex flex-col overflow-hidden
           w-full sm:w-80 right-0"
    style="background: #0D1117; border-left: 1px solid #2a3a3a; padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px);"
  >
    <div class="flex items-center justify-between px-4 py-3 border-b"
         style="border-color: #2a3a3a;">
      <h2 class="text-sm font-bold" style="color: #E6C37C;">📖 日志</h2>
      <button
        @click="emit('close')"
        class="text-sm px-2 py-1 min-h-[44px] border rounded-sm"
        style="color: #c4746e; background: none; border-color: #c4746e; cursor: pointer;"
        @mouseenter="e => { (e.target as HTMLElement).style.background = '#1e1a1a'; (e.target as HTMLElement).style.borderColor = '#d08070' }"
        @mouseleave="e => { (e.target as HTMLElement).style.background = 'none'; (e.target as HTMLElement).style.borderColor = '#c4746e' }"
      >✕ 关闭</button>
    </div>

    <div ref="scrollRef" class="flex-1 overflow-y-auto px-3 py-2 space-y-2">
      <div v-if="reversedJournal.length === 0" class="text-center py-8">
        <p class="text-xs" style="color: #5a6a7a;">还没有任何记录</p>
      </div>
      <div
        v-for="entry in reversedJournal"
        :key="entry.id"
        class="text-xs leading-relaxed border-b pb-2"
        style="border-color: #1e2a2a;"
      >
        <div class="flex justify-between mb-0.5">
          <span class="text-[10px]" style="color: #5a6a7a;">
            {{ formatTime(entry.time) }}
          </span>
          <span class="text-[10px]" style="color: #3a4a4a;">
            #{{ entry.id }}
          </span>
        </div>
        <p :style="getTextStyle(entry)">{{ entry.text }}</p>
      </div>
    </div>
  </div>
</template>
