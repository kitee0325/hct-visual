import { computed, watch } from 'vue';
import { useThemeManager } from './useThemeManager';
import { useThemeColors } from './useThemeColors';

/**
 * 将主题颜色映射到 Element Plus 的 CSS 变量
 */
export function useElementTheme() {
  // 获取主题管理器提供的颜色
  const { themeColorsRgba, isDarkMode } = useThemeColors();

  // 计算 Element Plus 需要的变量映射
  const elementCssVars = computed(() => {
    // 确保 themeColorsRgba.value 存在
    if (!themeColorsRgba.value) {
      console.warn('Theme colors not initialized');
      return {}; // 返回空对象，避免后续计算
    }

    const colors = themeColorsRgba.value;

    // 基本映射关系
    const elementVars: Record<string, string> = {
      // 主色
      '--el-color-primary': colors.primary,
      '--el-color-primary-light-3': colors.primaryContainer,
      '--el-color-primary-light-5': adjustColor(colors.primary, 0.5),
      '--el-color-primary-light-7': adjustColor(colors.primary, 0.7),
      '--el-color-primary-light-8': adjustColor(colors.primary, 0.8),
      '--el-color-primary-light-9': adjustColor(colors.primary, 0.9),
      '--el-color-primary-dark-2': colors.onPrimaryContainer,

      // 成功
      '--el-color-success': colors.secondary || 'rgba(84, 95, 113, 1)',
      '--el-color-success-light-3': adjustColor(
        colors.secondary || 'rgba(84, 95, 113, 1)',
        0.3
      ),
      '--el-color-success-light-5': adjustColor(
        colors.secondary || 'rgba(84, 95, 113, 1)',
        0.5
      ),
      '--el-color-success-light-7': adjustColor(
        colors.secondary || 'rgba(84, 95, 113, 1)',
        0.7
      ),
      '--el-color-success-light-8': adjustColor(
        colors.secondary || 'rgba(84, 95, 113, 1)',
        0.8
      ),
      '--el-color-success-light-9': adjustColor(
        colors.secondary || 'rgba(84, 95, 113, 1)',
        0.9
      ),
      '--el-color-success-dark-2': adjustColor(
        colors.secondary || 'rgba(84, 95, 113, 1)',
        -0.2
      ),

      // 警告
      '--el-color-warning': colors.tertiary || 'rgba(110, 86, 118, 1)',
      '--el-color-warning-light-3': adjustColor(
        colors.tertiary || 'rgba(110, 86, 118, 1)',
        0.3
      ),
      '--el-color-warning-light-5': adjustColor(
        colors.tertiary || 'rgba(110, 86, 118, 1)',
        0.5
      ),
      '--el-color-warning-light-7': adjustColor(
        colors.tertiary || 'rgba(110, 86, 118, 1)',
        0.7
      ),
      '--el-color-warning-light-8': adjustColor(
        colors.tertiary || 'rgba(110, 86, 118, 1)',
        0.8
      ),
      '--el-color-warning-light-9': adjustColor(
        colors.tertiary || 'rgba(110, 86, 118, 1)',
        0.9
      ),
      '--el-color-warning-dark-2': adjustColor(
        colors.tertiary || 'rgba(110, 86, 118, 1)',
        -0.2
      ),

      // 危险/错误
      '--el-color-danger': colors.error || 'rgba(186, 26, 26, 1)',
      '--el-color-danger-light-3': adjustColor(
        colors.error || 'rgba(186, 26, 26, 1)',
        0.3
      ),
      '--el-color-danger-light-5': adjustColor(
        colors.error || 'rgba(186, 26, 26, 1)',
        0.5
      ),
      '--el-color-danger-light-7': adjustColor(
        colors.error || 'rgba(186, 26, 26, 1)',
        0.7
      ),
      '--el-color-danger-light-8': adjustColor(
        colors.error || 'rgba(186, 26, 26, 1)',
        0.8
      ),
      '--el-color-danger-light-9': adjustColor(
        colors.error || 'rgba(186, 26, 26, 1)',
        0.9
      ),
      '--el-color-danger-dark-2': adjustColor(
        colors.error || 'rgba(186, 26, 26, 1)',
        -0.2
      ),

      // 错误 (与 danger 相同)
      '--el-color-error': colors.error || 'rgba(186, 26, 26, 1)',
      '--el-color-error-light-3': adjustColor(
        colors.error || 'rgba(186, 26, 26, 1)',
        0.3
      ),
      '--el-color-error-light-5': adjustColor(
        colors.error || 'rgba(186, 26, 26, 1)',
        0.5
      ),
      '--el-color-error-light-7': adjustColor(
        colors.error || 'rgba(186, 26, 26, 1)',
        0.7
      ),
      '--el-color-error-light-8': adjustColor(
        colors.error || 'rgba(186, 26, 26, 1)',
        0.8
      ),
      '--el-color-error-light-9': adjustColor(
        colors.error || 'rgba(186, 26, 26, 1)',
        0.9
      ),
      '--el-color-error-dark-2': adjustColor(
        colors.error || 'rgba(186, 26, 26, 1)',
        -0.2
      ),

      // 信息
      '--el-color-info': colors.outline || 'rgba(116, 119, 127, 1)',
      '--el-color-info-light-3': adjustColor(
        colors.outline || 'rgba(116, 119, 127, 1)',
        0.3
      ),
      '--el-color-info-light-5': adjustColor(
        colors.outline || 'rgba(116, 119, 127, 1)',
        0.5
      ),
      '--el-color-info-light-7': adjustColor(
        colors.outline || 'rgba(116, 119, 127, 1)',
        0.7
      ),
      '--el-color-info-light-8': adjustColor(
        colors.outline || 'rgba(116, 119, 127, 1)',
        0.8
      ),
      '--el-color-info-light-9': adjustColor(
        colors.outline || 'rgba(116, 119, 127, 1)',
        0.9
      ),
      '--el-color-info-dark-2': adjustColor(
        colors.outline || 'rgba(116, 119, 127, 1)',
        -0.2
      ),

      // 文本颜色
      '--el-text-color-primary': colors.onSurface || 'rgba(26, 28, 30, 1)',
      '--el-text-color-regular':
        colors.onSurfaceVariant || 'rgba(67, 71, 78, 1)',
      '--el-text-color-secondary': adjustColor(
        colors.onSurfaceVariant || 'rgba(67, 71, 78, 1)',
        0.2
      ),
      '--el-text-color-placeholder': adjustColor(
        colors.onSurfaceVariant || 'rgba(67, 71, 78, 1)',
        0.4
      ),
      '--el-text-color-disabled': adjustColor(
        colors.onSurfaceVariant || 'rgba(67, 71, 78, 1)',
        0.6
      ),

      // 边框颜色
      '--el-border-color': colors.outlineVariant || 'rgba(195, 198, 207, 1)',
      '--el-border-color-light': adjustColor(
        colors.outlineVariant || 'rgba(195, 198, 207, 1)',
        0.3
      ),
      '--el-border-color-lighter': adjustColor(
        colors.outlineVariant || 'rgba(195, 198, 207, 1)',
        0.5
      ),
      '--el-border-color-extra-light': adjustColor(
        colors.outlineVariant || 'rgba(195, 198, 207, 1)',
        0.8
      ),

      // 填充色
      '--el-fill-color': colors.surfaceVariant || 'rgba(224, 226, 236, 1)',
      '--el-fill-color-light': adjustColor(
        colors.surfaceVariant || 'rgba(224, 226, 236, 1)',
        0.3
      ),
      '--el-fill-color-lighter': adjustColor(
        colors.surfaceVariant || 'rgba(224, 226, 236, 1)',
        0.5
      ),
      '--el-fill-color-blank': colors.surface || 'rgba(253, 252, 255, 1)',

      // 背景颜色
      '--el-bg-color': colors.surface || 'rgba(253, 252, 255, 1)',
      '--el-bg-color-page': colors.background || 'rgba(253, 252, 255, 1)',
      '--el-bg-color-overlay': colors.surface || 'rgba(253, 252, 255, 1)',

      // 蒙版颜色
      '--el-mask-color': isDarkMode.value
        ? 'rgba(0, 0, 0, 0.8)'
        : 'rgba(0, 0, 0, 0.5)',

      // 阴影
      '--el-box-shadow': isDarkMode.value
        ? '0px 12px 32px 4px rgba(0, 0, 0, 0.36), 0px 8px 20px rgba(0, 0, 0, 0.72)'
        : '0px 12px 32px 4px rgba(0, 0, 0, 0.04), 0px 8px 20px rgba(0, 0, 0, 0.08)',
      '--el-box-shadow-light': isDarkMode.value
        ? '0px 0px 12px rgba(0, 0, 0, 0.72)'
        : '0px 0px 12px rgba(0, 0, 0, 0.12)',
    };

    return elementVars;
  });

  // 注入 Element Plus CSS 变量到文档根元素
  function applyElementTheme() {
    const style = document.documentElement.style;
    const vars = elementCssVars.value;

    // 安全检查：确保vars存在且不为空对象
    if (!vars || Object.keys(vars).length === 0) {
      console.warn('Element Plus Theme Variables not initialized');
      return;
    }

    // 应用所有变量
    Object.entries(vars).forEach(([key, value]) => {
      style.setProperty(key, value);
    });
  }

  // 监听主题变化，自动应用到 Element Plus
  watch(
    [() => themeColorsRgba.value, isDarkMode],
    () => {
      try {
        applyElementTheme();
      } catch (error) {
        console.error('Apply Element Plus theme error:', error);
      }
    },
    { immediate: true, deep: true }
  );

  return {
    elementCssVars,
    applyElementTheme,
  };
}

/**
 * 调整颜色的亮度
 * @param rgba RGBA颜色字符串
 * @param amount 调整量 (-1 到 1)
 * @returns 调整后的RGBA颜色字符串
 */
function adjustColor(rgba: string, amount: number): string {
  const rgbaRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/;
  const matches = rgba.match(rgbaRegex);

  if (!matches) {
    console.warn('Invalid RGBA color format:', rgba);
    return rgba;
  }

  const r = parseInt(matches[1], 10);
  const g = parseInt(matches[2], 10);
  const b = parseInt(matches[3], 10);
  const a = matches[4] ? parseFloat(matches[4]) : 1;

  // 调整 RGB 值
  const adjustValue = (value: number): number => {
    if (amount > 0) {
      // 增加亮度
      return Math.min(255, value + (255 - value) * amount);
    } else {
      // 降低亮度
      return Math.max(0, value * (1 + amount));
    }
  };

  const newR = Math.round(adjustValue(r));
  const newG = Math.round(adjustValue(g));
  const newB = Math.round(adjustValue(b));

  return `rgba(${newR}, ${newG}, ${newB}, ${a})`;
}
