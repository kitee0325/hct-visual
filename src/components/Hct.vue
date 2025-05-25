<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watchEffect,
  computed,
  watch,
} from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { Hct } from '@material/material-color-utilities';
import chromaLabelImg from '@/assets/chroma-label.svg';
import hueLabelImg from '@/assets/hue-label.svg';
import toneLabelImg from '@/assets/tone-label.svg';
import { useThemeColors } from '../composables/useThemeColors';

// 使用主题管理器共享的主题颜色状态
const { themeColors, themeColorsRgba, isDarkMode } = useThemeColors();

// 将主题颜色转换为HCT格式
interface ThemeColorHct {
  id: string;
  hue: number;
  chroma: number;
  tone: number;
}

interface SchemeProps {
  toJSON: () => Record<string, number>;
}

const themeColorsHct = computed<ThemeColorHct[]>(() => {
  const result: ThemeColorHct[] = [];
  const currentTheme = isDarkMode.value
    ? themeColors.value.dark
    : themeColors.value.light;

  if (!currentTheme) return [];

  Object.entries(currentTheme).forEach(([id, value]) => {
    // 跳过非颜色属性
    if (typeof value !== 'number') {
      return;
    }
    // ARGB转HCT
    const hctColor = Hct.fromInt(value);
    result.push({
      id,
      hue: hctColor.hue,
      chroma: hctColor.chroma,
      tone: hctColor.tone,
    });
  });
  return result;
});

const containerRef = ref<HTMLElement | null>(null);
const isAutoRotating = ref(true);

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let instancedMesh: THREE.InstancedMesh;
let sphereGeometry: THREE.SphereGeometry;
let material: THREE.MeshStandardMaterial;
let themeSphereGeometry: THREE.SphereGeometry;
let autoRotateTimeout: number | null = null;
let animationFrameId: number | null = null;
let themeColorSpheres: THREE.Mesh[] = [];
let hctContainer: THREE.Group;
let pointCloudContainer: THREE.Group;
let themeSpheresContainer: THREE.Group;
const INACTIVITY_TIMEOUT = 2000;
const initialCameraPosition = { x: 100, y: 50, z: 100 };

// Bloom常量
const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

// Bloom参数，随主题切换
const bloomParams = computed(() => {
  if (isDarkMode.value) {
    return {
      toneMapping: THREE.ACESFilmicToneMapping,
      toneMappingExposure: 1.0,
      threshold: 0.05,
      strength: 1.0,
      radius: 0.4,
      ambientIntensity: 1.2,
      directionalIntensity: 1.5,
    };
  } else {
    return {
      toneMapping: THREE.NoToneMapping,
      toneMappingExposure: 1.0,
      threshold: 0.15,
      strength: 0.4,
      radius: 0.4,
      ambientIntensity: 1.2,
      directionalIntensity: 1.5,
    };
  }
});

const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
const materials: Record<string, THREE.Material> = {};

// 后处理相关
let bloomComposer: EffectComposer;
let finalComposer: EffectComposer;

