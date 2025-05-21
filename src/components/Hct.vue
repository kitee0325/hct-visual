<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watchEffect } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Hct } from '@material/material-color-utilities';
import chromaLabelImg from '@/assets/chroma-label.svg';
import hueLabelImg from '@/assets/hue-label.svg';
import toneLabelImg from '@/assets/tone-label.svg';
import { useThemeManager } from '../composables/useThemeManager';

// 使用主题管理器共享的主题颜色状态
const { themeColorsRgba, isDarkMode } = useThemeManager();

const containerRef = ref<HTMLElement | null>(null);
const isAutoRotating = ref(true);

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let instancedMesh: THREE.InstancedMesh;
let sphereGeometry: THREE.SphereGeometry;
let material: THREE.MeshStandardMaterial;
let autoRotateTimeout: number | null = null;
let animationFrameId: number | null = null;
const INACTIVITY_TIMEOUT = 2000;
const initialCameraPosition = { x: 100, y: 50, z: 100 };

// 更新场景背景色的函数
const updateSceneBackground = () => {
  if (!scene) return;

  // 使用主题变量获取背景色
  const bgColor = isDarkMode.value
    ? getComputedStyle(document.documentElement)
        .getPropertyValue('--theme-background')
        .trim()
    : getComputedStyle(document.documentElement)
        .getPropertyValue('--theme-background')
        .trim();

  scene.background = new THREE.Color(bgColor || '#121212');

  // 同时确保容器背景色也被更新
  if (containerRef.value) {
    containerRef.value.style.backgroundColor = bgColor || '#121212';
  }

  // 调试信息
  console.log('HCT Scene background updated:', {
    isDarkMode: isDarkMode.value,
    bgColor,
    themeBackground: themeColorsRgba.value.background,
    propsBackground: themeColorsRgba.value.props?.background,
    time: new Date().toLocaleTimeString(), // 添加时间戳以便在控制台识别更新时间点
  });
};

const initThree = () => {
  if (!containerRef.value) return;

  // 检查CSS变量是否已正确应用
  const computedStyle = getComputedStyle(document.documentElement);
  const surfaceColor = computedStyle.getPropertyValue('--theme-surface').trim();

  console.log('Initial CSS variables check:', {
    '--theme-background': computedStyle
      .getPropertyValue('--theme-background')
      .trim(),
    '--theme-surface': computedStyle.getPropertyValue('--theme-surface').trim(),
    isDarkMode: isDarkMode.value,
    themeColorsRgba: themeColorsRgba.value,
  });

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(
    containerRef.value.clientWidth,
    containerRef.value.clientHeight
  );
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  containerRef.value.appendChild(renderer.domElement);

  // 创建场景
  scene = new THREE.Scene();
  updateSceneBackground();

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(
    initialCameraPosition.x,
    initialCameraPosition.y,
    initialCameraPosition.z
  );

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 50, 0);

  // 统一事件处理
  addEventListeners();

  // 添加光照
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  // 创建HCT色彩空间可视化
  createHctVisualization();

  // 开启动画循环
  animate();
};

// 添加事件监听器
const addEventListeners = () => {
  if (!containerRef.value) return;

  const events = [
    { name: 'mousemove', handler: handleUserInteraction },
    { name: 'touchmove', handler: handleUserInteraction },
    { name: 'mousedown', handler: handleUserInteraction },
    { name: 'touchstart', handler: handleUserInteraction },
  ];

  events.forEach((event) => {
    containerRef.value?.addEventListener(event.name, event.handler, {
      passive: true,
    });
  });
};

// 移除事件监听器
const removeEventListeners = () => {
  if (!containerRef.value) return;

  const events = [
    { name: 'mousemove', handler: handleUserInteraction },
    { name: 'touchmove', handler: handleUserInteraction },
    { name: 'mousedown', handler: handleUserInteraction },
    { name: 'touchstart', handler: handleUserInteraction },
  ];

  events.forEach((event) => {
    containerRef.value?.removeEventListener(event.name, event.handler);
  });
};

// 处理用户交互 - 简化后的防抖逻辑
const handleUserInteraction = () => {
  // 停止自转
  isAutoRotating.value = false;

  // 清除之前的定时器
  if (autoRotateTimeout !== null) {
    clearTimeout(autoRotateTimeout);
  }

  // 设置新的定时器，超时后恢复自转和重置相机
  autoRotateTimeout = window.setTimeout(() => {
    isAutoRotating.value = true;
    resetCameraPosition();
  }, INACTIVITY_TIMEOUT);
};

