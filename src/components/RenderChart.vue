<script setup lang="ts">
import {
  onMounted,
  computed,
  ref,
  watchEffect,
  nextTick,
  onBeforeUnmount,
} from 'vue';
import { useThemeManager } from '../composables/useThemeManager';
import { useThemeColors } from '../composables/useThemeColors';
import * as echarts from 'echarts';

// Use theme manager
const { lastUpdatedTimestamp } = useThemeManager();
const { themeColorsRgba } = useThemeColors();
const chartContainerRef = ref(null);

// Chart instances container
const charts = ref<any[]>([]);
const areaChartRef = ref(null);
const barChartRef = ref(null);
const pieChartRef = ref(null);
const scatterChartRef = ref(null);
const radarChartRef = ref(null);
const heatmapChartRef = ref(null);
const mapChartRef = ref(null);
const parallelChartRef = ref(null);

// Function to clean up chart options by removing unnecessary configuration
const cleanChartOptions = (option: any) => {
  // Remove tooltip if it's set to not show
  if (option.tooltip && option.tooltip.show === false) {
    delete option.tooltip;
  }

  // Remove legend if it's set to not show
  if (option.legend && option.legend.show === false) {
    delete option.legend;
  }

  return option;
};

// Compute theme styles
const chartStyles = computed(() => {
  const colors = themeColorsRgba.value;
  if (!colors) return {};

  return {
    backgroundColor: colors.surface,
    color: colors.onSurface,
    borderColor: colors.outline,
  };
});

// Generate theme-aware color palette
const getColorPalette = () => {
  const colors = themeColorsRgba.value;
  if (!colors) return [];

  // Helper function to calculate color difference (using simple RGB distance)
  const getColorDifference = (color1: string, color2: string) => {
    const getRGB = (color: string) => {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return [0, 0, 0];
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    };

    const [r1, g1, b1] = getRGB(color1);
    const [r2, g2, b2] = getRGB(color2);

    // Calculate Euclidean distance in RGB space
    return Math.sqrt(
      Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
    );
  };

  // Get all available colors from the theme
  const availableColors = [
    colors.primary,
    colors.secondary,
    colors.tertiary,
    colors.error,
    colors.primaryContainer,
    colors.secondaryContainer,
    colors.tertiaryContainer,
    colors.errorContainer,
  ];

  const backgroundColor = colors.surface;
  const MIN_BACKGROUND_DIFFERENCE = 100; // Minimum difference from background color
  const MIN_ADJACENT_DIFFERENCE = 80; // Minimum difference between adjacent colors

  // Filter colors that are too similar to background
  const nonBackgroundColors = availableColors.filter(
    (color) =>
      getColorDifference(color, backgroundColor) > MIN_BACKGROUND_DIFFERENCE
  );

  // Build optimized palette
  const optimizedPalette: string[] = [];
  for (const color of nonBackgroundColors) {
    // If this is the first color, or if it's different enough from the last color
    if (
      optimizedPalette.length === 0 ||
      getColorDifference(color, optimizedPalette[optimizedPalette.length - 1]) >
        MIN_ADJACENT_DIFFERENCE
    ) {
      optimizedPalette.push(color);
    }
  }

  // If we don't have enough colors, add some high-contrast combinations
  if (optimizedPalette.length < 4) {
    if (!optimizedPalette.includes(colors.error)) {
      optimizedPalette.push(colors.error);
    }
    if (!optimizedPalette.includes(colors.tertiary)) {
      optimizedPalette.push(colors.tertiary);
    }
  }

  // Ensure we have at least some colors to work with
  return optimizedPalette.length > 0
    ? optimizedPalette
    : [colors.error, colors.tertiary, colors.primary, colors.secondary];
};

// Area Chart (area-stack-gradient)
const initAreaChart = () => {
  if (!areaChartRef.value) return;

  // Dispose any existing chart on this element
  const existingChart = echarts.getInstanceByDom(areaChartRef.value);
  if (existingChart) {
    existingChart.dispose();
  }

  const chart = echarts.init(areaChartRef.value);
  charts.value.push(chart);

  const option = {
    color: getColorPalette(),
    tooltip: {
      show: false,
    },
    legend: {
      show: false,
    },
    grid: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      show: false,
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: [
      {
        type: 'line',
        stack: 'Total',
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 0,
        },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: themeColorsRgba.value.primary,
            },
            {
              offset: 1,
              color: themeColorsRgba.value.primaryContainer,
            },
          ]),
        },
        emphasis: {
          disabled: true,
        },
        silent: true,
        data: [140, 232, 101, 264, 90, 340, 250],
      },
      {
        type: 'line',
        stack: 'Total',
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 0,
        },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: themeColorsRgba.value.secondary,
            },
            {
              offset: 1,
              color: themeColorsRgba.value.secondaryContainer,
            },
          ]),
        },
        emphasis: {
          disabled: true,
        },
        silent: true,
        data: [120, 282, 111, 234, 220, 340, 310],
      },
      {
        type: 'line',
        stack: 'Total',
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 0,
        },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: themeColorsRgba.value.tertiary,
            },
            {
              offset: 1,
              color: themeColorsRgba.value.tertiaryContainer,
            },
          ]),
        },
        emphasis: {
          disabled: true,
        },
        silent: true,
        data: [320, 132, 201, 334, 190, 130, 220],
      },
      {
        type: 'line',
        stack: 'Total',
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 0,
        },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: themeColorsRgba.value.error,
            },
            {
              offset: 1,
              color: themeColorsRgba.value.errorContainer,
            },
          ]),
        },
        emphasis: {
          disabled: true,
        },
        silent: true,
        data: [220, 402, 231, 134, 190, 230, 120],
      },
      {
        type: 'line',
        stack: 'Total',
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 0,
        },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: themeColorsRgba.value.primaryContainer,
            },
            {
              offset: 1,
              color: themeColorsRgba.value.primary,
            },
          ]),
        },
        emphasis: {
          disabled: true,
        },
        silent: true,
        data: [220, 302, 181, 234, 210, 290, 150],
      },
    ],
    animation: false,
  };

  chart.setOption(cleanChartOptions(option));
};

