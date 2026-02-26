import * as THREE from 'three';
import { CellState, Difficulty, BOARD_SIZE, TIMING } from './constants';
import { GameState } from '../game/GameState';
import { AIPlayer } from '../ai/AIPlayer';
import { SceneManager } from '../rendering/SceneManager';
import { BoardRenderer } from '../rendering/BoardRenderer';
import { PieceRenderer } from '../rendering/PieceRenderer';
import { RobotDisplay } from '../rendering/RobotDisplay';
import { MapEffects } from '../rendering/MapEffects';
import { AnimationLoop } from '../rendering/AnimationLoop';
import { AudioManager } from '../audio/AudioManager';
import { SoundSynth } from '../audio/SoundSynth';
import { MusicManager } from '../audio/MusicManager';
import { UIManager } from '../ui/UIManager';
import { MainMenuScreen } from '../ui/screens/MainMenuScreen';
import { RobotSelectScreen } from '../ui/screens/RobotSelectScreen';
import { DifficultyScreen } from '../ui/screens/DifficultyScreen';
import { MapSelectScreen } from '../ui/screens/MapSelectScreen';
import { GameHUD } from '../ui/screens/GameHUD';
import { GameOverScreen } from '../ui/screens/GameOverScreen';
import { TutorialScreen } from '../ui/screens/TutorialScreen';
import type { BoardMap } from '../maps/BoardMap';
import type { Robot } from '../robots/Robot';
import { ROBOTS } from '../robots/robotRegistry';

enum GamePhase {
  MainMenu,
  Tutorial,
  RobotSelect,
  DifficultySelect,
  MapSelect,
  Playing,
  GameOver,
}

export class GameController {
  private phase: GamePhase = GamePhase.MainMenu;
  private sceneManager: SceneManager;
  private boardRenderer: BoardRenderer | null = null;
  private pieceRenderer: PieceRenderer | null = null;
  private robotDisplay: RobotDisplay | null = null;
  private mapEffects: MapEffects | null = null;
  private gameState: GameState | null = null;
  private aiPlayer: AIPlayer | null = null;
  private audioManager: AudioManager;
  private soundSynth: SoundSynth;
  private musicManager: MusicManager | null = null;
  private uiManager: UIManager;
  private animationLoop: AnimationLoop;
  private gameHUD: GameHUD | null = null;

  // Selections
  private selectedRobot: Robot | null = null;
  private selectedDifficulty: Difficulty | null = null;
  private selectedMap: BoardMap | null = null;

  // Input state
  private isAnimating = false;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private nextChatterTime = 0;

