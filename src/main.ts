import './style.css';
import { GameController } from './core/GameController';

const appContainer = document.getElementById('app')!;
const uiOverlay = document.getElementById('ui-overlay')!;

new GameController(appContainer, uiOverlay);
