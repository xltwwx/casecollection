<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1 class="title">案例收集助手</h1>
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          class="search-input" 
          placeholder="搜索客户姓名或案例名称" 
          v-model="searchQuery"
        />
      </div>
    </div>
    
    <!-- List -->
    <div class="case-list">
      <div v-if="filteredCases.length > 0">
        <div 
          v-for="item in filteredCases" 
          :key="item.id" 
          class="case-card"
          @click="onCaseTap(item.id)"
        >
          <div class="case-type" :class="item.type">{{ item.type }}</div>
          <span class="case-name">{{ item.name }}</span>
          <div class="case-info">
            <div class="info-item">
              <span class="info-icon">👤</span>
              <span class="info-text">{{ item.customerName }}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">⏱️</span>
              <span class="info-text">{{ item.duration }}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">📅</span>
              <span class="info-text">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <span class="empty-text">暂无相关案例</span>
      </div>
    </div>
    
    <!-- Floating Action Button -->
    <div class="fab" @click="onAddTap">
      <span class="fab-icon">+</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store'

const router = useRouter()
const searchQuery = ref('')
const cases = ref([])

// 加载案例
const loadCases = () => {
  // 按日期排序
  const sortedCases = [...store.cases].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  cases.value = sortedCases
}

// 过滤后的案例列表
const filteredCases = computed(() => {
  if (!searchQuery.value) return cases.value
  const query = searchQuery.value.toLowerCase()
  return cases.value.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.customerName.toLowerCase().includes(query)
  )
})

// 点击案例
const onCaseTap = (id) => {
  router.push(`/detail/${id}`)
}

// 添加新案例
const onAddTap = () => {
  router.push('/detail/new')
}

onMounted(() => {
  loadCases()
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f3f4f6;
  overflow: hidden;
}

.header {
  background-color: #ffffff;
  padding: 24px 16px 16px;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 12px;
  display: block;
}

.search-box {
  position: relative;
  background-color: #f3f4f6;
  border-radius: 16px;
  padding: 10px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding-left: 24px;
  font-size: 13px;
  background: transparent;
  height: 36px;
}

.case-list {
  flex: 1;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.case-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 0.5px solid #f3f4f6;
  position: relative;
  cursor: pointer;
}

.case-type {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 3px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: bold;
}

.case-type.正常 {
  background-color: #dcfce7;
  color: #16a34a;
}

.case-type.纠结 {
  background-color: #ffedd5;
  color: #ea580c;
}

.case-type.拒贷 {
  background-color: #fee2e2;
  color: #dc2626;
}

.case-type.逾期 {
  background-color: #f3e8ff;
  color: #9333ea;
}

.case-name {
  font-size: 16px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
  padding-right: 40px;
  display: block;
}

.case-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
  width: 50%;
}

.info-icon {
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding-top: 80px;
  color: #9ca3af;
  font-size: 14px;
}

.fab {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 64px;
  background-color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.3);
  z-index: 100;
  cursor: pointer;
}

.fab-icon {
  color: #ffffff;
  font-size: 28px;
  font-weight: 300;
}

/* 小屏幕适配 */
@media (max-width: 375px) {
  .header {
    padding: 16px 12px 12px;
  }
  
  .title {
    font-size: 18px;
  }
  
  .case-card {
    padding: 10px;
  }
  
  .case-name {
    font-size: 14px;
  }
  
  .fab {
    width: 56px;
    height: 56px;
  }
  
  .fab-icon {
    font-size: 24px;
  }
}
</style>
