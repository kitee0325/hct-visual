declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, EventDispatcher, Vector3 } from 'three';

  export class OrbitControls extends EventDispatcher {
    constructor(camera: Camera, domElement?: HTMLElement);
    enabled: boolean;
    target: Vector3;
    enableDamping: boolean;
    dampingFactor: number;
    update(): boolean;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/postprocessing/EffectComposer' {
  import { WebGLRenderer, WebGLRenderTarget, Texture } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass';

  export class EffectComposer {
    constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);
    renderTarget1: WebGLRenderTarget;
    renderTarget2: WebGLRenderTarget;
    writeBuffer: WebGLRenderTarget;
    readBuffer: WebGLRenderTarget;
    passes: Pass[];
    renderToScreen: boolean;
    addPass(pass: Pass): void;
    insertPass(pass: Pass, index: number): void;
    render(deltaTime?: number): void;
    setSize(width: number, height: number): void;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/postprocessing/Pass' {
  import { Material, WebGLRenderer, WebGLRenderTarget } from 'three';

  export class Pass {
    enabled: boolean;
    needsSwap: boolean;
    clear: boolean;
    renderToScreen: boolean;
    render(
      renderer: WebGLRenderer,
      writeBuffer: WebGLRenderTarget,
      readBuffer: WebGLRenderTarget,
      deltaTime: number,
      maskActive: boolean
    ): void;
  }
}

declare module 'three/examples/jsm/postprocessing/RenderPass' {
  import { Scene, Camera, Material } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass';

  export class RenderPass extends Pass {
    constructor(
      scene: Scene,
      camera: Camera,
      overrideMaterial?: Material,
      clearColor?: number,
      clearAlpha?: number
    );
    scene: Scene;
    camera: Camera;
  }
}

declare module 'three/examples/jsm/postprocessing/ShaderPass' {
  import { ShaderMaterial } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass';

  export class ShaderPass extends Pass {
    constructor(shader: ShaderMaterial, textureID?: string);
    textureID: string;
    uniforms: any;
    material: ShaderMaterial;
    fsQuad: any;
  }
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass' {
  import { Vector2, Camera, Material, WebGLRenderTarget } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass';

  export class UnrealBloomPass extends Pass {
    constructor(
      resolution: Vector2,
      strength?: number,
      radius?: number,
      threshold?: number
    );
    resolution: Vector2;
    strength: number;
    radius: number;
    threshold: number;
    clearColor: any;
    renderTargetsHorizontal: WebGLRenderTarget[];
    renderTargetsVertical: WebGLRenderTarget[];
    nMips: number;
    renderTargetBright: WebGLRenderTarget;
  }
}

declare module 'three/examples/jsm/postprocessing/OutputPass' {
  import { Pass } from 'three/examples/jsm/postprocessing/Pass';

  export class OutputPass extends Pass {
    constructor();
  }
}

declare module '@material/material-color-utilities/hct/hct' {
  export class Hct {
    static from(hue: number, chroma: number, tone: number): Hct;
    static fromInt(argb: number): Hct;
    toInt(): number;
    get hue(): number;
    set hue(newHue: number);
    get chroma(): number;
    set chroma(newChroma: number);
    get tone(): number;
    set tone(newTone: number);
  }
}
