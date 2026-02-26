import * as THREE from 'three';
import {
  BOARD_OFFSET,
  CELL_HEIGHT,
  DISC_RADIUS,
  DISC_HEIGHT,
  DISC_SEGMENTS,
  COLORS,
  TIMING,
  CellState,
  type Position,
} from '../core/constants';

interface PieceData {
  mesh: THREE.Mesh;
  state: CellState;
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class PieceRenderer {
  private pieces: Map<string, PieceData> = new Map();
  private discGeometry: THREE.CylinderGeometry;
  private blackMaterial: THREE.MeshStandardMaterial;
  private whiteMaterial: THREE.MeshStandardMaterial;
  constructor(private scene: THREE.Scene) {
    this.discGeometry = new THREE.CylinderGeometry(
      DISC_RADIUS, DISC_RADIUS, DISC_HEIGHT, DISC_SEGMENTS
    );

    this.blackMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.black,
      roughness: 0.4,
      metalness: 0.3,
      emissive: 0x222244,
      emissiveIntensity: 0.3,
    });

    this.whiteMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.white,
      roughness: 0.3,
      metalness: 0.2,
    });
  }

  private getKey(row: number, col: number): string {
    return `${row},${col}`;
  }

  private getMaterial(state: CellState): THREE.MeshStandardMaterial {
    return state === CellState.Black ? this.blackMaterial : this.whiteMaterial;
  }

  placePiece(row: number, col: number, state: CellState, animate = true): Promise<void> {
    const key = this.getKey(row, col);
    if (this.pieces.has(key)) return Promise.resolve();

    const material = this.getMaterial(state);
    const mesh = new THREE.Mesh(this.discGeometry, material);
    mesh.position.set(
      col - BOARD_OFFSET,
      CELL_HEIGHT / 2 + DISC_HEIGHT / 2,
      row - BOARD_OFFSET
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.pieces.set(key, { mesh, state });
    this.scene.add(mesh);

    if (!animate) {
      return Promise.resolve();
    }

    // Placement animation: scale up with bounce
    mesh.scale.set(0, 0, 0);
    const targetY = mesh.position.y;
    mesh.position.y = targetY + 0.5;

    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = TIMING.placementDuration;

      const animatePlacement = () => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOutBack(t);

        mesh.scale.set(eased, eased, eased);
        mesh.position.y = targetY + 0.5 * (1 - t);

        if (t < 1) {
          requestAnimationFrame(animatePlacement);
        } else {
          mesh.scale.set(1, 1, 1);
          mesh.position.y = targetY;
          resolve();
        }
      };
      requestAnimationFrame(animatePlacement);
    });
  }

  flipPiece(row: number, col: number, toState: CellState): Promise<void> {
    const key = this.getKey(row, col);
    const piece = this.pieces.get(key);
    if (!piece) return Promise.resolve();

    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = TIMING.flipDuration;
      const startRotation = 0;
      const endRotation = Math.PI;
      let swapped = false;

      const animateFlip = () => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(t);

        const rotation = startRotation + (endRotation - startRotation) * eased;
        piece.mesh.rotation.x = rotation;

        // Slight lift during flip
        const liftAmount = Math.sin(eased * Math.PI) * 0.3;
        piece.mesh.position.y = CELL_HEIGHT / 2 + DISC_HEIGHT / 2 + liftAmount;

        // Swap material at midpoint
        if (!swapped && eased >= 0.5) {
          piece.mesh.material = this.getMaterial(toState);
          piece.state = toState;
          swapped = true;
        }

        if (t < 1) {
          requestAnimationFrame(animateFlip);
        } else {
          piece.mesh.rotation.x = 0;
          piece.mesh.position.y = CELL_HEIGHT / 2 + DISC_HEIGHT / 2;
          piece.mesh.material = this.getMaterial(toState);
          piece.state = toState;
          resolve();
        }
      };
      requestAnimationFrame(animateFlip);
    });
  }

  async flipMultiple(positions: Position[], toState: CellState): Promise<void> {
    const promises: Promise<void>[] = [];
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      // Staggered start
      const promise = new Promise<void>((resolve) => {
        setTimeout(() => {
          this.flipPiece(pos.row, pos.col, toState).then(resolve);
        }, i * TIMING.flipStagger);
      });
      promises.push(promise);
    }
    await Promise.all(promises);
  }

  placeInitialPieces(pieces: { row: number; col: number; state: CellState }[]): void {
    for (const p of pieces) {
      this.placePiece(p.row, p.col, p.state, false);
    }
  }

  clear(): void {
    for (const [_, piece] of this.pieces) {
      this.scene.remove(piece.mesh);
    }
    this.pieces.clear();
  }

  dispose(): void {
    this.clear();
    this.discGeometry.dispose();
    this.blackMaterial.dispose();
    this.whiteMaterial.dispose();
  }
}
