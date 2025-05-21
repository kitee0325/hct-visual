<script setup lang="ts">
import { onMounted, watch, computed } from 'vue';
import { useThemeColors } from '../composables/useThemeColors';

// 使用共享的主题颜色状态
const { themeColorsRgba, isDarkMode } = useThemeColors();

// 计算组件使用的主题样式
const themeStyles = computed(() => {
  const colors = themeColorsRgba.value;

  if (!colors.props) return {};

  return {
    '--primary-bg': colors.props.primary,
    '--primary-text': isDarkMode.value
      ? colors.props.onPrimary
      : colors.props.onPrimary,
    '--secondary-bg': colors.props.secondary,
    '--secondary-text': colors.props.onSecondary,
    // 可以添加更多样式变量
  };
});

// 监听主题颜色变化
watch(
  () => themeColorsRgba.value,
  (newThemeColors) => {
    console.log('Theme colors updated in RenderUI:', newThemeColors);
  },
  { deep: true }
);

onMounted(() => {
  // 初始化UI渲染逻辑
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
  background-color: var(--primary-bg);
  color: var(--primary-text);
  border-radius: $border-radius-lg;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: $transition-base;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
