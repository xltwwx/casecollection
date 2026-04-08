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
          @input="onSearchInput"
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
import store from '../store/index'

const router = useRouter()
const searchQuery = ref('')

const cases = computed(() => store.getCases())

const filteredCases = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) {
    return cases.value
  }
  return cases.value.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.customerName.toLowerCase().includes(query)
  )
})

const onSearchInput = () => {
  // 由 computed 自动处理
}

const onCaseTap = (id) => {
  router.push(`/detail/${id}`)
}

const onAddTap = () => {
  router.push('/detail/new')
}

onMounted(() => {
  store.refreshCases()
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8fafc;
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 20px 20px;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.25);
  flex-shrink: 0;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
  display: block;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.search-icon {
  position: absolute;
  left: 16px;
  font-size: 18px;
  opacity: 0.5;
}

.search-input {
  width: 100%;
  padding-left: 32px;
  font-size: 15px;
  background: transparent;
  border: none;
  outline: none;
  color: #1f2937;
}

.search-input::placeholder {
  color: #9ca3af;
}

.case-list {
  flex: 1;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  padding-bottom: 100px;
}

.case-card {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 18px 16px;
  margin-bottom: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(243, 244, 246, 0.8);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.case-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.case-type {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
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
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
  padding-right: 70px;
  display: block;
}

.case-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  flex: 1 1 calc(50% - 6px);
  min-width: 140px;
}

.info-icon {
  font-size: 14px;
  opacity: 0.7;
}

.empty-state {
  text-align: center;
  padding-top: 120px;
  color: #9ca3af;
  font-size: 16px;
}

.fab {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  z-index: 100;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fab:active {
  transform: translateX(-50%) scale(0.9);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.fab-icon {
  color: #ffffff;
  font-size: 32px;
  font-weight: 300;
}

/* 响应式适配 */
@media (max-width: 375px) {
  .header {
    padding: 20px 16px 16px;
  }
  
  .title {
    font-size: 22px;
  }
  
  .case-card {
    padding: 16px 14px;
  }
  
  .case-name {
    font-size: 16px;
  }
  
  .fab {
    width: 56px;
    height: 56px;
  }
  
  .fab-icon {
    font-size: 28px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .fab {
    left: 50%;
  }
}
</style>
