import { Hct } from '@material/material-color-utilities';

// 工具函数：#RRGGBB => ARGB int
function hexToArgb(hex: string): number {
  let c = hex.replace('#', '');
  if (c.length === 3)
    c = c
      .split('')
      .map((x) => x + x)
      .join('');
  const num = parseInt(c, 16);
  return (0xff << 24) | num;
}

// 工具函数：ARGB int => #RRGGBB
function argbToHex(argb: number): string {
  const r = (argb >> 16) & 0xff;
  const g = (argb >> 8) & 0xff;
  const b = argb & 0xff;
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export interface ChartPaletteOptions {
  count?: number; // 颜色数量，默认8
  theme?: 'light' | 'dark'; // 主题
  chroma?: number; // 色度覆盖范围，默认自动
  toneLight?: number; // 明亮主题色明度
  toneDark?: number; // 暗色主题色明度
  colorBlindMode?:
    | 'normal'
    | 'protanopia'
    | 'deuteranopia'
    | 'tritanopia'
    | 'achromatopsia'; // 色盲模式
}

/**
 * 生成可视化图表色板
 * @param source 主色（hex字符串，如#1e90ff）
 * @param options 可选项
 * @returns 色板数组（hex字符串）
 */
export function generateChartPalette(
  source: string,
  options: ChartPaletteOptions = {}
): string[] {
  const {
    count = 8,
    theme = 'light',
    chroma,
    toneLight = 60,
    toneDark = 70,
    colorBlindMode = 'normal',
  } = options;

  // 解析主色HCT
  const argb = hexToArgb(source);
  const hct = Hct.fromInt(argb);
  const baseHue = hct.hue;
  const baseChroma = chroma ?? Math.max(48, hct.chroma, 32); // 保证鲜明
  const tone = theme === 'light' ? toneLight : toneDark;

  // 色相步长，保证分布均匀
  let step = 360 / count;
  // 色盲模式下增大色相步长，增强色差
  if (colorBlindMode && colorBlindMode !== 'normal') {
    step = (360 / count) * 1.3; // 增大色相间隔，避免色彩混淆
  }
  const palette: string[] = [];
  for (let i = 0; i < count; i++) {
    // 让主色排在第一个
    const hue = (baseHue + i * step) % 360;
    // 生成色，若chroma/tone超界HCT会自动校正
    const color = Hct.from(hue, baseChroma, tone);
    palette.push(argbToHex(color.toInt()));
  }

  // 保证主色在第一个（如果不是则旋转）
  const mainHex = argbToHex(Hct.from(baseHue, baseChroma, tone).toInt());
  const mainIdx = palette.findIndex(
    (c) => c.toLowerCase() === mainHex.toLowerCase()
  );
  if (mainIdx > 0) {
    // 把主色移到第一个
    palette.unshift(...palette.splice(mainIdx, 1));
  }

  return palette;
}
