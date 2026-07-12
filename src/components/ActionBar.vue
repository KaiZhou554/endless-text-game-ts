<script setup lang="ts">
import { computed } from 'vue'
const emit = defineEmits(['toggle-inventory', 'toggle-journal', 'toggle-map', 'save-game', 'load-game'])

const props = defineProps({
  gameState: { type: Object, required: true },
})

const effectiveCapacity = computed(() => {
  let cap = props.gameState.maxInventory || 6
  if (props.gameState.inventory.some((i: any) => i.id === 'backpack')) {
    cap += 2
  }
  return cap
})

function hoverBg(e: Event, color: string) {
  const el = e.currentTarget as HTMLElement | null
  if (el) el.style.background = color
}
</script>

<template>
  <div class="w-full border-t flex items-stretch"
       style="border-color: #2a3a3a; background: #0D1117;">
    <button
      @click="emit('toggle-inventory')"
      @mouseenter="hoverBg($event, '#1e2a2a')"
      @mouseleave="hoverBg($event, '#0D1117')"
      class="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs
             border-r transition-colors duration-150 min-h-[44px]"
      style="border-color: #2a3a3a; color: #B0C4DE; background: #0D1117;"
    >
      🎒 背包
      <span v-if="gameState.inventory.length > 0"
            class="text-[10px] px-1 rounded-sm"
            style="background: #1e2a2a; color: #E6C37C;">
        {{ gameState.inventory.length }}/{{ effectiveCapacity }}
      </span>
    </button>

    <button
      @click="emit('toggle-journal')"
      @mouseenter="hoverBg($event, '#1e2a2a')"
      @mouseleave="hoverBg($event, '#0D1117')"
      class="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs
             border-r transition-colors duration-150 min-h-[44px]"
      style="border-color: #2a3a3a; color: #B0C4DE; background: #0D1117;"
    >
      📖 日志
    </button>

    <button
      @click="emit('toggle-map')"
      @mouseenter="hoverBg($event, '#1e2a2a')"
      @mouseleave="hoverBg($event, '#0D1117')"
      class="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs
             border-r transition-colors duration-150 min-h-[44px]"
      style="border-color: #2a3a3a; color: #B0C4DE; background: #0D1117;"
    >
      🗺️ 地图
    </button>

    <!-- 简单模式存档按钮 -->
    <template v-if="gameState.mode === 'easy'">
      <button
        @click="emit('save-game')"
        @mouseenter="hoverBg($event, '#1e2a2a')"
        @mouseleave="hoverBg($event, '#0D1117')"
        class="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs
               border-r transition-colors duration-150 min-h-[44px]"
        style="border-color: #2a3a3a; color: #9ACD9D; background: #0D1117;"
      >
        💾 存档
      </button>
      <button
        v-if="gameState.saveSlot"
        @click="emit('load-game')"
        @mouseenter="hoverBg($event, '#1e2a2a')"
        @mouseleave="hoverBg($event, '#0D1117')"
        class="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs
               transition-colors duration-150 min-h-[44px]"
        style="color: #E6C37C; background: #0D1117;"
      >
        📂 读档
      </button>
    </template>
  </div>
</template>
