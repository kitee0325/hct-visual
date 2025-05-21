<script setup lang="ts">
import { Plus, Delete } from '@element-plus/icons-vue';
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadFile } from 'element-plus';
import { type CustomColor } from '@material/material-color-utilities';
import {
  themeFromSourceColor,
  themeFromImage,
  parseColorToArgb,
} from '../tools/color';
import { useThemeColors } from '../composables/useThemeColors';

// 使用共享的主题颜色组合式API
const { themeColorsRgba, isDarkMode, updateThemeColors, toggleDarkMode } =
  useThemeColors();

const imageUrl = ref<string>('');
const colorSelected = ref('rgba(30, 144, 255, 1)');
const predefineColors = ref(['rgba(30, 144, 255, 1)']);
const latestAction = ref<'image' | 'color'>('color');

// 自定义颜色相关
const customColors = ref<string[]>([]);
const currentCustomColor = ref('#409EFF');

// Using the getColorFromArgb function from tools/color.ts

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

// Using the parseColorToArgb function from tools/color.ts

function generateTheme() {
  let theme;
  if (latestAction.value === 'image') {
    if (!imageUrl.value) {
      ElMessage.error('Upload image first');
      return;
    }
    // 创建图像元素并加载
    const img = new Image();
    img.src = imageUrl.value;
    img.onload = async () => {
      theme = await themeFromImage(img);
      updateThemeColors(theme.schemes);
    };
  } else {
    // 将原始ARGB值转换为CustomColor对象
    const customColorObjects = customColorsArgb.value.map((argb, index) => {
      return {
        value: argb,
        name: `Custom Color ${index + 1}`,
        blend: true,
      } as CustomColor;
    });

    theme = themeFromSourceColor(
      parseColorToArgb(colorSelected.value),
      customColorObjects
    );
    updateThemeColors(theme.schemes);
  }
}

// 组件初始化时生成默认主题
onMounted(() => {
  generateTheme();
});

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
</script>

<template>
  <div class="form">
    <h2>Provide Primary Color</h2>
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
    <h2>Generate Theme</h2>
    <div class="form-theme">
      <div class="form-theme-action">
        <el-button type="primary" @click="generateTheme">Generate</el-button>
        <div class="form-theme-action-mode">
          <span>Light</span>
          <el-switch v-model="isDarkMode" @change="toggleDarkMode" />
          <span>Dark</span>
        </div>
      </div>
      <div class="form-theme-result">
        <div
          class="form-theme-result-item"
          v-for="(color, key) in themeColorsRgba.props"
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
$primary-color: var(--el-color-primary, #409eff);
$border-radius-sm: 8px;
$border-radius-md: 12px;
$border-radius-lg: 16px;
$box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
$transition-base: all 0.3s ease;
$border-color: #d9d9d9;

// Mixins
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
        var(--el-fill-color) 25%,
        transparent 25%
      ),
      linear-gradient(-45deg, var(--el-fill-color) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--el-fill-color) 75%),
      linear-gradient(-45deg, transparent 75%, var(--el-fill-color) 75%);
    background-size: 10px 10px;
    background-position: 0 0, 0 5px, 5px -5px, -5px 0;
    z-index: -1;
  }
}

// Base styles
.form {
  height: 100%;
  padding: 24px 28px 24px 24px;
  background-color: var(--el-bg-color-overlay);
  border-radius: $border-radius-lg;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  h2 {
    color: var(--el-text-color-primary);
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
      background-color: $primary-color;
      border-radius: 3px;
    }

    &:not(:first-of-type) {
      margin-top: 32px;
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
      color: var(--el-text-color-primary);
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
        background: var(--el-border-color-light);
        transform: translateX(-50%);
      }

      span {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: var(--el-bg-color-overlay);
        border: 1px solid var(--el-border-color-light);
        border-radius: 50%;
        position: relative;
        z-index: 1;
        font-weight: 600;
        color: var(--el-text-color-secondary);
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
      border: 2px dashed var(--el-border-color);
      border-radius: $border-radius-md;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: $transition-base;
      background-color: var(--el-fill-color-light);

      &:hover {
        border-color: $primary-color;
        box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
        transform: translateY(-2px);
      }

      &-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &-upload {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--el-text-color-secondary);

        &-icon {
          font-size: 48px;
          color: $primary-color;
        }
      }

      &-act {
        position: absolute;
        right: 8px;
        top: 8px;
        background-color: var(--el-bg-color-overlay);
        border-radius: 50%;
        padding: 4px;
        backdrop-filter: blur(4px);
      }
    }

    // Color picker
    &-select-wrapper {
      padding: 10px;
      border: 2px dashed var(--el-border-color);
      border-radius: $border-radius-md;
      cursor: pointer;
      background-color: var(--el-fill-color-light);
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
        border-color: $primary-color;
        box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
        transform: translateY(-2px);
      }
    }

    &-select .el-color-picker {
      transform: scale(2);
    }
  }

  // Custom colors section
  &-custom {
    margin-top: 24px;
    background-color: var(--el-fill-color-light);
    padding: 20px;
    border-radius: $border-radius-md;

    &-add {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-light);

      &-label {
        color: var(--el-text-color-regular);
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

  // Theme generation section
  &-theme {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 20px;

      &-mode {
        display: flex;
        align-items: center;
        gap: 8px;

        span {
          font-size: 14px;
          color: var(--el-text-color-regular);
        }
      }
    }

    &-result {
      width: 100%;
      max-height: 100%;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding-right: 12px;
      padding-bottom: 16px;

      &::-webkit-scrollbar {
        width: 8px;

        &-track {
          background: var(--el-fill-color-light);
          border-radius: 4px;
        }

        &-thumb {
          background: var(--el-border-color);
          border-radius: 4px;

          &:hover {
            background: var(
              --el-border-color-darker,
              var(--el-border-color-dark)
            );
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
          color: var(--el-text-color-primary);
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
          border: 1px solid var(--el-border-color-light);
          box-shadow: var(--el-box-shadow-light);
          position: relative;
          cursor: pointer;
          @include hover-lift;
          @include checkerboard-bg;
        }
      }
    }
  }
}
</style>
