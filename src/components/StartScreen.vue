<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['start-game'])
const props = defineProps({
  gameState: { type: Object, required: true },
})

const showIntro = ref(false)

function startNewGame(mode) {
  emit('start-game', mode)
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen px-4 pt-16 pb-8
              max-w-lg mx-auto">
    <!-- 标题 -->
    <div class="text-center mb-8">
      <div class="text-5xl mb-4 select-none">🧟</div>
      <h1 class="text-2xl font-bold tracking-widest mb-2" style="color: #E6C37C;">
        丧尸末日生存
      </h1>
      <p class="text-sm tracking-wide" style="color: #5a6a7a;">
        ZOMBIE SURVIVAL · TEXT ADVENTURE
      </p>
    </div>

    <!-- 分割线 -->
    <div class="w-full border-t mb-8" style="border-color: #2a3a3a;"></div>

    <!-- 简介 -->
    <div class="w-full mb-8 px-2" style="color: #9ACD9D;">
      <p class="text-sm leading-relaxed mb-3">
        ▸ 城市沦陷了。你是少数幸存者之一。
      </p>
      <p class="text-sm leading-relaxed mb-3">
        ▸ 管理你的生命、饱腹、口渴、理智和感染值。
      </p>
      <p class="text-sm leading-relaxed mb-3">
        ▸ 探索随机生成的世界，收集物资，与NPC互动。
      </p>
      <p class="text-sm leading-relaxed mb-3">
        ▸ 每一个选择都可能改变结局。谨慎行事。
      </p>
      <p class="text-sm leading-relaxed" style="color: #c4746e;">
        ▸ 永久死亡 — 死亡后进度不可恢复。
      </p>
    </div>

    <!-- 模式选择按钮 -->
    <div class="w-full space-y-3 mb-6">
      <button
        @click="startNewGame('roguelike')"
        class="w-full py-3 px-4 text-left text-sm border transition-colors duration-150
               min-h-[44px] rounded-sm"
        style="background: #0D1117; border-color: #E6C37C; color: #E6C37C;"
        @mouseenter="e => (e.target as HTMLElement).style.background = '#1e2a2a'"
        @mouseleave="e => (e.target as HTMLElement).style.background = '#0D1117'"
      >
        <span class="font-bold">⚔️ 标准模式</span>
        <span class="block text-xs mt-1" style="color: #B0C4DE;">
          永久死亡 · 无法读档 · 真正的生存体验
        </span>
      </button>

      <button
        @click="startNewGame('easy')"
        class="w-full py-3 px-4 text-left text-sm border transition-colors duration-150
               min-h-[44px] rounded-sm"
        style="background: #0D1117; border-color: #2a3a3a; color: #9ACD9D;"
        @mouseenter="e => (e.target as HTMLElement).style.background = '#1e2a2a'"
        @mouseleave="e => (e.target as HTMLElement).style.background = '#0D1117'"
      >
        <span class="font-bold">🛡️ 简单模式</span>
        <span class="block text-xs mt-1" style="color: #B0C4DE;">
          1个手动存档位 · 适合新手探索
        </span>
      </button>
    </div>

    <div class="w-full border-t mb-6" style="border-color: #2a3a3a;"></div>

    <!-- 底部信息 -->
    <div class="text-xs text-center" style="color: #5a6a7a;">
      <p>纯文字冒险 · Vue 3 + Tailwind CSS</p>
      <p class="mt-1">推荐使用等宽字体获得最佳体验</p>
    </div>
  </div>
</template>
