<script setup lang="ts">
import { Plus, Delete, Moon, Sunny } from '@element-plus/icons-vue';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadFile } from 'element-plus';
import {
  type CustomColor,
  themeFromSourceColor,
  themeFromImage,
} from '@material/material-color-utilities';
import { parseColorToArgb } from '../tools/color';
import { useThemeManager } from '../composables/useThemeManager';
import { useThemeColors } from '../composables/useThemeColors';
import { useElementTheme } from '../composables/useElementTheme';

// 使用主题管理器
const { themeColorsRgba, isDarkMode, toggleDarkMode } = useThemeColors();
const { applyTheme } = useThemeManager();

// 初始化 Element Plus 主题映射
const { applyElementTheme } = useElementTheme();

const imageUrl = ref<string>('');
const colorSelected = ref('rgba(30, 144, 255, 1)');
const predefineColors = ref(['rgba(30, 144, 255, 1)']);
const latestAction = ref<'image' | 'color'>('color');

// 自定义颜色相关
const customColors = ref<string[]>([]);
const currentCustomColor = ref('#409EFF');

// 将customColors转换为ARGB格式的计算属性
const customColorsArgb = computed(() =>
  customColors.value.map((color) => parseColorToArgb(color))
);

function addCustomColor(color: string) {
  if (color && !customColors.value.includes(color)) {
    customColors.value.push(color);
    currentCustomColor.value = '#409EFF';
  }
}

function removeCustomColor(index: number) {
  customColors.value.splice(index, 1);
}

function handleChange(file: File) {
  if (file) {
    imageUrl.value = URL.createObjectURL(file);
    latestAction.value = 'image';
  }
}

function handleRemove(event: Event) {
  event?.stopPropagation();
  imageUrl.value = '';
  latestAction.value = 'color';
}

function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  return true;
}

function handleColorChange(color: string) {
  predefineColors.value.push(color);
  if (predefineColors.value.length > 10) {
    predefineColors.value.shift();
  }
  latestAction.value = 'color';
}

// 在generateTheme函数之前添加新的辅助函数
function applyGeneratedTheme(theme: any, source: 'image' | 'color') {
  if (!theme?.schemes) {
    throw new Error(`Failed to generate theme from ${source}`);
  }

  // 处理自定义颜色
  const themeData = {
    light: { ...theme.schemes.light.toJSON() },
    dark: { ...theme.schemes.dark.toJSON() },
  };

  // 合并自定义颜色到主题中
  theme.customColors.forEach((customColor: any, index: number) => {
    const prefix = `custom${index + 1}`;

    // 合并亮色主题的自定义颜色
    themeData.light[`${prefix}`] = customColor.light.color;
    themeData.light[`on${prefix}`] = customColor.light.onColor;
    themeData.light[`${prefix}Container`] = customColor.light.colorContainer;
    themeData.light[`on${prefix}Container`] =
      customColor.light.onColorContainer;

    // 合并暗色主题的自定义颜色
    themeData.dark[`${prefix}`] = customColor.dark.color;
    themeData.dark[`on${prefix}`] = customColor.dark.onColor;
    themeData.dark[`${prefix}Container`] = customColor.dark.colorContainer;
    themeData.dark[`on${prefix}Container`] = customColor.dark.onColorContainer;
  });

  applyTheme(themeData);
  applyElementTheme();

  ElMessage({
    message: 'Theme generated successfully!',
    type: 'success',
    duration: 2000,
  });
}

function generateTheme() {
  const customColorObjects = customColorsArgb.value.map(
    (argb, index) =>
      ({
        value: argb,
        name: `Custom Color ${index + 1}`,
        blend: true,
      } as CustomColor)
  );
  if (latestAction.value === 'image') {
    if (!imageUrl.value) {
      ElMessage.error('Upload image first');
      return;
    }

    ElMessage({
      message: 'Generating theme from image...',
      type: 'info',
      duration: 2000,
    });

    const img = new Image();
    img.src = imageUrl.value;
    img.onerror = () => ElMessage.error('Failed to load image');

    img.onload = async () => {
      try {
        const theme = await themeFromImage(img, customColorObjects);
        applyGeneratedTheme(theme, 'image');
      } catch (error) {
        ElMessage.error('Error generating theme from image');
      }
    };
  } else {
    try {
      const theme = themeFromSourceColor(
        parseColorToArgb(colorSelected.value),
        customColorObjects
      );

      applyGeneratedTheme(theme, 'color');
    } catch (error) {
      ElMessage.error('Error generating theme from color');
    }
  }
}

