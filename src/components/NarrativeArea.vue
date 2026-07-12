<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue'

const props = defineProps({
  gameState: { type: Object, required: true },
})

const scrollContainer = ref<HTMLElement | null>(null)
const isNearBottom = ref(true)
const showScrollButton = ref(false)

// 检查是否在底部附近（100px 内）
function checkScrollPosition() {
  if (!scrollContainer.value) return
  const el = scrollContainer.value
  const threshold = 100
  isNearBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
  showScrollButton.value = !isNearBottom.value
}

// 滚动到底部
function scrollToBottom() {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
}

// 当日志更新时，若已在底部则自动滚到底部
watch(
  () => props.gameState.journal.length,
  async () => {
    await nextTick()
    if (scrollContainer.value && isNearBottom.value) {
      scrollToBottom()
    }
  }
)

// 窗口缩放时也检查位置
onMounted(async () => {
  await nextTick()
  scrollToBottom()
  // 监听滚动事件
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', checkScrollPosition)
  }
})

function getTextStyle(entry, total, currentTurnId) {
  const isRecent = entry.turnId === currentTurnId  // 本回合消息
  const isNewest = entry.id === total > 0 ? total[total.length - 1]?.id : null

  // 基础颜色
  let baseColor = '#B0C4DE'
  switch (entry.type) {
    case 'warning': baseColor = '#E6C37C'; break
    case 'danger':
    case 'combat': baseColor = '#c4746e'; break
    case 'location': baseColor = '#9ACD9D'; break
    case 'dialogue': baseColor = '#7ab8d4'; break
    case 'discovery': baseColor = '#E6C37C'; break
    case 'alliance': baseColor = '#9ACD9D'; break
    case 'action': baseColor = '#5a6a7a'; break
  }

  // 最近消息加亮，其余（非提示）稍暗
  let color = baseColor
  if (isRecent) {
    color = isNewest ? '#d0dce8' : '#c0d0e0'
  } else if (entry.type !== 'warning' && entry.type !== 'danger' && entry.type !== 'discovery') {
    color = '#8a9aaa'
  }

  return {
    color,
    background: isRecent ? '#15202a' : 'transparent',
  }
}

// 当前回合 ID（用于高亮判定）
const currentTurnId = computed(() => props.gameState.actionCount)
</script>

<template>
  <div class="relative flex-1 overflow-hidden" style="background: #0D1117;">
    <div
      ref="scrollContainer"
      class="absolute inset-0 overflow-y-auto px-4 py-3"
      style="background: #0D1117;"
    >
      <!-- 空状态 -->
      <div v-if="gameState.journal.length === 0" class="flex items-center justify-center h-full">
        <p class="text-sm cursor-blink" style="color: #5a6a7a;">
          等待游戏开始...
        </p>
      </div>

      <!-- 日志条目 -->
      <div v-else class="space-y-2 pb-6">
        <div
          v-for="(entry, idx) in gameState.journal"
          :key="entry.id"
          class="px-3 py-2 -mx-2"
          :style="{
            ...getTextStyle(entry, gameState.journal, currentTurnId),
            fontSize: '15px',
            lineHeight: '1.6',
          }"
        >
          <span>{{ entry.text }}</span>
        </div>
      </div>
    </div>

    <!-- 滚动到底部按钮 -->
    <button
      v-if="showScrollButton"
      @click="scrollToBottom"
      class="absolute bottom-3 right-3 z-10 text-xs px-4 py-1.5 rounded-sm border transition-colors"
      style="background: #1a1f1f; border-color: #E6C37C; color: #E6C37C;"
      @mouseenter="e => { (e.target as HTMLElement).style.background = '#2a3535'; (e.target as HTMLElement).style.borderColor = '#f0d080' }"
      @mouseleave="e => { (e.target as HTMLElement).style.background = '#1a1f1f'; (e.target as HTMLElement).style.borderColor = '#E6C37C' }"
    >
      ↓ 回到底部
    </button>
  </div>
</template>
