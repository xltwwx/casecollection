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
        <p class="hint-text">{{ hint }}</p>
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

const route = useRoute()
const router = useRouter()

let timerInterval = null

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

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 启动计时器
const startTimer = () => {
  let seconds = 0
  timer.value = 0
  formattedTime.value = '00:00'
  
  timerInterval = setInterval(() => {
    seconds++
    timer.value = seconds
    formattedTime.value = formatTime(seconds)
  }, 1000)
}

// 停止计时器
const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// 检查已有录音
const checkExistingRecording = () => {
  const tempDataStr = localStorage.getItem('tempRecording')
  if (tempDataStr) {
    const tempData = JSON.parse(tempDataStr)
    if (tempData && tempData.moduleId === moduleId.value && tempData.content) {
      hasRecording.value = true
      hasExistingRecording.value = true
      recordingContent.value = tempData.content
      isRecording.value = false
      timer.value = 0
      formattedTime.value = '00:00'
      statusText.value = '录音已完成'
      controlHint.value = '您可以试听、删除或重新录制'
      return
    }
  }
  
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

// 开始录音
const startRecording = () => {
  isRecording.value = true
  statusText.value = '正在录音中...'
  controlHint.value = '点击红色按钮停止录音'
  startTimer()
  
  // 使用浏览器原生录音 API（如果支持）
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream)
        const audioChunks = []
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data)
        }
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
          const content = `录音文件：${new Date().toLocaleTimeString()}`
          hasRecording.value = true
          recordingContent.value = content
          statusText.value = '录音已完成'
          controlHint.value = '您可以试听、删除或重新录制'
          
          localStorage.setItem('tempRecording', JSON.stringify({
            moduleId: moduleId.value,
            content: content
          }))
          
          // 停止所有音轨
          stream.getTracks().forEach(track => track.stop())
        }
        
        mediaRecorder.start()
        ;(window as any).currentMediaRecorder = mediaRecorder
      })
      .catch(err => {
        console.error('无法获取麦克风权限:', err)
        handleSimulatedRecording()
      })
  } else {
    handleSimulatedRecording()
  }
}

// 模拟录音
const handleSimulatedRecording = () => {
  stopTimer()
  const content = `模拟录音数据 - ${title.value} - ${new Date().toLocaleTimeString()}`
  isRecording.value = false
  hasRecording.value = true
  hasExistingRecording.value = true
  recordingContent.value = content
  statusText.value = '录音已完成'
  controlHint.value = '您可以试听、删除或重新录制'
  
  localStorage.setItem('tempRecording', JSON.stringify({
    moduleId: moduleId.value,
    content: content
  }))
}

// 停止录音
const stopRecording = () => {
  isRecording.value = false
  statusText.value = '录音已完成'
  controlHint.value = '您可以试听、删除或重新录制'
  stopTimer()
  
  // 停止媒体录制器
  if ((window as any).currentMediaRecorder) {
    try {
      ;(window as any).currentMediaRecorder.stop()
    } catch (e) {
      handleSimulatedRecording()
    }
  } else {
    handleSimulatedRecording()
  }
}

// 点击录音按钮
const onRecordTap = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 删除/重新录制
const onDelete = () => {
  onReRecord()
}

// 重新录制
const onReRecord = () => {
  if (confirm('是否删除当前录音并重新录制？')) {
    hasRecording.value = false
    hasExistingRecording.value = false
    recordingContent.value = ''
    timer.value = 0
    formattedTime.value = '00:00'
    statusText.value = '准备就绪'
    controlHint.value = '点击麦克风按钮开始录音'
    localStorage.removeItem('tempRecording')
  }
}

// 播放
const onPlay = () => {
  if (recordingContent.value) {
    alert('播放录音（演示）')
  }
}

// 完成
const onComplete = () => {
  if (hasRecording.value) {
    const tempDataStr = localStorage.getItem('tempRecording')
    if (tempDataStr) {
      const tempData = JSON.parse(tempDataStr)
      // 通知 detail 页面更新录音数据（通过事件或直接在 detail 页面读取）
    }
  } else {
    localStorage.removeItem('tempRecording')
  }
  router.back()
}

// 关闭
const onClose = () => {
  router.back()
}

onMounted(() => {
  moduleId.value = route.query.moduleId || ''
  title.value = decodeURIComponent(route.query.title || '')
  hint.value = decodeURIComponent(route.query.hint || '')
  checkExistingRecording()
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
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 0.5px solid #f3f4f6;
  flex-shrink: 0;
  min-height: 44px;
}

.close-btn,
.complete-btn {
  width: 32px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}

.close-icon {
  font-size: 20px;
  color: #6b7280;
}

.complete-text {
  font-size: 14px;
  font-weight: bold;
  color: #2563eb;
  white-space: nowrap;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #1f2937;
  flex: 1;
  text-align: center;
  margin: 0 8px;
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
  margin: 16px;
  background-color: #dbeafe;
  border-radius: 16px;
  padding: 12px;
}

.hint-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.hint-icon {
  font-size: 16px;
}

.hint-title {
  font-size: 13px;
  font-weight: bold;
  color: #2563eb;
}

.hint-text {
  font-size: 13px;
  color: #1e40af;
  line-height: 1.6;
  display: block;
  margin: 0;
}

.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
}

.timer {
  font-family: monospace;
  font-size: 48px;
  font-weight: bold;
  color: #1f2937;
  letter-spacing: -2px;
  margin-bottom: 16px;
}

.status-badge {
  background-color: #f3f4f6;
  padding: 6px 16px;
  border-radius: 16px;
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
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
}

.controls-section {
  padding: 24px 16px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  max-width: 250px;
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
  background-color: #2563eb;
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.3);
}

.btn-icon {
  font-size: 18px;
}

.btn-icon-large {
  font-size: 28px;
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
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background-color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 48px rgba(37, 99, 235, 0.4);
  z-index: 10;
  transition: all 0.3s ease;
}

.record-btn-inner.recording {
  background-color: #ef4444;
  transform: scale(1.1);
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
  width: 96px;
  height: 96px;
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
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
  text-align: center;
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
  
  .timer {
    font-size: 40px;
  }
  
  .controls-section {
    padding: 20px 12px 30px;
  }
  
  .record-btn-inner {
    width: 80px;
    height: 80px;
  }
  
  .mic-icon {
    font-size: 32px;
  }
  
  .play-btn {
    width: 70px;
    height: 70px;
  }
  
  .control-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