  // Bound handlers
  private boundClick: (e: MouseEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;

  constructor(appContainer: HTMLElement, uiOverlay: HTMLElement) {
    this.sceneManager = new SceneManager(appContainer);
    this.audioManager = new AudioManager();
    this.soundSynth = new SoundSynth(this.audioManager);
    this.uiManager = new UIManager(uiOverlay);
    this.animationLoop = new AnimationLoop();

    // Animation loop: render scene + idle chatter
    this.animationLoop.addCallback((delta, elapsed) => {
      if (this.robotDisplay) {
        this.robotDisplay.update(elapsed, delta);
      }
      if (this.mapEffects) {
        this.mapEffects.update(elapsed, delta);
      }
      // Periodic idle robot chatter during gameplay
      if (this.phase === GamePhase.Playing && elapsed > this.nextChatterTime) {
        this.nextChatterTime = elapsed + 8 + Math.random() * 12; // 8-20 seconds
        const pitch = this.selectedRobot?.voicePitch ?? 1.0;
        // Randomly pick player or AI robot to chatter
        if (Math.random() > 0.5) {
          this.soundSynth.playRobotChatter(pitch);
          this.robotDisplay?.aiAnimator.triggerChatter(0.3);
        } else {
          this.soundSynth.playRobotChatter(1.0);
          this.robotDisplay?.playerAnimator.triggerChatter(0.3);
        }
      }
      this.sceneManager.render();
    });
    this.animationLoop.start();

    // Input handlers
    this.boundClick = this.onCanvasClick.bind(this);
    this.boundMouseMove = this.onCanvasMouseMove.bind(this);

    // Show main menu
    this.showMainMenu();
  }

  private showMainMenu(): void {
    this.phase = GamePhase.MainMenu;
    this.cleanupGame();
    this.uiManager.showScreen(
      new MainMenuScreen(
        () => {
          this.audioManager.init();
          this.audioManager.resume();
          this.soundSynth.playMenuClick();
          this.showRobotSelect();
        },
        () => {
          this.audioManager.init();
          this.audioManager.resume();
          this.soundSynth.playMenuClick();
          this.showTutorial();
        }
      )
    );
  }

  private showTutorial(): void {
    this.phase = GamePhase.Tutorial;
    this.uiManager.showScreen(
      new TutorialScreen(
        () => {
          this.soundSynth.playMenuClick();
          this.showRobotSelect();
        },
        () => {
          this.soundSynth.playMenuClick();
          this.showMainMenu();
        }
      )
    );
  }

  private showRobotSelect(): void {
    this.phase = GamePhase.RobotSelect;
    this.uiManager.showScreen(
      new RobotSelectScreen(
        (robot) => {
          this.soundSynth.playMenuClick();
          this.selectedRobot = robot;
          this.showDifficultySelect();
        },
        () => {
          this.soundSynth.playMenuClick();
          this.showMainMenu();
        }
      )
    );
  }

  private showDifficultySelect(): void {
    this.phase = GamePhase.DifficultySelect;
    this.uiManager.showScreen(
      new DifficultyScreen(
        (difficulty) => {
          this.soundSynth.playMenuClick();
          this.selectedDifficulty = difficulty;
          this.showMapSelect();
        },
        () => {
          this.soundSynth.playMenuClick();
          this.showRobotSelect();
        }
      )
    );
  }

  private showMapSelect(): void {
    this.phase = GamePhase.MapSelect;
    this.uiManager.showScreen(
      new MapSelectScreen(
        (map) => {
          this.soundSynth.playMenuClick();
          this.selectedMap = map;
          this.startGame();
        },
        () => {
          this.soundSynth.playMenuClick();
          this.showDifficultySelect();
        }
      )
    );
  }

  private startGame(): void {
    this.phase = GamePhase.Playing;
    this.uiManager.hideCurrentScreen();

    const map = this.selectedMap!;
    const robot = this.selectedRobot!;
    const difficulty = this.selectedDifficulty!;

    // Apply map theme to scene
    this.sceneManager.applyMap(map);

    // Create board and map effects
    this.boardRenderer = new BoardRenderer(this.sceneManager.scene, map);
    this.mapEffects = new MapEffects(this.sceneManager.scene, map);

    // Create piece renderer
    this.pieceRenderer = new PieceRenderer(this.sceneManager.scene);

    // Pick a random robot for the player side (distinct from AI robot)
    const playerRobot = this.getPlayerRobot(robot);

    // Create robot display (HTML overlay at bottom of screen)
    this.robotDisplay = new RobotDisplay(playerRobot, robot);

    // Create game state
    this.gameState = new GameState();

    // Create AI
    this.aiPlayer = new AIPlayer(difficulty);

    // Place initial pieces
    const initialPieces: { row: number; col: number; state: CellState }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = this.gameState.board.getCell(r, c);
        if (cell !== CellState.Empty) {
          initialPieces.push({ row: r, col: c, state: cell });
        }
      }
    }
    this.pieceRenderer.placeInitialPieces(initialPieces);

    // Show HUD
    this.gameHUD = new GameHUD(() => {
      this.showMainMenu();
    }, robot.name);
    this.gameHUD.show(document.getElementById('ui-overlay')!);
    this.updateHUD();

    // Show valid moves
    this.showValidMovesForCurrentPlayer();

    // Start background music
    this.musicManager = new MusicManager(this.audioManager);
    this.musicManager.start();

