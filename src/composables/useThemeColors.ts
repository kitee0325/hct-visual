import { ref, computed } from 'vue';
import { type Scheme } from '@material/material-color-utilities';
import { transformSchemeToRgba } from '../tools/color';

// 创建并初始化主题颜色
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
function updateCssVariables(theme: any) {
  if (!theme || typeof document === 'undefined') return;

  const root = document.documentElement;

  // 设置所有主题相关CSS变量
  Object.entries(theme).forEach(([key, value]) => {
    // 跳过非颜色属性
    if (
      key === 'props' ||
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

  // 确保props中的所有颜色也被应用
  if (theme.props) {
    Object.entries(theme.props).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('rgba')) {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--theme-${cssKey}`, value as string);
      }
    });
  }

  // 添加调试信息
  console.log('CSS variables updated:', {
    surface: root.style.getPropertyValue('--theme-surface'),
    background: root.style.getPropertyValue('--theme-background'),
    darkMode: document.documentElement.classList.contains('dark'),
    currentTheme: isDarkMode.value ? 'dark' : 'light',
  });
}

// 更新主题颜色的方法
function updateThemeColors(newThemeColors: { light: Scheme; dark: Scheme }) {
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

  console.log('Toggle dark mode:', {
    isDarkMode: isDarkMode.value,
    currentThemeMode: isDarkMode.value ? 'dark' : 'light',
  });

  updateCssVariables(currentTheme);
}

// 初始化默认主题
function initDefaultTheme() {
  // 深色模式默认主题
  const darkTheme = {
    primary: 'rgba(0, 95, 175, 1.00)',
    onPrimary: 'rgba(255, 255, 255, 1.00)',
    primaryContainer: 'rgba(212, 227, 255, 1.00)',
    onPrimaryContainer: 'rgba(0, 28, 58, 1.00)',
    secondary: 'rgba(84, 95, 113, 1.00)',
    onSecondary: 'rgba(255, 255, 255, 1.00)',
    secondaryContainer: 'rgba(216, 227, 248, 1.00)',
    onSecondaryContainer: 'rgba(17, 28, 43, 1.00)',
    tertiary: 'rgba(110, 86, 118, 1.00)',
    onTertiary: 'rgba(255, 255, 255, 1.00)',
    tertiaryContainer: 'rgba(247, 216, 255, 1.00)',
    onTertiaryContainer: 'rgba(39, 20, 48, 1.00)',
    error: 'rgba(186, 26, 26, 1.00)',
    onError: 'rgba(255, 255, 255, 1.00)',
    errorContainer: 'rgba(255, 218, 214, 1.00)',
    onErrorContainer: 'rgba(65, 0, 2, 1.00)',
    background: 'rgba(18, 18, 18, 1.00)',
    onBackground: 'rgba(255, 255, 255, 1.00)',
    surface: 'rgba(18, 18, 18, 1.00)',
    onSurface: 'rgba(255, 255, 255, 1.00)',
    surfaceVariant: 'rgba(28, 28, 30, 1.00)',
    onSurfaceVariant: 'rgba(200, 200, 200, 1.00)',
    outline: 'rgba(116, 119, 127, 1.00)',
    outlineVariant: 'rgba(68, 68, 70, 1.00)',
    shadow: 'rgba(0, 0, 0, 1.00)',
    scrim: 'rgba(0, 0, 0, 1.00)',
    inverseSurface: 'rgba(47, 48, 51, 1.00)',
    inverseOnSurface: 'rgba(241, 240, 244, 1.00)',
    inversePrimary: 'rgba(165, 200, 255, 1.00)',
    toJSON: () => ({}),
  } as unknown as Scheme;

  // 亮色模式默认主题
  const lightTheme = {
    primary: 'rgba(0, 95, 175, 1.00)',
    onPrimary: 'rgba(255, 255, 255, 1.00)',
    primaryContainer: 'rgba(212, 227, 255, 1.00)',
    onPrimaryContainer: 'rgba(0, 28, 58, 1.00)',
    secondary: 'rgba(84, 95, 113, 1.00)',
    onSecondary: 'rgba(255, 255, 255, 1.00)',
    secondaryContainer: 'rgba(216, 227, 248, 1.00)',
    onSecondaryContainer: 'rgba(17, 28, 43, 1.00)',
    tertiary: 'rgba(110, 86, 118, 1.00)',
    onTertiary: 'rgba(255, 255, 255, 1.00)',
    tertiaryContainer: 'rgba(247, 216, 255, 1.00)',
    onTertiaryContainer: 'rgba(39, 20, 48, 1.00)',
    error: 'rgba(186, 26, 26, 1.00)',
    onError: 'rgba(255, 255, 255, 1.00)',
    errorContainer: 'rgba(255, 218, 214, 1.00)',
    onErrorContainer: 'rgba(65, 0, 2, 1.00)',
    background: 'rgba(253, 252, 255, 1.00)',
    onBackground: 'rgba(26, 28, 30, 1.00)',
    surface: 'rgba(253, 252, 255, 1.00)',
    onSurface: 'rgba(26, 28, 30, 1.00)',
    surfaceVariant: 'rgba(224, 226, 236, 1.00)',
    onSurfaceVariant: 'rgba(67, 71, 78, 1.00)',
    outline: 'rgba(116, 119, 127, 1.00)',
    outlineVariant: 'rgba(195, 198, 207, 1.00)',
    shadow: 'rgba(0, 0, 0, 1.00)',
    scrim: 'rgba(0, 0, 0, 1.00)',
    inverseSurface: 'rgba(47, 48, 51, 1.00)',
    inverseOnSurface: 'rgba(241, 240, 244, 1.00)',
    inversePrimary: 'rgba(165, 200, 255, 1.00)',
    toJSON: () => ({}),
  } as unknown as Scheme;

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
