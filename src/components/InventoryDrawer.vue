<script setup lang="ts">
import { computed, ref } from 'vue'
import { itemDB } from '../data/index.js'

const props = defineProps({
  gameState: { type: Object, required: true },
})

const emit = defineEmits(['close', 'use-item', 'drop-item', 'equip-weapon', 'equip-armor', 'unequip'])

const selectedItem = ref(null)

const inventoryItems = computed(() => props.gameState.inventory)
const equippedWeapon = computed(() => props.gameState.equippedWeapon)
const equippedArmor = computed(() => props.gameState.equippedArmor)

function getItemTypeColor(type) {
  const colors = {
    weapon: '#c4746e',
    armor: '#7ab8d4',
    food: '#E6C37C',
    drink: '#7ab8d4',
    medical: '#9ACD9D',
    tool: '#B0C4DE',
    key: '#E6C37C',
    misc: '#5a6a7a',
  }
  return colors[type] || '#5a6a7a'
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

function handleEquip(item) {
  if (item.type === 'weapon') {
    emit('equip-weapon', item.id)
  } else if (item.type === 'armor') {
    emit('equip-armor', item.id)
  }
  selectedItem.value = null
}
</script>

<template>
  <!-- 遮罩 -->
  <div
    @click="emit('close')"
    class="fixed inset-0 z-40"
    style="background: rgba(0,0,0,0.5);"
  ></div>

  <!-- 抽屉 -->
  <div
    class="fixed top-0 bottom-0 z-50 flex flex-col overflow-hidden
           w-full sm:w-80 right-0"
    style="background: #0D1117; border-left: 1px solid #2a3a3a;"
  >
    <!-- 头部 -->
    <div class="flex items-center justify-between px-4 py-3 border-b"
         style="border-color: #2a3a3a;">
      <h2 class="text-sm font-bold" style="color: #E6C37C;">🎒 背包</h2>
      <button
        @click="emit('close')"
        class="text-sm px-2 py-1 min-h-[44px] border rounded-sm"
        style="color: #c4746e; background: none; border-color: #c4746e; cursor: pointer;"
        @mouseenter="e => { (e.target as HTMLElement).style.background = '#1e1a1a'; (e.target as HTMLElement).style.borderColor = '#d08070' }"
        @mouseleave="e => { (e.target as HTMLElement).style.background = 'none'; (e.target as HTMLElement).style.borderColor = '#c4746e' }"
      >✕ 关闭</button>
    </div>

    <!-- 装备栏 -->
    <div class="px-4 py-2 border-b text-xs space-y-1" style="border-color: #2a3a3a;">
      <div class="flex justify-between">
        <span style="color: #5a6a7a;">⚔️ 武器:</span>
        <span v-if="equippedWeapon" style="color: #c4746e;">
          {{ equippedWeapon.name }}
          <button @click="emit('unequip', 'weapon')"
                  class="ml-1 text-[10px] hover:underline" style="color: #5a6a7a;">卸下</button>
        </span>
        <span v-else style="color: #5a6a7a;">空手</span>
      </div>
      <div class="flex justify-between">
        <span style="color: #5a6a7a;">🛡️ 防具:</span>
        <span v-if="equippedArmor" style="color: #7ab8d4;">
          {{ equippedArmor.name }}
          <button @click="emit('unequip', 'armor')"
                  class="ml-1 text-[10px] hover:underline" style="color: #5a6a7a;">卸下</button>
        </span>
        <span v-else style="color: #5a6a7a;">无</span>
      </div>
      <div class="flex justify-between">
        <span style="color: #5a6a7a;">容量:</span>
        <span style="color: #B0C4DE;">
          {{ inventoryItems.length }}/{{ gameState.maxInventory + (gameState.inventory.find(i => i.id === 'backpack') ? 4 : 0) }}
        </span>
      </div>
    </div>

    <!-- 物品列表 -->
    <div class="flex-1 overflow-y-auto px-2 py-2">
      <div v-if="inventoryItems.length === 0" class="text-center py-8">
        <p class="text-sm" style="color: #5a6a7a;">背包是空的</p>
      </div>
      <div v-else class="space-y-1">
        <div
          v-for="item in inventoryItems"
          :key="item.id + '-' + Math.random()"
          @click="selectItem(item)"
          class="px-3 py-2 border cursor-pointer transition-colors duration-150 rounded-sm"
          :style="{
            borderColor: selectedItem === item ? getItemTypeColor(item.type) : '#2a3a3a',
            background: selectedItem === item ? '#1e2a2a' : '#0D1117',
          }"
          @mouseenter="e => { if (selectedItem !== item) (e.target as HTMLElement).style.background = '#111a1a' }"
          @mouseleave="e => { if (selectedItem !== item) (e.target as HTMLElement).style.background = '#0D1117' }"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold" :style="{ color: getItemTypeColor(item.type) }">
              {{ item.name }}
              <span v-if="item._count > 1" class="ml-1" style="color: #5a6a7a;">x{{ item._count }}</span>
            </span>
            <span class="text-[10px] px-1.5 py-0.5 rounded-sm"
                  :style="{ background: '#1e2a2a', color: getItemTypeColor(item.type) }">
              {{ getItemTypeName(item.type) }}
            </span>
          </div>
          <p class="text-[11px] mt-1 leading-relaxed" style="color: #5a6a7a;">
            {{ item.desc }}
          </p>
          <!-- 标签 -->
          <div v-if="item.tags && item.tags.length > 0" class="flex flex-wrap gap-1 mt-1">
            <span
              v-for="tag in item.tags.slice(0, 3)"
              :key="tag"
              class="text-[9px] px-1"
              style="color: #5a6a7a; border: 1px solid #2a3a3a;"
            >{{ tag }}</span>
          </div>
          <!-- 选中后的操作按钮 -->
          <div v-if="selectedItem === item" class="flex gap-2 mt-2">
            <button
              v-if="item.type === 'food' || item.type === 'drink' || item.type === 'medical'"
              @click.stop="handleUse(item)"
              class="text-[11px] px-2 py-1 border rounded-sm min-h-[36px] transition-colors"
              style="border-color: #9ACD9D; color: #9ACD9D; background: #0D1117;"
              @mouseenter="e => (e.target as HTMLElement).style.background = '#1e2a2a'"
              @mouseleave="e => (e.target as HTMLElement).style.background = '#0D1117'"
            >使用</button>
            <button
              v-if="item.type === 'weapon' || item.type === 'armor'"
              @click.stop="handleEquip(item)"
              class="text-[11px] px-2 py-1 border rounded-sm min-h-[36px] transition-colors"
              style="border-color: #E6C37C; color: #E6C37C; background: #0D1117;"
              @mouseenter="e => (e.target as HTMLElement).style.background = '#1e2a2a'"
              @mouseleave="e => (e.target as HTMLElement).style.background = '#0D1117'"
            >装备</button>
            <button
              @click.stop="handleDrop(item)"
              class="text-[11px] px-2 py-1 border rounded-sm min-h-[36px] transition-colors"
              style="border-color: #c4746e; color: #c4746e; background: #0D1117;"
              @mouseenter="e => (e.target as HTMLElement).style.background = '#1e2a2a'"
              @mouseleave="e => (e.target as HTMLElement).style.background = '#0D1117'"
            >丢弃</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
