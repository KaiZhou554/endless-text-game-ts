<script setup lang="ts">
import { computed } from 'vue'
import { getUsedSlots, getEffectiveCapacity } from '../game/state.js'
const emit = defineEmits(['toggle-inventory', 'toggle-journal', 'toggle-map', 'save-game', 'load-game'])

const props = defineProps({
  gameState: { type: Object, required: true },
})

const effectiveCapacity = computed(() => getEffectiveCapacity(props.gameState))
const usedSlots = computed(() => getUsedSlots(props.gameState))
</script>

<template>
  <div class="w-full border-t border-border bg-bg flex items-stretch">
    <button
      @click="emit('toggle-inventory')"
      class="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs
             border-r border-border text-fore bg-bg
             transition-colors duration-150 min-h-[44px] hover:bg-hover"
    >
      🎒 背包
      <span v-if="gameState.inventory.length > 0"
            class="text-[10px] px-1 rounded-sm bg-hover text-accent">
        {{ usedSlots }}/{{ effectiveCapacity }}
      </span>
    </button>

    <button
      @click="emit('toggle-journal')"
      class="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs
             border-r border-border text-fore bg-bg
             transition-colors duration-150 min-h-[44px] hover:bg-hover"
    >
      📖 日志
    </button>

    <button
      @click="emit('toggle-map')"
      class="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs
             border-r border-border text-fore bg-bg
             transition-colors duration-150 min-h-[44px] hover:bg-hover"
    >
      🗺️ 地图
    </button>

    <!-- 简单模式存档按钮 -->
    <template v-if="gameState.mode === 'easy'">
      <button
        @click="emit('save-game')"
        class="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs
               border-r border-border text-success bg-bg
               transition-colors duration-150 min-h-[44px] hover:bg-hover"
      >
        💾 存档
      </button>
      <button
        v-if="gameState.saveSlot"
        @click="emit('load-game')"
        class="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs
               text-accent bg-bg
               transition-colors duration-150 min-h-[44px] hover:bg-hover"
      >
        📂 读档
      </button>
    </template>
  </div>
</template>
