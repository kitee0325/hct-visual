<script setup lang="ts">
import { computed } from 'vue';
import { useThemeManager } from '../composables/useThemeManager';

// 使用主题管理器
const { themeColorsRgba, isDarkMode, getThemeStyles } = useThemeManager();

// 计算组件使用的主题样式
const themeStyles = computed(() => {
  return getThemeStyles();
});
</script>

<template>
  <div class="render-ui" :style="themeStyles">
    <!-- 使用主题颜色渲染UI组件 -->
  </div>
</template>

<style scoped lang="scss">
// Variables - matching Form.vue patterns
$border-radius-sm: 8px;
$border-radius-md: 12px;
$border-radius-lg: 16px;
$box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
$transition-base: all 0.3s ease;
$border-color: #d9d9d9;

.render-ui {
  width: 100%;
  height: 100%;
  background-color: var(--theme-surface);
  color: var(--theme-on-surface);
  border-radius: $border-radius-lg;
  box-shadow: var(--theme-box-shadow-light);
  padding: 24px;
  transition: $transition-base;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
