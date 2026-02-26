export interface Screen {
  show(container: HTMLElement): void;
  hide(): void;
  dispose(): void;
}

export class UIManager {
  private currentScreen: Screen | null = null;

  constructor(private container: HTMLElement) {}

  showScreen(screen: Screen): void {
    if (this.currentScreen) {
      this.currentScreen.hide();
      this.currentScreen.dispose();
    }
    this.currentScreen = screen;
    screen.show(this.container);
  }

  hideCurrentScreen(): void {
    if (this.currentScreen) {
      this.currentScreen.hide();
      this.currentScreen.dispose();
      this.currentScreen = null;
    }
  }
}
