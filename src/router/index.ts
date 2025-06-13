import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home.vue';
import Palette from '@/pages/Palette/index.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/palette',
    name: 'Palette',
    component: Palette,
  },
  // 可以在此处继续添加其他页面路由
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
