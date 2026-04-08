import { createApp } from 'vue'
import router from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(router)

// 将 router 挂载到全局 window 对象，供 wx-api 使用
if (typeof window !== 'undefined') {
  window.__vueRouter = router
}

app.mount('#app')
