import { ref, computed, watchEffect } from 'vue';
import { type Scheme } from '@material/material-color-utilities';
import { transformSchemeToRgba } from '../tools/color';
import { useThemeColors } from './useThemeColors';

// 创建一个单例模式的主题管理器
let isInitialized = false;

// 以下变量会被所有组件共享
const lastUpdatedTimestamp = ref(Date.now());

/**
 * 主题管理器组合式函数
 * 整合了主题颜色的获取、主题模式的切换、主题更新等功能
 * 用于集中管理应用中所有与主题相关的操作
 */
export function useThemeManager() {
  // 复用现有的useThemeColors中的功能
  const {
    themeColors,
    themeColorsRgba,
    isDarkMode,
    updateThemeColors,
    toggleDarkMode,
  } = useThemeColors();

  // 计算当前使用的主题颜色对象
  const currentTheme = computed(() => {
    return isDarkMode.value ? themeColors.value.dark : themeColors.value.light;
  });

  // 用于组件的主题样式计算
  const getThemeStyles = () => {
    const colors = themeColorsRgba.value;
    if (!colors || !colors.props) return {};

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
  const applyTheme = (newTheme: { light: Scheme; dark: Scheme }) => {
    updateThemeColors(newTheme);
    lastUpdatedTimestamp.value = Date.now();
  };

  /**
   * 重置为默认主题
   */
  const resetToDefaultTheme = () => {
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