// Bar Chart (bar-stack-borderRadius)
const initBarChart = () => {
  if (!barChartRef.value) return;

  // Dispose any existing chart on this element
  const existingChart = echarts.getInstanceByDom(barChartRef.value);
  if (existingChart) {
    existingChart.dispose();
  }

  const chart = echarts.init(barChartRef.value);
  charts.value.push(chart);

  // Define types for the bar chart data
  type BarDataItem =
    | number
    | {
        value: number;
        itemStyle: {
          borderRadius: number[];
        };
      };

  interface BarSeriesItem {
    type: string;
    stack: string;
    emphasis: {
      disabled: boolean;
    };
    silent?: boolean;
    data: BarDataItem[];
  }

  // Prepare series data
  const series: BarSeriesItem[] = [
    {
      type: 'bar',
      stack: 'total',
      emphasis: {
        disabled: true,
      },
      silent: true,
      data: [320, 302, 301, 334, 390, 330, 320],
    },
    {
      type: 'bar',
      stack: 'total',
      emphasis: {
        disabled: true,
      },
      silent: true,
      data: [120, 132, 101, 134, 90, 230, 210],
    },
    {
      type: 'bar',
      stack: 'total',
      emphasis: {
        disabled: true,
      },
      silent: true,
      data: [220, 182, 191, 234, 290, 330, 310],
    },
    {
      type: 'bar',
      stack: 'total',
      emphasis: {
        disabled: true,
      },
      silent: true,
      data: [150, 212, 201, 154, 190, 330, 410],
    },
    {
      type: 'bar',
      stack: 'total',
      emphasis: {
        disabled: true,
      },
      silent: true,
      data: [862, 1018, 964, 1026, 1679, 1600, 1570],
    },
  ];

  // Define types for stack information
  interface StackInfo {
    [key: string]: {
      stackStart: number[];
      stackEnd: number[];
    };
  }

  // Calculate stack information to determine which items are at the top
  const stackInfo: StackInfo = {};
  for (let i = 0; i < series[0].data.length; ++i) {
    for (let j = 0; j < series.length; ++j) {
      const stackName = series[j].stack;
      if (!stackName) {
        continue;
      }
      if (!stackInfo[stackName]) {
        stackInfo[stackName] = {
          stackStart: [],
          stackEnd: [],
        };
      }
      const info = stackInfo[stackName];
      const data = series[j].data[i];
      // Check if data is a number and not 0
      const dataValue = typeof data === 'number' ? data : data.value;
      if (dataValue && dataValue !== 0) {
        if (info.stackStart[i] == null) {
          info.stackStart[i] = j;
        }
        info.stackEnd[i] = j;
      }
    }
  }

  // Apply border radius only to the top bars in each stack
  for (let i = 0; i < series.length; ++i) {
    const seriesItem = series[i];
    const info = stackInfo[seriesItem.stack || ''];

    if (info) {
      const newData: BarDataItem[] = [];

      for (let j = 0; j < seriesItem.data.length; ++j) {
        const isEnd = info.stackEnd[j] === i;
        const topBorder = isEnd ? 5 : 0;
        const bottomBorder = 0;

        const originalValue =
          typeof seriesItem.data[j] === 'number'
            ? (seriesItem.data[j] as number)
            : (seriesItem.data[j] as { value: number }).value;

        newData.push({
          value: originalValue,
          itemStyle: {
            borderRadius: [topBorder, topBorder, bottomBorder, bottomBorder],
          },
        });
      }

      seriesItem.data = newData;
    }
  }

  const option = {
    color: getColorPalette(),
    tooltip: {
      show: false,
    },
    legend: {
      show: false,
    },
    grid: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      show: false,
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: series,
    animation: false,
  };

  chart.setOption(cleanChartOptions(option));
};

// Pie Chart (pie-roseType-simple)
const initPieChart = () => {
  if (!pieChartRef.value) return;

  // Dispose any existing chart on this element
  const existingChart = echarts.getInstanceByDom(pieChartRef.value);
  if (existingChart) {
    existingChart.dispose();
  }

  const chart = echarts.init(pieChartRef.value);
  charts.value.push(chart);

  const option = {
    color: getColorPalette(),
    tooltip: {
      show: false,
    },
    legend: {
      show: false,
    },
    series: [
      {
        type: 'pie',
        radius: ['20%', '70%'],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8,
        },
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        emphasis: {
          disabled: true,
        },
        silent: true,
        data: [
          { value: 30, name: 'rose 1' },
          { value: 28, name: 'rose 2' },
          { value: 26, name: 'rose 3' },
          { value: 24, name: 'rose 4' },
          { value: 22, name: 'rose 5' },
          { value: 20, name: 'rose 6' },
          { value: 18, name: 'rose 7' },
          { value: 16, name: 'rose 8' },
        ],
      },
    ],
    animation: false,
  };

  chart.setOption(cleanChartOptions(option));
};

