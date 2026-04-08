import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('../pages/Index.vue')
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('../pages/Detail.vue')
  },
  {
    path: '/recording',
    name: 'Recording',
    component: () => import('../pages/Recording.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
