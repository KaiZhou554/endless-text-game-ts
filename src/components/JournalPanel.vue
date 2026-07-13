<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  gameState: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const clues = computed(() => props.gameState.clues || [])

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
      <h2 class="text-sm font-bold text-accent">📖 笔记</h2>
      <button
        @click="emit('close')"
        class="text-sm min-h-11 border rounded-sm
               text-danger bg-transparent border-danger cursor-pointer
               hover:bg-close-hover hover:border-close-hover-border"
      >✕ 关闭</button>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-if="clues.length === 0" class="text-center py-8">
        <p class="text-xs text-muted">还没有收集到任何线索</p>
        <p class="text-[10px] text-muted mt-1">探索世界，线索会自动记录在这里</p>
      </div>
      <div v-else class="space-y-1">
        <div
          v-for="clue in clues"
          :key="clue.id"
          class="border-b border-hover"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-accent">{{ clue.name }}</span>
            <span class="text-[10px] text-muted">{{ formatTime(clue.time) }}</span>
          </div>
          <p class="text-[11px] leading-relaxed text-muted mt-0.5 mb-1">{{ clue.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
