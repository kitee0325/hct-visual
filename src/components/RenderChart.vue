<script setup lang="ts">
import { onMounted, computed, ref, watchEffect } from 'vue';
import { useThemeManager } from '../composables/useThemeManager';

// 使用主题管理器
const { themeColorsRgba, lastUpdatedTimestamp } = useThemeManager();
const chartContainerRef = ref(null);

// 计算主题样式
const chartStyles = computed(() => {
  const colors = themeColorsRgba.value;
  if (!colors || !colors.props) return {};

  return {
    backgroundColor: colors.surface || colors.props.surface,
    color: colors.onSurface || colors.props.onSurface,
    borderColor: colors.outline || colors.props.outline,
  };
});

// 更新图表显示
function updateChartDisplay(colors: any) {
  if (!colors || !colors.props) return;

  // 这里可以实现基于主题颜色的图表渲染逻辑
  // 例如：使用echarts或其他图表库更新图表颜色

  // 确保直接修改DOM元素的样式以应用主题颜色
  if (chartContainerRef.value) {
    const container = chartContainerRef.value as HTMLElement;
    container.style.backgroundColor = colors.props.surface;
    container.style.color = colors.props.onSurface;
    container.style.borderColor = colors.props.outline;

    // 添加更新时间戳，便于追踪最近一次更新
    console.log(
      'Chart updated at:',
      new Date(lastUpdatedTimestamp.value).toLocaleTimeString()
    );
  }
}

// 使用watchEffect监听主题变化
watchEffect(() => {
  if (themeColorsRgba.value && chartContainerRef.value) {
    updateChartDisplay(themeColorsRgba.value);
  }
});

onMounted(() => {
  // 确保在组件挂载后应用初始主题
  if (themeColorsRgba.value && themeColorsRgba.value.props) {
    updateChartDisplay(themeColorsRgba.value);
  }
});
</script>

<template>
  <div class="render-chart" ref="chartContainerRef" :style="chartStyles">
    <!-- Chart content goes here -->
  </div>
</template>

<style scoped lang="scss">
// Variables - matching Form.vue patterns
$border-radius-sm: 8px;
$border-radius-md: 12px;
$border-radius-lg: 16px;
$transition-base: all 0.3s ease;

.render-chart {
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