    // Add input listeners
    this.sceneManager.renderer.domElement.addEventListener('click', this.boundClick);
    this.sceneManager.renderer.domElement.addEventListener('mousemove', this.boundMouseMove);
  }

  private getPlayerRobot(aiRobot: Robot): Robot {
    // Pick a random different robot for the player
    const otherRobots = ROBOTS.filter((r) => r.id !== aiRobot.id);
    return otherRobots[Math.floor(Math.random() * otherRobots.length)];
  }

  private onCanvasClick(event: MouseEvent): void {
    if (this.phase !== GamePhase.Playing) return;
    if (this.isAnimating) return;
    if (!this.gameState || this.gameState.currentPlayer !== CellState.Black) return;

    this.updateMouse(event);
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

    const intersects = this.raycaster.intersectObjects(
      this.boardRenderer!.getCellMeshes()
    );

    if (intersects.length > 0) {
      const cell = this.boardRenderer!.meshToCell(intersects[0].object as THREE.Mesh);
      if (cell) {
        this.handlePlayerMove(cell.row, cell.col);
      }
    }
  }

  private onCanvasMouseMove(event: MouseEvent): void {
    if (this.phase !== GamePhase.Playing) return;
    if (this.isAnimating) return;
    if (!this.gameState || this.gameState.currentPlayer !== CellState.Black) return;

    this.updateMouse(event);
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

    const intersects = this.raycaster.intersectObjects(
      this.boardRenderer!.getCellMeshes()
    );

    this.boardRenderer!.clearHighlight();

    if (intersects.length > 0) {
      const cell = this.boardRenderer!.meshToCell(intersects[0].object as THREE.Mesh);
      if (cell) {
        const validMoves = this.gameState.getValidMovesForCurrent();
        const isValid = validMoves.some(
          (m) => m.row === cell.row && m.col === cell.col
        );
        if (isValid) {
          this.boardRenderer!.highlightCell(cell.row, cell.col);
          this.sceneManager.renderer.domElement.style.cursor = 'pointer';
        } else {
          this.sceneManager.renderer.domElement.style.cursor = 'default';
        }
      }
    } else {
      this.sceneManager.renderer.domElement.style.cursor = 'default';
    }
  }

  private updateMouse(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  private async handlePlayerMove(row: number, col: number): Promise<void> {
    if (!this.gameState || !this.pieceRenderer) return;

    const result = this.gameState.makeMove(row, col);
    if (!result) {
      this.soundSynth.playBuzz();
      return;
    }

    this.isAnimating = true;
    this.boardRenderer!.clearValidMoves();
    this.boardRenderer!.clearHighlight();

    // Animate placement
    this.soundSynth.playPlace();
    await this.pieceRenderer.placePiece(row, col, CellState.Black);

    // Animate flips
    if (result.flipped.length > 0) {
      this.robotDisplay?.playerAnimator.triggerHappy();
      this.robotDisplay?.aiAnimator.triggerSad();
    }
    for (let i = 0; i < result.flipped.length; i++) {
      setTimeout(() => this.soundSynth.playFlip(), i * TIMING.flipStagger);
    }
    await this.pieceRenderer.flipMultiple(result.flipped, CellState.Black);

    this.updateHUD();

    // Check game over
    if (this.gameState.gameOver) {
      this.isAnimating = false;
      this.endGame();
      return;
    }

    // AI turn
    if (this.gameState.currentPlayer === CellState.White) {
      await this.handleAITurn();
    } else {
      this.showValidMovesForCurrentPlayer();
    }

    this.isAnimating = false;
  }

  private async handleAITurn(): Promise<void> {
    if (!this.gameState || !this.pieceRenderer || !this.aiPlayer) return;

    this.gameHUD?.updateTurn(CellState.White);

    // Thinking delay
    const delay = TIMING.aiThinkingDelay +
      Math.random() * TIMING.aiThinkingDelayVariance;
    await this.delay(delay);

    // Robot chatter (AI thinking)
    this.soundSynth.playRobotChatter(this.selectedRobot?.voicePitch ?? 1.0);
    this.robotDisplay?.aiAnimator.triggerChatter(0.4);

    await this.delay(200);

    const move = this.aiPlayer.pickMove(this.gameState.board, CellState.White);
    const result = this.gameState.makeMove(move.row, move.col);

    if (!result) {
      // AI has no moves, pass handled in gameState
      this.updateHUD();
      if (this.gameState.gameOver) {
        this.endGame();
        return;
      }
      this.showValidMovesForCurrentPlayer();
      return;
    }

    // Animate AI placement
    this.soundSynth.playPlace();
    await this.pieceRenderer.placePiece(move.row, move.col, CellState.White);

    // Animate flips
    if (result.flipped.length > 0) {
      this.robotDisplay?.aiAnimator.triggerHappy();
      this.robotDisplay?.playerAnimator.triggerSad();
    }
    for (let i = 0; i < result.flipped.length; i++) {
      setTimeout(() => this.soundSynth.playFlip(), i * TIMING.flipStagger);
    }
    await this.pieceRenderer.flipMultiple(result.flipped, CellState.White);

    this.updateHUD();

    // Check game over
    if (this.gameState.gameOver) {
      this.endGame();
      return;
    }

    // If player has no moves, AI goes again
    if (this.gameState.currentPlayer === CellState.White) {
      await this.handleAITurn();
    } else {
      this.showValidMovesForCurrentPlayer();
    }
  }

  private showValidMovesForCurrentPlayer(): void {
    if (!this.gameState || !this.boardRenderer) return;
    const moves = this.gameState.getValidMovesForCurrent();
    this.boardRenderer.showValidMoves(moves);
    this.gameHUD?.updateTurn(this.gameState.currentPlayer);
  }

  private updateHUD(): void {
    if (!this.gameState || !this.gameHUD) return;
    const counts = this.gameState.board.countPieces();
    this.gameHUD.updateScore(counts.black, counts.white);
    this.gameHUD.updateTurn(this.gameState.currentPlayer);
  }

  private endGame(): void {
    this.phase = GamePhase.GameOver;
    if (!this.gameState) return;

    const counts = this.gameState.board.countPieces();
    const winner = this.gameState.winner;

    // Robot reactions
    if (winner === CellState.Black) {
      this.robotDisplay?.playerAnimator.triggerVictory();
      this.robotDisplay?.aiAnimator.triggerSad();
      this.soundSynth.playVictory();
    } else if (winner === CellState.White) {
      this.robotDisplay?.aiAnimator.triggerVictory();
      this.robotDisplay?.playerAnimator.triggerSad();
      this.soundSynth.playDefeat();
    }

    // Remove input listeners
    this.sceneManager.renderer.domElement.removeEventListener('click', this.boundClick);
    this.sceneManager.renderer.domElement.removeEventListener('mousemove', this.boundMouseMove);
    this.sceneManager.renderer.domElement.style.cursor = 'default';

    // Hide HUD
    this.gameHUD?.hide();

    // Show game over screen after a brief delay
    setTimeout(() => {
      const overlay = document.getElementById('ui-overlay')!;
      const screen = new GameOverScreen(
        winner,
        counts.black,
        counts.white,
        () => {
          // Play again with same settings
          screen.dispose();
          this.cleanupGame();
          this.startGame();
        },
        () => {
          screen.dispose();
          this.showMainMenu();
        }
      );
      screen.show(overlay);
    }, 1500);
  }

  private cleanupGame(): void {
    this.sceneManager.renderer.domElement.removeEventListener('click', this.boundClick);
    this.sceneManager.renderer.domElement.removeEventListener('mousemove', this.boundMouseMove);
    this.sceneManager.renderer.domElement.style.cursor = 'default';

    if (this.boardRenderer) {
      this.boardRenderer.dispose();
      this.boardRenderer = null;
    }
    if (this.pieceRenderer) {
      this.pieceRenderer.dispose();
      this.pieceRenderer = null;
    }
    if (this.robotDisplay) {
      this.robotDisplay.dispose();
      this.robotDisplay = null;
    }
    if (this.mapEffects) {
      this.mapEffects.dispose();
      this.mapEffects = null;
    }
    if (this.musicManager) {
      this.musicManager.stop();
      this.musicManager = null;
    }
    if (this.gameHUD) {
      this.gameHUD.dispose();
      this.gameHUD = null;
    }
    this.gameState = null;
    this.aiPlayer = null;
    this.isAnimating = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