// Scatter Chart (scatter-aqi-color)
const initScatterChart = () => {
  if (!scatterChartRef.value) return;

  // Dispose any existing chart on this element
  const existingChart = echarts.getInstanceByDom(scatterChartRef.value);
  if (existingChart) {
    existingChart.dispose();
  }

  const chart = echarts.init(scatterChartRef.value);
  charts.value.push(chart);

  // Data for Beijing, Shanghai, and Guangzhou
  const dataBJ = [
    [1, 55, 9, 56, 0.46, 18, 6, '良'],
    [2, 25, 11, 21, 0.65, 34, 9, '优'],
    [3, 56, 7, 63, 0.3, 14, 5, '良'],
    [4, 33, 7, 29, 0.33, 16, 6, '优'],
    [5, 42, 24, 44, 0.76, 40, 16, '优'],
    [6, 82, 58, 90, 1.77, 68, 33, '良'],
    [7, 74, 49, 77, 1.46, 48, 27, '良'],
    [8, 78, 55, 80, 1.29, 59, 29, '良'],
    [9, 267, 216, 280, 4.8, 108, 64, '重度污染'],
    [10, 185, 127, 216, 2.52, 61, 27, '中度污染'],
    [11, 39, 19, 38, 0.57, 31, 15, '优'],
    [12, 41, 11, 40, 0.43, 21, 7, '优'],
    [13, 64, 38, 74, 1.04, 46, 22, '良'],
    [14, 108, 79, 120, 1.7, 75, 41, '轻度污染'],
    [15, 108, 63, 116, 1.48, 44, 26, '轻度污染'],
    [16, 33, 6, 29, 0.34, 13, 5, '优'],
    [17, 94, 66, 110, 1.54, 62, 31, '良'],
    [18, 186, 142, 192, 3.88, 93, 79, '中度污染'],
    [19, 57, 31, 54, 0.96, 32, 14, '良'],
    [20, 22, 8, 17, 0.48, 23, 10, '优'],
    [21, 39, 15, 36, 0.61, 29, 13, '优'],
    [22, 94, 69, 114, 2.08, 73, 39, '良'],
    [23, 99, 73, 110, 2.43, 76, 48, '良'],
    [24, 31, 12, 30, 0.5, 32, 16, '优'],
    [25, 42, 27, 43, 1, 53, 22, '优'],
    [26, 154, 117, 157, 3.05, 92, 58, '中度污染'],
    [27, 234, 185, 230, 4.09, 123, 69, '重度污染'],
    [28, 160, 120, 186, 2.77, 91, 50, '中度污染'],
    [29, 134, 96, 165, 2.76, 83, 41, '轻度污染'],
    [30, 52, 24, 60, 1.03, 50, 21, '良'],
    [31, 46, 5, 49, 0.28, 10, 6, '优'],
  ];

  const dataGZ = [
    [1, 26, 37, 27, 1.163, 27, 13, '优'],
    [2, 85, 62, 71, 1.195, 60, 8, '良'],
    [3, 78, 38, 74, 1.363, 37, 7, '良'],
    [4, 21, 21, 36, 0.634, 40, 9, '优'],
    [5, 41, 42, 46, 0.915, 81, 13, '优'],
    [6, 56, 52, 69, 1.067, 92, 16, '良'],
    [7, 64, 30, 28, 0.924, 51, 2, '良'],
    [8, 55, 48, 74, 1.236, 75, 26, '良'],
    [9, 76, 85, 113, 1.237, 114, 27, '良'],
    [10, 91, 81, 104, 1.041, 56, 40, '良'],
    [11, 84, 39, 60, 0.964, 25, 11, '良'],
    [12, 64, 51, 101, 0.862, 58, 23, '良'],
    [13, 70, 69, 120, 1.198, 65, 36, '良'],
    [14, 77, 105, 178, 2.549, 64, 16, '良'],
    [15, 109, 68, 87, 0.996, 74, 29, '轻度污染'],
    [16, 73, 68, 97, 0.905, 51, 34, '良'],
    [17, 54, 27, 47, 0.592, 53, 12, '良'],
    [18, 51, 61, 97, 0.811, 65, 19, '良'],
    [19, 91, 71, 121, 1.374, 43, 18, '良'],
    [20, 73, 102, 182, 2.787, 44, 19, '良'],
    [21, 73, 50, 76, 0.717, 31, 20, '良'],
    [22, 84, 94, 140, 2.238, 68, 18, '良'],
    [23, 93, 77, 104, 1.165, 53, 7, '良'],
    [24, 99, 130, 227, 3.97, 55, 15, '良'],
    [25, 146, 84, 139, 1.094, 40, 17, '轻度污染'],
    [26, 113, 108, 137, 1.481, 48, 15, '轻度污染'],
    [27, 81, 48, 62, 1.619, 26, 3, '良'],
    [28, 56, 48, 68, 1.336, 37, 9, '良'],
    [29, 82, 92, 174, 3.29, 0, 13, '良'],
    [30, 106, 116, 188, 3.628, 101, 16, '轻度污染'],
    [31, 118, 50, 0, 1.383, 76, 11, '轻度污染'],
  ];

  const dataSH = [
    [1, 91, 45, 125, 0.82, 34, 23, '良'],
    [2, 65, 27, 78, 0.86, 45, 29, '良'],
    [3, 83, 60, 84, 1.09, 73, 27, '良'],
    [4, 109, 81, 121, 1.28, 68, 51, '轻度污染'],
    [5, 106, 77, 114, 1.07, 55, 51, '轻度污染'],
    [6, 109, 81, 121, 1.28, 68, 51, '轻度污染'],
    [7, 106, 77, 114, 1.07, 55, 51, '轻度污染'],
    [8, 89, 65, 78, 0.86, 51, 26, '良'],
    [9, 53, 33, 47, 0.64, 50, 17, '良'],
    [10, 80, 55, 80, 1.01, 75, 24, '良'],
    [11, 117, 81, 124, 1.03, 45, 24, '轻度污染'],
    [12, 99, 71, 142, 1.1, 62, 42, '良'],
    [13, 95, 69, 130, 1.28, 74, 50, '良'],
    [14, 116, 87, 131, 1.47, 84, 40, '轻度污染'],
    [15, 108, 80, 121, 1.3, 85, 37, '轻度污染'],
    [16, 134, 83, 167, 1.16, 57, 43, '轻度污染'],
    [17, 79, 43, 107, 1.05, 59, 37, '良'],
    [18, 71, 46, 89, 0.86, 64, 25, '良'],
    [19, 97, 71, 113, 1.17, 88, 31, '良'],
    [20, 84, 57, 91, 0.85, 55, 31, '良'],
    [21, 87, 63, 101, 0.9, 56, 41, '良'],
    [22, 104, 77, 119, 1.09, 73, 48, '轻度污染'],
    [23, 87, 62, 100, 1, 72, 28, '良'],
    [24, 168, 128, 172, 1.49, 97, 56, '中度污染'],
    [25, 65, 45, 51, 0.74, 39, 17, '良'],
    [26, 39, 24, 38, 0.61, 47, 17, '优'],
    [27, 39, 24, 39, 0.59, 50, 19, '优'],
    [28, 93, 68, 96, 1.05, 79, 29, '良'],
    [29, 188, 143, 197, 1.66, 99, 51, '中度污染'],
    [30, 174, 131, 174, 1.55, 108, 50, '中度污染'],
    [31, 187, 143, 201, 1.39, 89, 53, '中度污染'],
  ];

  const schema = [
    { name: 'date', index: 0, text: '日' },
    { name: 'AQIindex', index: 1, text: 'AQI指数' },
    { name: 'PM25', index: 2, text: 'PM2.5' },
    { name: 'PM10', index: 3, text: 'PM10' },
    { name: 'CO', index: 4, text: '一氧化碳（CO）' },
    { name: 'NO2', index: 5, text: '二氧化氮（NO2）' },
    { name: 'SO2', index: 6, text: '二氧化硫（SO2）' },
  ];

  const itemStyle = {
    opacity: 0.8,
    shadowBlur: 10,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: 'rgba(0,0,0,0.3)',
  };

  const colors = getColorPalette().slice(0, 3);

  const option = {
    color: colors,
    legend: {
      show: false,
    },
    grid: {
      top: 30,
      right: 20,
      left: 20,
      bottom: 20,
      containLabel: true,
    },
    tooltip: {
      show: false,
    },
    xAxis: {
      type: 'value',
      nameGap: 15,
      axisLabel: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: themeColorsRgba.value.outlineVariant,
        },
      },
      axisLine: {
        lineStyle: {
          color: themeColorsRgba.value.outline,
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      nameGap: 15,
      axisLabel: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: themeColorsRgba.value.outlineVariant,
        },
      },
      axisLine: {
        lineStyle: {
          color: themeColorsRgba.value.outline,
        },
      },
      axisTick: {
        show: false,
      },
    },
    visualMap: {
      show: false,
      type: 'piecewise',
      dimension: 2,
      min: 0,
      max: 250,
      left: 'right',
      top: 'center',
      calculable: true,
      realtime: false,
      splitNumber: 8,
      inRange: {
        color: [
          themeColorsRgba.value.primaryContainer,
          themeColorsRgba.value.primary,
          themeColorsRgba.value.tertiaryContainer,
          themeColorsRgba.value.tertiary,
          themeColorsRgba.value.secondaryContainer,
          themeColorsRgba.value.secondary,
          themeColorsRgba.value.errorContainer,
          themeColorsRgba.value.error,
        ],
      },
    },
    series: [
      {
        name: '北京',
        type: 'scatter',
        symbolSize: function (data: any[]) {
          // Scale dot size based on PM2.5 value (index 2)
          return Math.sqrt(data[2]) * 2 + 5;
        },
        itemStyle: itemStyle,
        encode: {
          x: 1,
          y: 2,
        },
        silent: true,
        data: dataBJ,
      },
      {
        name: '上海',
        type: 'scatter',
        symbolSize: function (data: any[]) {
          return Math.sqrt(data[2]) * 2 + 5;
        },
        itemStyle: itemStyle,
        encode: {
          x: 1,
          y: 2,
        },
        silent: true,
        data: dataSH,
      },
      {
        name: '广州',
        type: 'scatter',
        symbolSize: function (data: any[]) {
          return Math.sqrt(data[2]) * 2 + 5;
        },
        itemStyle: itemStyle,
        encode: {
          x: 1,
          y: 2,
        },
        silent: true,
        data: dataGZ,
      },
    ],
    animation: false,
  };

  chart.setOption(cleanChartOptions(option));
};

