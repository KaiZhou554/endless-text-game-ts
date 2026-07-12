<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  gameState: { type: Object, required: true },
})

const emit = defineEmits(['close', 'travel'])

// 地点是否已探索（解锁）
function isUnlocked(locId) {
  return props.gameState.scenesVisited && props.gameState.scenesVisited.includes(locId)
}

// 地图上的地点列表
const mapLocations = [
  { id: 'hospital', name: '废弃医院', icon: '🏥', desc: '圣玛丽纪念医院', danger: 3, tags: ['医疗'] },
  { id: 'supermarket', name: '超市仓库', icon: '🏪', desc: '沃尔玛后仓', danger: 2, tags: ['食物'] },
  { id: 'subway', name: '地铁站', icon: '🚇', desc: '地下铁站', danger: 4, tags: ['黑暗'] },
  { id: 'apartment', name: '居民楼', icon: '🏢', desc: '六层老公寓', danger: 2, tags: ['住宅'] },
  { id: 'police_station', name: '警局', icon: '🏛️', desc: '市警察局', danger: 5, tags: ['武器'] },
  { id: 'pharmacy', name: '药房', icon: '💊', desc: '绿十字药房', danger: 2, tags: ['医疗'] },
  { id: 'gas_station', name: '加油站', icon: '⛽', desc: '壳牌加油站', danger: 2, tags: ['燃料'] },
  { id: 'school', name: '小学', icon: '🏫', desc: '市第三小学', danger: 3, tags: ['教育'] },
  { id: 'forest_path', name: '森林小径', icon: '🌲', desc: '城郊次生林', danger: 1, tags: ['自然'] },
  { id: 'riverside', name: '河岸边', icon: '🏞️', desc: '城市运河', danger: 1, tags: ['水源'] },
  { id: 'radio_station', name: '广播站', icon: '📻', desc: '市广播站', danger: 2, tags: ['通讯'] },
  { id: 'laboratory', name: '研究中心', icon: '🔬', desc: '基因治疗中心', danger: 4, tags: ['关键'] },
  { id: 'warehouse', name: '工业仓库', icon: '🏭', desc: '大型仓库', danger: 3, tags: ['物资'] },
  { id: 'stadium', name: '体育馆', icon: '🏟️', desc: '避难所遗址', danger: 4, tags: ['避难所'] },
  { id: 'train_yard', name: '铁路货场', icon: '🚂', desc: '货运站', danger: 3, tags: ['交通'] },
  { id: 'greenhouse', name: '植物园', icon: '🌿', desc: '热带温室', danger: 2, tags: ['自然'] },
  { id: 'armory', name: '军械库', icon: '🔫', desc: '国民警卫队', danger: 6, tags: ['武器'] },
  { id: 'library', name: '图书馆', icon: '📚', desc: '市立图书馆', danger: 1, tags: ['安静'] },
  { id: 'rooftop', name: '大楼天台', icon: '🏙️', desc: '写字楼顶', danger: 1, tags: ['安全'] },
  { id: 'parking_garage', name: '地下停车场', icon: '🅿️', desc: '地下车库', danger: 3, tags: ['交通', '黑暗'] },
]

function dangerColor(danger) {
  if (danger <= 1) return '#9ACD9D'
  if (danger <= 3) return '#E6C37C'
  return '#c4746e'
}

function dangerText(danger) {
  if (danger <= 1) return '低'
  if (danger <= 3) return '中'
  if (danger <= 5) return '高'
  return '极高'
}

function travelTo(locationId) {
  if (!isUnlocked(locationId)) return
  if (locationId === props.gameState.currentScene) return
  emit('travel', locationId)
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
    style="background: #0D1117; border-left: 1px solid #2a3a3a; padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px);"
  >
    <div class="flex items-center justify-between border-b"
         style="border-color: #2a3a3a;">
      <h2 class="text-sm font-bold" style="color: #E6C37C;">🗺️ 地图</h2>
      <button
        @click="emit('close')"
        class="text-sm min-h-[44px] border rounded-sm"
        style="color: #c4746e; background: none; border-color: #c4746e; cursor: pointer;"
        @mouseenter="e => { (e.target as HTMLElement).style.background = '#1e1a1a'; (e.target as HTMLElement).style.borderColor = '#d08070' }"
        @mouseleave="e => { (e.target as HTMLElement).style.background = 'none'; (e.target as HTMLElement).style.borderColor = '#c4746e' }"
      >✕ 关闭</button>
    </div>

    <!-- 当前位置 -->
    <div class="border-b text-xs" style="border-color: #2a3a3a;">
      <span style="color: #5a6a7a;">📍 当前位置: </span>
      <span class="font-bold" style="color: #9ACD9D;">
        {{ mapLocations.find(l => l.id === gameState.currentScene)?.name || '未知' }}
      </span>
      <span class="text-[10px]" style="color: #5a6a7a;">
        · 已探索 {{ gameState.scenesVisited?.length || 0 }}/{{ mapLocations.length }}
      </span>
    </div>

    <!-- 地点列表 -->
    <div class="flex-1 overflow-y-auto space-y-1">
      <div
        v-for="loc in mapLocations"
        :key="loc.id"
        @click="travelTo(loc.id)"
        class="border transition-colors duration-150 rounded-sm
               flex items-center gap-3"
        :style="{
          borderColor: isUnlocked(loc.id) ? (gameState.currentScene === loc.id ? '#E6C37C' : '#2a3a3a') : '#1a2828',
          background: gameState.currentScene === loc.id ? '#1e2a2a' : (isUnlocked(loc.id) ? '#0D1117' : '#0a1515'),
          cursor: isUnlocked(loc.id) && gameState.currentScene !== loc.id ? 'pointer' : 'default',
        }"
        @mouseenter="e => { if (isUnlocked(loc.id) && gameState.currentScene !== loc.id) (e.target as HTMLElement).style.background = '#111a1a' }"
        @mouseleave="e => { if (isUnlocked(loc.id) && gameState.currentScene !== loc.id) (e.target as HTMLElement).style.background = '#0D1117' }"
      >
        <template v-if="isUnlocked(loc.id) || gameState.currentScene === loc.id">
          <span class="text-lg">{{ loc.icon }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold" style="color: #B0C4DE;">{{ loc.name }}</span>
              <span
                v-if="isUnlocked(loc.id)"
                class="text-[9px] rounded-sm"
                :style="{ background: '#1e2a2a', color: dangerColor(loc.danger) }"
              >{{ dangerText(loc.danger) }}危</span>
              <span class="text-[9px]" style="color: #c4746e; opacity: 0.7;">-{{ 3 + loc.danger }}</span>
              <span class="text-[9px]" style="color: #7ab8d4; opacity: 0.7;">-{{ 2 + Math.floor(loc.danger/2) }}</span>
              <span
                v-if="gameState.currentScene === loc.id"
                class="text-[9px]"
                style="color: #E6C37C; border: 1px solid #E6C37C;"
              >当前</span>
            </div>
            <p class="text-[10px] truncate" style="color: #5a6a7a;">{{ loc.desc }} · {{ loc.tags.join(', ') }}</p>
          </div>
        </template>
        <template v-else>
          <span class="text-lg" style="color: #2a3a3a;">?</span>
          <div class="flex-1 min-w-0">
            <span class="text-xs font-bold" style="color: #2a3a3a;">???</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
