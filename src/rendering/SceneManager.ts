import * as THREE from 'three';
import type { BoardMap } from '../maps/BoardMap';

export class SceneManager {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private mapExtras: THREE.Object3D[] = [];

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
    // Clean up previous map extras
    for (const obj of this.mapExtras) {
      this.scene.remove(obj);
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) child.material.dispose();
        }
      });
    }
    this.mapExtras = [];
    this.scene.fog = null;

    this.scene.background = new THREE.Color(map.backgroundColor);
    this.dirLight.color.set(map.lightColor);
    this.dirLight.intensity = map.lightIntensity;
    this.ambientLight.color.set(map.ambientColor);
    this.ambientLight.intensity = map.ambientIntensity;

    // Per-map atmosphere
    switch (map.id) {
      case 'classic': this.applyClassicAtmosphere(map); break;
      case 'neon': this.applyNeonAtmosphere(map); break;
      case 'space': this.applySpaceAtmosphere(map); break;
      case 'junkyard': this.applyJunkyardAtmosphere(map); break;
    }
  }

  private applyClassicAtmosphere(_map: BoardMap): void {
    // Warm fog for cozy feel
    this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.035);

    // Ground plane - dark wood floor
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2a1f14,
      roughness: 0.9,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.mapExtras.push(ground);

    // Warm point lights like lanterns
    const warmLight1 = new THREE.PointLight(0xffaa44, 0.6, 12);
    warmLight1.position.set(-5, 3, -5);
    this.scene.add(warmLight1);
    this.mapExtras.push(warmLight1);

    const warmLight2 = new THREE.PointLight(0xffaa44, 0.6, 12);
    warmLight2.position.set(5, 3, 5);
    this.scene.add(warmLight2);
    this.mapExtras.push(warmLight2);
  }

  private applyNeonAtmosphere(_map: BoardMap): void {
    // Dark fog
    this.scene.fog = new THREE.FogExp2(0x050510, 0.04);

    // Reflective dark floor
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x080818,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.mapExtras.push(ground);

    // Neon accent lights
    const cyanLight = new THREE.PointLight(0x00e5ff, 1.0, 15);
    cyanLight.position.set(-4, 2, -4);
    this.scene.add(cyanLight);
    this.mapExtras.push(cyanLight);

    const magentaLight = new THREE.PointLight(0xff00ff, 0.6, 12);
    magentaLight.position.set(4, 2, 4);
    this.scene.add(magentaLight);
    this.mapExtras.push(magentaLight);
  }

  private applySpaceAtmosphere(_map: BoardMap): void {
    // Very subtle fog for depth
    this.scene.fog = new THREE.FogExp2(0x000022, 0.012);

    // Faint blue/purple rim light from "nebula"
    const nebulaLight = new THREE.PointLight(0x6a3de8, 0.5, 20);
    nebulaLight.position.set(-8, 5, -6);
    this.scene.add(nebulaLight);
    this.mapExtras.push(nebulaLight);

    const starLight = new THREE.PointLight(0xc5cae9, 0.4, 20);
    starLight.position.set(6, 4, 8);
    this.scene.add(starLight);
    this.mapExtras.push(starLight);
  }

  private applyJunkyardAtmosphere(_map: BoardMap): void {
    // Smoky amber fog
    this.scene.fog = new THREE.FogExp2(0x1a1008, 0.04);

    // Rusty metal ground
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a1008,
      roughness: 0.95,
      metalness: 0.3,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.mapExtras.push(ground);

    // Warm ember glow from below
    const emberLight = new THREE.PointLight(0xff6600, 0.5, 10);
    emberLight.position.set(0, -0.5, 0);
    this.scene.add(emberLight);
    this.mapExtras.push(emberLight);

    // Yellowish work light
    const workLight = new THREE.PointLight(0xffcc44, 0.7, 14);
    workLight.position.set(-3, 4, 3);
    this.scene.add(workLight);
    this.mapExtras.push(workLight);
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
