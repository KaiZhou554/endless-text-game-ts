<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import Typewriter from 'typewriter-effect/dist/core'

const props = defineProps({
  gameState: { type: Object, required: true },
})

const scrollContainer = ref<HTMLElement | null>(null)
const isNearBottom = ref(true)
const promptState = ref("waiting")  // "waiting" | "ready"
let promptTimer: any = null
const showScrollButton = ref(false)
const typewriterTarget = ref<HTMLElement | null>(null)

// 显示队列管理
const revealedIds = ref(new Set<number>())  // 已显示完成的条目 id
const processingQueue = ref<any[]>([])      // 待处理队列
const isProcessing = ref(false)             // 是否正在处理
const currentTypingEntry = ref<any>(null)    // 当前正在打字机显示的条目
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

function isTypewriterEligible(type: string): boolean {
  return ['narrative', 'location', 'discovery', 'result', 'alliance'].includes(type)
}

// 监听日志新增（监听最后一个条目的 id，避免满 30 条 shift 后 length 不变）
watch(
  () => {
    const j = props.gameState.journal
    return j.length > 0 ? j[j.length - 1]?.id : null
  },
  async (newId, oldId) => {
    if (newId === null || newId === oldId) return
    await nextTick()
    if (scrollContainer.value && isNearBottom.value) {
      scrollToBottom()
    }
    const journal = props.gameState.journal
    // 将未 reveal 的条目加入队列
    for (const entry of journal) {
      if (entry && !revealedIds.value.has(entry.id)) {
        processingQueue.value.push(entry)
      }
    }
    processQueue()
  }
)

function processQueue() {
  if (isProcessing.value || processingQueue.value.length === 0) return
  isProcessing.value = true

  const entry = processingQueue.value[0]
  if (!entry) {
    isProcessing.value = false
    return
  }

  // Safety timeout: 30秒后强制释放队列（防止 onDone 因异常未被调用）
  const safetyTimer = setTimeout(() => {
    isProcessing.value = false
    processingQueue.value.shift()
    processQueue()
  }, 30000)

  const originalFinish = () => {
    clearTimeout(safetyTimer)
    finishEntry(entry)
  }

  if (isTypewriterEligible(entry.type)) {
    startTyping(entry, originalFinish)
  } else {
    originalFinish()
  }
}

function finishEntry(entry: any) {
  revealedIds.value = new Set([...revealedIds.value, entry.id])
  processingQueue.value.shift()
  isProcessing.value = false

  // 自动滚动
  nextTick(() => {
    if (scrollContainer.value && isNearBottom.value) {
      scrollToBottom()
    }
  })

  // 非打字机条目之间也留一点间隔
  if (!isTypewriterEligible(entry.type)) {
    setTimeout(() => processQueue(), 200)
  } else {
    // 打字机完成后，给一点停顿再处理下一条
    setTimeout(() => processQueue(), 400)
  }
}

function startTyping(entry: any, onDone: () => void) {
  try {
    if (typewriterInstance) {
      typewriterInstance.stop()
      typewriterInstance = null
    }
    currentTypingEntry.value = entry

    nextTick(() => {
      try {
        if (!typewriterTarget.value) {
          // 目标元素尚未就绪，直接完成
          onDone()
          return
        }
        typewriterTarget.value.innerHTML = ''

        // 用 MutationObserver 监听打字机内容变化，自动滚动到底部
        let twObserver: MutationObserver | null = null
        try {
          twObserver = new MutationObserver(() => {
            if (scrollContainer.value && isNearBottom.value) {
              scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
            }
          })
          twObserver.observe(typewriterTarget.value, {
            childList: true,
            subtree: true,
            characterData: true,
          })
        } catch (_e) { /* 不支持 MutationObserver 时忽略 */ }

        typewriterInstance = new (Typewriter as any)(typewriterTarget.value, {
          delay: 20,
          cursor: '▋',
          loop: false,
          autoStart: false,
        })
        typewriterInstance
          .typeString(entry.text)
          .callFunction(() => {
            if (twObserver) { twObserver.disconnect(); twObserver = null }
            currentTypingEntry.value = null
            typewriterInstance = null
            onDone()
          })
          .start()
      } catch (e) {
        console.warn('typewriter error:', e)
        onDone()
      }
    })
  } catch (e) {
    console.warn('startTyping error:', e)
    onDone()
  }
}

// 窗口缩放时也检查位置
onMounted(async () => {
  await nextTick()
  scrollToBottom()
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', checkScrollPosition)
  }
  // 处理已有日志
  const journal = props.gameState.journal
  for (const entry of journal) {
    processingQueue.value.push(entry)
  }
  processQueue()
})

function getTextStyle(entry: any, total: any[], currentTurnId: number) {
  const isRecent = entry.turnId === currentTurnId
  const isNewest = entry.id === total.length > 0 ? total[total.length - 1]?.id : null

  let baseColor = '#B0C4DE'
  switch (entry.type) {
    case 'warning': baseColor = '#E6C37C'; break
    case 'danger': baseColor = '#c4746e'; break
    case 'combat': baseColor = '#5a6a7a'; break
    case 'location': baseColor = '#9ACD9D'; break
    case 'dialogue': baseColor = '#7ab8d4'; break
    case 'discovery': baseColor = '#E6C37C'; break
    case 'alliance': baseColor = '#9ACD9D'; break
    case 'action': baseColor = '#5a6a7a'; break
  }

  let color = baseColor
  if (entry.type === 'action' || entry.type === 'combat') {
    color = baseColor  // 保持暗淡
  } else if (isRecent) {
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

watch(isProcessing, (v) => {
  if (!v && props.gameState.journal.length > 0) {
    // 队列空闲 → 先显示等待，1.5s 后变为就绪
    promptState.value = "waiting"
    if (promptTimer) clearTimeout(promptTimer)
    promptTimer = setTimeout(() => {
      promptState.value = "ready"
    }, 1500)
  }
})
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

      <!-- 日志条目：仅显示已 reveal 的条目（正在打字的条目由 typewriterTarget 显示） -->
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
          <!-- 已揭示的条目正常显示；正在打字的和未处理的隐藏 -->
          <span v-if="revealedIds.has(entry.id)" v-html="entry.text"></span>
        </div>

        <!-- Typewriter 打字区域 -->
        <div
          v-if="currentTypingEntry && !revealedIds.has(currentTypingEntry.id)"
          ref="typewriterTarget"
          class="px-3 py-2 -mx-2"
          style="font-size: 15px; line-height: 1.6; color: #B0C4DE; min-height: 1.5em;"
        ></div>

        <!-- 剧情输出结束提示（延迟 0.3s 淡入） -->
        <transition name="prompt-fade">
          <div v-if="gameState.journal.length > 0 && !isProcessing"
               class="pl-3 pt-2 pb-4" style="color: #4a5a5a; font-size: 13px;">
            {{ promptState === 'waiting' ? '⏳ 等待下一回合……' : '➤ 选择你的行动' }}
            <div v-if="promptState === 'waiting'"
                 class="mt-1.5 h-0.5 rounded-full overflow-hidden"
                 style="background: #1e2a2a; width: 100%;">
              <div class="h-full rounded-full animate-progress"
                   style="background: #4a5a5a;"></div>
            </div>
          </div>
        </transition>
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
