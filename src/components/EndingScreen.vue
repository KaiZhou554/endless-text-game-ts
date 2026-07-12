<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  ending: { type: Object, required: true },
  gameState: { type: Object, required: true },
})

const emit = defineEmits(['restart'])

const statsList = computed(() => {
  if (!props.gameState) return []
  const list: any[] = []
  if (props.ending.stats) {
    for (const key of props.ending.stats) {
      switch (key) {
        case 'days':
          list.push({ label: '存活天数', value: Math.floor(props.gameState.dayCount) + 1 + ' 天' })
          break
        case 'kills':
          list.push({ label: '击杀数', value: props.gameState.kills })
          break
        case 'itemsCollected':
          list.push({ label: '收集物品', value: props.gameState.itemsCollected + ' 件' })
          break
        case 'npcsMet':
          list.push({ label: '遭遇NPC', value: props.gameState.npcsMet.length + ' 人' })
          break
        case 'npcsHelped':
          list.push({ label: '帮助NPC', value: props.gameState.npcsHelped + ' 次' })
          break
      }
    }
  }
  return list
})

const subtitle = computed(() => {
  if (!props.ending || !props.gameState) return ''
  return props.ending.subtitle.replace('{days}', Math.floor(props.gameState.dayCount) + 1)
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen
              max-w-lg mx-auto overflow-y-auto">
    <!-- 标题 -->
    <div class="text-center">
      <div class="text-4xl select-none">
        {{ ending.isDeath ? '💀' : '🌟' }}
      </div>
      <h2 class="text-xl font-bold" style="color: #E6C37C;">
        {{ ending.title }}
      </h2>
      <p class="text-xs" style="color: #5a6a7a;">
        {{ subtitle }}
      </p>
    </div>

    <div class="w-full border-t" style="border-color: #2a3a3a;"></div>

    <!-- 结局文本 -->
    <div class="w-full">
      <pre class="text-sm leading-relaxed whitespace-pre-wrap font-mono"
           style="color: #B0C4DE; font-family: inherit;">{{ ending.text }}</pre>
    </div>

    <div class="w-full border-t" style="border-color: #2a3a3a;"></div>

    <!-- 统计 -->
    <div v-if="statsList.length > 0" class="w-full">
      <h3 class="text-sm font-bold" style="color: #9ACD9D;">📊 生存统计</h3>
      <div class="space-y-1">
        <div
          v-for="stat in statsList"
          :key="stat.label"
          class="flex justify-between text-sm border-b"
          style="border-color: #1e2a2a;"
        >
          <span style="color: #5a6a7a;">{{ stat.label }}</span>
          <span class="font-bold tabular-nums" style="color: #E6C37C;">{{ stat.value }}</span>
        </div>
      </div>
    </div>

    <!-- 重新开始 -->
    <button
      @click="emit('restart')"
      class="w-full text-center text-sm border transition-colors duration-150
             min-h-[44px] rounded-sm font-bold"
      style="background: #0D1117; border-color: #E6C37C; color: #E6C37C;"
      @mouseenter="e => (e.target as HTMLElement).style.background = '#1e2a2a'"
      @mouseleave="e => (e.target as HTMLElement).style.background = '#0D1117'"
    >
      🔄 重新开始
    </button>

    <p class="text-xs text-center" style="color: #5a6a7a;">
      {{ ending.isDeath ? '死亡是终点，也是新的开始。' : '你的故事告一段落，但世界还在继续。' }}
    </p>
  </div>
</template>