// Radar Chart (radar2)
const initRadarChart = () => {
  if (!radarChartRef.value) return;

  // Dispose any existing chart on this element
  const existingChart = echarts.getInstanceByDom(radarChartRef.value);
  if (existingChart) {
    existingChart.dispose();
  }

  const chart = echarts.init(radarChartRef.value);
  charts.value.push(chart);

  // Initialize chart

  const option = {
    color: getColorPalette(),
    radar: {
      indicator: [
        { name: 'IE8-', max: 380 },
        { name: 'IE9+', max: 380 },
        { name: 'Safari', max: 380 },
        { name: 'Firefox', max: 380 },
        { name: 'Chrome', max: 380 },
      ],
      axisName: {
        color: themeColorsRgba.value.onSurfaceVariant,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: themeColorsRgba.value.outline,
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: themeColorsRgba.value.outlineVariant,
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255, 255, 255, 0.05)', 'rgba(0, 0, 0, 0.02)'],
        },
      },
      axisLabel: {
        show: false,
      },
    },
    series: (function () {
      const series = [];
      for (let i = 1; i <= 28; i++) {
        series.push({
          type: 'radar',
          symbol: 'none',
          lineStyle: {
            width: 1,
          },
          emphasis: {
            areaStyle: {
              color: 'rgba(0,250,0,0.3)',
            },
          },
          silent: true,
          data: [
            {
              value: [
                (40 - i) * 10,
                (38 - i) * 4 + 60,
                i * 5 + 10,
                i * 9,
                (i * i) / 2,
              ],
              name: i + 2000 + '',
            },
          ],
        });
      }
      return series;
    })(),
    animation: false,
  };

  chart.setOption(cleanChartOptions(option));
};

