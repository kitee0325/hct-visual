import { ref, computed } from 'vue';
import { type Scheme, argbFromRgb } from '@material/material-color-utilities';
import { transformSchemeToRgba } from '../tools/color';

// 创建并初始化主题颜色
const themeColors = ref<{
  light: Record<string, number>;
  dark: Record<string, number>;
}>({} as { light: Record<string, number>; dark: Record<string, number> });
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

// 计算当前主题颜色（RGBA格式）
const themeColorsRgba = computed(() => {
  const theme = isDarkMode.value
    ? transformSchemeToRgba(themeColors.value.dark)
    : transformSchemeToRgba(themeColors.value.light);

  // 每当计算属性更新时，同步更新CSS变量
  updateCssVariables(theme);
  return theme;
});

// 将主题颜色同步到CSS变量
function updateCssVariables(theme: Record<string, string>) {
  if (!theme || typeof document === 'undefined') return;

  const root = document.documentElement;

  // 设置所有主题相关CSS变量
  Object.entries(theme).forEach(([key, value]) => {
    // 跳过非颜色属性
    if (
      key === 'toJSON' ||
      typeof value !== 'string' ||
      !value.startsWith('rgba')
    ) {
      return;
    }
    // 将驼峰命名转换为中划线命名
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--theme-${cssKey}`, value);
  });
}

// 更新主题颜色的方法
function updateThemeColors(newThemeColors: {
  light: Record<string, number>;
  dark: Record<string, number>;
}) {
  themeColors.value = newThemeColors;
  // 更新后立即应用CSS变量
  const currentTheme = isDarkMode.value
    ? transformSchemeToRgba(themeColors.value.dark)
    : transformSchemeToRgba(themeColors.value.light);
  updateCssVariables(currentTheme);
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

  // 立即更新CSS变量以确保正确应用当前主题
  const currentTheme = isDarkMode.value
    ? transformSchemeToRgba(themeColors.value.dark)
    : transformSchemeToRgba(themeColors.value.light);

  updateCssVariables(currentTheme);
}

// 初始化默认主题
function initDefaultTheme() {
  // 创建深色模式和亮色模式的主题，使用ARGB格式
  const darkTheme = {
    primary: argbFromRgb(0, 95, 175),
    onPrimary: argbFromRgb(255, 255, 255),
    primaryContainer: argbFromRgb(212, 227, 255),
    onPrimaryContainer: argbFromRgb(0, 28, 58),
    secondary: argbFromRgb(84, 95, 113),
    onSecondary: argbFromRgb(255, 255, 255),
    secondaryContainer: argbFromRgb(216, 227, 248),
    onSecondaryContainer: argbFromRgb(17, 28, 43),
    tertiary: argbFromRgb(110, 86, 118),
    onTertiary: argbFromRgb(255, 255, 255),
    tertiaryContainer: argbFromRgb(247, 216, 255),
    onTertiaryContainer: argbFromRgb(39, 20, 48),
    error: argbFromRgb(186, 26, 26),
    onError: argbFromRgb(255, 255, 255),
    errorContainer: argbFromRgb(255, 218, 214),
    onErrorContainer: argbFromRgb(65, 0, 2),
    background: argbFromRgb(18, 18, 18),
    onBackground: argbFromRgb(255, 255, 255),
    surface: argbFromRgb(18, 18, 18),
    onSurface: argbFromRgb(255, 255, 255),
    surfaceVariant: argbFromRgb(28, 28, 30),
    onSurfaceVariant: argbFromRgb(200, 200, 200),
    outline: argbFromRgb(116, 119, 127),
    outlineVariant: argbFromRgb(68, 68, 70),
    shadow: argbFromRgb(0, 0, 0),
    scrim: argbFromRgb(0, 0, 0),
    inverseSurface: argbFromRgb(47, 48, 51),
    inverseOnSurface: argbFromRgb(241, 240, 244),
    inversePrimary: argbFromRgb(165, 200, 255),
  };

  // 亮色模式默认主题
  const lightTheme = {
    primary: argbFromRgb(0, 95, 175),
    onPrimary: argbFromRgb(255, 255, 255),
    primaryContainer: argbFromRgb(212, 227, 255),
    onPrimaryContainer: argbFromRgb(0, 28, 58),
    secondary: argbFromRgb(84, 95, 113),
    onSecondary: argbFromRgb(255, 255, 255),
    secondaryContainer: argbFromRgb(216, 227, 248),
    onSecondaryContainer: argbFromRgb(17, 28, 43),
    tertiary: argbFromRgb(110, 86, 118),
    onTertiary: argbFromRgb(255, 255, 255),
    tertiaryContainer: argbFromRgb(247, 216, 255),
    onTertiaryContainer: argbFromRgb(39, 20, 48),
    error: argbFromRgb(186, 26, 26),
    onError: argbFromRgb(255, 255, 255),
    errorContainer: argbFromRgb(255, 218, 214),
    onErrorContainer: argbFromRgb(65, 0, 2),
    background: argbFromRgb(253, 252, 255),
    onBackground: argbFromRgb(26, 28, 30),
    surface: argbFromRgb(253, 252, 255),
    onSurface: argbFromRgb(26, 28, 30),
    surfaceVariant: argbFromRgb(224, 226, 236),
    onSurfaceVariant: argbFromRgb(67, 71, 78),
    outline: argbFromRgb(116, 119, 127),
    outlineVariant: argbFromRgb(195, 198, 207),
    shadow: argbFromRgb(0, 0, 0),
    scrim: argbFromRgb(0, 0, 0),
    inverseSurface: argbFromRgb(47, 48, 51),
    inverseOnSurface: argbFromRgb(241, 240, 244),
    inversePrimary: argbFromRgb(165, 200, 255),
  };

  // 更新主题颜色
  updateThemeColors({
    light: lightTheme,
    dark: darkTheme,
  });
}

// 导出组合式函数
export function useThemeColors() {
  // 组件挂载后初始化暗黑模式和主题
  if (typeof window !== 'undefined') {
    // 确保在客户端环境中执行
    initDarkMode();
    initDefaultTheme();

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
