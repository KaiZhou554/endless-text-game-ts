<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  gameState: { type: Object, required: true },
})

// 状态条配置
const bars = computed(() => [
  {
    label: '生命',
    icon: '❤️',
    value: props.gameState.hp,
    max: props.gameState.maxHp,
    color: '#c4746e',
    shortLabel: 'HP',
  },
  {
    label: '饱腹',
    icon: '🍖',
    value: props.gameState.hunger,
    max: props.gameState.maxHunger,
    color: '#E6C37C',
    shortLabel: 'HUN',
  },
  {
    label: '口渴',
    icon: '💧',
    value: props.gameState.thirst,
    max: props.gameState.maxThirst,
    color: '#7ab8d4',
    shortLabel: 'THR',
  },
  {
    label: '理智',
    icon: '🧠',
    value: props.gameState.sanity,
    max: props.gameState.maxSanity,
    color: '#9ACD9D',
    shortLabel: 'SAN',
  },
  {
    label: '感染',
    icon: '🦠',
    value: props.gameState.infection,
    max: props.gameState.maxInfection,
    color: '#8b5cf6',
    shortLabel: 'INF',
  },
])

function barWidth(value, max) {
  return Math.max(0, Math.min(100, (value / max) * 100)) + '%'
}

function barColor(value, baseColor) {
  if (value < 20) return '#c4746e' // 红色警告
  if (value < 40) return '#E6C37C' // 黄色警告
  return baseColor
}

function formatTimeOfDay(dayCount) {
  const hour = ((dayCount % 1) * 24 + 24) % 24
  if (hour >= 5 && hour < 8) return '早晨'
  if (hour >= 8 && hour < 12) return '上午'
  if (hour >= 12 && hour < 14) return '正午'
  if (hour >= 14 && hour < 18) return '下午'
  if (hour >= 18 && hour < 20) return '黄昏'
  return '🌙 夜晚'
}
</script>

<template>
  <div class="w-full border-b px-2 sm:px-4 py-1.5 sm:py-2 flex-shrink-0" style="border-color: #2a3a3a; background: #0D1117;">
    <!-- PC 端：完整显示 -->
    <!-- 第一行：生命/饱腹/口渴 -->
    <div class="hidden sm:flex w-full gap-x-4">
      <div
        v-for="bar in bars.slice(0, 3)"
        :key="bar.label"
        class="flex items-center gap-1.5 min-w-0"
        style="flex: 1 1 100px;"
      >
        <span class="text-xs whitespace-nowrap" style="color: #5a6a7a;">
          {{ bar.icon }} {{ bar.label }}
        </span>
        <span class="text-xs font-bold min-w-[2rem] tabular-nums"
              :style="{ color: barColor(bar.value, bar.color) }">
          {{ bar.value }}
        </span>
        <div class="flex-1 h-1.5 min-w-[30px]" style="background: #1e2a2a;">
          <div
            class="h-full transition-all duration-300"
            :style="{
              width: barWidth(bar.value, bar.max),
              background: barColor(bar.value, bar.color),
            }"
          ></div>
        </div>
      </div>
    </div>
    <!-- 第二行：理智 + 感染 + 时间 -->
    <div class="hidden sm:flex w-full gap-x-4 mt-1">
      <div
        v-for="bar in bars.slice(3)"
        :key="bar.label"
        class="flex items-center gap-1.5 min-w-0"
        style="flex: 1 1 100px;"
      >
        <span class="text-xs whitespace-nowrap" style="color: #5a6a7a;">
          {{ bar.icon }} {{ bar.label }}
        </span>
        <span class="text-xs font-bold min-w-[2rem] tabular-nums"
              :style="{ color: barColor(bar.value, bar.color) }">
          {{ bar.value }}
        </span>
        <div class="flex-1 h-1.5 min-w-[30px]" style="background: #1e2a2a;">
          <div
            class="h-full transition-all duration-300"
            :style="{
              width: barWidth(bar.value, bar.max),
              background: barColor(bar.value, bar.color),
            }"
          ></div>
        </div>
      </div>
      <!-- 天数 + 时段 + 疲劳 -->
      <div class="flex items-center gap-1 ml-auto">
        <span class="text-xs font-bold tabular-nums" style="color: #E6C37C;">
          D{{ Math.floor(gameState.dayCount) + 1 }} {{ formatTimeOfDay(gameState.dayCount) }}
        </span>
        <span v-if="(gameState.hoursAwake || 0) >= 12" class="text-[10px]" :style="{ color: (gameState.hoursAwake || 0) >= 20 ? '#c4746e' : '#E6C37C' }">
          😪 {{ Math.floor(gameState.hoursAwake || 0) }}h
        </span>
      </div>
    </div>

    <!-- 手机端：紧凑显示 -->
    <div class="flex sm:hidden items-center gap-1">
      <div
        v-for="bar in bars"
        :key="bar.label"
        class="flex-1 flex flex-col items-center min-w-0"
      >
        <span class="text-[10px]" style="color: #5a6a7a;">{{ bar.shortLabel }}</span>
        <div class="w-full h-1 mt-0.5" style="background: #1e2a2a;">
          <div
            class="h-full transition-all duration-300"
            :style="{
              width: barWidth(bar.value, bar.max),
              background: barColor(bar.value, bar.color),
            }"
          ></div>
        </div>
        <span class="text-[10px] font-bold mt-0.5 tabular-nums"
              :style="{ color: barColor(bar.value, bar.color) }">
          {{ bar.value }}
        </span>
      </div>
      <span class="text-[10px] font-bold ml-1 tabular-nums" style="color: #E6C37C; min-width: 24px;">
        D{{ Math.floor(gameState.dayCount) + 1 }}
      </span>
      <span v-if="(gameState.hoursAwake || 0) >= 12" class="text-[9px]" :style="{ color: (gameState.hoursAwake || 0) >= 20 ? '#c4746e' : '#E6C37C' }">
        😪{{ Math.floor(gameState.hoursAwake || 0) }}h
      </span>
    </div>
  </div>
</template>