// Heatmap Chart (heatmap-large-piecewise)
const initHeatmapChart = () => {
  if (!heatmapChartRef.value) return;

  // Dispose any existing chart on this element
  const existingChart = echarts.getInstanceByDom(heatmapChartRef.value);
  if (existingChart) {
    existingChart.dispose();
  }

  const chart = echarts.init(heatmapChartRef.value);
  charts.value.push(chart);

  // Perlin noise helper function
  function getNoiseHelper() {
    class Grad {
      x: number;
      y: number;
      z: number;

      constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
      }

      dot2(x: number, y: number): number {
        return this.x * x + this.y * y;
      }

      dot3(x: number, y: number, z: number): number {
        return this.x * x + this.y * y + this.z * z;
      }
    }
    const grad3 = [
      new Grad(1, 1, 0),
      new Grad(-1, 1, 0),
      new Grad(1, -1, 0),
      new Grad(-1, -1, 0),
      new Grad(1, 0, 1),
      new Grad(-1, 0, 1),
      new Grad(1, 0, -1),
      new Grad(-1, 0, -1),
      new Grad(0, 1, 1),
      new Grad(0, -1, 1),
      new Grad(0, 1, -1),
      new Grad(0, -1, -1),
    ];
    const p = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
      140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247,
      120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177,
      33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165,
      71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211,
      133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25,
      63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
      135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217,
      226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
      59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248,
      152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22,
      39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218,
      246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
      81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
      222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
    ];
    // To remove the need for index wrapping, double the permutation table length
    let perm = new Array(512);
    let gradP = new Array(512);
    // This isn't a very good seeding function, but it works ok. It supports 2^16
    // different seed values. Write something better if you need more seeds.
    function seed(seed: number): void {
      if (seed > 0 && seed < 1) {
        // Scale the seed out
        seed *= 65536;
      }
      seed = Math.floor(seed);
      if (seed < 256) {
        seed |= seed << 8;
      }
      for (let i = 0; i < 256; i++) {
        let v;
        if (i & 1) {
          v = p[i] ^ (seed & 255);
        } else {
          v = p[i] ^ ((seed >> 8) & 255);
        }
        perm[i] = perm[i + 256] = v;
        gradP[i] = gradP[i + 256] = grad3[v % 12];
      }
    }
    seed(0);
    // ##### Perlin noise stuff
    function fade(t: number): number {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }
    function lerp(a: number, b: number, t: number): number {
      return (1 - t) * a + t * b;
    }
    // 2D Perlin Noise
    function perlin2(x: number, y: number): number {
      // Find unit grid cell containing point
      let X = Math.floor(x),
        Y = Math.floor(y);
      // Get relative xy coordinates of point within that cell
      x = x - X;
      y = y - Y;
      // Wrap the integer cells at 255 (smaller integer period can be introduced here)
      X = X & 255;
      Y = Y & 255;
      // Calculate noise contributions from each of the four corners
      let n00 = gradP[X + perm[Y]].dot2(x, y);
      let n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
      let n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
      let n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1);
      // Compute the fade curve value for x
      let u = fade(x);
      // Interpolate the four results
      return lerp(lerp(n00, n10, u), lerp(n01, n11, u), fade(y));
    }
    return {
      seed,
      perlin2,
    };
  }

  // Generate data using Perlin noise
  function generateData() {
    let noise = getNoiseHelper();
    let xData = [];
    let yData = [];
    let data = [];

    noise.seed(Math.random());

    for (let i = 0; i <= 200; i++) {
      for (let j = 0; j <= 100; j++) {
        data.push([i, j, noise.perlin2(i / 40, j / 20) + 0.5]);
      }
      xData.push(i);
    }

    for (let j = 0; j < 100; j++) {
      yData.push(j);
    }

    return { data, xData, yData };
  }

  const { data, xData, yData } = generateData();

  const option = {
    tooltip: {},
    grid: {
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
    },
    yAxis: {
      type: 'category',
      data: yData,
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
    },
    visualMap: {
      show: false,
      type: 'piecewise',
      min: 0,
      max: 1,
      left: 'right',
      top: 'center',
      calculable: true,
      realtime: false,
      splitNumber: 8,
      inRange: {
        color: [
          themeColorsRgba.value.primaryContainer,
          themeColorsRgba.value.primary,
          themeColorsRgba.value.tertiaryContainer,
          themeColorsRgba.value.tertiary,
          themeColorsRgba.value.secondaryContainer,
          themeColorsRgba.value.secondary,
          themeColorsRgba.value.errorContainer,
          themeColorsRgba.value.error,
        ],
      },
    },
    series: [
      {
        name: 'Gaussian',
        type: 'heatmap',
        data: data,
        emphasis: {
          itemStyle: {
            borderColor: '#333',
            borderWidth: 1,
          },
        },
        silent: true,
        progressive: 1000,
        animation: false,
      },
    ],
  };

  chart.setOption(cleanChartOptions(option));
};

