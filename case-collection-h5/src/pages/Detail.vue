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
  background-color: #f3f4f6;
  overflow: hidden;
}

.header {
  background-color: #ffffff;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #f3f4f6;
  flex-shrink: 0;
}

.back-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.back-icon {
  font-size: 40rpx;
  color: #4b5563;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  flex: 1;
  text-align: center;
  margin: 0 24rpx;
}

.placeholder {
  width: 48rpx;
}

.edit-btn {
  width: 64rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.edit-text {
  font-size: 26rpx;
  font-weight: bold;
  color: #2563eb;
}

.modify-section {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f3f4f6;
}

.modify-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx;
  background-color: #fef3c7;
  border-radius: 16rpx;
  cursor: pointer;
}

.modify-icon {
  font-size: 24rpx;
}

.modify-text {
  font-size: 24rpx;
  color: #92400e;
  font-weight: 500;
}

.content {
  flex: 1;
  padding: 20rpx;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.card {
  background-color: #ffffff;
  border-radius: 32rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.form-item {
  margin-bottom: 24rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 22rpx;
  font-weight: bold;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  margin-bottom: 12rpx;
  display: block;
}

.input-wrapper {
  width: 100%;
  background-color: #f9fafb;
  border-radius: 24rpx;
  padding: 0 32rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 28rpx;
  border: none;
  background: transparent;
  outline: none;
}

.picker-value {
  width: 100%;
  background-color: #f9fafb;
  border-radius: 24rpx;
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  color: #1f2937;
  height: 88rpx;
  line-height: 88rpx;
  box-sizing: border-box;
  border: none;
  outline: none;
}

.modules-list {
  margin-bottom: 20rpx;
}

.module-card {
  background-color: #ffffff;
  border-radius: 32rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
  border: 1rpx solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.module-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #e5e7eb;
}

.status-dot.active {
  background-color: #22c55e;
}

.module-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #1f2937;
}

.module-action {
  width: 64rpx;
  height: 64rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
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
  padding: 48rpx 0 80rpx;
}

.submit-btn {
  width: 300rpx;
  background-color: #2563eb;
  color: #ffffff;
  border-radius: 24rpx;
  font-size: 30rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.2);
  border: none;
  cursor: pointer;
  padding: 12px 24px;
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
  border-radius: 48rpx;
  padding: 48rpx;
  width: 600rpx;
  text-align: center;
}

.modal-icon {
  width: 100rpx;
  height: 100rpx;
  background-color: #dbeafe;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  margin: 0 auto 24rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1f2937;
  display: block;
  margin-bottom: 16rpx;
}

.modal-desc {
  font-size: 26rpx;
  color: #6b7280;
  display: block;
  margin-bottom: 48rpx;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  gap: 20rpx;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 24rpx 0;
  border-radius: 24rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  cursor: pointer;
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
    padding: 20rpx;
  }
  
  .title {
    font-size: 28rpx;
    margin: 0 16rpx;
  }
  
  .content {
    padding: 16rpx;
  }
  
  .card {
    padding: 20rpx;
    border-radius: 24rpx;
  }
  
  .module-card {
    padding: 20rpx;
  }
  
  .submit-btn {
    width: 260rpx;
    font-size: 28rpx;
  }
  
  .modal-content {
    width: 540rpx;
    padding: 40rpx;
  }
}
</style>
