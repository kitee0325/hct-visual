import './assets/main.css';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

import { createApp } from 'vue';
import App from './App.vue';
import { useElementTheme } from './composables/useElementTheme';

// 引入封装好的router
import router from './router';

// 初始化Element Plus主题
useElementTheme();

createApp(App).use(router).mount('#app');