// USA Map Chart
const initMapChart = async () => {
  if (!mapChartRef.value) return;

  // Dispose any existing chart on this element
  const existingChart = echarts.getInstanceByDom(mapChartRef.value);
  if (existingChart) {
    existingChart.dispose();
  }

  const chart = echarts.init(mapChartRef.value);
  charts.value.push(chart);

  try {
    // Register USA map
    const usaJson = await fetch('/src/assets/USA.json').then((response) =>
      response.json()
    );
    echarts.registerMap('USA', usaJson, {
      Alaska: {
        left: -131,
        top: 25,
        width: 15,
      },
      Hawaii: {
        left: -110,
        top: 28,
        width: 5,
      },
      'Puerto Rico': {
        left: -76,
        top: 26,
        width: 2,
      },
    });

    // Generate random data for states
    function generateMapData() {
      const data = [];
      // USA has 50 states plus DC
      for (let i = 0; i < 51; i++) {
        data.push({
          name: usaJson.features[i]?.properties?.name || `State ${i}`,
          value: Math.round(Math.random() * 100),
        });
      }
      return data;
    }

    const option = {
      tooltip: {
        show: false,
      },
      visualMap: {
        show: false,
        left: 'right',
        min: 0,
        max: 100,
        inRange: {
          color: [
            themeColorsRgba.value.primaryContainer,
            themeColorsRgba.value.primary,
            themeColorsRgba.value.secondary,
            themeColorsRgba.value.tertiary,
            themeColorsRgba.value.error,
          ],
        },
        text: ['High', 'Low'],
        calculable: false,
      },
      series: [
        {
          name: 'USA',
          type: 'map',
          map: 'USA',
          emphasis: {
            disabled: true,
          },
          itemStyle: {
            borderColor: themeColorsRgba.value.outline,
            borderWidth: 0.5,
          },
          silent: true,
          data: generateMapData(),
        },
      ],
      animation: false,
    };

    chart.setOption(cleanChartOptions(option));
  } catch (error) {
    console.error('Error initializing USA map chart:', error);
  }
};

