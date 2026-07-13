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
    case 'warning': return { color: 'var(--color-accent)' }
    case 'danger': return { color: 'var(--color-danger)' }
    case 'combat': return { color: 'var(--color-danger)' }
    case 'location': return { color: 'var(--color-success)' }
    case 'dialogue': return { color: 'var(--color-info)' }
    case 'discovery': return { color: 'var(--color-accent)' }
    case 'alliance': return { color: 'var(--color-success)' }
    case 'action': return { color: 'var(--color-muted)' }
    default: return { color: 'var(--color-fore)' }
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
    class="fixed inset-0 z-40 bg-overlay"
  ></div>

  <!-- 抽屉 -->
  <div
    class="fixed top-0 bottom-0 z-50 flex flex-col overflow-hidden
           w-full sm:w-80 right-0 bg-bg border-l border-border
           pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
  >
    <div class="flex items-center justify-between border-b border-border">
      <h2 class="text-sm font-bold text-accent">📖 日志</h2>
      <button
        @click="emit('close')"
        class="text-sm min-h-11 border rounded-sm
               text-danger bg-transparent border-danger cursor-pointer
               hover:bg-close-hover hover:border-close-hover-border"
      >✕ 关闭</button>
    </div>

    <div ref="scrollRef" class="flex-1 overflow-y-auto space-y-2">
      <div v-if="reversedJournal.length === 0" class="text-center">
        <p class="text-xs text-muted">还没有任何记录</p>
      </div>
      <div
        v-for="entry in reversedJournal"
        :key="entry.id"
        class="text-xs leading-relaxed border-b border-hover"
      >
        <div class="flex justify-between">
          <span class="text-[10px] text-muted">
            {{ formatTime(entry.time) }}
          </span>
          <span class="text-[10px] text-timestamp">
            #{{ entry.id }}
          </span>
        </div>
        <p :style="getTextStyle(entry)">{{ entry.text }}</p>
      </div>
    </div>
  </div>
</template>
