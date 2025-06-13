<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { TonalPalette, CorePalette } from '@material/material-color-utilities';
import { ElColorPicker, ElSwitch, ElSelect, ElOption } from 'element-plus';
import { Scheme } from '@material/material-color-utilities';
import { generateChartPalette } from './dataVisualScheme';
import { simulate } from '@bjornlu/colorblind';

// 工具函数：将 #RRGGBB 转为 ARGB int
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

// 取色器绑定值
const color = ref('#1e90ff');

// 生成 TonalPalette
const tonalPalette = computed(() => {
  const argb = hexToArgb(color.value);
  return TonalPalette.fromInt(argb);
});

// 生成 CorePalette
const corePalette = computed(() => {
  const argb = hexToArgb(color.value);
  return CorePalette.of(argb);
});

// 需要展示的色阶
const tones = [100, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

// ARGB int 转 #RRGGBB
function argbToHex(argb: number): string {
  const r = (argb >> 16) & 0xff;
  const g = (argb >> 8) & 0xff;
  const b = argb & 0xff;
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

// 生成 light/dark Scheme
const lightScheme = computed(() => {
  return Scheme.lightFromCorePalette(corePalette.value).toJSON();
});
const darkScheme = computed(() => {
  return Scheme.darkFromCorePalette(corePalette.value).toJSON();
});

// 主题模式
const isDark = ref(false);

// 切换 body 背景色和文字色
watchEffect(() => {
  if (isDark.value) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
});

// 复制色值并高亮反馈
const copiedHex = ref('');
function copyToClipboard(hex: string) {
  navigator.clipboard.writeText(hex);
  copiedHex.value = hex;
  setTimeout(() => {
    if (copiedHex.value === hex) copiedHex.value = '';
  }, 800);
}

// 计算相对亮度
function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  const toLinear = (c: number) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}
// 计算对比度
function contrast(hex1: string, hex2: string) {
  const l1 = luminance(hexToRgb(hex1));
  const l2 = luminance(hexToRgb(hex2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const paletteBg = computed(() => (isDark.value ? '#181818' : '#fff'));

// 生成可视化图表色板
const chartPaletteLight = computed(() =>
  generateChartPalette(color.value, {
    theme: 'light',
    count: 8,
    toneLight: 70,
    toneDark: 50,
    chroma: undefined,
    colorBlindMode:
      colorBlindMode.value as import('./dataVisualScheme').ChartPaletteOptions['colorBlindMode'],
  })
);
const chartPaletteDark = computed(() =>
  generateChartPalette(color.value, {
    theme: 'dark',
    count: 8,
    toneLight: 30,
    toneDark: 70,
    chroma: undefined,
    colorBlindMode:
      colorBlindMode.value as import('./dataVisualScheme').ChartPaletteOptions['colorBlindMode'],
  })
);

// 色盲模式
const colorBlindModes = [
  { label: '正常', value: 'normal' },
  { label: '红色盲（Protanopia）', value: 'protanopia' },
  { label: '绿色盲（Deuteranopia）', value: 'deuteranopia' },
  { label: '蓝色盲（Tritanopia）', value: 'tritanopia' },
  { label: '全色盲（Achromatopsia）', value: 'achromatopsia' },
];
const colorBlindMode = ref('normal');

// 将 #RRGGBB 转为 {r,g,b}
function hexToRgb(hex: string) {
  let c = hex.replace('#', '');
  if (c.length === 3)
    c = c
      .split('')
      .map((x) => x + x)
      .join('');
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}
// {r,g,b} 转 #RRGGBB
function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return (
    '#' +
    [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')
  );
}
// 色盲模拟
function simulateColor(hex: string): string {
  if (colorBlindMode.value === 'normal') return hex;
  const rgb = hexToRgb(hex);
  const sim = simulate(rgb, colorBlindMode.value as any);
  return rgbToHex(sim);
}
</script>

<template>
  <div class="palette">
    <div class="palette-header">
      <div class="palette-picker">
        <span>选择主色：</span>
        <el-color-picker v-model="color" :show-alpha="false" />
      </div>
      <el-select
        v-model="colorBlindMode"
        style="width: 200px; margin-left: 24px"
      >
        <el-option
          v-for="mode in colorBlindModes"
          :key="mode.value"
          :label="mode.label"
          :value="mode.value"
        />
      </el-select>
      <el-switch
        v-model="isDark"
        active-text="🌙"
        inactive-text="☀️"
        style="
          margin-left: auto;
          position: fixed;
          top: 32px;
          right: 32px;
          z-index: 1001;
          background: var(--palette-bg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border-radius: 20px;
          padding: 4px 12px;
        "
      />
    </div>

    <h3>TonalPalette 色阶</h3>
    <div class="palette-row">
      <div
        v-for="tone in tones"
        :key="'tonal-' + tone"
        class="palette-block-group"
      >
        <div
          class="palette-block"
          :class="{
            copied:
              copiedHex === simulateColor(argbToHex(tonalPalette.tone(tone))),
          }"
          :style="{
            background: simulateColor(argbToHex(tonalPalette.tone(tone))),
          }"
          @click="
            copyToClipboard(simulateColor(argbToHex(tonalPalette.tone(tone))))
          "
          title="点击复制色值"
        ></div>
        <div class="palette-labels">
          <div class="palette-label">{{ tone }}</div>
          <div class="palette-hex">
            {{ simulateColor(argbToHex(tonalPalette.tone(tone))) }}
          </div>
        </div>
      </div>
    </div>

    <h3>CorePalette 主色板（a1）</h3>
    <div class="palette-row">
      <div
        v-for="tone in tones"
        :key="'a1-' + tone"
        class="palette-block-group"
      >
        <div
          class="palette-block"
          :class="{
            copied:
              copiedHex === simulateColor(argbToHex(corePalette.a1.tone(tone))),
          }"
          :style="{
            background: simulateColor(argbToHex(corePalette.a1.tone(tone))),
          }"
          @click="
            copyToClipboard(simulateColor(argbToHex(corePalette.a1.tone(tone))))
          "
          title="点击复制色值"
        ></div>
        <div class="palette-labels">
          <div class="palette-label">{{ tone }}</div>
          <div class="palette-hex">
            {{ simulateColor(argbToHex(corePalette.a1.tone(tone))) }}
          </div>
        </div>
      </div>
    </div>

    <h3>CorePalette 次色板（a2）</h3>
    <div class="palette-row">
      <div
        v-for="tone in tones"
        :key="'a2-' + tone"
        class="palette-block-group"
      >
        <div
          class="palette-block"
          :class="{
            copied:
              copiedHex === simulateColor(argbToHex(corePalette.a2.tone(tone))),
          }"
          :style="{
            background: simulateColor(argbToHex(corePalette.a2.tone(tone))),
          }"
          @click="
            copyToClipboard(simulateColor(argbToHex(corePalette.a2.tone(tone))))
          "
          title="点击复制色值"
        ></div>
        <div class="palette-labels">
          <div class="palette-label">{{ tone }}</div>
          <div class="palette-hex">
            {{ simulateColor(argbToHex(corePalette.a2.tone(tone))) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Scheme Light/Dark 色板，根据主题切换 -->
    <h3>{{ isDark ? 'Scheme Dark 色板' : 'Scheme Light 色板' }}</h3>
    <div class="palette-row" style="flex-wrap: wrap">
      <div
        v-for="(value, key) in isDark ? darkScheme : lightScheme"
        :key="(isDark ? 'dark-' : 'light-') + key"
        class="palette-block-group"
      >
        <div
          class="palette-block"
          :class="{ copied: copiedHex === simulateColor(argbToHex(value)) }"
          :style="{ background: simulateColor(argbToHex(value)) }"
          @click="copyToClipboard(simulateColor(argbToHex(value)))"
          title="点击复制色值"
        ></div>
        <div class="palette-labels">
          <div class="palette-label">{{ key }}</div>
          <div class="palette-hex">{{ simulateColor(argbToHex(value)) }}</div>
        </div>
      </div>
    </div>

    <h3>可视化图表色板（Chart Palette）</h3>
    <div class="palette-row">
      <div
        v-for="(hex, idx) in isDark ? chartPaletteDark : chartPaletteLight"
        :key="'chart-' + idx"
        class="palette-block-group"
      >
        <div
          class="palette-block"
          :class="{
            copied: copiedHex === simulateColor(hex),
            // 'not-accessible': !isAccessible(simulateColor(hex)),
          }"
          :style="{ background: simulateColor(hex) }"
          @click="copyToClipboard(simulateColor(hex))"
          :title="'点击复制色值'"
        ></div>
        <div class="palette-labels">
          <div class="palette-label">{{ idx + 1 }}</div>
          <div class="palette-hex">{{ simulateColor(hex) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.palette {
  padding: 24px;
  min-height: 100vh;
  background: var(--palette-bg);
  color: var(--palette-text);
  transition: background 0.3s, color 0.3s;

  .palette-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
  }
  .palette-picker {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .palette-row {
    display: flex;
    gap: 16px;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }
  .palette-block-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 96px;
    margin-bottom: 8px;
  }
  .palette-block {
    width: 96px;
    height: 96px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
    transition: background 0.3s, box-shadow 0.3s, border 0.2s;
    border: 1.5px solid rgba(0, 0, 0, 0.04);
    cursor: pointer;
    user-select: none;
  }
  .palette-block:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    border: 1.5px solid var(--palette-text);
  }
  .palette-block.copied {
    border: 2.5px solid #4fc08d;
    box-shadow: 0 0 0 3px rgba(79, 192, 141, 0.18);
  }
  .palette-labels {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 2px;
  }
  .palette-label {
    font-size: 13px;
    color: #888;
    font-weight: 400;
    letter-spacing: 0.02em;
    width: 100%;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
    transition: color 0.3s;
  }
  .palette-hex {
    font-size: 15px;
    color: var(--palette-text);
    font-weight: 600;
    letter-spacing: 0.04em;
    width: 100%;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s;
  }
}
:root {
  --palette-bg: #fff;
  --palette-text: #222;
}
.dark-mode .palette,
.palette.dark-mode {
  --palette-bg: #181818;
  --palette-text: #f5f5f5;
}
</style>