// Function to copy color value to clipboard
function copyColorToClipboard(color: string) {
  navigator.clipboard
    .writeText(color)
    .then(() => {
      ElMessage({
        message: `Color ${color} copied to clipboard!`,
        type: 'success',
        duration: 2000,
      });
    })
    .catch((err) => {
      ElMessage({
        message: 'Failed to copy color',
        type: 'error',
        duration: 2000,
      });
      console.error('Could not copy text: ', err);
    });
}

// Function to export color palette as image
function exportPalette() {
  const colors = Object.entries(themeColorsRgba.value);
  const padding = 24;
  const colorBoxSize = 80;
  const labelHeight = 30;
  const columns = 4;
  const rows = Math.ceil(colors.length / columns);
  const cornerRadius = 8; // Added corner radius

  // Create canvas with higher resolution for better text rendering
  const scale = 2; // Scale factor for higher resolution
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size with scaling
  canvas.width = ((colorBoxSize + padding) * columns + padding) * scale;
  canvas.height =
    ((colorBoxSize + labelHeight + padding) * rows + padding) * scale;
  ctx.scale(scale, scale);

  // Enable text anti-aliasing
  ctx.textRendering = 'optimizeLegibility';
  ctx.imageSmoothingEnabled = true;

  // Set background
  ctx.fillStyle = isDarkMode.value ? '#1a1a1a' : '#ffffff';
  ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

  // Draw color boxes and labels
  colors.forEach(([key, color], index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const x = padding + col * (colorBoxSize + padding);
    const y = padding + row * (colorBoxSize + labelHeight + padding);

    // Draw rounded color box
    ctx.beginPath();
    ctx.roundRect(x, y, colorBoxSize, colorBoxSize, cornerRadius);
    ctx.fillStyle = color;
    ctx.fill();

    // Draw label with better text rendering
    ctx.fillStyle = isDarkMode.value ? '#ffffff' : '#000000';
    ctx.font =
      '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Break long labels into multiple lines if needed
    const words = key.split(/(?=[A-Z])/);
    const maxLineWidth = colorBoxSize * 1.2;
    let lines = [''];
    let currentLine = 0;

    words.forEach((word) => {
      const testLine = lines[currentLine] + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWidth && lines[currentLine] !== '') {
        currentLine++;
        lines[currentLine] = word;
      } else {
        lines[currentLine] = testLine;
      }
    });

    // Draw each line of text
    lines.forEach((line, i) => {
      const lineY =
        y + colorBoxSize + (labelHeight / (lines.length + 1)) * (i + 1);
      ctx.fillText(line, x + colorBoxSize / 2, lineY);
    });
  });

  // Export as PNG
  try {
    const link = document.createElement('a');
    link.download = 'color-palette.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    ElMessage({
      message: 'Color palette exported successfully!',
      type: 'success',
      duration: 2000,
    });
  } catch (error) {
    ElMessage.error('Failed to export color palette');
  }
}
</script>

