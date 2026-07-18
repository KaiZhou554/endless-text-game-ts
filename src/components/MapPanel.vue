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
  { id: 'hospital', name: '废弃医院', icon: '🏥', desc: '圣玛丽纪念医院附近', danger: 3, tags: ['医疗'] },
  { id: 'supermarket', name: '超市仓库', icon: '🏪', desc: '繁华的商业街', danger: 2, tags: ['食物'] },
  { id: 'subway', name: '地铁站', icon: '🚇', desc: '地下铁站', danger: 4, tags: ['黑暗'] },
  { id: 'apartment', name: '居民楼', icon: '🏢', desc: '六层老公寓附近', danger: 2, tags: ['住宅'] },
  { id: 'police_station', name: '警局', icon: '🏛️', desc: '市警察局', danger: 5, tags: ['武器'] },
  { id: 'pharmacy', name: '药房', icon: '💊', desc: '绿十字药房附近', danger: 2, tags: ['医疗'] },
  { id: 'gas_station', name: '加油站', icon: '⛽', desc: '加油站附近', danger: 2, tags: ['燃料'] },
  { id: 'school', name: '小学', icon: '🏫', desc: '市第三小学', danger: 3, tags: ['教育'] },
  { id: 'forest_path', name: '森林小径', icon: '🌲', desc: '城郊次生林', danger: 1, tags: ['自然'] },
  { id: 'riverside', name: '河岸边', icon: '🏞️', desc: '城市运河', danger: 1, tags: ['水源'] },
  { id: 'radio_station', name: '广播站', icon: '📻', desc: '市广播站附近', danger: 2, tags: ['通讯'] },
  { id: 'laboratory', name: '研究中心', icon: '🔬', desc: '基因治疗中心', danger: 4, tags: ['关键'] },
  { id: 'warehouse', name: '工业仓库', icon: '🏭', desc: '大型仓库', danger: 3, tags: ['物资'] },
  { id: 'stadium', name: '体育馆', icon: '🏟️', desc: '避难所遗址', danger: 4, tags: ['避难所'] },
  { id: 'train_yard', name: '铁路货场', icon: '🚂', desc: '货运站', danger: 3, tags: ['交通'] },
  { id: 'greenhouse', name: '植物园', icon: '🌿', desc: '热带温室', danger: 2, tags: ['自然'] },
  { id: 'armory', name: '军械库', icon: '🔫', desc: '国民警卫队', danger: 6, tags: ['武器'] },
  { id: 'library', name: '图书馆', icon: '📚', desc: '市立图书馆附近', danger: 1, tags: ['安静'] },
  { id: 'rooftop', name: '大楼天台', icon: '🏙️', desc: '写字楼顶', danger: 1, tags: ['安全'] },
  { id: 'parking_garage', name: '地下停车场', icon: '🅿️', desc: '地下车库', danger: 3, tags: ['交通', '黑暗'] },
  { id: 'overpass', name: '天桥', icon: '🌉', desc: '过街天桥', danger: 2, tags: ['室外', '交通'] },
  { id: 'safe_zone', name: '社区避难所', icon: '🏘️', desc: '幸存者定居点', danger: 0, tags: ['安全', '社区'] },
]

function dangerColor(danger) {
  if (danger <= 1) return 'danger-low'
  if (danger <= 3) return 'danger-mid'
  return 'danger-high'
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
    class="fixed inset-0 z-40 bg-overlay"
  ></div>

  <!-- 抽屉 -->
  <div
    class="fixed top-0 bottom-0 z-50 flex flex-col overflow-hidden
           w-full sm:w-80 right-0 bg-bg border-l border-border"
    style="padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px);"
  >
    <div class="flex items-center justify-between border-b border-border">
      <h2 class="text-sm font-bold text-accent">🗺️ 地图</h2>
      <button
        @click="emit('close')"
        class="text-sm min-h-11 border rounded-sm
               text-danger border-danger bg-transparent cursor-pointer
               hover:bg-close-hover hover:border-close-hover-border"
      >✕ 关闭</button>
    </div>

    <!-- 当前位置 -->
    <div class="border-b border-border text-xs">
      <span class="text-muted">📍 当前位置: </span>
      <span class="font-bold text-success">
        {{ mapLocations.find(l => l.id === gameState.currentScene)?.name || '未知' }}
      </span>
      <span class="text-[10px] text-muted">
        · 已探索 {{ gameState.scenesVisited?.length || 0 }}/{{ mapLocations.length }}
      </span>
    </div>

    <!-- 地点列表 -->
    <div class="flex-1 overflow-y-auto space-y-1">
      <div
        v-for="loc in mapLocations"
        :key="loc.id"
        @click="travelTo(loc.id)"
        class="border transition-colors duration-150 rounded-sm flex items-center gap-3"
        :class="{
          'border-accent bg-hover': gameState.currentScene === loc.id,
          'border-border bg-bg hover:bg-item-hover cursor-pointer': isUnlocked(loc.id) && gameState.currentScene !== loc.id,
          'border-locked-border bg-locked-bg cursor-default': !isUnlocked(loc.id) && gameState.currentScene !== loc.id,
        }"
      >
        <template v-if="isUnlocked(loc.id) || gameState.currentScene === loc.id">
          <span class="text-lg">{{ loc.icon }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-fore">{{ loc.name }}</span>
              <span
                v-if="isUnlocked(loc.id)"
                class="text-[9px] rounded-sm bg-hover"
                :class="dangerColor(loc.danger)"
              >{{ dangerText(loc.danger) }}危</span>
              <span class="text-[9px] text-danger/70">-{{ 3 + loc.danger }}</span>
              <span class="text-[9px] text-info/70">-{{ 2 + Math.floor(loc.danger/2) }}</span>
              <span
                v-if="gameState.currentScene === loc.id"
                class="text-[9px] text-accent border border-accent"
              >当前</span>
            </div>
            <p class="text-[10px] truncate text-muted">{{ loc.desc }} · {{ loc.tags.join(', ') }}</p>
          </div>
        </template>
        <template v-else>
          <span class="text-lg text-border">?</span>
          <div class="flex-1 min-w-0">
            <span class="text-xs font-bold text-border">???</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