// Parallel Chart
const initParallelChart = () => {
  if (!parallelChartRef.value) return;

  // Dispose any existing chart on this element
  const existingChart = echarts.getInstanceByDom(parallelChartRef.value);
  if (existingChart) {
    existingChart.dispose();
  }

  const chart = echarts.init(parallelChartRef.value);
  charts.value.push(chart);

  // Schema for parallel chart
  const schema = [
    { name: 'date', index: 0, text: '日期' },
    { name: 'AQIindex', index: 1, text: 'AQI' },
    { name: 'PM25', index: 2, text: 'PM2.5' },
    { name: 'PM10', index: 3, text: 'PM10' },
    { name: 'CO', index: 4, text: 'CO' },
    { name: 'NO2', index: 5, text: 'NO2' },
    { name: 'SO2', index: 6, text: 'SO2' },
    { name: '等级', index: 7, text: '等级' },
  ];

  // Data for Beijing, Shanghai, and Guangzhou
  const dataBJ = [
    [1, 55, 9, 56, 0.46, 18, 6, '良'],
    [2, 25, 11, 21, 0.65, 34, 9, '优'],
    [3, 56, 7, 63, 0.3, 14, 5, '良'],
    [4, 33, 7, 29, 0.33, 16, 6, '优'],
    [5, 42, 24, 44, 0.76, 40, 16, '优'],
    [6, 82, 58, 90, 1.77, 68, 33, '良'],
    [7, 74, 49, 77, 1.46, 48, 27, '良'],
    [8, 78, 55, 80, 1.29, 59, 29, '良'],
    [9, 267, 216, 280, 4.8, 108, 64, '重度污染'],
    [10, 185, 127, 216, 2.52, 61, 27, '中度污染'],
    [11, 39, 19, 38, 0.57, 31, 15, '优'],
    [12, 41, 11, 40, 0.43, 21, 7, '优'],
    [13, 64, 38, 74, 1.04, 46, 22, '良'],
    [14, 108, 79, 120, 1.7, 75, 41, '轻度污染'],
    [15, 108, 63, 116, 1.48, 44, 26, '轻度污染'],
    [16, 33, 6, 29, 0.34, 13, 5, '优'],
    [17, 94, 66, 110, 1.54, 62, 31, '良'],
    [18, 186, 142, 192, 3.88, 93, 79, '中度污染'],
    [19, 57, 31, 54, 0.96, 32, 14, '良'],
    [20, 22, 8, 17, 0.48, 23, 10, '优'],
    [21, 39, 15, 36, 0.61, 29, 13, '优'],
    [22, 94, 69, 114, 2.08, 73, 39, '良'],
    [23, 99, 73, 110, 2.43, 76, 48, '良'],
    [24, 31, 12, 30, 0.5, 32, 16, '优'],
    [25, 42, 27, 43, 1, 53, 22, '优'],
    [26, 154, 117, 157, 3.05, 92, 58, '中度污染'],
    [27, 234, 185, 230, 4.09, 123, 69, '重度污染'],
    [28, 160, 120, 186, 2.77, 91, 50, '中度污染'],
    [29, 134, 96, 165, 2.76, 83, 41, '轻度污染'],
    [30, 52, 24, 60, 1.03, 50, 21, '良'],
    [31, 46, 5, 49, 0.28, 10, 6, '优'],
  ];

  const dataGZ = [
    [1, 26, 37, 27, 1.163, 27, 13, '优'],
    [2, 85, 62, 71, 1.195, 60, 8, '良'],
    [3, 78, 38, 74, 1.363, 37, 7, '良'],
    [4, 21, 21, 36, 0.634, 40, 9, '优'],
    [5, 41, 42, 46, 0.915, 81, 13, '优'],
    [6, 56, 52, 69, 1.067, 92, 16, '良'],
    [7, 64, 30, 28, 0.924, 51, 2, '良'],
    [8, 55, 48, 74, 1.236, 75, 26, '良'],
    [9, 76, 85, 113, 1.237, 114, 27, '良'],
    [10, 91, 81, 104, 1.041, 56, 40, '良'],
    [11, 84, 39, 60, 0.964, 25, 11, '良'],
    [12, 64, 51, 101, 0.862, 58, 23, '良'],
    [13, 70, 69, 120, 1.198, 65, 36, '良'],
    [14, 77, 105, 178, 2.549, 64, 16, '良'],
    [15, 109, 68, 87, 0.996, 74, 29, '轻度污染'],
    [16, 73, 68, 97, 0.905, 51, 34, '良'],
    [17, 54, 27, 47, 0.592, 53, 12, '良'],
    [18, 51, 61, 97, 0.811, 65, 19, '良'],
    [19, 91, 71, 121, 1.374, 43, 18, '良'],
    [20, 73, 102, 182, 2.787, 44, 19, '良'],
    [21, 73, 50, 76, 0.717, 31, 20, '良'],
    [22, 84, 94, 140, 2.238, 68, 18, '良'],
    [23, 93, 77, 104, 1.165, 53, 7, '良'],
    [24, 99, 130, 227, 3.97, 55, 15, '良'],
    [25, 146, 84, 139, 1.094, 40, 17, '轻度污染'],
    [26, 113, 108, 137, 1.481, 48, 15, '轻度污染'],
    [27, 81, 48, 62, 1.619, 26, 3, '良'],
    [28, 56, 48, 68, 1.336, 37, 9, '良'],
    [29, 82, 92, 174, 3.29, 0, 13, '良'],
    [30, 106, 116, 188, 3.628, 101, 16, '轻度污染'],
    [31, 118, 50, 0, 1.383, 76, 11, '轻度污染'],
  ];

  const dataSH = [
    [1, 91, 45, 125, 0.82, 34, 23, '良'],
    [2, 65, 27, 78, 0.86, 45, 29, '良'],
    [3, 83, 60, 84, 1.09, 73, 27, '良'],
    [4, 109, 81, 121, 1.28, 68, 51, '轻度污染'],
    [5, 106, 77, 114, 1.07, 55, 51, '轻度污染'],
    [6, 109, 81, 121, 1.28, 68, 51, '轻度污染'],
    [7, 106, 77, 114, 1.07, 55, 51, '轻度污染'],
    [8, 89, 65, 78, 0.86, 51, 26, '良'],
    [9, 53, 33, 47, 0.64, 50, 17, '良'],
    [10, 80, 55, 80, 1.01, 75, 24, '良'],
    [11, 117, 81, 124, 1.03, 45, 24, '轻度污染'],
    [12, 99, 71, 142, 1.1, 62, 42, '良'],
    [13, 95, 69, 130, 1.28, 74, 50, '良'],
    [14, 116, 87, 131, 1.47, 84, 40, '轻度污染'],
    [15, 108, 80, 121, 1.3, 85, 37, '轻度污染'],
    [16, 134, 83, 167, 1.16, 57, 43, '轻度污染'],
    [17, 79, 43, 107, 1.05, 59, 37, '良'],
    [18, 71, 46, 89, 0.86, 64, 25, '良'],
    [19, 97, 71, 113, 1.17, 88, 31, '良'],
    [20, 84, 57, 91, 0.85, 55, 31, '良'],
    [21, 87, 63, 101, 0.9, 56, 41, '良'],
    [22, 104, 77, 119, 1.09, 73, 48, '轻度污染'],
    [23, 87, 62, 100, 1, 72, 28, '良'],
    [24, 168, 128, 172, 1.49, 97, 56, '中度污染'],
    [25, 65, 45, 51, 0.74, 39, 17, '良'],
    [26, 39, 24, 38, 0.61, 47, 17, '优'],
    [27, 39, 24, 39, 0.59, 50, 19, '优'],
    [28, 93, 68, 96, 1.05, 79, 29, '良'],
    [29, 188, 143, 197, 1.66, 99, 51, '中度污染'],
    [30, 174, 131, 174, 1.55, 108, 50, '中度污染'],
    [31, 187, 143, 201, 1.39, 89, 53, '中度污染'],
  ];

  const lineStyle = {
    width: 1,
    opacity: 0.5,
  };

  const option = {
    tooltip: {
      show: false,
    },
    legend: {
      show: false,
    },
    parallelAxis: [
      {
        dim: 0,
        inverse: true,
        max: 31,
        axisLine: {
          lineStyle: {
            color: themeColorsRgba.value.outline,
          },
        },
        axisTick: {
          lineStyle: {
            color: themeColorsRgba.value.outlineVariant,
          },
        },
        axisLabel: {
          show: false,
        },
      },
      {
        dim: 1,
        axisLine: {
          lineStyle: {
            color: themeColorsRgba.value.outline,
          },
        },
        axisTick: {
          lineStyle: {
            color: themeColorsRgba.value.outlineVariant,
          },
        },
        axisLabel: {
          show: false,
        },
      },
      {
        dim: 2,
        axisLine: {
          lineStyle: {
            color: themeColorsRgba.value.outline,
          },
        },
        axisTick: {
          lineStyle: {
            color: themeColorsRgba.value.outlineVariant,
          },
        },
        axisLabel: {
          show: false,
        },
      },
      {
        dim: 3,
        axisLine: {
          lineStyle: {
            color: themeColorsRgba.value.outline,
          },
        },
        axisTick: {
          lineStyle: {
            color: themeColorsRgba.value.outlineVariant,
          },
        },
        axisLabel: {
          show: false,
        },
      },
      {
        dim: 4,
        axisLine: {
          lineStyle: {
            color: themeColorsRgba.value.outline,
          },
        },
        axisTick: {
          lineStyle: {
            color: themeColorsRgba.value.outlineVariant,
          },
        },
        axisLabel: {
          show: false,
        },
      },
      {
        dim: 5,
        axisLine: {
          lineStyle: {
            color: themeColorsRgba.value.outline,
          },
        },
        axisTick: {
          lineStyle: {
            color: themeColorsRgba.value.outlineVariant,
          },
        },
        axisLabel: {
          show: false,
        },
      },
      {
        dim: 6,
        axisLine: {
          lineStyle: {
            color: themeColorsRgba.value.outline,
          },
        },
        axisTick: {
          lineStyle: {
            color: themeColorsRgba.value.outlineVariant,
          },
        },
        axisLabel: {
          show: false,
        },
      },
      {
        dim: 7,
        type: 'category',
        data: ['优', '良', '轻度污染', '中度污染', '重度污染', '严重污染'],
        axisLine: {
          lineStyle: {
            color: themeColorsRgba.value.outline,
          },
        },
        axisTick: {
          lineStyle: {
            color: themeColorsRgba.value.outlineVariant,
          },
        },
        axisLabel: {
          show: false,
        },
      },
    ],
    visualMap: {
      show: false,
      min: 0,
      max: 150,
      dimension: 2,
      inRange: {
        color: [
          themeColorsRgba.value.error,
          themeColorsRgba.value.tertiary,
          themeColorsRgba.value.primary,
        ],
      },
    },
    parallel: {
      left: '5%',
      right: '13%',
      bottom: 20,
      top: 50,
    },
    series: [
      {
        name: 'Beijing',
        type: 'parallel',
        lineStyle: {
          ...lineStyle,
          color: themeColorsRgba.value.primary,
        },
        silent: true,
        data: dataBJ,
      },
      {
        name: 'Shanghai',
        type: 'parallel',
        lineStyle: {
          ...lineStyle,
          color: themeColorsRgba.value.secondary,
        },
        silent: true,
        data: dataSH,
      },
      {
        name: 'Guangzhou',
        type: 'parallel',
        lineStyle: {
          ...lineStyle,
          color: themeColorsRgba.value.tertiary,
        },
        silent: true,
        data: dataGZ,
      },
    ],
    animation: false,
  };

  chart.setOption(cleanChartOptions(option));
};

