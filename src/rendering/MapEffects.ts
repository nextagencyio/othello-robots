import * as THREE from 'three';
import type { BoardMap } from '../maps/BoardMap';
import { BOARD_SIZE, BOARD_OFFSET } from '../core/constants';

interface FloatingItem {
  mesh: THREE.Object3D;
  baseY: number;
  bobSpeed: number;
  bobAmount: number;
  rotSpeed: THREE.Vector3;
  phase: number;
}

/**
 * Per-map 3D decorations and particle effects around the game board.
 */
export class MapEffects {
  private group: THREE.Group;
  private floatingItems: FloatingItem[] = [];
  private pointCloud: THREE.Points | null = null;
  private pointVelocities: Float32Array | null = null;
  private pointBounds: { minY: number; maxY: number; radius: number } | null = null;

  constructor(private scene: THREE.Scene, map: BoardMap) {
    this.group = new THREE.Group();

    switch (map.id) {
      case 'classic': this.createClassicEffects(); break;
      case 'neon': this.createNeonEffects(); break;
      case 'space': this.createSpaceEffects(); break;
      case 'junkyard': this.createJunkyardEffects(); break;
    }

    scene.add(this.group);
  }

  private createClassicEffects(): void {
    // Corner posts (wooden pillars)
    const postGeo = new THREE.CylinderGeometry(0.12, 0.15, 1.2, 6);
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x5d4037,
      roughness: 0.9,
      metalness: 0.0,
    });
    const topGeo = new THREE.SphereGeometry(0.18, 6, 6);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x8d6e63,
      roughness: 0.7,
      metalness: 0.1,
    });

    const halfBoard = BOARD_SIZE / 2 + 0.3;
    const corners = [
      [-halfBoard, -halfBoard],
      [-halfBoard, halfBoard],
      [halfBoard, -halfBoard],
      [halfBoard, halfBoard],
    ];
    for (const [x, z] of corners) {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, 0.5, z);
      post.castShadow = true;
      this.group.add(post);

      const top = new THREE.Mesh(topGeo, topMat);
      top.position.set(x, 1.15, z);
      this.group.add(top);
    }

    // Warm dust particles floating upward
    this.createPointCloud(60, {
      color: 0xfff8e1,
      size: 0.04,
      opacity: 0.35,
      radius: 7,
      minY: -1,
      maxY: 5,
      velocityY: 0.15,
    });
  }

  private createNeonEffects(): void {
    // Glowing grid lines extending from board
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.15,
    });
    const lineGeo = new THREE.BoxGeometry(0.02, 0.02, 4);
    const halfBoard = BOARD_SIZE / 2;

    // Lines extending outward from board edges
    for (let i = 0; i < BOARD_SIZE + 1; i++) {
      const offset = i - BOARD_OFFSET - 0.5;

      // Front side
      const lineFront = new THREE.Mesh(lineGeo, lineMat);
      lineFront.position.set(offset, 0.06, halfBoard + 2.2);
      this.group.add(lineFront);

      // Back side
      const lineBack = new THREE.Mesh(lineGeo, lineMat);
      lineBack.position.set(offset, 0.06, -halfBoard - 2.2);
      this.group.add(lineBack);

      // Left side
      const lineGeoH = new THREE.BoxGeometry(4, 0.02, 0.02);
      const lineLeft = new THREE.Mesh(lineGeoH, lineMat);
      lineLeft.position.set(-halfBoard - 2.2, 0.06, offset);
      this.group.add(lineLeft);

      // Right side
      const lineRight = new THREE.Mesh(lineGeoH, lineMat);
      lineRight.position.set(halfBoard + 2.2, 0.06, offset);
      this.group.add(lineRight);
    }

    // Floating neon cubes
    const cubeMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.4,
    });
    const cubeMat2 = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.3,
    });
    const cubeGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);

    for (let i = 0; i < 12; i++) {
      const cube = new THREE.Mesh(cubeGeo, i % 2 === 0 ? cubeMat : cubeMat2);
      const angle = (i / 12) * Math.PI * 2;
      const dist = 5.5 + Math.random() * 2;
      cube.position.set(
        Math.cos(angle) * dist,
        1 + Math.random() * 3,
        Math.sin(angle) * dist
      );
      this.group.add(cube);
      this.floatingItems.push({
        mesh: cube,
        baseY: cube.position.y,
        bobSpeed: 0.8 + Math.random() * 1.5,
        bobAmount: 0.3 + Math.random() * 0.3,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Neon particles
    this.createPointCloud(80, {
      color: 0x00e5ff,
      size: 0.06,
      opacity: 0.5,
      radius: 8,
      minY: 0,
      maxY: 4,
      velocityY: 0.3,
    });
  }

  private createSpaceEffects(): void {
    // Star field
    this.createPointCloud(200, {
      color: 0xffffff,
      size: 0.05,
      opacity: 0.7,
      radius: 15,
      minY: -3,
      maxY: 10,
      velocityY: 0,
    });

    // Distant planet
    const planetGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x5c6bc0,
      emissive: 0x1a237e,
      emissiveIntensity: 0.3,
      roughness: 0.8,
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.position.set(-8, 6, -10);
    this.group.add(planet);

    // Planet ring
    const ringGeo = new THREE.TorusGeometry(2.2, 0.1, 8, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x9fa8da,
      emissive: 0x5c6bc0,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(planet.position);
    ring.rotation.x = Math.PI * 0.4;
    ring.rotation.z = 0.2;
    this.group.add(ring);
    this.floatingItems.push({
      mesh: ring,
      baseY: ring.position.y,
      bobSpeed: 0,
      bobAmount: 0,
      rotSpeed: new THREE.Vector3(0, 0.1, 0),
      phase: 0,
    });

    // Floating asteroids
    const asteroidGeo = new THREE.IcosahedronGeometry(0.2, 0);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: 0x616161,
      roughness: 1,
      metalness: 0.2,
    });
    for (let i = 0; i < 8; i++) {
      const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
      const angle = (i / 8) * Math.PI * 2;
      const dist = 6 + Math.random() * 3;
      asteroid.position.set(
        Math.cos(angle) * dist,
        1 + Math.random() * 4,
        Math.sin(angle) * dist
      );
      asteroid.scale.setScalar(0.5 + Math.random() * 1);
      this.group.add(asteroid);
      this.floatingItems.push({
        mesh: asteroid,
        baseY: asteroid.position.y,
        bobSpeed: 0.3 + Math.random() * 0.5,
        bobAmount: 0.15 + Math.random() * 0.2,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ),
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  private createJunkyardEffects(): void {
    // Floating gears
    const gearMat = new THREE.MeshStandardMaterial({
      color: 0x8d6e63,
      metalness: 0.8,
      roughness: 0.4,
    });

    for (let i = 0; i < 6; i++) {
      const gear = this.createGearMesh(0.3 + Math.random() * 0.3, gearMat);
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 5.5 + Math.random() * 2;
      gear.position.set(
        Math.cos(angle) * dist,
        0.5 + Math.random() * 3,
        Math.sin(angle) * dist
      );
      this.group.add(gear);
      this.floatingItems.push({
        mesh: gear,
        baseY: gear.position.y,
        bobSpeed: 0.4 + Math.random() * 0.6,
        bobAmount: 0.2 + Math.random() * 0.2,
        rotSpeed: new THREE.Vector3(0, 0, (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random())),
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Scrap pipes sticking out
    const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x795548,
      metalness: 0.7,
      roughness: 0.5,
    });
    const pipePositions = [
      { x: -5, z: -4, rotZ: 0.4 },
      { x: 5.5, z: 3, rotZ: -0.3 },
      { x: -4, z: 5, rotZ: 0.6 },
      { x: 4.5, z: -5.5, rotZ: -0.5 },
    ];
    for (const p of pipePositions) {
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.position.set(p.x, 0.5, p.z);
      pipe.rotation.z = p.rotZ;
      pipe.castShadow = true;
      this.group.add(pipe);
    }

    // Spark/ember particles
    this.createPointCloud(50, {
      color: 0xff6d00,
      size: 0.06,
      opacity: 0.6,
      radius: 6,
      minY: 0,
      maxY: 4,
      velocityY: 0.5,
    });
  }

  private createGearMesh(radius: number, material: THREE.Material): THREE.Mesh {
    // Simplified gear using a torus + teeth as a group
    const torusGeo = new THREE.TorusGeometry(radius, radius * 0.2, 6, 12);
    const gear = new THREE.Mesh(torusGeo, material);
    gear.castShadow = true;
    return gear;
  }

  private createPointCloud(
    count: number,
    opts: {
      color: number;
      size: number;
      opacity: number;
      radius: number;
      minY: number;
      maxY: number;
      velocityY: number;
    }
  ): void {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * opts.radius;
      positions[i * 3] = Math.cos(angle) * dist;
      positions[i * 3 + 1] = opts.minY + Math.random() * (opts.maxY - opts.minY);
      positions[i * 3 + 2] = Math.sin(angle) * dist;
      velocities[i] = (0.5 + Math.random() * 0.5) * opts.velocityY;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: opts.color,
      size: opts.size,
      transparent: true,
      opacity: opts.opacity,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.pointCloud = new THREE.Points(geo, mat);
    this.pointVelocities = velocities;
    this.pointBounds = { minY: opts.minY, maxY: opts.maxY, radius: opts.radius };
    this.group.add(this.pointCloud);
  }

  update(_elapsed: number, delta: number): void {
    // Animate floating items
    for (const item of this.floatingItems) {
      const t = _elapsed + item.phase;
      if (item.bobAmount > 0) {
        item.mesh.position.y = item.baseY + Math.sin(t * item.bobSpeed) * item.bobAmount;
      }
      item.mesh.rotation.x += item.rotSpeed.x * delta;
      item.mesh.rotation.y += item.rotSpeed.y * delta;
      item.mesh.rotation.z += item.rotSpeed.z * delta;
    }

    // Animate point cloud
    if (this.pointCloud && this.pointVelocities && this.pointBounds) {
      const positions = this.pointCloud.geometry.attributes.position as THREE.BufferAttribute;
      const arr = positions.array as Float32Array;
      const bounds = this.pointBounds;

      for (let i = 0; i < this.pointVelocities.length; i++) {
        const vy = this.pointVelocities[i];
        if (vy === 0) continue;

        arr[i * 3 + 1] += vy * delta;

        // Wrap around
        if (arr[i * 3 + 1] > bounds.maxY) {
          arr[i * 3 + 1] = bounds.minY;
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * bounds.radius;
          arr[i * 3] = Math.cos(angle) * dist;
          arr[i * 3 + 2] = Math.sin(angle) * dist;
        }
      }
      positions.needsUpdate = true;
    }
  }

  dispose(): void {
    this.scene.remove(this.group);
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      }
      if (obj instanceof THREE.Points) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      }
    });
  }
}
