<script setup lang="ts">
import { computed, ref } from 'vue'
import { itemDB } from '../data/index.js'
import { getUsedSlots, getEffectiveCapacity } from '../game/state.js'

const props = defineProps({
  gameState: { type: Object, required: true },
})

const emit = defineEmits(['close', 'use-item', 'drop-item'])

const selectedItem = ref(null)

const inventoryItems = computed(() => props.gameState.inventory)

function getItemTypeColor(type) {
  const colors = {
    weapon: 'var(--color-danger)',
    armor: 'var(--color-info)',
    food: 'var(--color-accent)',
    drink: 'var(--color-info)',
    medical: 'var(--color-success)',
    tool: 'var(--color-fore)',
    key: 'var(--color-accent)',
    misc: 'var(--color-muted)',
  }
  return colors[type] || 'var(--color-muted)'
}

function getItemTypeName(type) {
  const names = {
    weapon: '武器',
    armor: '防具',
    food: '食物',
    drink: '饮品',
    medical: '医疗',
    tool: '工具',
    key: '关键',
    misc: '杂项',
  }
  return names[type] || type
}

function selectItem(item) {
  selectedItem.value = selectedItem.value === item ? null : item
}

function handleUse(item) {
  emit('use-item', item.id)
  selectedItem.value = null
}

function handleDrop(item) {
  emit('drop-item', item.id)
  selectedItem.value = null
}
</script>

<template>
  <!-- 遮罩 -->
  <div
    @click="emit('close')"
    class="fixed inset-0 z-40 bg-overlay"
  ></div>

  <!-- 抽屉 -->
  <div
    class="fixed top-0 bottom-0 z-50 flex flex-col overflow-hidden
           w-full sm:w-80 right-0 bg-bg border-l border-border"
    style="padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px);"
  >
    <!-- 头部 -->
    <div class="flex items-center justify-between border-b border-border">
      <h2 class="text-sm font-bold text-accent">🎒 背包</h2>
      <button
        @click="emit('close')"
        class="text-sm min-h-11 border rounded-sm
               text-danger border-danger bg-transparent cursor-pointer
               hover:bg-close-hover hover:border-close-hover-border"
      >✕ 关闭</button>
    </div>

    <!-- 容量 -->
    <div class="border-b border-border text-xs flex justify-between">
      <span class="text-muted">容量:</span>
      <span class="text-fore">
        {{ getUsedSlots(gameState) }}/{{ getEffectiveCapacity(gameState) }}
      </span>
    </div>

    <!-- 物品列表 -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="inventoryItems.length === 0" class="text-center">
        <p class="text-sm text-muted">背包是空的</p>
      </div>
      <div v-else class="space-y-1">
        <div
          v-for="item in inventoryItems"
          :key="item.id + '-' + Math.random()"
          @click="selectItem(item)"
          class="border cursor-pointer transition-colors duration-150 rounded-sm"
          :class="[
            selectedItem === item
              ? 'bg-hover'
              : 'bg-bg border-border hover:bg-item-hover'
          ]"
          :style="selectedItem === item ? { borderColor: getItemTypeColor(item.type) } : {}"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold" :style="{ color: getItemTypeColor(item.type) }">
              {{ item.name }}
              <span v-if="item._count > 1" class="text-muted">x{{ item._count }}</span>
            </span>
            <span class="text-[10px] rounded-sm bg-hover"
                  :style="{ color: getItemTypeColor(item.type) }">
              {{ getItemTypeName(item.type) }}
            </span>
          </div>
          <p class="text-[11px] leading-relaxed text-muted">
            {{ item.desc }}
          </p>
          <!-- 标签 -->
          <div v-if="item.tags && item.tags.length > 0" class="flex flex-wrap gap-1">
            <span
              v-for="tag in item.tags.slice(0, 3)"
              :key="tag"
              class="text-[9px] text-muted border border-border"
            >{{ tag }}</span>
          </div>
          <!-- 选中后的操作按钮 -->
          <div v-if="selectedItem === item" class="flex gap-2 w-full">
            <button
              v-if="item.type === 'food' || item.type === 'drink' || item.type === 'medical' || item.usable"
              @click.stop="handleUse(item)"
              class="text-[11px] border rounded-sm min-h-9 flex-1
                     border-success text-success bg-bg
                     hover:bg-hover transition-colors"
            >使用</button>
            <button
              @click.stop="handleDrop(item)"
              class="text-[11px] border rounded-sm min-h-9 flex-1
                     border-danger text-danger bg-bg
                     hover:bg-hover transition-colors"
            >丢弃</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
