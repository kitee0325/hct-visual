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
