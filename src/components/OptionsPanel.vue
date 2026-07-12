<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  options: { type: Array, required: true },
  gameState: { type: Object, required: true },
  disabled: { type: Boolean, required: true },
})

const emit = defineEmits(['select-option'])

function selectOption(option: any) {
  if (!option.available || props.disabled) return
  emit('select-option', option)
}

function optionStyle(option: any) {
  if (!option.available) {
    return {
      background: '#0D1117',
      borderColor: '#2a3a3a',
      color: '#5a6a7a',
      cursor: 'not-allowed',
      opacity: '0.5',
    }
  }
  // 根据标签返回不同边框颜色
  if (option.tags && option.tags.includes('战斗')) {
    return {
      background: '#0D1117',
      borderColor: '#c4746e',
      color: '#c4746e',
      cursor: 'pointer',
    }
  }
  if (option.tags && (option.tags.includes('搜索') || option.tags.includes('采集'))) {
    return {
      background: '#0D1117',
      borderColor: '#E6C37C',
      color: '#E6C37C',
      cursor: 'pointer',
    }
  }
  if (option.tags && (option.tags.includes('救援') || option.tags.includes('帮助'))) {
    return {
      background: '#0D1117',
      borderColor: '#9ACD9D',
      color: '#9ACD9D',
      cursor: 'pointer',
    }
  }
  return {
    background: '#0D1117',
    borderColor: '#2a3a3a',
    color: '#B0C4DE',
    cursor: 'pointer',
  }
}

// 选项编号
const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']
</script>

<template>
  <div class="w-full border-t px-2 sm:px-4 py-1"
       style="border-color: #2a3a3a; background: #0D1117;">
    <div
      v-for="(option, idx) in options"
      :key="idx"
    >
      <button
        @click="selectOption(option)"
        @mouseenter="e => {
          if ((option as any).available && !disabled) {
            (e.target as HTMLElement).style.background = '#1e2a2a'
          }
        }"
        @mouseleave="e => {
          (e.target as HTMLElement).style.background = optionStyle(option).background
        }"
        :disabled="!(option as any).available || disabled"
        class="w-full text-left px-2 py-2 text-sm border transition-colors duration-150
               min-h-[44px] rounded-sm flex items-start gap-2"
        :style="optionStyle(option)"
      >
        <span class="font-bold shrink-0 mt-px">{{ optionLabels[idx] || '?' }}.</span>
        <span class="flex-1">
          {{ (option as any).text }}
          <span
            v-if="(option as any).risk"
            class="block text-xs mt-0.5"
            style="color: #5a6a7a;"
          >{{ (option as any).risk }}</span>
          <span
            v-if="(option as any).disabledReason"
            class="block text-xs mt-0.5"
            style="color: #c4746e;"
          >{{ (option as any).disabledReason }}</span>
        </span>
      </button>
    </div>

    <!-- 没有可用选项 -->
    <div
      v-if="options.length === 0"
      class="text-center py-3 text-sm"
      style="color: #5a6a7a;"
    >
      没有可用的选项...
    </div>
  </div>
</template>
