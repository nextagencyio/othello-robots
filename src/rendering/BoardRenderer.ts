import * as THREE from 'three';
import { BOARD_SIZE, BOARD_OFFSET, CELL_SIZE, CELL_HEIGHT, type Position } from '../core/constants';
import type { BoardMap } from '../maps/BoardMap';

export class BoardRenderer {
  private cellMeshes: THREE.Mesh[][] = [];
  private boardGroup: THREE.Group;
  private originalMaterials: THREE.MeshStandardMaterial[][] = [];
  private highlightedCells: Set<string> = new Set();
  private validMoveCells: Set<string> = new Set();
  private map: BoardMap;

  constructor(private scene: THREE.Scene, map: BoardMap) {
    this.map = map;
    this.boardGroup = new THREE.Group();

    // Board border/base
    const borderGeo = new THREE.BoxGeometry(
      BOARD_SIZE + 0.4,
      CELL_HEIGHT + 0.05,
      BOARD_SIZE + 0.4
    );
    const borderMat = new THREE.MeshStandardMaterial({
      color: map.borderColor,
      metalness: map.borderMetalness,
      roughness: map.borderRoughness,
    });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.set(0, -CELL_HEIGHT / 2 - 0.025, 0);
    borderMesh.receiveShadow = true;
    this.boardGroup.add(borderMesh);

    // Individual cells
    const cellGeo = new THREE.BoxGeometry(CELL_SIZE, CELL_HEIGHT, CELL_SIZE);

    for (let row = 0; row < BOARD_SIZE; row++) {
      this.cellMeshes[row] = [];
      this.originalMaterials[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        const isLight = (row + col) % 2 === 0;
        const color = isLight ? map.cellLightColor : map.cellDarkColor;
        const mat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.7,
          metalness: 0.1,
        });
        const mesh = new THREE.Mesh(cellGeo, mat);
        mesh.position.set(
          col - BOARD_OFFSET,
          0,
          row - BOARD_OFFSET
        );
        mesh.receiveShadow = true;
        mesh.userData = { row, col };
        this.cellMeshes[row][col] = mesh;
        this.originalMaterials[row][col] = mat;
        this.boardGroup.add(mesh);
      }
    }

    scene.add(this.boardGroup);
  }

  getCellMeshes(): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        meshes.push(this.cellMeshes[r][c]);
      }
    }
    return meshes;
  }

  meshToCell(mesh: THREE.Mesh): Position | null {
    if (mesh.userData.row !== undefined && mesh.userData.col !== undefined) {
      return { row: mesh.userData.row, col: mesh.userData.col };
    }
    return null;
  }

  showValidMoves(moves: Position[]): void {
    this.clearValidMoves();
    for (const move of moves) {
      const key = `${move.row},${move.col}`;
      this.validMoveCells.add(key);
      const mat = this.originalMaterials[move.row][move.col];
      mat.emissive.set(this.map.validMoveColor);
      mat.emissiveIntensity = 0.25;
    }
  }

  clearValidMoves(): void {
    for (const key of this.validMoveCells) {
      const [r, c] = key.split(',').map(Number);
      if (!this.highlightedCells.has(key)) {
        this.originalMaterials[r][c].emissive.set(0x000000);
        this.originalMaterials[r][c].emissiveIntensity = 0;
      }
    }
    this.validMoveCells.clear();
  }

  highlightCell(row: number, col: number): void {
    this.clearHighlight();
    const key = `${row},${col}`;
    this.highlightedCells.add(key);
    const mat = this.originalMaterials[row][col];
    mat.emissive.set(this.map.highlightColor);
    mat.emissiveIntensity = 0.3;
  }

  clearHighlight(): void {
    for (const key of this.highlightedCells) {
      const [r, c] = key.split(',').map(Number);
      this.highlightedCells.delete(key);
      if (this.validMoveCells.has(key)) {
        this.originalMaterials[r][c].emissive.set(this.map.validMoveColor);
        this.originalMaterials[r][c].emissiveIntensity = 0.15;
      } else {
        this.originalMaterials[r][c].emissive.set(0x000000);
        this.originalMaterials[r][c].emissiveIntensity = 0;
      }
    }
  }

  cellToWorldPosition(row: number, col: number): THREE.Vector3 {
    return new THREE.Vector3(
      col - BOARD_OFFSET,
      CELL_HEIGHT / 2,
      row - BOARD_OFFSET
    );
  }

  dispose(): void {
    this.scene.remove(this.boardGroup);
    this.boardGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      }
    });
  }
}
