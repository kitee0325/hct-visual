import { ref, computed, watchEffect } from 'vue';
import { type Scheme, argbFromRgb } from '@material/material-color-utilities';
import { useThemeColors } from './useThemeColors';

// 创建一个单例模式的主题管理器
let isInitialized = false;

// 以下变量会被所有组件共享
const lastUpdatedTimestamp = ref(Date.now());

export type ThemeScheme = Record<string, number>;

/**
 * 主题管理器组合式函数
 * 整合了主题颜色的获取、主题模式的切换、主题更新等功能
 * 用于集中管理应用中所有与主题相关的操作
 */
export function useThemeManager() {
  // 复用现有的useThemeColors中的功能
  const { themeColors, themeColorsRgba, isDarkMode, updateThemeColors } =
    useThemeColors();

  // 计算当前使用的主题颜色对象
  const currentTheme = computed(() => {
    return isDarkMode.value ? themeColors.value.dark : themeColors.value.light;
  });

  // 用于组件的主题样式计算
  const getThemeStyles = () => {
    const colors = themeColorsRgba.value;
    if (!colors) return {};

    return {
      // 使用主题颜色变量
      '--primary-bg': `var(--theme-primary)`,
      '--primary-text': `var(--theme-on-primary)`,
      '--secondary-bg': `var(--theme-secondary)`,
      '--secondary-text': `var(--theme-on-secondary)`,
      '--surface-bg': `var(--theme-surface)`,
      '--surface-text': `var(--theme-on-surface)`,
      '--error-color': `var(--theme-error)`,
      '--outline-color': `var(--theme-outline)`,
    };
  };

  /**
   * 更新主题并应用到整个应用
   * @param newTheme 新的主题方案
   */
  const applyTheme = (newTheme: { light: ThemeScheme; dark: ThemeScheme }) => {
    updateThemeColors({
      light: newTheme.light,
      dark: newTheme.dark,
    });
    lastUpdatedTimestamp.value = Date.now();
  };

  /**
   * 重置为默认主题
   */
  const resetToDefaultTheme = () => {
    // 深色模式默认主题
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
  };

  /**
   * 保存当前主题到本地存储
   */
  const saveThemeToLocalStorage = () => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(
        'themeColors',
        JSON.stringify({
          light: themeColors.value.light,
          dark: themeColors.value.dark,
        })
      );
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  };

  /**
   * 从本地存储加载主题
   * @returns {boolean} 是否成功加载主题
   */
  const loadThemeFromLocalStorage = (): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const savedTheme = localStorage.getItem('themeColors');
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme);
        if (parsedTheme && parsedTheme.light && parsedTheme.dark) {
          updateThemeColors(parsedTheme);
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
    }
    return false;
  };

  // 初始化主题管理器
  if (!isInitialized && typeof window !== 'undefined') {
    // 页面初始加载时只初始化一次
    isInitialized = true;

    // 尝试从本地存储加载主题，如果失败则使用默认主题
    if (!loadThemeFromLocalStorage()) {
      // 使用默认主题
      resetToDefaultTheme();
    }

    // 监听主题变化
    watchEffect(() => {
      // 当主题颜色或模式变化时，更新时间戳
      if (themeColorsRgba.value) {
        lastUpdatedTimestamp.value = Date.now();

        // 当主题变化时保存到本地存储
        saveThemeToLocalStorage();
      }
    });
  }

  return {
    // 新增的功能
    currentTheme,
    lastUpdatedTimestamp,
    getThemeStyles,
    applyTheme,
    resetToDefaultTheme,
    saveThemeToLocalStorage,
    loadThemeFromLocalStorage,
  };
}
