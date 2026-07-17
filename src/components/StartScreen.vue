<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { hasSave, getSaveMeta, SAVE_KEYS } from '../game/save-service.js'
import { scenes } from '../data/index.js'

const emit = defineEmits(['start-game', 'continue-game'])
const props = defineProps({
  gameState: { type: Object, required: true },
})

const showIntro = ref(false)
const roguelikeSaveMeta = ref<any>(null)  // 标准模式自动存档
const easySaveMeta = ref<any>(null)       // 简单模式手动存档

function getBestAutoSaveMeta() {
  // 找自动存档中最新的一个
  const a0 = getSaveMeta(SAVE_KEYS.autosave0)
  const a1 = getSaveMeta(SAVE_KEYS.autosave1)
  if (!a0 && !a1) return null
  if (!a0) return a1
  if (!a1) return a0
  return a0.timestamp > a1.timestamp ? a0 : a1
}

onMounted(() => {
  // 标准模式自动存档
  const autoMeta = getBestAutoSaveMeta()
  if (autoMeta && autoMeta.mode === 'roguelike') {
    roguelikeSaveMeta.value = autoMeta
  }
  // 简单模式手动存档
  if (hasSave(SAVE_KEYS.manual)) {
    const manualMeta = getSaveMeta(SAVE_KEYS.manual)
    if (manualMeta) easySaveMeta.value = manualMeta
  }
})

function startNewGame(mode: string) {
  emit('start-game', mode)
}

function continueGame(key: string) {
  emit('continue-game', key)
}

function sceneDisplayName(sceneId: string): string {
  return (scenes as any)[sceneId]?.name || sceneId
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen max-w-lg">
    <!-- 标题 -->
    <div class="text-center">
      <div class="text-5xl select-none">🧟</div>
      <h1 class="text-2xl font-bold tracking-widest text-accent">
        丧尸末日生存
      </h1>
      <p class="text-sm tracking-wide text-muted">
        ZOMBIE PLAYS DICE
      </p>
    </div>

    <!-- 分割线 -->
    <div class="w-full border-t border-border"></div>

    <!-- 简介 -->
    <div class="w-full text-success">
      <p class="text-sm leading-relaxed">
        ▸ 城市沦陷了。你是少数幸存者之一。
      </p>
      <p class="text-sm leading-relaxed">
        ▸ 管理你的生命、饱腹、口渴、理智和感染值。
      </p>
      <p class="text-sm leading-relaxed">
        ▸ 探索随机生成的世界，收集物资，与NPC互动。
      </p>
      <p class="text-sm leading-relaxed">
        ▸ 每一个选择都可能改变结局。谨慎行事。
      </p>
      <p class="text-sm leading-relaxed text-danger">
        ▸ 永久死亡 — 死亡后进度不可恢复。
      </p>
    </div>

    <!-- 模式选择按钮 -->
    <div class="w-full space-y-3">
      <!-- 标准模式继续 -->
      <button v-if="roguelikeSaveMeta" @click="continueGame(roguelikeSaveMeta.key)"
        class="w-full min-h-11 rounded-sm border text-left text-sm
               bg-bg border-accent text-accent hover:bg-hover
               transition-colors duration-150">
        <span class="font-bold">📂 继续标准模式</span>
        <span class="block text-xs text-fore">
          第 {{ Math.floor(roguelikeSaveMeta.dayCount) + 1 }} 天 · {{ sceneDisplayName(roguelikeSaveMeta.sceneName) }}
        </span>
      </button>

      <button @click="startNewGame('roguelike')"
        class="w-full min-h-11 rounded-sm border text-left text-sm
               bg-bg border-accent text-accent hover:bg-hover
               transition-colors duration-150">
        <span class="font-bold">⚔️ 标准模式</span>
        <span class="block text-xs text-fore">
          永久死亡 · 无法读档 · 真正的生存体验
        </span>
      </button>

      <!-- 简单模式继续 -->
      <button v-if="easySaveMeta" @click="continueGame(easySaveMeta.key)"
        class="w-full min-h-11 rounded-sm border text-left text-sm
               bg-bg border-success text-success hover:bg-hover
               transition-colors duration-150">
        <span class="font-bold">📂 继续简单模式</span>
        <span class="block text-xs text-fore">
          第 {{ Math.floor(easySaveMeta.dayCount) + 1 }} 天 · {{ sceneDisplayName(easySaveMeta.sceneName) }}
        </span>
      </button>

      <button @click="startNewGame('easy')"
        class="w-full min-h-11 rounded-sm border text-left text-sm
               bg-bg border-border text-success hover:bg-hover
               transition-colors duration-150">
        <span class="font-bold">🛡️ 简单模式</span>
        <span class="block text-xs text-fore">
          1个手动存档位 · 适合新手探索
        </span>
      </button>
    </div>

    <div class="w-full border-t border-border"></div>

    <!-- 底部信息 -->
    <div class="text-xs text-center text-muted">
      <p>github.com/KaiZhou554/endless-text-game-ts</p>
      <p>推荐使用等宽字体获得最佳体验</p>
    </div>
  </div>
</template>
