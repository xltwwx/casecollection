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
              @input="onCustomerIdInput"
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
import store from '../store/index'
import wx from '../utils/wx-api'

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

const loadCaseData = () => {
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
}

const onCustomerIdInput = () => {
  // v-model 自动处理
}

const onBusinessTypeChange = () => {
  const type = businessTypes[businessTypeIndex.value]
  formData.businessType = type
  formData.type = type
}

const onModuleTap = (module) => {
  const moduleId = module.id
  
  // 检查该模块是否已有录音数据
  const existingContent = formData.recordings[moduleId]
  
  // 清除之前的临时录音数据
  wx.removeStorageSync('tempRecording')
  
  // 如果已有录音，先保存到临时存储以便录音页面恢复
  if (existingContent) {
    wx.setStorageSync('tempRecording', {
      moduleId: moduleId,
      content: existingContent
    })
  }
  
  router.push({
    path: '/recording',
    query: {
      moduleId: moduleId,
      title: encodeURIComponent(module.title),
      hint: encodeURIComponent(module.hint)
    }
  })
}

// 更新录音数据的方法（供 recording 页面调用）
const updateRecordingData = (moduleId, content) => {
  formData.recordings[moduleId] = content
}

// 暴露方法给全局
onMounted(() => {
  window.__updateRecordingData = updateRecordingData
  loadCaseData()
})

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
  store.saveCase({ ...formData })
  
  hideConfirm()
  router.back()
}

// 编辑已有案例的方法
const onEditCase = () => {
  const customerId = prompt('请输入客户号')
  if (customerId) {
    formData.customerId = customerId
    alert('修改成功')
  }
}

// 修改业务类型
const onModifyBusinessType = () => {
  const choice = prompt(`请选择业务类型 (0-${businessTypes.length - 1}): ${businessTypes.join(', ')}`)
  const index = parseInt(choice)
  if (!isNaN(index) && index >= 0 && index < businessTypes.length) {
    const type = businessTypes[index]
    businessTypeIndex.value = index
    formData.businessType = type
    formData.type = type
    alert('修改成功')
  }
}

const onBack = () => {
  router.back()
}

// 监听路由变化重新加载数据
route.params.id // 触发 watch
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
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.2);
  flex-shrink: 0;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.back-btn:active {
  background-color: rgba(255, 255, 255, 0.2);
}

.back-icon {
  font-size: 24px;
  color: #ffffff;
  font-weight: 300;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  flex: 1;
  text-align: center;
  margin: 0 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.placeholder {
  width: 40px;
}

.edit-btn {
  width: 52px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.edit-btn:active {
  background-color: rgba(255, 255, 255, 0.2);
}

.edit-text {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.modify-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(243, 244, 246, 0.6);
}

.modify-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background-color: #fef3c7;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modify-btn:active {
  transform: scale(0.98);
}

.modify-icon {
  font-size: 16px;
}

.modify-text {
  font-size: 13px;
  color: #92400e;
  font-weight: 500;
}

.content {
  flex: 1;
  padding: 14px;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(243, 244, 246, 0.6);
}

.form-item {
  margin-bottom: 18px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  display: block;
}

.input-wrapper {
  width: 100%;
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  background-color: #ffffff;
}

.input {
  width: 100%;
  height: 48px;
  line-height: 48px;
  font-size: 15px;
  border: none;
  background: transparent;
  outline: none;
  color: #1f2937;
}

.picker-value {
  width: 100%;
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  color: #1f2937;
  height: 48px;
  line-height: 48px;
  box-sizing: border-box;
  border: 1px solid transparent;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.picker-value:hover {
  background-color: #f1f5f9;
}

.modules-list {
  margin-bottom: 14px;
}

.module-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(243, 244, 246, 0.6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
}

.module-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.module-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #e5e7eb;
  transition: all 0.3s ease;
}

.status-dot.active {
  background-color: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
}

.module-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.module-action {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;
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
  width: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  border: none;
  cursor: pointer;
  padding: 14px 32px;
  transition: all 0.3s ease;
}

.submit-btn:active {
  transform: scale(0.96);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: #ffffff;
  border-radius: 24px;
  padding: 32px 24px;
  width: 85%;
  max-width: 340px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 16px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  display: block;
  margin-bottom: 10px;
}

.modal-desc {
  font-size: 14px;
  color: #6b7280;
  display: block;
  margin-bottom: 28px;
  line-height: 1.6;
}

.modal-buttons {
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 14px 0;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-cancel:active {
  background-color: #e5e7eb;
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-confirm:active {
  transform: scale(0.96);
}

/* 响应式适配 */
@media (max-width: 375px) {
  .header {
    padding: 12px 14px;
  }
  
  .title {
    font-size: 16px;
    margin: 0 10px;
  }
  
  .content {
    padding: 12px;
  }
  
  .card {
    padding: 16px;
    border-radius: 14px;
  }
  
  .module-card {
    padding: 14px;
  }
  
  .submit-btn {
    width: 180px;
    font-size: 15px;
  }
  
  .modal-content {
    width: 90%;
    padding: 28px 20px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>
