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
    // 确保 themeColorsRgba.value 和 props 存在
    if (!themeColorsRgba.value || !themeColorsRgba.value.props) {
      console.warn('Theme colors not initialized');
      return {}; // 返回空对象，避免后续计算
    }

    const colors = themeColorsRgba.value.props;

    // 基本映射关系
    const elementVars: Record<string, string> = {
      // 主色
      '--el-color-primary': colors['--theme-primary'],
      '--el-color-primary-light-3': colors['--theme-primary-container'],
      '--el-color-primary-light-5': adjustColor(colors['--theme-primary'], 0.5),
      '--el-color-primary-light-7': adjustColor(colors['--theme-primary'], 0.7),
      '--el-color-primary-light-8': adjustColor(colors['--theme-primary'], 0.8),
      '--el-color-primary-light-9': adjustColor(colors['--theme-primary'], 0.9),
      '--el-color-primary-dark-2': colors['--theme-on-primary-container'],

      // 成功
      '--el-color-success':
        colors['--theme-secondary'] || 'rgba(84, 95, 113, 1)',
      '--el-color-success-light-3': adjustColor(
        colors['--theme-secondary'] || 'rgba(84, 95, 113, 1)',
        0.3
      ),
      '--el-color-success-light-5': adjustColor(
        colors['--theme-secondary'] || 'rgba(84, 95, 113, 1)',
        0.5
      ),
      '--el-color-success-light-7': adjustColor(
        colors['--theme-secondary'] || 'rgba(84, 95, 113, 1)',
        0.7
      ),
      '--el-color-success-light-8': adjustColor(
        colors['--theme-secondary'] || 'rgba(84, 95, 113, 1)',
        0.8
      ),
      '--el-color-success-light-9': adjustColor(
        colors['--theme-secondary'] || 'rgba(84, 95, 113, 1)',
        0.9
      ),
      '--el-color-success-dark-2': adjustColor(
        colors['--theme-secondary'] || 'rgba(84, 95, 113, 1)',
        -0.2
      ),

      // 警告
      '--el-color-warning':
        colors['--theme-tertiary'] || 'rgba(110, 86, 118, 1)',
      '--el-color-warning-light-3': adjustColor(
        colors['--theme-tertiary'] || 'rgba(110, 86, 118, 1)',
        0.3
      ),
      '--el-color-warning-light-5': adjustColor(
        colors['--theme-tertiary'] || 'rgba(110, 86, 118, 1)',
        0.5
      ),
      '--el-color-warning-light-7': adjustColor(
        colors['--theme-tertiary'] || 'rgba(110, 86, 118, 1)',
        0.7
      ),
      '--el-color-warning-light-8': adjustColor(
        colors['--theme-tertiary'] || 'rgba(110, 86, 118, 1)',
        0.8
      ),
      '--el-color-warning-light-9': adjustColor(
        colors['--theme-tertiary'] || 'rgba(110, 86, 118, 1)',
        0.9
      ),
      '--el-color-warning-dark-2': adjustColor(
        colors['--theme-tertiary'] || 'rgba(110, 86, 118, 1)',
        -0.2
      ),

      // 危险/错误
      '--el-color-danger': colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
      '--el-color-danger-light-3': adjustColor(
        colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
        0.3
      ),
      '--el-color-danger-light-5': adjustColor(
        colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
        0.5
      ),
      '--el-color-danger-light-7': adjustColor(
        colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
        0.7
      ),
      '--el-color-danger-light-8': adjustColor(
        colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
        0.8
      ),
      '--el-color-danger-light-9': adjustColor(
        colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
        0.9
      ),
      '--el-color-danger-dark-2': adjustColor(
        colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
        -0.2
      ),

      // 错误 (与 danger 相同)
      '--el-color-error': colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
      '--el-color-error-light-3': adjustColor(
        colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
        0.3
      ),
      '--el-color-error-light-5': adjustColor(
        colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
        0.5
      ),
      '--el-color-error-light-7': adjustColor(
        colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
        0.7
      ),
      '--el-color-error-light-8': adjustColor(
        colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
        0.8
      ),
      '--el-color-error-light-9': adjustColor(
        colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
        0.9
      ),
      '--el-color-error-dark-2': adjustColor(
        colors['--theme-error'] || 'rgba(186, 26, 26, 1)',
        -0.2
      ),

      // 信息
      '--el-color-info': colors['--theme-outline'] || 'rgba(116, 119, 127, 1)',
      '--el-color-info-light-3': adjustColor(
        colors['--theme-outline'] || 'rgba(116, 119, 127, 1)',
        0.3
      ),
      '--el-color-info-light-5': adjustColor(
        colors['--theme-outline'] || 'rgba(116, 119, 127, 1)',
        0.5
      ),
      '--el-color-info-light-7': adjustColor(
        colors['--theme-outline'] || 'rgba(116, 119, 127, 1)',
        0.7
      ),
      '--el-color-info-light-8': adjustColor(
        colors['--theme-outline'] || 'rgba(116, 119, 127, 1)',
        0.8
      ),
      '--el-color-info-light-9': adjustColor(
        colors['--theme-outline'] || 'rgba(116, 119, 127, 1)',
        0.9
      ),
      '--el-color-info-dark-2': adjustColor(
        colors['--theme-outline'] || 'rgba(116, 119, 127, 1)',
        -0.2
      ),

      // 文本颜色
      '--el-text-color-primary':
        colors['--theme-on-surface'] || 'rgba(26, 28, 30, 1)',
      '--el-text-color-regular':
        colors['--theme-on-surface-variant'] || 'rgba(67, 71, 78, 1)',
      '--el-text-color-secondary': adjustColor(
        colors['--theme-on-surface-variant'] || 'rgba(67, 71, 78, 1)',
        0.2
      ),
      '--el-text-color-placeholder': adjustColor(
        colors['--theme-on-surface-variant'] || 'rgba(67, 71, 78, 1)',
        0.4
      ),
      '--el-text-color-disabled': adjustColor(
        colors['--theme-on-surface-variant'] || 'rgba(67, 71, 78, 1)',
        0.6
      ),

      // 边框颜色
      '--el-border-color':
        colors['--theme-outline-variant'] || 'rgba(195, 198, 207, 1)',
      '--el-border-color-light': adjustColor(
        colors['--theme-outline-variant'] || 'rgba(195, 198, 207, 1)',
        0.3
      ),
      '--el-border-color-lighter': adjustColor(
        colors['--theme-outline-variant'] || 'rgba(195, 198, 207, 1)',
        0.5
      ),
      '--el-border-color-extra-light': adjustColor(
        colors['--theme-outline-variant'] || 'rgba(195, 198, 207, 1)',
        0.8
      ),

      // 填充色
      '--el-fill-color':
        colors['--theme-surface-variant'] || 'rgba(224, 226, 236, 1)',
      '--el-fill-color-light': adjustColor(
        colors['--theme-surface-variant'] || 'rgba(224, 226, 236, 1)',
        0.3
      ),
      '--el-fill-color-lighter': adjustColor(
        colors['--theme-surface-variant'] || 'rgba(224, 226, 236, 1)',
        0.5
      ),
      '--el-fill-color-blank':
        colors['--theme-surface'] || 'rgba(253, 252, 255, 1)',

      // 背景颜色
      '--el-bg-color': colors['--theme-surface'] || 'rgba(253, 252, 255, 1)',
      '--el-bg-color-page':
        colors['--theme-background'] || 'rgba(253, 252, 255, 1)',
      '--el-bg-color-overlay':
        colors['--theme-surface'] || 'rgba(253, 252, 255, 1)',

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

    Object.keys(vars).forEach((key) => {
      if (vars[key]) {
        // 确保值存在
        style.setProperty(key, vars[key]);
      }
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
 * 调整 RGBA 颜色的亮度
 * @param rgba RGBA 颜色字符串，例如 "rgba(255, 0, 0, 1)"
 * @param amount 调整量，正数增加亮度，负数降低亮度
 */
function adjustColor(rgba: string, amount: number): string {
  // 安全检查：如果rgba为空或undefined，返回默认颜色
  if (!rgba) {
    return 'rgba(0, 0, 0, 0)'; // 返回透明色作为默认值
  }

  // 解析 RGBA
  const rgbaMatch = rgba.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/
  );
  if (!rgbaMatch) return rgba;

  let r = parseInt(rgbaMatch[1]);
  let g = parseInt(rgbaMatch[2]);
  let b = parseInt(rgbaMatch[3]);
  const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;

  if (amount > 0) {
    // 增加亮度 (向白色过渡)
    r = Math.round(r + (255 - r) * amount);
    g = Math.round(g + (255 - g) * amount);
    b = Math.round(b + (255 - b) * amount);
  } else {
    // 降低亮度 (向黑色过渡)
    const factor = 1 + amount;
    r = Math.round(r * factor);
    g = Math.round(g * factor);
    b = Math.round(b * factor);
  }

  // 确保 RGB 值在 0-255 范围内
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
