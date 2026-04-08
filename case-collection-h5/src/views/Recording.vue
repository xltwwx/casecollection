<template>
  <div class="container">
    <div class="header">
      <div class="back-btn" @click="onBack">
        <span class="back-icon">←</span>
      </div>
      <h1 class="title">录音</h1>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="record-area">
        <button 
          class="record-btn" 
          :class="{ recording: isRecording }"
          @touchstart="startRecord"
          @touchend="stopRecord"
          @mousedown="startRecord"
          @mouseup="stopRecord"
          @mouseleave="stopRecord"
        >
          <span class="record-icon">{{ isRecording ? '■' : '🎤' }}</span>
          <span class="record-text">{{ isRecording ? '松开结束' : '按住说话' }}</span>
        </button>
      </div>

      <div v-if="audioUrl" class="audio-player">
        <audio :src="audioUrl" controls></audio>
      </div>

      <div v-if="transcript" class="transcript">
        <div class="transcript-title">识别结果：</div>
        <div class="transcript-content">{{ transcript }}</div>
      </div>
    </div>

    <div class="footer">
      <button class="submit-btn" @click="onSubmit" :disabled="!transcript">提交</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Recording',
  data() {
    return {
      isRecording: false,
      audioUrl: null,
      transcript: '',
      mediaRecorder: null,
      audioChunks: []
    }
  },
  methods: {
    async startRecord() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.mediaRecorder = new MediaRecorder(stream)
        this.audioChunks = []
        
        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data)
        }
        
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
          this.audioUrl = URL.createObjectURL(audioBlob)
          this.simulateTranscription()
        }
        
        this.mediaRecorder.start()
        this.isRecording = true
      } catch (err) {
        alert('无法访问麦克风：' + err.message)
      }
    },
    stopRecord() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop()
        this.isRecording = false
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
    },
    simulateTranscription() {
      setTimeout(() => {
        this.transcript = '这是模拟的语音识别结果，实际项目中需要接入语音识别 API。'
      }, 1000)
    },
    onBack() {
      this.$router.back()
    },
    onSubmit() {
      alert('提交成功：' + this.transcript)
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
.placeholder {
  width: 40px;
}
.content {
  flex: 1;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.record-area {
  margin: 40px 0;
}
.record-btn {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #007aff;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}
.record-btn.recording {
  background: #ff3b30;
  transform: scale(1.1);
}
.record-icon {
  font-size: 40px;
  color: #fff;
  margin-bottom: 10px;
}
.record-text {
  font-size: 14px;
  color: #fff;
}
.audio-player {
  width: 100%;
  margin: 20px 0;
}
.audio-player audio {
  width: 100%;
}
.transcript {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
}
.transcript-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}
.transcript-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
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
.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
