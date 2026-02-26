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

interface PointCloudData {
  points: THREE.Points;
  velocities: Float32Array;
  bounds: { minY: number; maxY: number; radius: number };
}

/**
 * Per-map 3D decorations and particle effects around the game board.
 */
export class MapEffects {
  private group: THREE.Group;
  private floatingItems: FloatingItem[] = [];
  private pointClouds: PointCloudData[] = [];
  private animatedMaterials: { mat: THREE.Material; type: string }[] = [];

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

  // ==================== CLASSIC ====================
  private createClassicEffects(): void {
    const halfBoard = BOARD_SIZE / 2 + 0.3;

    // Corner posts with ornate bases
    const postGeo = new THREE.CylinderGeometry(0.1, 0.14, 1.4, 8);
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x5d4037, roughness: 0.85, metalness: 0.0,
    });
    const baseGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.15, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x4e342e, roughness: 0.9, metalness: 0.0,
    });
    const topGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0xffcc80, roughness: 0.5, metalness: 0.3,
      emissive: 0xffaa44, emissiveIntensity: 0.3,
    });

    const corners = [
      [-halfBoard, -halfBoard],
      [-halfBoard, halfBoard],
      [halfBoard, -halfBoard],
      [halfBoard, halfBoard],
    ];
    for (const [x, z] of corners) {
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.set(x, -0.05, z);
      base.castShadow = true;
      this.group.add(base);

      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, 0.6, z);
      post.castShadow = true;
      this.group.add(post);

      // Glowing orb on top (like a lantern)
      const orb = new THREE.Mesh(topGeo, topMat);
      orb.position.set(x, 1.35, z);
      this.group.add(orb);
      this.floatingItems.push({
        mesh: orb, baseY: 1.35, bobSpeed: 1.5, bobAmount: 0.05,
        rotSpeed: new THREE.Vector3(0, 0, 0), phase: Math.random() * Math.PI * 2,
      });
    }

    // Decorative books/items near corners of board
    const bookGeo = new THREE.BoxGeometry(0.3, 0.15, 0.2);
    const bookColors = [0x8b0000, 0x1b5e20, 0x0d47a1, 0x4a148c];
    const bookPositions = [
      { x: -halfBoard - 0.8, z: -halfBoard + 1, rotY: 0.3 },
      { x: halfBoard + 0.6, z: halfBoard - 0.5, rotY: -0.5 },
      { x: -halfBoard + 0.5, z: halfBoard + 0.8, rotY: 0.8 },
    ];
    for (let i = 0; i < bookPositions.length; i++) {
      const bp = bookPositions[i];
      const bookMat = new THREE.MeshStandardMaterial({
        color: bookColors[i], roughness: 0.8, metalness: 0.0,
      });
      const book = new THREE.Mesh(bookGeo, bookMat);
      book.position.set(bp.x, 0.0, bp.z);
      book.rotation.y = bp.rotY;
      book.castShadow = true;
      this.group.add(book);
    }

    // Small trophy/cup
    const cupBaseGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.1, 8);
    const cupBodyGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.25, 8);
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, roughness: 0.3, metalness: 0.8,
    });
    const cupBase = new THREE.Mesh(cupBaseGeo, cupMat);
    cupBase.position.set(halfBoard + 0.9, 0.0, -halfBoard + 0.3);
    this.group.add(cupBase);
    const cupBody = new THREE.Mesh(cupBodyGeo, cupMat);
    cupBody.position.set(halfBoard + 0.9, 0.2, -halfBoard + 0.3);
    this.group.add(cupBody);

    // Warm dust particles
    this.addPointCloud(80, {
      color: 0xfff8e1, size: 0.04, opacity: 0.3,
      radius: 8, minY: -0.5, maxY: 5, velocityY: 0.12,
    });

    // Faint golden firefly particles
    this.addPointCloud(30, {
      color: 0xffcc00, size: 0.07, opacity: 0.5,
      radius: 6, minY: 0.5, maxY: 3, velocityY: 0.05,
    });
  }

  // ==================== NEON ====================
  private createNeonEffects(): void {
    const halfBoard = BOARD_SIZE / 2;

    // Grid lines extending from board edges
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff, transparent: true, opacity: 0.15,
    });
    const lineGeo = new THREE.BoxGeometry(0.02, 0.02, 5);

    for (let i = 0; i < BOARD_SIZE + 1; i++) {
      const offset = i - BOARD_OFFSET - 0.5;
      // Front + Back
      for (const zSign of [1, -1]) {
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(offset, 0.06, zSign * (halfBoard + 2.7));
        this.group.add(line);
      }
      // Left + Right
      const lineGeoH = new THREE.BoxGeometry(5, 0.02, 0.02);
      for (const xSign of [1, -1]) {
        const line = new THREE.Mesh(lineGeoH, lineMat);
        line.position.set(xSign * (halfBoard + 2.7), 0.06, offset);
        this.group.add(line);
      }
    }

    // Glowing corner pylons
    const pylonGeo = new THREE.BoxGeometry(0.15, 2.5, 0.15);
    const pylonMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff, transparent: true, opacity: 0.2,
    });
    const pylonTopGeo = new THREE.BoxGeometry(0.3, 0.05, 0.3);
    const pylonTopMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff, transparent: true, opacity: 0.6,
    });
    const pylonCorners = [
      [-halfBoard - 0.5, -halfBoard - 0.5],
      [-halfBoard - 0.5, halfBoard + 0.5],
      [halfBoard + 0.5, -halfBoard - 0.5],
      [halfBoard + 0.5, halfBoard + 0.5],
    ];
    for (const [x, z] of pylonCorners) {
      const pylon = new THREE.Mesh(pylonGeo, pylonMat);
      pylon.position.set(x, 1.25, z);
      this.group.add(pylon);
      const top = new THREE.Mesh(pylonTopGeo, pylonTopMat);
      top.position.set(x, 2.55, z);
      this.group.add(top);
    }

    // Horizontal neon rings around the board (at different heights)
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00e5ff, transparent: true, opacity: 0.12,
    });
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xff00ff, transparent: true, opacity: 0.08,
    });
    this.animatedMaterials.push({ mat: ringMat1, type: 'neon-pulse-cyan' });
    this.animatedMaterials.push({ mat: ringMat2, type: 'neon-pulse-magenta' });

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(halfBoard + 1.2, 0.02, 4, 64), ringMat1
    );
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 0.3;
    this.group.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(halfBoard + 2, 0.015, 4, 64), ringMat2
    );
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = 1.5;
    this.group.add(ring2);
    this.floatingItems.push({
      mesh: ring2, baseY: 1.5, bobSpeed: 0.3, bobAmount: 0.2,
      rotSpeed: new THREE.Vector3(0, 0.15, 0), phase: 0,
    });

    // Floating neon cubes + octahedra
    const shapes = [
      new THREE.BoxGeometry(0.15, 0.15, 0.15),
      new THREE.OctahedronGeometry(0.12),
    ];
    const neonMats = [
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.5 }),
      new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.4 }),
      new THREE.MeshBasicMaterial({ color: 0x76ff03, transparent: true, opacity: 0.35 }),
    ];

    for (let i = 0; i < 16; i++) {
      const geo = shapes[i % shapes.length];
      const mat = neonMats[i % neonMats.length];
      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / 16) * Math.PI * 2;
      const dist = 5 + Math.random() * 3;
      mesh.position.set(
        Math.cos(angle) * dist,
        0.5 + Math.random() * 3.5,
        Math.sin(angle) * dist,
      );
      this.group.add(mesh);
      this.floatingItems.push({
        mesh, baseY: mesh.position.y,
        bobSpeed: 0.6 + Math.random() * 1.5,
        bobAmount: 0.2 + Math.random() * 0.4,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
        ),
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Rising digital particles (cyan)
    this.addPointCloud(100, {
      color: 0x00e5ff, size: 0.06, opacity: 0.5,
      radius: 9, minY: -0.5, maxY: 5, velocityY: 0.4,
    });
    // Magenta particles
    this.addPointCloud(40, {
      color: 0xff00ff, size: 0.05, opacity: 0.4,
      radius: 7, minY: 0, maxY: 4, velocityY: 0.25,
    });
  }

  // ==================== SPACE ====================
  private createSpaceEffects(): void {
    // Dense star field
    this.addPointCloud(350, {
      color: 0xffffff, size: 0.05, opacity: 0.8,
      radius: 18, minY: -5, maxY: 12, velocityY: 0,
    });
    // Colored nebula particles
    this.addPointCloud(60, {
      color: 0x7c4dff, size: 0.1, opacity: 0.3,
      radius: 14, minY: 0, maxY: 10, velocityY: 0.02,
    });
    this.addPointCloud(40, {
      color: 0x448aff, size: 0.08, opacity: 0.25,
      radius: 12, minY: -2, maxY: 8, velocityY: -0.015,
    });

    // Large planet - positioned more visibly
    const planetGeo = new THREE.SphereGeometry(2.0, 24, 24);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x5c6bc0,
      emissive: 0x283593,
      emissiveIntensity: 0.5,
      roughness: 0.7,
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.position.set(-7, 5, -8);
    this.group.add(planet);

    // Planet atmosphere glow
    const glowGeo = new THREE.SphereGeometry(2.15, 24, 24);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x7986cb,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(planet.position);
    this.group.add(glow);

    // Planet ring
    const ringGeo = new THREE.TorusGeometry(3.0, 0.15, 8, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x9fa8da,
      emissive: 0x5c6bc0,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(planet.position);
    ring.rotation.x = Math.PI * 0.4;
    ring.rotation.z = 0.2;
    this.group.add(ring);
    this.floatingItems.push({
      mesh: ring, baseY: ring.position.y,
      bobSpeed: 0, bobAmount: 0,
      rotSpeed: new THREE.Vector3(0, 0.08, 0), phase: 0,
    });

    // Second small moon/planet
    const moonGeo = new THREE.SphereGeometry(0.6, 12, 12);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0x9e9e9e,
      emissive: 0x616161,
      emissiveIntensity: 0.2,
      roughness: 0.9,
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(8, 4, -6);
    this.group.add(moon);

    // Floating asteroids - more varied sizes
    const asteroidGeo1 = new THREE.IcosahedronGeometry(0.2, 0);
    const asteroidGeo2 = new THREE.IcosahedronGeometry(0.15, 1);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: 0x757575, roughness: 1, metalness: 0.2,
    });
    const asteroidMat2 = new THREE.MeshStandardMaterial({
      color: 0x8d6e63, roughness: 0.9, metalness: 0.3,
    });
    for (let i = 0; i < 14; i++) {
      const geo = i % 2 === 0 ? asteroidGeo1 : asteroidGeo2;
      const mat = i % 3 === 0 ? asteroidMat2 : asteroidMat;
      const asteroid = new THREE.Mesh(geo, mat);
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 5.5 + Math.random() * 4;
      asteroid.position.set(
        Math.cos(angle) * dist,
        0.5 + Math.random() * 5,
        Math.sin(angle) * dist,
      );
      asteroid.scale.setScalar(0.4 + Math.random() * 1.2);
      this.group.add(asteroid);
      this.floatingItems.push({
        mesh: asteroid, baseY: asteroid.position.y,
        bobSpeed: 0.2 + Math.random() * 0.4,
        bobAmount: 0.1 + Math.random() * 0.2,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
        ),
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Nebula backdrop - large semi-transparent plane behind the board
    const nebulaGeo = new THREE.PlaneGeometry(20, 12);
    const nebulaMat = new THREE.MeshBasicMaterial({
      color: 0x1a237e,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    });
    const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
    nebula.position.set(0, 3, -12);
    nebula.rotation.y = Math.PI * 0.15;
    this.group.add(nebula);
  }

  // ==================== JUNKYARD ====================
  private createJunkyardEffects(): void {
    // Floating gears - more variety
    const gearMats = [
      new THREE.MeshStandardMaterial({ color: 0x8d6e63, metalness: 0.8, roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ color: 0xa1887f, metalness: 0.7, roughness: 0.5 }),
      new THREE.MeshStandardMaterial({ color: 0x6d4c41, metalness: 0.9, roughness: 0.3 }),
    ];

    for (let i = 0; i < 8; i++) {
      const gear = this.createGearMesh(
        0.25 + Math.random() * 0.4,
        gearMats[i % gearMats.length]
      );
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 5 + Math.random() * 2.5;
      gear.position.set(
        Math.cos(angle) * dist,
        0.3 + Math.random() * 3.5,
        Math.sin(angle) * dist,
      );
      this.group.add(gear);
      this.floatingItems.push({
        mesh: gear, baseY: gear.position.y,
        bobSpeed: 0.3 + Math.random() * 0.5,
        bobAmount: 0.15 + Math.random() * 0.2,
        rotSpeed: new THREE.Vector3(
          0,
          (Math.random() - 0.5) * 0.3,
          (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.6),
        ),
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Scrap pipes sticking out of ground at angles
    const pipeGeo = new THREE.CylinderGeometry(0.06, 0.08, 2.5, 8);
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x795548, metalness: 0.7, roughness: 0.5,
    });
    const pipePositions = [
      { x: -5.5, z: -4, rotZ: 0.4, rotX: 0.1 },
      { x: 6, z: 3.5, rotZ: -0.35, rotX: -0.1 },
      { x: -4.5, z: 5.5, rotZ: 0.5, rotX: 0.2 },
      { x: 5, z: -6, rotZ: -0.45, rotX: 0 },
      { x: -6, z: 0, rotZ: 0.6, rotX: 0.3 },
      { x: 6.5, z: -2, rotZ: -0.3, rotX: -0.2 },
    ];
    for (const p of pipePositions) {
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.position.set(p.x, 0.3, p.z);
      pipe.rotation.z = p.rotZ;
      pipe.rotation.x = p.rotX;
      pipe.castShadow = true;
      this.group.add(pipe);
    }

    // Scrap metal plates on the ground
    const plateGeo = new THREE.BoxGeometry(0.8, 0.03, 0.6);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x5d4037, metalness: 0.6, roughness: 0.7,
    });
    const platePositions = [
      { x: -5, z: 2, rotY: 0.8 },
      { x: 4, z: -3, rotY: -0.4 },
      { x: -3, z: -5, rotY: 1.2 },
      { x: 6, z: 1, rotY: 0.3 },
    ];
    for (const p of platePositions) {
      const plate = new THREE.Mesh(plateGeo, plateMat);
      plate.position.set(p.x, -0.05, p.z);
      plate.rotation.y = p.rotY;
      plate.receiveShadow = true;
      this.group.add(plate);
    }

    // Scrap piles (stacked boxes)
    const scrapGeo = new THREE.BoxGeometry(0.4, 0.3, 0.3);
    const scrapMat = new THREE.MeshStandardMaterial({
      color: 0x6d4c41, metalness: 0.5, roughness: 0.8,
    });
    const pilePositions = [
      { x: -6, z: -2 },
      { x: 5.5, z: 5 },
    ];
    for (const p of pilePositions) {
      for (let j = 0; j < 3; j++) {
        const scrap = new THREE.Mesh(scrapGeo, scrapMat);
        scrap.position.set(
          p.x + (Math.random() - 0.5) * 0.3,
          j * 0.25,
          p.z + (Math.random() - 0.5) * 0.3,
        );
        scrap.rotation.y = Math.random() * Math.PI;
        scrap.castShadow = true;
        this.group.add(scrap);
      }
    }

    // Floating bolts and nuts
    const boltGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.15, 6);
    const boltMat = new THREE.MeshStandardMaterial({
      color: 0x9e9e9e, metalness: 0.9, roughness: 0.3,
    });
    for (let i = 0; i < 6; i++) {
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      const angle = Math.random() * Math.PI * 2;
      const dist = 4 + Math.random() * 4;
      bolt.position.set(
        Math.cos(angle) * dist,
        0.5 + Math.random() * 2,
        Math.sin(angle) * dist,
      );
      this.group.add(bolt);
      this.floatingItems.push({
        mesh: bolt, baseY: bolt.position.y,
        bobSpeed: 0.5 + Math.random() * 1,
        bobAmount: 0.1 + Math.random() * 0.15,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 3,
        ),
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Warning stripe on ground near board
    const stripeGeo = new THREE.BoxGeometry(BOARD_SIZE + 1.5, 0.01, 0.15);
    const stripeMat = new THREE.MeshBasicMaterial({
      color: 0xffab00, transparent: true, opacity: 0.3,
    });
    for (let i = 0; i < 3; i++) {
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(0, -0.1, -BOARD_SIZE / 2 - 0.5 - i * 0.3);
      stripe.rotation.y = Math.PI / 4;
      this.group.add(stripe);
    }

    // Spark/ember particles (more!)
    this.addPointCloud(80, {
      color: 0xff6d00, size: 0.06, opacity: 0.6,
      radius: 7, minY: -0.2, maxY: 5, velocityY: 0.6,
    });
    // Smoke particles (dark, slow)
    this.addPointCloud(40, {
      color: 0x4e342e, size: 0.12, opacity: 0.15,
      radius: 5, minY: 0, maxY: 6, velocityY: 0.2,
    });
  }

  // ==================== HELPERS ====================

  private createGearMesh(radius: number, material: THREE.Material): THREE.Mesh {
    const torusGeo = new THREE.TorusGeometry(radius, radius * 0.2, 6, 12);
    const gear = new THREE.Mesh(torusGeo, material);
    gear.castShadow = true;
    return gear;
  }

  private addPointCloud(
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

    const points = new THREE.Points(geo, mat);
    this.pointClouds.push({
      points,
      velocities,
      bounds: { minY: opts.minY, maxY: opts.maxY, radius: opts.radius },
    });
    this.group.add(points);
  }

  update(elapsed: number, delta: number): void {
    // Animate floating items
    for (const item of this.floatingItems) {
      const t = elapsed + item.phase;
      if (item.bobAmount > 0) {
        item.mesh.position.y = item.baseY + Math.sin(t * item.bobSpeed) * item.bobAmount;
      }
      item.mesh.rotation.x += item.rotSpeed.x * delta;
      item.mesh.rotation.y += item.rotSpeed.y * delta;
      item.mesh.rotation.z += item.rotSpeed.z * delta;
    }

    // Animate all point clouds
    for (const pc of this.pointClouds) {
      const positions = pc.points.geometry.attributes.position as THREE.BufferAttribute;
      const arr = positions.array as Float32Array;
      const bounds = pc.bounds;

      for (let i = 0; i < pc.velocities.length; i++) {
        const vy = pc.velocities[i];
        if (vy === 0) continue;

        arr[i * 3 + 1] += vy * delta;

        if (vy > 0 && arr[i * 3 + 1] > bounds.maxY) {
          arr[i * 3 + 1] = bounds.minY;
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * bounds.radius;
          arr[i * 3] = Math.cos(angle) * dist;
          arr[i * 3 + 2] = Math.sin(angle) * dist;
        } else if (vy < 0 && arr[i * 3 + 1] < bounds.minY) {
          arr[i * 3 + 1] = bounds.maxY;
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * bounds.radius;
          arr[i * 3] = Math.cos(angle) * dist;
          arr[i * 3 + 2] = Math.sin(angle) * dist;
        }
      }
      positions.needsUpdate = true;
    }

    // Animate materials (pulsing neon)
    for (const { mat, type } of this.animatedMaterials) {
      if (type === 'neon-pulse-cyan') {
        (mat as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(elapsed * 2) * 0.06;
      } else if (type === 'neon-pulse-magenta') {
        (mat as THREE.MeshBasicMaterial).opacity = 0.05 + Math.sin(elapsed * 1.5 + 1) * 0.04;
      }
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
