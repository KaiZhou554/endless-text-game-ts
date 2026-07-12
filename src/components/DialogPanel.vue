<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { startDialogue, selectDialogueOption } from '../game/engine.js'

const props = defineProps({
  gameState: { type: Object, required: true },
})

const emit = defineEmits(['close', 'dialogue-result'])

const dialogue = computed(() => props.gameState.currentDialogue)
const npcText = ref('')
const playerOptions = ref<any[]>([])
const dialogueHistory = ref<any[]>([])  // {speaker, text}
const isProcessing = ref(false)

// 初始化对话
watch(
  () => props.gameState.currentDialogue,
  (newDlg) => {
    if (newDlg && newDlg.currentNode) {
      npcText.value = newDlg.currentNode.npcText
      playerOptions.value = newDlg.currentNode.options.map(opt => ({
        ...opt,
        available: checkOptionAvailable(opt),
      }))
    }
  },
  { immediate: true }
)

function checkOptionAvailable(option: any) {
  if (option.requireItems && option.requireItems.length > 0) {
    const hasAny = option.requireItems.some(id =>
      props.gameState.inventory.some(i => i.id === id)
    )
    if (!hasAny) return false
  }
  if (option.requireTags && option.requireTags.length > 0) {
    const hasAnyTag = option.requireTags.some(tag =>
      props.gameState.inventory.some(i => i.tags && i.tags.includes(tag))
    )
    if (!hasAnyTag) return false
  }
  return true
}

function selectOption(idx: number) {
  if (isProcessing.value) return
  isProcessing.value = true

  const option = playerOptions.value[idx]
  if (!option || !option.available) {
    isProcessing.value = false
    return
  }

  // 添加玩家文本到历史
  dialogueHistory.value.push({ speaker: 'player', text: option.text })

  const result: any = selectDialogueOption(props.gameState, idx)

  if (result.error) {
    isProcessing.value = false
    return
  }

  // 添加NPC文本
  if (result.npcText) {
    npcText.value = result.npcText
    dialogueHistory.value.push({ speaker: 'npc', text: result.npcText })
  }

  // 更新选项
  if (result.options) {
    playerOptions.value = result.options
  } else {
    playerOptions.value = []
  }

  // 对话结束（含奖励物品一同返回，避免重复触发）
  if (result.dialogueEnded) {
    setTimeout(() => {
      emit('dialogue-result', result)
    }, 800)
  } else if (result.rewardItems) {
    emit('dialogue-result', result)
  }

  isProcessing.value = false
}

// 对话标签编号
const optionLabels = ['A', 'B', 'C', 'D']
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden" style="background: #0D1117;">
    <!-- NPC 信息头部 -->
    <div class="border-b px-4 py-2" style="border-color: #2a3a3a;">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-bold" style="color: #E6C37C;">
            💬 {{ dialogue?.npc?.name || '???' }}
          </span>
          <span class="text-xs ml-2" style="color: #5a6a7a;">
            {{ dialogue?.npc?.title || '' }}
          </span>
        </div>
        <span class="text-[10px]" style="color: #5a6a7a;">
          信任: {{ Math.round(props.gameState.npcRelations[dialogue?.npcId] || 50) }}
        </span>
      </div>
    </div>

    <!-- 对话历史 + 当前NPC文本 -->
    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      <!-- NPC描述 -->
      <div v-if="dialogue?.npc?.desc" class="text-xs italic" style="color: #5a6a7a;">
        {{ dialogue.npc.desc }}
      </div>

      <!-- 历史 -->
      <div
        v-for="(msg, idx) in dialogueHistory"
        :key="idx"
        class="text-sm leading-relaxed"
      >
        <div v-if="msg.speaker === 'npc'" style="color: #7ab8d4;">
          <span class="text-[10px] font-bold" style="color: #5a6a7a;">
            {{ dialogue?.npc?.name || 'NPC' }}:
          </span>
          <p class="mt-0.5">{{ msg.text }}</p>
        </div>
        <div v-else class="text-right" style="color: #9ACD9D;">
          <span class="text-[10px]" style="color: #5a6a7a;">你:</span>
          <p class="mt-0.5">{{ msg.text }}</p>
        </div>
      </div>

      <!-- 当前NPC文本（如果不在历史中） -->
      <div v-if="dialogueHistory.length === 0 || dialogueHistory[dialogueHistory.length - 1]?.text !== npcText"
           class="text-sm leading-relaxed" style="color: #7ab8d4;">
        <span class="text-[10px] font-bold" style="color: #5a6a7a;">
          {{ dialogue?.npc?.name || 'NPC' }}:
        </span>
        <p class="mt-0.5">{{ npcText }}</p>
      </div>
    </div>

    <!-- 选项 -->
    <div class="border-t px-2 py-2 space-y-1" style="border-color: #2a3a3a;">
      <div
        v-for="(option, idx) in playerOptions"
        :key="idx"
      >
        <button
          @click="selectOption(idx)"
          :disabled="!option.available || isProcessing"
          class="w-full text-left px-3 py-2 text-sm border transition-colors duration-150
                 min-h-[44px] rounded-sm flex items-start gap-2"
          :style="{
            borderColor: option.available ? '#2a3a3a' : '#1e2a2a',
            color: option.available ? '#B0C4DE' : '#5a6a7a',
            background: '#0D1117',
            opacity: option.available ? 1 : 0.5,
            cursor: option.available ? 'pointer' : 'not-allowed',
          }"
          @mouseenter="e => { if (option.available && !isProcessing) (e.target as HTMLElement).style.background = '#1e2a2a' }"
          @mouseleave="e => { (e.target as HTMLElement).style.background = '#0D1117' }"
        >
          <span class="font-bold shrink-0 mt-px">{{ optionLabels[idx] }}.</span>
          <span class="flex-1">{{ option.text }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