const resetCameraPosition = () => {
  if (!camera) return;

  // 记录当前位置
  const startPosition = camera.position.clone();
  const startTime = performance.now();
  const duration = 1000; // 1秒过渡时间

  const animateCamera = (currentTime: number) => {
    const elapsed = currentTime - startTime;

    if (elapsed < duration) {
      // 计算平滑插值因子
      const t = elapsed / duration;
      const smoothT = 1 - Math.pow(1 - t, 3); // 使用缓出立方函数

      // 平滑插值相机位置
      camera.position.x =
        startPosition.x + (initialCameraPosition.x - startPosition.x) * smoothT;
      camera.position.y =
        startPosition.y + (initialCameraPosition.y - startPosition.y) * smoothT;
      camera.position.z =
        startPosition.z + (initialCameraPosition.z - startPosition.z) * smoothT;

      // 继续动画
      requestAnimationFrame(animateCamera);
    } else {
      // 确保相机最终位置准确
      camera.position.set(
        initialCameraPosition.x,
        initialCameraPosition.y,
        initialCameraPosition.z
      );
    }

    // 更新相机朝向
    camera.lookAt(controls.target);
  };

  // 开始相机动画
  requestAnimationFrame(animateCamera);
};

const createHctVisualization = () => {
  // 采样参数
  const toneSamples = 36;
  const chromaLevels = 36;
  const basePointsPerCircle = 6;

  // 估算实例数
  const maxEstimatedInstances =
    toneSamples * chromaLevels * (chromaLevels * basePointsPerCircle);

  // 创建实例化网格几何体和材质
  sphereGeometry = new THREE.SphereGeometry(1, 6, 4);
  material = new THREE.MeshStandardMaterial({
    roughness: 0.7,
    metalness: 0.2,
  });

  instancedMesh = new THREE.InstancedMesh(
    sphereGeometry,
    material,
    maxEstimatedInstances
  );

  // 临时对象，避免重复创建
  const tempMatrix = new THREE.Matrix4();
  const tempColor = new THREE.Color();
  let instanceIndex = 0;

  // 对于每个亮度值，创建一个水平截面
  for (let toneIndex = 0; toneIndex < toneSamples; toneIndex++) {
    const tone = (toneIndex / (toneSamples - 1)) * 100;

    // 纯黑色和纯白色的特殊处理
    const isExtremeTone =
      Math.abs(tone) < 0.001 || Math.abs(tone - 100) < 0.001;

    if (isExtremeTone) {
      // 对于极端亮度值，只添加一个中心点
      const hctColor = Hct.from(0, 0, tone);
      const argb = hctColor.toInt();
      tempColor.setHex(argb & 0x00ffffff);

      tempMatrix.setPosition(0, tone, 0);
      instancedMesh.setMatrixAt(instanceIndex, tempMatrix);
      instancedMesh.setColorAt(instanceIndex, tempColor);
      instanceIndex++;
      continue;
    }

    // 计算此亮度下的HCT色彩空间最大包络
    const hueResolution = 36;
    const envelope = [];

    for (let hueIndex = 0; hueIndex < hueResolution; hueIndex++) {
      const hueDegrees = (hueIndex / hueResolution) * 360;
      const hctForMaxChroma = Hct.from(hueDegrees, 200, tone);
      envelope.push({
        hueDegrees,
        maxChroma: hctForMaxChroma.chroma,
      });
    }

    // 对每个彩度层次（同心圆）
    for (let chromaLevel = 0; chromaLevel < chromaLevels; chromaLevel++) {
      const normalizedRadius = chromaLevel / (chromaLevels - 1);
      const targetChroma = 150 * normalizedRadius;

      // 点的数量随半径增加
      const pointsOnCircle = basePointsPerCircle * (chromaLevel + 1);

      // 在当前圆周上均匀分布点
      for (let pointIndex = 0; pointIndex < pointsOnCircle; pointIndex++) {
        if (instanceIndex >= maxEstimatedInstances) break;

        const hueAngle = (pointIndex / pointsOnCircle) * 360;
        const hueRadians = THREE.MathUtils.degToRad(hueAngle);

        // 通过插值计算当前角度的最大彩度
        let maxChromaAtHue = 0;
        for (let i = 0; i < envelope.length; i++) {
          const currentHue = envelope[i].hueDegrees;
          const nextHue = envelope[(i + 1) % envelope.length].hueDegrees;

          if (
            (hueAngle >= currentHue && hueAngle < nextHue) ||
            (i === envelope.length - 1 &&
              (hueAngle >= currentHue || hueAngle < nextHue))
          ) {
            // 线性插值获取最大彩度
            const ratio =
              nextHue > currentHue
                ? (hueAngle - currentHue) / (nextHue - currentHue)
                : (hueAngle - currentHue) / (nextHue + 360 - currentHue);
            maxChromaAtHue =
              envelope[i].maxChroma * (1 - ratio) +
              envelope[(i + 1) % envelope.length].maxChroma * ratio;
            break;
          }
        }

        // 如果请求的彩度超过了最大彩度，跳过这个点
        if (targetChroma > maxChromaAtHue) {
          continue;
        }

        // 创建HCT颜色
        const hctColor = Hct.from(hueAngle, targetChroma, tone);
        const actualChroma = hctColor.chroma;

        // 如果HCT色彩空间中不存在这个点，则跳过
        if (Math.abs(actualChroma - targetChroma) > 5) {
          continue;
        }

        // 获取RGB颜色
        const argb = hctColor.toInt();
        tempColor.setHex(argb & 0x00ffffff);

        // 计算3D坐标
        const x = actualChroma * Math.cos(hueRadians);
        const y = tone;
        const z = actualChroma * Math.sin(hueRadians);

        // 直接设置实例矩阵和颜色
        tempMatrix.setPosition(x, y, z);
        instancedMesh.setMatrixAt(instanceIndex, tempMatrix);
        instancedMesh.setColorAt(instanceIndex, tempColor);
        instanceIndex++;
      }
    }
  }

  // 更新实例数量
  instancedMesh.count = instanceIndex;

  // 更新矩阵和颜色
  instancedMesh.instanceMatrix.needsUpdate = true;
  if (instancedMesh.instanceColor) {
    instancedMesh.instanceColor.needsUpdate = true;
  }

  scene.add(instancedMesh);
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);

  // 只有在自转状态下才旋转点云
  if (isAutoRotating.value && instancedMesh) {
    instancedMesh.rotateY(0.002);
  }

  controls.update();
  renderer.render(scene, camera);
};