<template>
  <div class="form">
    <h2>Provide Primary Color</h2>

    <!-- Theme Toggle Button -->
    <div class="theme-toggle">
      <el-button
        circle
        size="large"
        :type="isDarkMode ? 'info' : 'warning'"
        @click="
          toggleDarkMode(!isDarkMode);
          applyElementTheme();
        "
      >
        <el-icon :size="20"
          ><component :is="isDarkMode ? Moon : Sunny"
        /></el-icon>
      </el-button>
    </div>

    <div class="form-color">
      <div class="form-color-img">
        <el-upload
          class="form-color-img-uploader"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="(uploadFile: UploadFile) => handleChange(uploadFile.raw as File)"
          :before-upload="beforeUpload"
        >
          <div class="form-color-img-uploader-box">
            <img
              v-if="imageUrl"
              :src="imageUrl"
              class="form-color-img-uploader-box-img"
            />
            <div v-if="imageUrl" class="form-color-img-uploader-box-act">
              <el-button
                type="danger"
                circle
                @click="(e: MouseEvent) => handleRemove(e)"
              >
                <el-icon><delete /></el-icon>
              </el-button>
            </div>
            <div v-else class="form-color-img-uploader-box-upload">
              <el-icon class="form-color-img-uploader-box-upload-icon"
                ><plus
              /></el-icon>
            </div>
          </div>
        </el-upload>
        <div class="form-color-label">From Image</div>
      </div>

      <div class="form-color-divider">
        <span>OR</span>
      </div>

      <div class="form-color-select">
        <div
          class="form-color-select-wrapper"
          :style="{ backgroundColor: colorSelected }"
        >
          <el-color-picker
            v-model="colorSelected"
            show-alpha
            :predefine="predefineColors"
            @change="handleColorChange"
          />
        </div>
        <div class="form-color-label">Select Color</div>
      </div>
    </div>
    <h2>Add Custom Color</h2>
    <div class="form-custom">
      <div class="form-custom-add">
        <div class="form-custom-add-label">
          <span>Choose Color</span>
        </div>
        <el-color-picker
          v-model="currentCustomColor"
          show-alpha
          @change="addCustomColor"
        />
      </div>
      <div class="form-custom-colors">
        <el-tag
          v-for="(color, index) in customColors"
          :key="index"
          :style="{ backgroundColor: color, borderColor: color }"
          class="form-custom-colors-tag"
          closable
          @close="removeCustomColor(index)"
        >
          {{ color }}
        </el-tag>
      </div>
    </div>

    <div class="generate-action">
      <el-button type="primary" size="large" @click="generateTheme"
        >Generate</el-button
      >
    </div>

    <div class="form-theme-header">
      <h2>Browser Theme</h2>
      <el-button
        type="info"
        size="small"
        @click="exportPalette"
        class="form-theme-export-btn"
      >
        Export Palette
      </el-button>
    </div>
    <div class="form-theme">
      <div class="form-theme-result">
        <div
          class="form-theme-result-item"
          v-for="(color, key) in themeColorsRgba"
          :key="key"
        >
          <div class="form-theme-result-item-label">{{ key }}</div>
          <el-tag
            class="form-theme-result-item-color"
            :style="{ backgroundColor: color }"
            @click="copyColorToClipboard(color)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Variables
$primary-color: var(--theme-primary, #409eff);
$border-radius-sm: 8px;
$border-radius-md: 12px;
$border-radius-lg: 16px;
$box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
$transition-base: all 0.3s ease;
$border-color: #d9d9d9;

// 使用全局主题变量，移除本地CSS变量定义
@mixin hover-lift {
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}

@mixin checkerboard-bg {
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    background-image: linear-gradient(
        45deg,
        var(--theme-surface-variant) 25%,
        transparent 25%
      ),
      linear-gradient(-45deg, var(--theme-surface-variant) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--theme-surface-variant) 75%),
      linear-gradient(-45deg, transparent 75%, var(--theme-surface-variant) 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0;
    z-index: -1;
    opacity: 0.7;
  }
}

