import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('../views/Index.vue')
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('../views/Detail.vue')
  },
  {
    path: '/recording',
    name: 'Recording',
    component: () => import('../views/Recording.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
