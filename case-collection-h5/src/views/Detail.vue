<template>
  <div class="container">
    <!-- Header -->
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
    
    <!-- Scrollable Content -->
    <div class="content">
      <!-- Basic Info -->
      <div class="card basic-info">
        <div class="form-item">
          <span class="label">客户号</span>
          <div class="input-wrapper">
            <input 
              class="input" 
              placeholder="请输入客户号" 
              v-model="formData.customerId"
            />
          </div>
        </div>
        <div class="form-item">
          <span class="label">业务类型</span>
          <select 
            class="picker-value"
            v-model="businessTypeIndex"
            @change="onBusinessTypeChange"
          >
            <option v-for="(type, index) in businessTypes" :key="type" :value="index">
              {{ type }}
            </option>
          </select>
        </div>
        <!-- 修改按钮区域 -->
        <div v-if="!isNewCase" class="modify-section">
          <div class="modify-btn" @click="onModifyBusinessType">
            <span class="modify-icon">✏️</span>
            <span class="modify-text">修改类型</span>
          </div>
        </div>
      </div>
      
      <!-- Modules -->
      <div class="modules-list">
        <div 
          v-for="item in modules" 
          :key="item.id" 
          class="module-card"
          @click="onModuleTap(item)"
        >
          <div class="module-left">
            <div class="status-dot" :class="{ active: formData.recordings[item.id] }"></div>
            <span class="module-title">{{ item.title }}</span>
          </div>
          <div class="module-action" :class="{ 'has-recording': formData.recordings[item.id] }">
            <span v-if="formData.recordings[item.id]">▶</span>
            <span v-else>🎤</span>
          </div>
        </div>
      </div>
      
      <!-- Submit Button -->
      <div class="submit-section">
        <button class="submit-btn" @click="onSubmitTap">确认提交</button>
      </div>
    </div>
    
    <!-- Confirm Modal -->
    <div v-if="showConfirm" class="modal-overlay" @click="hideConfirm">
      <div class="modal-content" @click.stop>
        <div class="modal-icon">✓</div>
        <h2 class="modal-title">确认提交</h2>
        <p class="modal-desc">是否确认提交当前案例及所有模块的录音文件？</p>
        <div class="modal-buttons">
          <button class="btn-cancel" @click="hideConfirm">取消</button>
          <button class="btn-confirm" @click="confirmSubmit">确认提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { store } from '../store'

const router = useRouter()
const route = useRoute()

const MODULES = [
  { id: 'intro', title: '拟交流案例介绍', hint: '请录入案例标题、时间、客户姓名、客户类型、经营行业及贷款金额等基本信息。' },
  { id: 'customer', title: '客户基本信息与社区化', hint: '请录入客户的家庭情况、经营情况以及资产负债等社区化信息。' },
  { id: 'scheme', title: '贷款方案', hint: '请录入贷款利率、期限、担保方式及还款方式等具体方案内容。' },
  { id: 'investigation', title: '调查过程', hint: '请录入非现场调查和现场调查的具体过程与发现。' },
  { id: 'focus', title: '决策争议焦点', hint: '请录入该案例在决策过程中的核心争议点及模型分析结果。' },
]

const formData = reactive({
  id: '',
  name: '',
  customerName: '',
  customerId: '',
  businessType: '正常',
  duration: '00:00',
  date: '',
  type: '正常',
  intro: { title: '', time: '', customerName: '', customerType: '', industry: '', amount: '' },
  customerInfo: { family: '', business: '', assetsLiabilities: '' },
  loanScheme: { rate: '', term: '', guarantee: '', repayment: '' },
  investigation: { offSite: '', onSite: '' },
  decisionFocus: '',
  recordings: {}
})

const modules = MODULES
const businessTypes = ['正常', '纠结', '拒贷', '逾期']
const businessTypeIndex = ref(0)
const showConfirm = ref(false)
const isNewCase = ref(false)

// 初始化
onMounted(() => {
  const id = route.params.id
  
  if (id === 'new') {
    // 新案例
    const today = new Date().toISOString().split('T')[0]
    formData.id = Math.random().toString(36).substr(2, 9)
    formData.date = today
    isNewCase.value = true
  } else {
    // 编辑已有案例
    const caseItem = store.getCaseById(id)
    if (caseItem) {
      Object.assign(formData, caseItem)
      const index = businessTypes.indexOf(caseItem.type || caseItem.businessType || '正常')
      businessTypeIndex.value = index >= 0 ? index : 0
    }
  }
})

// 业务类型变更
const onBusinessTypeChange = () => {
  const type = businessTypes[businessTypeIndex.value]
  formData.businessType = type
  formData.type = type
}