// Initialize all charts
const initCharts = () => {
  // Dispose existing charts first to prevent memory leaks
  charts.value.forEach((chart) => {
    chart.dispose();
  });
  charts.value = [];

  // Use setTimeout with nextTick to ensure DOM is fully updated before initializing charts
  nextTick(() => {
    setTimeout(() => {
      initAreaChart();
      initBarChart();
      initPieChart();
      initScatterChart();
      initRadarChart();
      initHeatmapChart();
      initMapChart();
      initParallelChart();
    }, 0);
  });
};

// Update chart display when theme changes
const updateChartDisplay = () => {
  if (!themeColorsRgba.value) return;

  // Apply theme colors to all charts
  initCharts();
};

// Handle window resize
const handleResize = () => {
  charts.value.forEach((chart) => {
    chart.resize();
  });
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
  charts.value.forEach((chart) => {
    chart.dispose();
  });
  charts.value = [];

  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="render-chart" ref="chartContainerRef" :style="chartStyles">
    <div class="render-chart-grid">
      <!-- Row 1: Wide (2) + Regular (1) -->
      <!-- Scatter Chart - Double width -->
      <div class="render-chart-item render-chart-item-wide">
        <h3>Color Scatter</h3>
        <div ref="scatterChartRef" class="chart-container"></div>
      </div>

      <!-- Area Chart -->
      <div class="render-chart-item">
        <h3>Gradient Area Chart</h3>
        <div ref="areaChartRef" class="chart-container"></div>
      </div>

      <!-- Row 2: Regular (1) + Wide (2) -->
      <!-- Bar Chart -->
      <div class="render-chart-item">
        <h3>Stacked Bar Chart</h3>
        <div ref="barChartRef" class="chart-container"></div>
      </div>

      <!-- Map Chart - Double width -->
      <div class="render-chart-item render-chart-item-wide">
        <h3>USA Map</h3>
        <div ref="mapChartRef" class="chart-container"></div>
      </div>

      <!-- Row 3: Wide (2) + Regular (1) -->
      <!-- Heatmap Chart - Double width -->
      <div class="render-chart-item render-chart-item-wide">
        <h3>Heatmap</h3>
        <div ref="heatmapChartRef" class="chart-container"></div>
      </div>

      <!-- Pie Chart -->
      <div class="render-chart-item">
        <h3>Rose Chart</h3>
        <div ref="pieChartRef" class="chart-container"></div>
      </div>

      <!-- Row 4: Regular (1) + Wide (2) -->
      <!-- Radar Chart -->
      <div class="render-chart-item">
        <h3>Radar Chart</h3>
        <div ref="radarChartRef" class="chart-container"></div>
      </div>

      <!-- Parallel Chart -->
      <div class="render-chart-item render-chart-item-wide">
        <h3>Parallel Chart</h3>
        <div ref="parallelChartRef" class="chart-container"></div>
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
