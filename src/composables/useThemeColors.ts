import { ref, computed } from 'vue';
import { type Scheme } from '@material/material-color-utilities';
import { transformSchemeToRgba } from '../tools/color';

// 创建响应式状态
const themeColors = ref<{ light: Scheme; dark: Scheme }>(
  {} as { light: Scheme; dark: Scheme }
);
const isDarkMode = ref(false);

// 初始化暗黑模式
function initDarkMode() {
  // 检查本地存储
  const savedMode = localStorage.getItem('isDarkMode');
  if (savedMode !== null) {
    isDarkMode.value = savedMode === 'true';
  } else {
    // 检查系统颜色偏好
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    isDarkMode.value = prefersDark;
  }

  // 初始应用暗黑模式
  applyDarkMode(isDarkMode.value);
}

// 应用暗黑模式到HTML元素
function applyDarkMode(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Using transformSchemeToRgba and getColorFromArgb from tools/color.ts

// 计算当前主题颜色（RGBA格式）
const themeColorsRgba = computed(() => {
  return isDarkMode.value
    ? transformSchemeToRgba(themeColors.value.dark)
    : transformSchemeToRgba(themeColors.value.light);
});

// 更新主题颜色的方法
function updateThemeColors(newThemeColors: { light: Scheme; dark: Scheme }) {
  themeColors.value = newThemeColors;
}

// 切换暗/亮模式
function toggleDarkMode(isDark?: boolean) {
  if (isDark !== undefined) {
    isDarkMode.value = isDark;
  } else {
    isDarkMode.value = !isDarkMode.value;
  }

  // 应用暗黑模式
  applyDarkMode(isDarkMode.value);
  // 保存到本地存储
  localStorage.setItem('isDarkMode', isDarkMode.value.toString());
}

// 导出组合式函数
export function useThemeColors() {
  // 组件挂载后初始化暗黑模式
  if (typeof window !== 'undefined') {
    // 确保在客户端环境中执行
    initDarkMode();

    // 监听系统颜色偏好变化
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        // 仅当用户没有手动设置过主题时，跟随系统
        if (localStorage.getItem('isDarkMode') === null) {
          isDarkMode.value = e.matches;
          applyDarkMode(e.matches);
        }
      });
  }

  return {
    themeColors,
    themeColorsRgba,
    isDarkMode,
    updateThemeColors,
    toggleDarkMode,
  };
}