// Base styles
.form {
  height: 100%;
  padding: 24px 28px 24px 24px;
  background-color: var(--theme-surface);
  border-radius: $border-radius-lg;
  box-shadow: var(--theme-box-shadow-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--theme-on-surface);
  position: relative; /* Added for absolute positioning of the theme toggle */

  h2 {
    color: var(--theme-on-surface);
    font-weight: 600;
    position: relative;
    padding-bottom: 8px;
    margin-bottom: 16px;

    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 40px;
      height: 3px;
      background-color: var(--theme-primary);
      border-radius: 3px;
    }

    &:not(:first-of-type) {
      margin-top: 32px;
    }
  }

  // Theme header section
  &-theme-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      padding-bottom: 0;

      &:after {
        bottom: -8px;
      }
    }

    .el-button {
      margin-left: 16px;
      transition: $transition-base;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--theme-box-shadow-light);
      }
    }
  }

  // Color selection section
  &-color {
    display: flex;
    margin-top: 20px;
    position: relative;
    align-items: center;
    justify-content: space-around;

    &-label {
      text-align: center;
      margin-top: 12px;
      font-weight: 500;
      color: var(--theme-on-surface);
      font-size: 14px;
    }

    &-divider {
      position: relative;
      height: 200px;
      display: flex;
      align-items: center;

      &:before {
        content: '';
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--theme-outline-variant);
        transform: translateX(-50%);
      }

      span {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: var(--theme-surface);
        border: 1px solid var(--theme-outline-variant);
        border-radius: 50%;
        position: relative;
        z-index: 1;
        font-weight: 600;
        color: var(--theme-on-surface-variant);
      }
    }

    &-img,
    &-select {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 40%;
    }

    // Image uploader
    &-img-uploader-box {
      width: 180px;
      height: 180px;
      border: 2px dashed var(--theme-outline-variant);
      border-radius: $border-radius-md;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: $transition-base;
      background-color: var(--theme-surface-variant);

      &:hover {
        border-color: var(--theme-primary);
        box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
        transform: translateY(-2px);
      }

      &-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &-upload {
        color: var(--theme-on-surface-variant);

        &-icon {
          color: var(--theme-primary);
        }
      }

      &-act {
        position: absolute;
        right: 8px;
        top: 8px;
        background-color: var(--theme-surface);
        border-radius: 50%;
        padding: 4px;
        backdrop-filter: blur(4px);
      }
    }

    // Color picker
    &-select-wrapper {
      padding: 10px;
      border: 2px dashed var(--theme-outline-variant);
      border-radius: $border-radius-md;
      cursor: pointer;
      background-color: var(--theme-surface-variant);
      transition: $transition-base;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 180px;
      height: 180px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.15) 1px,
            transparent 1px
          ),
          linear-gradient(
            45deg,
            rgba(0, 0, 0, 0.05) 25%,
            transparent 25%,
            transparent 75%,
            rgba(0, 0, 0, 0.05) 75%
          ),
          linear-gradient(
            -45deg,
            rgba(0, 0, 0, 0.05) 25%,
            transparent 25%,
            transparent 75%,
            rgba(0, 0, 0, 0.05) 75%
          );
        background-size: 10px 10px, 20px 20px, 20px 20px;
        pointer-events: none;
        mix-blend-mode: overlay;
        opacity: 0.8;
      }

      &:hover {
        border-color: var(--theme-primary);
      }
    }

    &-select .el-color-picker {
      transform: scale(2);
    }
  }

  // Custom colors section
  &-custom {
    margin-top: 24px;
    background-color: var(--theme-surface-variant);
    padding: 20px;
    border-radius: $border-radius-md;

    &-add {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--theme-outline-variant);

      &-label {
        color: var(--theme-on-surface);
        font-size: 16px;
        font-weight: 600;
      }
    }

    &-colors {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      &-tag {
        color: white;
        padding: 8px 12px;
        min-width: 90px;
        min-height: 32px;
        text-align: center;
        border-radius: $border-radius-sm;
        font-weight: 500;
        box-shadow: $box-shadow;
        @include hover-lift;
      }
    }
  }

  // Generate button outside the form-custom
  .generate-action {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    margin-bottom: 32px;

    .el-button {
      padding: 12px 28px;
      font-size: 16px;
      font-weight: 600;
      @include hover-lift;
    }
  }

  // Theme generation section
  &-theme {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;

    &-result {
      width: 100%;
      max-height: 100%;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding-right: 12px;
      padding-bottom: 16px;
      position: relative;

      &::-webkit-scrollbar {
        width: 8px;

        &-track {
          background: var(--theme-surface-variant);
          border-radius: 4px;
        }

        &-thumb {
          background: var(--theme-outline);
          border-radius: 4px;

          &:hover {
            background: var(--theme-outline);
          }
        }
      }

      &-item {
        display: flex;
        flex-direction: column;
        gap: 8px;

        &-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--theme-on-surface);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        &-color {
          height: 40px;
          width: 100%;
          border-radius: $border-radius-sm;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--theme-outline-variant);
          box-shadow: var(--theme-box-shadow-light);
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;

          &::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            border: 2px solid var(--theme-primary);
            opacity: 0;
            transition: all 0.3s ease;
          }

          &:hover {
            transform: scale(1.05);

            &::after {
              opacity: 1;
              box-shadow: 0 0 0 4px var(--theme-primary-light);
            }
          }
        }
      }
    }
  }
}

// Theme toggle button
.theme-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;

  .el-button {
    box-shadow: var(--theme-box-shadow-light);
    transition: transform 0.3s ease;
    padding: 12px;

    &:hover {
      transform: rotate(15deg);
    }

    .el-icon {
      font-size: 1.5rem;
    }
  }
}
</style>
