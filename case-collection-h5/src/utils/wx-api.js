// 模拟微信小程序的 wx API
const wx = {
  // 本地存储
  getStorageSync(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (e) {
      console.error('getStorageSync error:', e)
      return null
    }
  },
  
  setStorageSync(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.error('setStorageSync error:', e)
    }
  },
  
  removeStorageSync(key) {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error('removeStorageSync error:', e)
    }
  },
  
  // 导航
  navigateTo({ url }) {
    // 在 Vue Router 中处理
    window.__vueRouter?.push(url)
  },
  
  navigateBack() {
    window.__vueRouter?.back()
  },
  
  // UI 反馈
  showToast({ title, icon = 'success' }) {
    console.log('Toast:', title)
    // 实际项目中可以实现一个 toast 组件
  },
  
  showModal({ title, content, editable, placeholderText, success }) {
    if (editable) {
      const value = prompt(placeholderText || '')
      if (value) {
        success({ confirm: true, content: value })
      } else {
        success({ confirm: false })
      }
    } else {
      const confirmed = confirm(content)
      success({ confirm: confirmed })
    }
  },
  
  showActionSheet({ itemList, success }) {
    const choice = prompt(`请选择 (0-${itemList.length - 1}): ${itemList.join(', ')}`)
    const index = parseInt(choice)
    if (!isNaN(index) && index >= 0 && index < itemList.length) {
      success({ tapIndex: index })
    }
  },
  
  // 录音相关 API
  getRecorderManager() {
    let mediaRecorder = null
    let audioChunks = []
    
    return {
      onStart(callback) {
        this._onStart = callback
      },
      onStop(callback) {
        this._onStop = callback
      },
      onError(callback) {
        this._onError = callback
      },
      start(options) {
        try {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
              mediaRecorder = new MediaRecorder(stream)
              audioChunks = []
              
              mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data)
              }
              
              mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
                const audioUrl = URL.createObjectURL(audioBlob)
                
                if (this._onStop) {
                  this._onStop({
                    tempFilePath: audioUrl,
                    duration: options.duration
                  })
                }
                
                // 停止所有音轨
                stream.getTracks().forEach(track => track.stop())
              }
              
              if (this._onStart) {
                this._onStart()
              }
              
              mediaRecorder.start()
            })
            .catch(err => {
              console.error('录音权限被拒绝:', err)
              if (this._onError) {
                this._onError({ errMsg: err.message })
              }
            })
        } catch (e) {
          console.error('录音启动失败:', e)
          if (this._onError) {
            this._onError({ errMsg: e.message })
          }
        }
      },
      stop() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop()
        }
      }
    }
  },
  
  createInnerAudioContext() {
    const audio = new Audio()
    return {
      src: '',
      play() {
        audio.play()
      },
      pause() {
        audio.pause()
      },
      stop() {
        audio.pause()
        audio.currentTime = 0
      },
      onEnded(callback) {
        audio.onended = callback
      },
      onError(callback) {
        audio.onerror = callback
      }
    }
  }
}

export default wx
