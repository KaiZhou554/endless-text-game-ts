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

function optionClasses(option: any) {
  if (!option.available) {
    return 'bg-bg border-border text-muted cursor-not-allowed opacity-50'
  }
  if (option.tags && option.tags.includes('战斗')) {
    return 'bg-bg border-danger text-danger cursor-pointer'
  }
  if (option.tags && (option.tags.includes('搜索') || option.tags.includes('采集'))) {
    return 'bg-bg border-accent text-accent cursor-pointer'
  }
  if (option.tags && (option.tags.includes('救援') || option.tags.includes('帮助'))) {
    return 'bg-bg border-success text-success cursor-pointer'
  }
  return 'bg-bg border-border text-fore cursor-pointer'
}

// 选项编号
const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']
</script>

<template>
  <div class="w-full border-t border-border bg-bg">
    <div
      v-for="(option, idx) in options"
      :key="idx"
    >
      <button
        @click="selectOption(option)"
        :disabled="!(option as any).available || disabled"
        class="w-full text-left text-sm border transition-colors duration-150
               min-h-[44px] rounded-sm flex items-start gap-2
               hover:bg-hover"
        :class="optionClasses(option)"
      >
        <span class="font-bold shrink-0">{{ optionLabels[idx] || '?' }}.</span>
        <span class="flex-1">
          {{ (option as any).text }}
          <span
            v-if="(option as any).risk"
            class="block text-xs text-muted"
          >{{ (option as any).risk }}</span>
          <span
            v-if="(option as any).disabledReason"
            class="block text-xs text-danger"
          >{{ (option as any).disabledReason }}</span>
        </span>
      </button>
    </div>

    <!-- 没有可用选项 -->
    <div
      v-if="options.length === 0"
      class="text-center text-sm text-muted"
    >
      没有可用的选项...
    </div>
  </div>
</template>
