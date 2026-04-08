<template>
  <div class="container">
    <div class="header">
      <h1 class="title">案例收集助手</h1>
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          class="search-input"
          placeholder="搜索客户姓名或案例名称"
          v-model="searchQuery"
          @input="handleSearch"
        />
      </div>
    </div>

    <div class="case-list">
      <div
        v-for="item in filteredCases"
        :key="item.id"
        class="case-item"
        @click="goToDetail(item.id)"
      >
        <div class="case-name">{{ item.name }}</div>
        <div class="case-customer">{{ item.customer }}</div>
        <div class="case-date">{{ item.date }}</div>
      </div>
    </div>

    <button class="add-btn" @click="goToRecording">+</button>
  </div>
</template>

<script>
export default {
  name: 'Index',
  data() {
    return {
      searchQuery: '',
      cases: []
    }
  },
  computed: {
    filteredCases() {
      if (!this.searchQuery) return this.cases
      return this.cases.filter(item => 
        item.name.includes(this.searchQuery) || 
        item.customer.includes(this.searchQuery)
      )
    }
  },
  mounted() {
    this.loadCases()
  },
  methods: {
    loadCases() {
      const stored = localStorage.getItem('cases')
      if (stored) {
        this.cases = JSON.parse(stored)
      } else {
        this.cases = [
          { id: 1, name: '高血压随访', customer: '张三', date: '2024-01-15' },
          { id: 2, name: '糖尿病管理', customer: '李四', date: '2024-01-16' },
          { id: 3, name: '冠心病复查', customer: '王五', date: '2024-01-17' }
        ]
        localStorage.setItem('cases', JSON.stringify(this.cases))
      }
    },
    handleSearch() {
      console.log('Searching:', this.searchQuery)
    },
    goToDetail(id) {
      this.$router.push(`/detail/${id}`)
    },
    goToRecording() {
      this.$router.push('/recording')
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}
.header {
  margin-bottom: 20px;
}
.title {
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
}
.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 10px 15px;
}
.search-icon {
  margin-right: 10px;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
}
.case-list {
  margin-bottom: 80px;
}
.case-item {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
}
.case-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}
.case-customer {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}
.case-date {
  font-size: 12px;
  color: #999;
}
.add-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #007aff;
  color: #fff;
  font-size: 30px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 122, 255, 0.3);
}
</style>
