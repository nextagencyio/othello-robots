import * as THREE from 'three';
import type { BoardMap } from '../maps/BoardMap';

export class SceneManager {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Orthographic camera for isometric view
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 11;
    this.camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      100
    );

    // Isometric positioning
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);

    // Directional light
    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.dirLight.position.set(5, 12, 8);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 50;
    this.dirLight.shadow.camera.left = -8;
    this.dirLight.shadow.camera.right = 8;
    this.dirLight.shadow.camera.top = 8;
    this.dirLight.shadow.camera.bottom = -8;
    this.scene.add(this.dirLight);

    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(this.ambientLight);

    // Handle resize
    window.addEventListener('resize', () => this.resize());
  }

  applyMap(map: BoardMap): void {
    this.scene.background = new THREE.Color(map.backgroundColor);
    this.dirLight.color.set(map.lightColor);
    this.dirLight.intensity = map.lightIntensity;
    this.ambientLight.color.set(map.ambientColor);
    this.ambientLight.intensity = map.ambientIntensity;
  }

  resize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 11;
    this.camera.left = (frustumSize * aspect) / -2;
    this.camera.right = (frustumSize * aspect) / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = frustumSize / -2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.renderer.dispose();
  }
}
