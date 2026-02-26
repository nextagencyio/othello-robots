# Othello Robots

A robot-themed Othello (Reversi) game built with Three.js, featuring an isometric 3D board, animated robot characters, multiple board themes, and procedural audio.

## Features

- **Isometric 3D board** rendered with Three.js and an orthographic camera
- **4 selectable robot opponents** — Clanky, Sparks, Boltz, and Gizmo — each with unique personalities, animations, and voice pitches
- **3 difficulty levels** — Easy (random), Medium (positional strategy), Hard (minimax with alpha-beta pruning)
- **4 themed board maps** with distinct atmospheres:
  - **Classic** — Green felt with wooden posts, warm lanterns, and floating dust
  - **Neon Grid** — Cyberpunk aesthetic with glowing pylons, pulsing rings, and a reflective floor
  - **Deep Space** — Floating among stars, planets, asteroids, and nebula clouds
  - **Junkyard** — Rusty scrapyard with floating gears, pipes, sparks, and smoky fog
- **Procedural chiptune music** generated in real-time via the Web Audio API
- **Procedural sound effects** — piece placement, flips, robot chatter, victory/defeat fanfares
- **Interactive tutorial** — 7-step illustrated guide accessible from the main menu
- **Animated robot sprites** — Canvas 2D-drawn robots with articulated arms, expressive eyes, and reactive emotions

## Tech Stack

- **Vite** + **TypeScript**
- **Three.js** (only runtime dependency)
- **Canvas 2D API** for robot sprite generation
- **Web Audio API** for all audio (no audio files)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Building

```bash
npm run build
```

Output goes to `dist/`.

## How to Play

Othello is a strategy board game for two players. You play as the dark discs against a robot opponent controlling the light discs.

1. Place a disc to **sandwich** one or more of your opponent's discs between your new disc and an existing one
2. All sandwiched discs **flip** to your color
3. Flips work in all 8 directions (horizontal, vertical, diagonal)
4. The game ends when neither player can move
5. **Most discs wins!**

Valid moves are highlighted on the board. Corners are the most valuable positions since they can never be flipped.

## Project Structure

```
src/
├── core/          # GameController, constants
├── game/          # Board, GameState, MoveValidator
├── ai/            # AI strategies (random, greedy, minimax)
├── rendering/     # Three.js scene, board, pieces, robots, map effects
├── maps/          # Board theme definitions
├── robots/        # Robot types, sprite generation, animation
├── audio/         # AudioManager, SoundSynth, MusicManager
└── ui/            # UI screens (menus, HUD, tutorial, game over)
```
