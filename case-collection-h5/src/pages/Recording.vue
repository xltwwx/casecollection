<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="close-btn" @click="onClose">
        <span class="close-icon">✕</span>
      </div>
      <h1 class="title">{{ title }}</h1>
      <div class="complete-btn" @click="onComplete">
        <span class="complete-text">完成</span>
      </div>
    </div>
    
    <!-- Content - Scrollable Area -->
    <div class="content">
      <!-- Hint -->
      <div class="hint-box">
        <div class="hint-header">
          <span class="hint-icon">ℹ️</span>
          <span class="hint-title">录音模板提示</span>
        </div>
        <span class="hint-text">{{ hint }}</span>
      </div>
      
      <!-- Timer/Status -->
      <div class="timer-section">
        <span class="timer">{{ formattedTime }}</span>
        <div class="status-badge" :class="{ 'recording-status': isRecording }">
          <span class="status-text">{{ statusText }}</span>
        </div>
      </div>
      
      <!-- Controls -->
      <div class="controls-section">
        <!-- Has recording, not recording: show delete, play, re-record buttons -->
        <div v-if="hasRecording && !isRecording" class="controls-row">
          <div class="control-btn delete-btn" @click="onDelete">
            <span class="btn-icon">🗑️</span>
          </div>
          <div class="control-btn play-btn" @click="onPlay">
            <span class="btn-icon-large">▶</span>
          </div>
          <div class="control-btn re-record-btn" @click="onReRecord">
            <span class="btn-icon">🔄</span>
          </div>
        </div>
        
        <!-- Recording or no recording: show main record button -->
        <div v-else class="main-record-btn" @click="onRecordTap">
          <div class="record-btn-inner" :class="{ 'recording': isRecording }">
            <span v-if="!isRecording" class="mic-icon">🎤</span>
            <span v-else class="stop-icon">⬛</span>
          </div>
          <div v-if="isRecording" class="pulse-ring"></div>
        </div>
        
        <span class="control-hint">{{ controlHint }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import wx from '../utils/wx-api'

const route = useRoute()
const router = useRouter()

const moduleId = ref('')
const title = ref('')
const hint = ref('')
const isRecording = ref(false)
const hasRecording = ref(false)
const hasExistingRecording = ref(false)
const recordingContent = ref('')
const timer = ref(0)
const formattedTime = ref('00:00')
const statusText = ref('准备就绪')
const controlHint = ref('点击蓝色按钮开始录音')

let timerInterval = null
let mediaRecorder = null

const onLoad = () => {
  moduleId.value = route.query.moduleId || ''
  title.value = decodeURIComponent(route.query.title || '')
  hint.value = decodeURIComponent(route.query.hint || '')
  
  // 检查是否已有录音
  checkExistingRecording()
}

const checkExistingRecording = () => {
  const tempData = wx.getStorageSync('tempRecording')
  if (tempData && tempData.moduleId === moduleId.value && tempData.content) {
    hasRecording.value = true
    hasExistingRecording.value = true
    recordingContent.value = tempData.content
    isRecording.value = false
    timer.value = 0
    formattedTime.value = '00:00'
    statusText.value = '录音已完成'
    controlHint.value = '您可以试听、删除或重新录制'
  } else {
    // 没有已有录音，重置状态
    hasRecording.value = false
    hasExistingRecording.value = false
    recordingContent.value = ''
    isRecording.value = false
    timer.value = 0
    formattedTime.value = '00:00'
    statusText.value = '准备就绪'
    controlHint.value = '点击麦克风按钮开始录音'
  }
}

const startTimer = () => {
  let seconds = 0
  timer.value = 0
  formattedTime.value = '00:00'
  
  timerInterval = setInterval(() => {
    seconds++
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    timer.value = seconds
    formattedTime.value = formatted
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const onRecordTap = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const startRecording = () => {
  isRecording.value = true
  statusText.value = '正在录音中...'
  controlHint.value = '点击红色按钮停止录音'
  startTimer()
  
  // 使用浏览器原生录音 API
  try {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream)
        const audioChunks = []
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data)
        }
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
          const audioUrl = URL.createObjectURL(audioBlob)
          
          const content = `录音文件：${audioUrl} - ${new Date().toLocaleTimeString()}`
          hasRecording.value = true
          recordingContent.value = content
          statusText.value = '录音已完成'
          controlHint.value = '您可以试听、删除或重新录制'
          
          // 保存到临时存储
          wx.setStorageSync('tempRecording', {
            moduleId: moduleId.value,
            content: content,
            tempFilePath: audioUrl
          })
          
          // 停止所有音轨
          stream.getTracks().forEach(track => track.stop())
        }
        
        mediaRecorder.start()
      })
      .catch(err => {
        console.error('录音权限被拒绝:', err)
        handleSimulatedRecording()
      })
  } catch (e) {
    console.error('录音启动失败:', e)
    handleSimulatedRecording()
  }
}