const handleResize = () => {
  if (!containerRef.value) return;

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
};

onMounted(() => {
  // 初始化Three.js
  initThree();
  window.addEventListener('resize', handleResize, { passive: true });

  // 添加主题变化监听，确保在onMounted内部设置，以便scene已经初始化
  watchEffect(() => {
    if (scene && themeColorsRgba.value) {
      // 显式引用isDarkMode.value以确保正确收集依赖
      const currentMode = isDarkMode.value;
      console.log(
        '主题变化检测: 当前模式 =',
        currentMode ? '暗色' : '亮色',
        new Date().toLocaleTimeString()
      );
      updateSceneBackground();
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);

  // 清除防抖定时器
  if (autoRotateTimeout !== null) {
    clearTimeout(autoRotateTimeout);
  }

  // 取消动画帧
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }

  // 移除事件监听器
  removeEventListeners();

  // 释放Three.js资源
  if (instancedMesh) {
    scene.remove(instancedMesh);
    instancedMesh.dispose();
  }

  if (sphereGeometry) sphereGeometry.dispose();
  if (material) material.dispose();

  if (renderer && containerRef.value) {
    containerRef.value.removeChild(renderer.domElement);
    renderer.dispose();
  }

  if (controls) controls.dispose();
});
</script>

<template>
  <div class="hct" ref="containerRef">
    <transition name="fade">
      <div class="hct-labels" v-show="isAutoRotating">
        <img class="hct-labels-hue" :src="hueLabelImg" alt="hue" />
        <img class="hct-labels-chroma" :src="chromaLabelImg" alt="chroma" />
        <img class="hct-labels-tone" :src="toneLabelImg" alt="tone" />
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
// Variables - matching Form.vue patterns
$border-radius-sm: 8px;
$border-radius-md: 12px;
$border-radius-lg: 16px;
$box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
$transition-base: all 0.3s ease;
$border-color: #d9d9d9;

// 直接使用全局主题变量
.hct {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--theme-surface);
  border-radius: $border-radius-lg;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: $transition-base;
  color: var(--theme-on-surface);

  &-labels {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    user-select: none;

    // Add better contrast for label SVGs in dark mode
    html.dark & {
      filter: brightness(1.2) contrast(1.1);
    }

    &-hue {
      position: absolute;
      top: 50%;
      left: 15%;
      width: 150px;
      aspect-ratio: 22 / 19;
      transform: translate(-50%, -50%);
    }

    &-chroma {
      position: absolute;
      bottom: 10%;
      left: 50%;
      width: 400px;
      aspect-ratio: 63 / 13;
    }

    &-tone {
      position: absolute;
      bottom: 15%;
      right: 10%;
      width: 130px;
      aspect-ratio: 2 / 7;
    }
  }
}

/* 渐显渐隐动画样式 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
