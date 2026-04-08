<template>
  <div class="container">
    <div class="header">
      <div class="back-btn" @click="onBack">
        <span class="back-icon">←</span>
      </div>
      <h1 class="title">{{ formData.name || '新开案例' }}</h1>
      <div v-if="!isNewCase" class="edit-btn" @click="onEditCase">
        <span class="edit-text">修改</span>
      </div>
      <div v-else class="placeholder"></div>
    </div>

    <div class="content">
      <div class="card basic-info">
        <div class="form-item">
          <span class="label">客户号</span>
          <input class="input" v-model="formData.customerId" placeholder="请输入客户号" />
        </div>
        <div class="form-item">
          <span class="label">客户姓名</span>
          <input class="input" v-model="formData.customerName" placeholder="请输入客户姓名" />
        </div>
        <div class="form-item">
          <span class="label">案例名称</span>
          <input class="input" v-model="formData.name" placeholder="请输入案例名称" />
        </div>
      </div>

      <div class="card">
        <div class="section-title">主诉</div>
        <textarea class="textarea" v-model="formData.complaint" placeholder="请输入主诉内容" rows="3"></textarea>
      </div>

      <div class="card">
        <div class="section-title">现病史</div>
        <textarea class="textarea" v-model="formData.history" placeholder="请输入现病史内容" rows="5"></textarea>
      </div>

      <div class="card">
        <div class="section-title">既往史</div>
        <textarea class="textarea" v-model="formData.pastHistory" placeholder="请输入既往史内容" rows="3"></textarea>
      </div>
    </div>

    <div class="footer">
      <button class="submit-btn" @click="onSubmit">保存</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Detail',
  data() {
    return {
      isNewCase: true,
      formData: {
        customerId: '',
        customerName: '',
        name: '',
        complaint: '',
        history: '',
        pastHistory: ''
      }
    }
  },
  mounted() {
    const id = this.$route.params.id
    if (id) {
      this.isNewCase = false
      this.loadCase(id)
    }
  },
  methods: {
    loadCase(id) {
      const cases = JSON.parse(localStorage.getItem('cases') || '[]')
      const caseData = cases.find(c => c.id == id)
      if (caseData) {
        this.formData = { ...caseData }
      }
    },
    onBack() {
      this.$router.back()
    },
    onEditCase() {
      console.log('Edit case')
    },
    onSubmit() {
      let cases = JSON.parse(localStorage.getItem('cases') || '[]')
      if (this.isNewCase) {
        const newId = cases.length > 0 ? Math.max(...cases.map(c => c.id)) + 1 : 1
        this.formData.id = newId
        this.formData.date = new Date().toISOString().split('T')[0]
        cases.push({ ...this.formData })
      } else {
        const index = cases.findIndex(c => c.id == this.$route.params.id)
        if (index !== -1) {
          cases[index] = { ...this.formData }
        }
      }
      localStorage.setItem('cases', JSON.stringify(cases))
      alert('保存成功')
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}
.back-btn {
  cursor: pointer;
}
.back-icon {
  font-size: 24px;
  color: #333;
}
.title {
  font-size: 18px;
  color: #333;
}
.edit-btn {
  cursor: pointer;
}
.edit-text {
  color: #007aff;
  font-size: 14px;
}
.placeholder {
  width: 40px;
}
.content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}
.card {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}
.basic-info .form-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.basic-info .form-item:last-child {
  margin-bottom: 0;
}
.label {
  width: 80px;
  font-size: 14px;
  color: #666;
}
.input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  border-bottom: 1px solid #eee;
  padding: 8px 0;
}
.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}
.textarea {
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  resize: none;
  font-family: inherit;
}
.footer {
  padding: 15px 20px;
  background: #fff;
  border-top: 1px solid #eee;
}
.submit-btn {
  width: 100%;
  height: 44px;
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}
</style>