// Bloom合成shader
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragmentShader = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
uniform float bloomStrength;
varying vec2 vUv;
void main() {
  vec4 base = texture2D(baseTexture, vUv);
  vec4 bloom = texture2D(bloomTexture, vUv);
  gl_FragColor = vec4(mix(base.rgb, bloom.rgb, bloomStrength), base.a);
}
`;

// 更新场景背景色
const updateSceneBackground = () => {
  const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--theme-background')
    .trim();
  if (containerRef.value) {
    containerRef.value.style.backgroundColor = bgColor || '#121212';
  }
};

const initThree = () => {
  if (!containerRef.value) return;
  themeSphereGeometry = new THREE.SphereGeometry(1, 6, 4);
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(
    containerRef.value.clientWidth,
    containerRef.value.clientHeight
  );
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = bloomParams.value.toneMapping;
  renderer.toneMappingExposure = bloomParams.value.toneMappingExposure;
  containerRef.value.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  scene.layers.set(0);
  updateSceneBackground();
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
  camera.layers.enableAll();
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 50, 0);
  addEventListeners();
  const ambientLight = new THREE.AmbientLight(
    0xffffff,
    bloomParams.value.ambientIntensity
  );
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    bloomParams.value.directionalIntensity
  );
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);
  setupPostProcessing();
  createHctVisualization();
  animate();
  watchEffect(() => {
    if (!renderer || !scene || !bloomComposer) {
      return;
    }
    const currentParams = bloomParams.value;
    renderer.toneMapping = currentParams.toneMapping;
    renderer.toneMappingExposure = currentParams.toneMappingExposure;
    scene.children.forEach((child) => {
      if (child instanceof THREE.AmbientLight) {
        child.intensity = currentParams.ambientIntensity;
      } else if (child instanceof THREE.DirectionalLight) {
        child.intensity = currentParams.directionalIntensity;
      }
    });
    const bloomPassInstance = bloomComposer.passes[1] as UnrealBloomPass;
    if (bloomPassInstance && bloomPassInstance instanceof UnrealBloomPass) {
      bloomPassInstance.threshold = currentParams.threshold;
      bloomPassInstance.strength = currentParams.strength;
      bloomPassInstance.radius = currentParams.radius;
    }
    updateSceneBackground();
  });
};

// 后处理效果
const setupPostProcessing = () => {
  if (!containerRef.value) return;
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    bloomParams.value.strength,
    bloomParams.value.radius,
    bloomParams.value.threshold
  );
  bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);
  const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
        bloomStrength: { value: 0.7 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      defines: {},
    }),
    'baseTexture'
  );
  mixPass.needsSwap = true;
  const outputPass = new OutputPass();
  finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderScene);
  finalComposer.addPass(mixPass);
  finalComposer.addPass(outputPass);
};

// 事件监听
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

// 用户交互防抖
const handleUserInteraction = () => {
  isAutoRotating.value = false;
  if (autoRotateTimeout !== null) {
    clearTimeout(autoRotateTimeout);
  }
  autoRotateTimeout = window.setTimeout(() => {
    isAutoRotating.value = true;
    resetCameraPosition();
  }, INACTIVITY_TIMEOUT);
};

const resetCameraPosition = () => {
  if (!camera) return;
  const startPosition = camera.position.clone();
  const startTime = performance.now();
  const duration = 1000;
  const animateCamera = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    if (elapsed < duration) {
      const t = elapsed / duration;
      const smoothT = 1 - Math.pow(1 - t, 3);
      camera.position.x =
        startPosition.x + (initialCameraPosition.x - startPosition.x) * smoothT;
      camera.position.y =
        startPosition.y + (initialCameraPosition.y - startPosition.y) * smoothT;
      camera.position.z =
        startPosition.z + (initialCameraPosition.z - startPosition.z) * smoothT;
      requestAnimationFrame(animateCamera);
    } else {
      camera.position.set(
        initialCameraPosition.x,
        initialCameraPosition.y,
        initialCameraPosition.z
      );
    }
    camera.lookAt(controls.target);
  };
  requestAnimationFrame(animateCamera);
};

const createHctVisualization = () => {
  hctContainer = new THREE.Group();
  scene.add(hctContainer);
  pointCloudContainer = new THREE.Group();
  themeSpheresContainer = new THREE.Group();
  hctContainer.add(pointCloudContainer);
  hctContainer.add(themeSpheresContainer);
  const toneSamples = 36;
  const chromaLevels = 36;
  const basePointsPerCircle = 6;
  const maxEstimatedInstances =
    toneSamples * chromaLevels * (chromaLevels * basePointsPerCircle);
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
  instancedMesh.layers.set(0);
  const tempMatrix = new THREE.Matrix4();
  const tempColor = new THREE.Color();
  let instanceIndex = 0;
  for (let toneIndex = 0; toneIndex < toneSamples; toneIndex++) {
    const tone = (toneIndex / (toneSamples - 1)) * 100;
    const isExtremeTone =
      Math.abs(tone) < 0.001 || Math.abs(tone - 100) < 0.001;
    if (isExtremeTone) {
      const hctColor = Hct.from(0, 0, tone);
      const argb = hctColor.toInt();
      tempColor.setHex(argb & 0x00ffffff);
      tempMatrix.setPosition(0, tone, 0);
      instancedMesh.setMatrixAt(instanceIndex, tempMatrix);
      instancedMesh.setColorAt(instanceIndex, tempColor);
      instanceIndex++;
      continue;
    }
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
    for (let chromaLevel = 0; chromaLevel < chromaLevels; chromaLevel++) {
      const normalizedRadius = chromaLevel / (chromaLevels - 1);
      const targetChroma = 150 * normalizedRadius;
      const pointsOnCircle = basePointsPerCircle * (chromaLevel + 1);
      for (let pointIndex = 0; pointIndex < pointsOnCircle; pointIndex++) {
        if (instanceIndex >= maxEstimatedInstances) break;
        const hueAngle = (pointIndex / pointsOnCircle) * 360;
        const hueRadians = THREE.MathUtils.degToRad(hueAngle);
        let maxChromaAtHue = 0;
        for (let i = 0; i < envelope.length; i++) {
          const currentHue = envelope[i].hueDegrees;
          const nextHue = envelope[(i + 1) % envelope.length].hueDegrees;
          if (
            (hueAngle >= currentHue && hueAngle < nextHue) ||
            (i === envelope.length - 1 &&
              (hueAngle >= currentHue || hueAngle < nextHue))
          ) {
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
        if (targetChroma > maxChromaAtHue) {
          continue;
        }
        const hctColor = Hct.from(hueAngle, targetChroma, tone);
        const actualChroma = hctColor.chroma;
        if (Math.abs(actualChroma - targetChroma) > 5) {
          continue;
        }
        const argb = hctColor.toInt();
        tempColor.setHex(argb & 0x00ffffff);
        const x = actualChroma * Math.cos(hueRadians);
        const y = tone;
        const z = actualChroma * Math.sin(hueRadians);
        tempMatrix.setPosition(x, y, z);
        instancedMesh.setMatrixAt(instanceIndex, tempMatrix);
        instancedMesh.setColorAt(instanceIndex, tempColor);
        instanceIndex++;
      }
    }
  }
  instancedMesh.count = instanceIndex;
  instancedMesh.instanceMatrix.needsUpdate = true;
  if (instancedMesh.instanceColor) {
    instancedMesh.instanceColor.needsUpdate = true;
  }
  pointCloudContainer.add(instancedMesh);
  updateThemeColorSpheres();
};

// 主题色小球原始材质缓存
const themeSphereOriginalMaterials: THREE.Material[] = [];

// 主题色小球更新
const updateThemeColorSpheres = () => {
  if (!scene) return;
  const colors = themeColorsHct.value;
  while (themeColorSpheres.length < colors.length) {
    const material = new THREE.MeshStandardMaterial();
    const sphere = new THREE.Mesh(themeSphereGeometry, material);
    sphere.layers.set(BLOOM_SCENE);
    themeSpheresContainer.add(sphere);
    themeColorSpheres.push(sphere);
    themeSphereOriginalMaterials.push(material);
  }
  while (themeColorSpheres.length > colors.length) {
    const sphere = themeColorSpheres.pop();
    if (sphere) {
      themeSpheresContainer.remove(sphere);
      sphere.geometry.dispose();
      (sphere.material as THREE.Material).dispose();
      themeSphereOriginalMaterials.pop();
    }
  }
  colors.forEach((color, i) => {
    const finalHue = color.hue;
    const finalChroma = color.chroma;
    const finalTone = color.tone;
    const hueRadians = THREE.MathUtils.degToRad(finalHue);
    const x = finalChroma * Math.cos(hueRadians);
    const y = finalTone;
    const z = finalChroma * Math.sin(hueRadians);
    const colorInt = Hct.from(finalHue, finalChroma, finalTone).toInt();
    const mesh = themeColorSpheres[i];
    mesh.position.set(x, y, z);
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const rgb = colorInt & 0x00ffffff;
    mat.color.setHex(rgb);
    mat.emissive.setHex(rgb);
    mat.roughness = 0.7;
    mat.metalness = 0.2;
    mat.emissiveIntensity = 0.0; // 主 pass 不发光
    mat.needsUpdate = true;
  });
  pointCloudContainer.position.set(0, 0, 0);
  themeSpheresContainer.position.set(0, 0, 0);
  themeSpheresContainer.renderOrder = 1;
  pointCloudContainer.renderOrder = 0;
  pointCloudContainer.layers.set(0);
  themeSpheresContainer.layers.set(BLOOM_SCENE);
};

// --- Bloom pass 前后切换主题色小球材质 ---
function setThemeSpheresBloomMaterial() {
  const colors = themeColorsHct.value;
  themeColorSpheres.forEach((mesh, i) => {
    const color = colors[i];
    if (!color) return;
    const finalHue = color.hue;
    const finalChroma = color.chroma;
    const finalTone = color.tone;
    const colorInt = Hct.from(finalHue, finalChroma, finalTone).toInt();
    const rgb = colorInt & 0x00ffffff;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.color.setHex(rgb);
    mat.emissive.setHex(rgb);
    mat.emissiveIntensity = 2.0;
    mat.needsUpdate = true;
  });
}
function restoreThemeSpheresMaterial() {
  const colors = themeColorsHct.value;
  themeColorSpheres.forEach((mesh, i) => {
    const color = colors[i];
    if (!color) return;
    const finalHue = color.hue;
    const finalChroma = color.chroma;
    const finalTone = color.tone;
    const colorInt = Hct.from(finalHue, finalChroma, finalTone).toInt();
    const rgb = colorInt & 0x00ffffff;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.color.setHex(rgb);
    mat.emissive.setHex(rgb);
    mat.emissiveIntensity = 0.0;
    mat.needsUpdate = true;
  });
}

// 非Bloom层物体变暗
const darkenNonBloomed = (obj: THREE.Object3D) => {
  if (obj.type !== 'Mesh' && !(obj instanceof THREE.Mesh)) return;
  const mesh = obj as THREE.Mesh;
  if (bloomLayer.test(mesh.layers)) return;
  if (mesh.material) {
    materials[mesh.uuid] = Array.isArray(mesh.material)
      ? mesh.material[0]
      : mesh.material;
    mesh.material = darkMaterial;
  }
};

// 恢复原材质
const restoreMaterial = (obj: THREE.Object3D) => {
  if (materials[obj.uuid]) {
    const mesh = obj as THREE.Mesh;
    if (mesh.material) {
      mesh.material = materials[obj.uuid];
      delete materials[obj.uuid];
    }
  }
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  if (isAutoRotating.value && hctContainer) {
    hctContainer.rotateY(0.002);
  }
  controls.update();
  if (bloomComposer && finalComposer) {
    camera.layers.set(BLOOM_SCENE);
    setThemeSpheresBloomMaterial(); // bloom pass 前切换材质
    scene.traverse(darkenNonBloomed);
    bloomComposer.render();
    scene.traverse(restoreMaterial);
    restoreThemeSpheresMaterial(); // bloom pass 后恢复材质
    camera.layers.set(0);
    finalComposer.render();
  } else {
    renderer.render(scene, camera);
  }
};

const handleResize = () => {
  if (!containerRef.value) return;
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  if (bloomComposer && finalComposer) {
    bloomComposer.setSize(width, height);
    finalComposer.setSize(width, height);
  }
};

onMounted(() => {
  initThree();
  window.addEventListener('resize', handleResize, { passive: true });
  watch(
    () => themeColors.value,
    (newThemeColors) => {
      if (scene && newThemeColors) {
        updateThemeColorSpheres();
      }
    },
    { deep: true, immediate: true }
  );
  watchEffect(() => {
    if (scene && themeColorsRgba.value) {
      const currentMode = isDarkMode.value;
      updateSceneBackground();
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (autoRotateTimeout !== null) {
    clearTimeout(autoRotateTimeout);
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  removeEventListeners();
  themeColorSpheres.forEach((sphere) => {
    themeSpheresContainer.remove(sphere);
    sphere.geometry.dispose();
    (sphere.material as THREE.Material).dispose();
  });
  themeColorSpheres = [];
  if (instancedMesh) {
    pointCloudContainer.remove(instancedMesh);
    instancedMesh.dispose();
  }
  if (pointCloudContainer) {
    hctContainer.remove(pointCloudContainer);
  }
  if (themeSpheresContainer) {
    hctContainer.remove(themeSpheresContainer);
  }
  if (hctContainer) {
    scene.remove(hctContainer);
  }
  if (sphereGeometry) sphereGeometry.dispose();
  if (themeSphereGeometry) themeSphereGeometry.dispose();
  if (material) material.dispose();
  if (bloomComposer) bloomComposer.dispose();
  if (finalComposer) finalComposer.dispose();
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
$transition-base: all 0.3s ease;

// 直接使用全局主题变量
.hct {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--theme-background);
  border-radius: $border-radius-lg;
  box-shadow: var(--theme-box-shadow-light);
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
