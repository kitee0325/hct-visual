<script setup lang="ts">
import {
  onMounted,
  computed,
  ref,
  watchEffect,
  nextTick,
  onBeforeUnmount,
  type Ref,
} from 'vue';
import { useThemeManager } from '../composables/useThemeManager';
import { useThemeColors } from '../composables/useThemeColors';
import * as echarts from 'echarts';
import {
  cleanChartOptions,
  getAreaChartOption,
  getBarChartOption,
  getPieChartOption,
  getScatterChartOption,
  getRadarChartOption,
  getHeatmapChartOption,
  getMapChartOption,
  getParallelChartOption,
  type ChartStyleColors,
} from '../config/chartOptions';

// Chart configuration type
interface ChartConfig {
  ref: Ref<null | HTMLElement>;
  getOption: (themeColors: Ref<ChartStyleColors | undefined>) => any;
  name: string;
}

// Use theme manager
const { lastUpdatedTimestamp } = useThemeManager();
const { themeColorsRgba } = useThemeColors();
const chartContainerRef = ref(null);

// Chart instances and refs
const charts = ref<any[]>([]);
const chartConfigs: ChartConfig[] = [
  { ref: ref(null), getOption: getAreaChartOption, name: 'area' },
  { ref: ref(null), getOption: getBarChartOption, name: 'bar' },
  { ref: ref(null), getOption: getPieChartOption, name: 'pie' },
  { ref: ref(null), getOption: getScatterChartOption, name: 'scatter' },
  { ref: ref(null), getOption: getRadarChartOption, name: 'radar' },
  { ref: ref(null), getOption: getHeatmapChartOption, name: 'heatmap' },
  { ref: ref(null), getOption: getMapChartOption, name: 'map' },
  { ref: ref(null), getOption: getParallelChartOption, name: 'parallel' },
];

// Compute theme styles
const chartStyles = computed(() => {
  const colors = themeColorsRgba.value as unknown as ChartStyleColors;
  if (!colors) return {};

  return {
    backgroundColor: colors.surface,
    color: colors.onSurface,
    borderColor: colors.outline,
  };
});

// Initialize a single chart
const initChart = async (config: ChartConfig) => {
  if (!config.ref.value) return;

  // Dispose any existing chart
  const existingChart = echarts.getInstanceByDom(config.ref.value);
  if (existingChart) {
    existingChart.dispose();
  }

  const chart = echarts.init(config.ref.value);
  charts.value.push(chart);

  const option = await config.getOption(
    themeColorsRgba as unknown as Ref<ChartStyleColors | undefined>
  );
  chart.setOption(cleanChartOptions(option));
};

// Initialize all charts
const initCharts = () => {
  // Dispose existing charts
  charts.value.forEach((chart) => chart.dispose());
  charts.value = [];

  // Use setTimeout with nextTick to ensure DOM is fully updated
  nextTick(() => {
    setTimeout(() => {
      chartConfigs.forEach((config) => initChart(config));
    }, 0);
  });
};

// Update chart display when theme changes
const updateChartDisplay = () => {
  if (!themeColorsRgba.value) return;
  initCharts();
};

// Handle window resize
const handleResize = () => {
  charts.value.forEach((chart) => chart.resize());
};

// Watch for theme changes
watchEffect(() => {
  if (lastUpdatedTimestamp.value) {
    updateChartDisplay();
  }
});

onMounted(() => {
  nextTick(() => {
    initCharts();
    window.addEventListener('resize', handleResize);
  });
});

onBeforeUnmount(() => {
  charts.value.forEach((chart) => chart.dispose());
  charts.value = [];
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="render-chart" ref="chartContainerRef" :style="chartStyles">
    <div class="render-chart-grid">
      <!-- Row 1: Wide (2) + Regular (1) -->
      <div class="render-chart-item render-chart-item-wide">
        <h3>Color Scatter</h3>
        <div :ref="chartConfigs[3].ref" class="chart-container"></div>
      </div>
      <div class="render-chart-item">
        <h3>Gradient Area Chart</h3>
        <div :ref="chartConfigs[0].ref" class="chart-container"></div>
      </div>

      <!-- Row 2: Regular (1) + Wide (2) -->
      <div class="render-chart-item">
        <h3>Stacked Bar Chart</h3>
        <div :ref="chartConfigs[1].ref" class="chart-container"></div>
      </div>
      <div class="render-chart-item render-chart-item-wide">
        <h3>USA Map</h3>
        <div :ref="chartConfigs[6].ref" class="chart-container"></div>
      </div>

      <!-- Row 3: Wide (2) + Regular (1) -->
      <div class="render-chart-item render-chart-item-wide">
        <h3>Heatmap</h3>
        <div :ref="chartConfigs[5].ref" class="chart-container"></div>
      </div>
      <div class="render-chart-item">
        <h3>Rose Chart</h3>
        <div :ref="chartConfigs[2].ref" class="chart-container"></div>
      </div>

      <!-- Row 4: Regular (1) + Wide (2) -->
      <div class="render-chart-item">
        <h3>Radar Chart</h3>
        <div :ref="chartConfigs[4].ref" class="chart-container"></div>
      </div>
      <div class="render-chart-item render-chart-item-wide">
        <h3>Parallel Chart</h3>
        <div :ref="chartConfigs[7].ref" class="chart-container"></div>
      </div>
    </div>
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
  padding: 16px;
  transition: $transition-base;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  // Grid layout
  &-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    flex: 1;
    overflow-y: auto;
    padding-right: 12px;
    padding-bottom: 16px;

    // Scrollbar styling
    &::-webkit-scrollbar {
      width: 8px;

      &-track {
        background: var(--theme-surface-variant);
        border-radius: 4px;
      }

      &-thumb {
        background: var(--theme-outline);
        border-radius: 4px;

        &:hover {
          background: var(--theme-outline);
        }
      }
    }

    // Responsive adjustments
    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &-item {
    width: 100%;
    background-color: var(--theme-surface-variant);
    color: var(--theme-on-surface-variant);
    border-radius: $border-radius-md;
    padding: 16px;
    box-shadow: var(--theme-box-shadow-light);
    transition: $transition-base;

    // Wide items span 2 columns
    &-wide {
      grid-column: span 2;
    }

    // On smaller screens, wide items take full width
    @media (max-width: 768px) {
      &-wide {
        grid-column: span 1;
      }
    }

    h3 {
      margin-top: 0;
      margin-bottom: 16px;
      color: var(--theme-primary);
      font-size: 1.1rem;
    }
  }
}

.chart-container {
  width: 100%;
  height: 300px;
}

.empty-chart-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(var(--theme-surface-rgb), 0.5);
  border-radius: $border-radius-md;
  color: var(--theme-on-surface-variant);
  font-style: italic;
}
</style>
