import {
  themeFromSourceColor,
  themeFromImage,
  argbFromRgba,
  rgbaFromArgb,
} from '@material/material-color-utilities';

/**
 * Converts ARGB color value to RGBA string format
 * @param argb The ARGB color value
 * @returns RGBA string in format "rgba(r, g, b, a)"
 */
export function getColorFromArgb(argb: number): string {
  const { r, g, b, a } = rgbaFromArgb(argb);
  return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
}

/**
 * Parses various color format strings to ARGB
 * @param color Color string in rgba format
 * @returns ARGB color value
 */
export function parseColorToArgb(color: string): number {
  // Handle rgba format
  const rgbaRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/;
  const rgbaMatches = color.match(rgbaRegex);

  if (!rgbaMatches) {
    console.error('Invalid color format:', color);
    return argbFromRgba({ r: 0, g: 0, b: 0, a: 255 });
  }

  const r = parseInt(rgbaMatches[1], 10);
  const g = parseInt(rgbaMatches[2], 10);
  const b = parseInt(rgbaMatches[3], 10);
  const a = rgbaMatches[4] ? Math.round(parseFloat(rgbaMatches[4]) * 255) : 255;

  return argbFromRgba({ r, g, b, a });
}

/**
 * Recursively transforms a Scheme object by converting ARGB values to RGBA strings
 * @param scheme The color scheme object to transform
 * @returns A new object with ARGB values converted to RGBA strings
 */
export function transformSchemeToRgba(scheme: any): any {
  const result: any = {};

  for (const key in scheme) {
    if (typeof scheme[key] === 'object' && scheme[key] !== null) {
      result[key] = transformSchemeToRgba(scheme[key]);
    } else if (typeof scheme[key] === 'number') {
      // If it's a number, assume it's an ARGB color value and convert to RGBA string
      result[key] = getColorFromArgb(scheme[key]);
    } else {
      result[key] = scheme[key];
    }
  }

  return result;
}

// Re-export functions from material-color-utilities
export { themeFromSourceColor, themeFromImage, argbFromRgba, rgbaFromArgb };