const handleSimulatedRecording = () => {
  stopTimer()
  const content = `模拟录音数据 - ${title.value} - ${new Date().toLocaleTimeString()}`
  isRecording.value = false
  hasRecording.value = true
  hasExistingRecording.value = true
  recordingContent.value = content
  statusText.value = '录音已完成'
  controlHint.value = '您可以试听、删除或重新录制'
  
  wx.setStorageSync('tempRecording', {
    moduleId: moduleId.value,
    content: content
  })
}

const stopRecording = () => {
  isRecording.value = false
  statusText.value = '录音已完成'
  controlHint.value = '您可以试听、删除或重新录制'
  stopTimer()
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  } else {
    handleSimulatedRecording()
  }
}

const onReRecord = () => {
  // 删除当前录音，准备重新录制
  if (confirm('是否删除当前录音并重新录制？')) {
    hasRecording.value = false
    hasExistingRecording.value = false
    recordingContent.value = ''
    timer.value = 0
    formattedTime.value = '00:00'
    statusText.value = '准备就绪'
    controlHint.value = '点击麦克风按钮开始录音'
    wx.removeStorageSync('tempRecording')
  }
}

const onDelete = () => {
  onReRecord()
}

const onPlay = () => {
  if (recordingContent.value) {
    alert('播放录音（演示）')
    // 实际使用时可以用 Audio 播放音频
  }
}

const onComplete = () => {
  if (hasRecording.value) {
    // 保存录音数据到模块
    const tempData = wx.getStorageSync('tempRecording')
    if (tempData && window.__updateRecordingData) {
      window.__updateRecordingData(moduleId.value, tempData.content)
    }
  } else {
    // 没有录音也允许返回，清空该模块的录音
    wx.removeStorageSync('tempRecording')
  }
  router.back()
}

const onClose = () => {
  // 不清除临时数据，保留录音结果
  router.back()
}

onMounted(() => {
  onLoad()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ffffff;
  overflow: hidden;
}

.header {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(243, 244, 246, 0.6);
  flex-shrink: 0;
  min-height: 56px;
  background-color: #ffffff;
}

.close-btn,
.complete-btn {
  width: 48px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:active,
.complete-btn:active {
  background-color: #f3f4f6;
}

.close-icon {
  font-size: 22px;
  color: #6b7280;
}

.complete-text {
  font-size: 15px;
  font-weight: 600;
  color: #667eea;
  white-space: nowrap;
}

.title {
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
  flex: 1;
  text-align: center;
  margin: 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.hint-box {
  margin: 20px 16px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 16px;
  padding: 16px;
}

.hint-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.hint-icon {
  font-size: 18px;
}

.hint-title {
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
}

.hint-text {
  font-size: 13px;
  color: #1e40af;
  line-height: 1.6;
  display: block;
}

.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
}

.timer {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 56px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -2px;
  margin-bottom: 20px;
  font-variant-numeric: tabular-nums;
}

.status-badge {
  background-color: #f3f4f6;
  padding: 8px 24px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.status-badge.recording-status {
  background-color: #fee2e2;
  animation: pulse-bg 1.5s ease-in-out infinite;
}

@keyframes pulse-bg {
  0%, 100% {
    background-color: #fee2e2;
  }
  50% {
    background-color: #fecaca;
  }
}

.status-text {
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
}

.controls-section {
  padding: 32px 24px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  width: 100%;
  max-width: 320px;
}

.control-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:active {
  transform: scale(0.92);
}

.delete-btn {
  background-color: #fee2e2;
}

.re-record-btn {
  background-color: #ffedd5;
}

.play-btn {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35);
}

.btn-icon {
  font-size: 22px;
}

.btn-icon-large {
  font-size: 32px;
  color: #ffffff;
}

.main-record-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.record-btn-inner {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
  z-index: 10;
  transition: all 0.3s ease;
}

.record-btn-inner.recording {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(239, 68, 68, 0.4);
}

.mic-icon {
  font-size: 36px;
}

.stop-icon {
  font-size: 28px;
  color: #ffffff;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background-color: #ef4444;
  animation: pulse 1.5s ease-out infinite;
  z-index: 1;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.6);
    opacity: 0;
  }
}

.control-hint {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
  text-align: center;
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
  
  .timer {
    font-size: 48px;
  }
  
  .controls-section {
    padding: 28px 20px 50px;
  }
  
  .record-btn-inner {
    width: 76px;
    height: 76px;
  }
  
  .mic-icon {
    font-size: 32px;
  }
  
  .play-btn {
    width: 70px;
    height: 70px;
  }
  
  .control-btn {
    width: 50px;
    height: 50px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>
