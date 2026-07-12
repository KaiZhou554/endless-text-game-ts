<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import Typewriter from 'typewriter-effect/dist/core'

const props = defineProps({
  gameState: { type: Object, required: true },
})

const scrollContainer = ref<HTMLElement | null>(null)
const isNearBottom = ref(true)
const showScrollButton = ref(false)
const typewriterTarget = ref<HTMLElement | null>(null)
const typingText = ref('')
const typingEntryId = ref<number | null>(null)  // 当前正在打字的日志条目 id
let typewriterInstance: any = null

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

// 监听日志新增，对叙事类消息启动打字机效果
watch(
  () => props.gameState.journal.length,
  async (newLen, oldLen) => {
    await nextTick()
    if (scrollContainer.value && isNearBottom.value) {
      scrollToBottom()
    }
    // 检查是否有新的叙事类条目需要打字
    if (newLen > (oldLen || 0)) {
      const journal = props.gameState.journal
      const newest = journal[journal.length - 1]
      if (newest && isTypewriterEligible(newest.type) && typingEntryId.value !== newest.id) {
        startTyping(newest)
      }
    }
  },
  { immediate: false }
)

function isTypewriterEligible(type: string): boolean {
  // 仅对叙事/地点/发现类消息使用打字机，排除 action/combat/warning/danger
  return ['narrative', 'location', 'discovery', 'result', 'alliance'].includes(type)
}

function startTyping(entry: any) {
  if (typewriterInstance) {
    typewriterInstance.stop()
    typewriterInstance = null
  }
  typingEntryId.value = entry.id
  typingText.value = entry.text

  nextTick(() => {
    if (!typewriterTarget.value) return
    typewriterTarget.value.innerHTML = ''
    typewriterInstance = new Typewriter(typewriterTarget.value, {
      delay: 20,
      cursor: '▋',
      loop: false,
      autoStart: false,
    })
    typewriterInstance
      .typeString(entry.text)
      .callFunction(() => {
        // 打字完成，清除打字状态
        typingText.value = ''
        typingEntryId.value = null
        typewriterInstance = null
        nextTick(() => {
          if (scrollContainer.value && isNearBottom.value) {
            scrollToBottom()
          }
        })
      })
      .start()
  })
}

// 窗口缩放时也检查位置
onMounted(async () => {
  await nextTick()
  scrollToBottom()
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', checkScrollPosition)
  }
  // 处理初始已有的叙事条目
  const journal = props.gameState.journal
  if (journal.length > 0) {
    const last = journal[journal.length - 1]
    if (last && isTypewriterEligible(last.type)) {
      startTyping(last)
    }
  }
})

function getTextStyle(entry: any, total: any[], currentTurnId: number) {
  const isRecent = entry.turnId === currentTurnId
  const isNewest = entry.id === total.length > 0 ? total[total.length - 1]?.id : null

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
      <div v-if="gameState.journal.length === 0 && !typingText" class="flex items-center justify-center h-full">
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
          <!-- 正在打字的条目隐藏，由下方 typewriterTarget 显示 -->
          <span v-if="typingEntryId !== entry.id">{{ entry.text }}</span>
        </div>

        <!-- Typewriter 打字区域 -->
        <div
          v-if="typingText"
          ref="typewriterTarget"
          class="px-3 py-2 -mx-2"
          style="font-size: 15px; line-height: 1.6; color: #B0C4DE; min-height: 1.5em;"
        ></div>
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