// 点击模块
const onModuleTap = (module) => {
  const moduleId = module.id
  
  // 检查该模块是否已有录音数据
  const existingContent = formData.recordings[moduleId]
  
  // 清除之前的临时录音数据
  localStorage.removeItem('tempRecording')
  
  // 如果已有录音，先保存到临时存储以便录音页面恢复
  if (existingContent) {
    localStorage.setItem('tempRecording', JSON.stringify({
      moduleId: moduleId,
      content: existingContent
    }))
  }
  
  router.push(`/recording?moduleId=${moduleId}&title=${encodeURIComponent(module.title)}&hint=${encodeURIComponent(module.hint)}`)
}

// 提交
const onSubmitTap = () => {
  showConfirm.value = true
}

const hideConfirm = () => {
  showConfirm.value = false
}

const confirmSubmit = () => {
  const name = formData.customerId ? `案例-${formData.customerId}` : '未命名案例'
  formData.name = name
  
  // 保存数据
  store.upsertCase({ ...formData })
  
  hideConfirm()
  router.back()
}

// 编辑已有案例
const onEditCase = () => {
  const newCustomerId = prompt('请输入客户号', formData.customerId)
  if (newCustomerId !== null && newCustomerId.trim()) {
    formData.customerId = newCustomerId.trim()
    alert('修改成功')
  }
}

// 修改业务类型
const onModifyBusinessType = () => {
  const newIndex = prompt(`请选择业务类型 (0-${businessTypes.length - 1}):\n${businessTypes.map((t, i) => `${i}: ${t}`).join('\n')}`, businessTypeIndex.value.toString())
  if (newIndex !== null) {
    const idx = parseInt(newIndex)
    if (!isNaN(idx) && idx >= 0 && idx < businessTypes.length) {
      businessTypeIndex.value = idx
      onBusinessTypeChange()
      alert('修改成功')
    }
  }
}

const onBack = () => {
  router.back()
}
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
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 0.5px solid #f3f4f6;
  flex-shrink: 0;
}

.back-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.back-icon {
  font-size: 20px;
  color: #4b5563;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #1f2937;
  flex: 1;
  text-align: center;
  margin: 0 12px;
}

.placeholder {
  width: 24px;
}

.edit-btn {
  width: 32px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.edit-text {
  font-size: 13px;
  font-weight: bold;
  color: #2563eb;
}

.modify-section {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 0.5px solid #f3f4f6;
}

.modify-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  background-color: #fef3c7;
  border-radius: 8px;
  cursor: pointer;
}

.modify-icon {
  font-size: 12px;
}

.modify-text {
  font-size: 12px;
  color: #92400e;
  font-weight: 500;
}

.content {
  flex: 1;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.form-item {
  margin-bottom: 12px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 11px;
  font-weight: bold;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: block;
}

.input-wrapper {
  width: 100%;
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  height: 44px;
  line-height: 44px;
  font-size: 14px;
  border: none;
  background: transparent;
}

.picker-value {
  width: 100%;
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: #1f2937;
  height: 44px;
  line-height: 44px;
  box-sizing: border-box;
  border: none;
}

.modules-list {
  margin-bottom: 10px;
}

.module-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 0.5px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.module-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e5e7eb;
}

.status-dot.active {
  background-color: #22c55e;
}

.module-title {
  font-size: 14px;
  font-weight: bold;
  color: #1f2937;
}

.module-action {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.module-action.has-recording {
  background-color: #dcfce7;
  color: #16a34a;
}

.module-action:not(.has-recording) {
  background-color: #dbeafe;
  color: #2563eb;
}

.submit-section {
  display: flex;
  justify-content: center;
  padding: 24px 0 40px;
}

.submit-btn {
  width: 150px;
  background-color: #2563eb;
  color: #ffffff;
  border-radius: 12px;
  font-size: 15px;
  font-weight: bold;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);
  border: none;
  padding: 12px 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 24px;
  padding: 24px;
  width: 300px;
  text-align: center;
}

.modal-icon {
  width: 50px;
  height: 50px;
  background-color: #dbeafe;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 12px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
  display: block;
  margin-bottom: 8px;
}

.modal-desc {
  font-size: 13px;
  color: #6b7280;
  display: block;
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  gap: 10px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px 0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  border: none;
}

.btn-cancel {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-confirm {
  background-color: #2563eb;
  color: #ffffff;
}

/* 小屏幕适配 */
@media (max-width: 375px) {
  .header {
    padding: 10px;
  }
  
  .title {
    font-size: 14px;
    margin: 0 8px;
  }
  
  .content {
    padding: 8px;
  }
  
  .card {
    padding: 10px;
    border-radius: 12px;
  }
  
  .module-card {
    padding: 10px;
  }
  
  .submit-btn {
    width: 130px;
    font-size: 14px;
  }
  
  .modal-content {
    width: 270px;
    padding: 20px;
  }
}
</style>
