import { Component, ViewChild } from '@angular/core';
import { SceneCanvasComponent } from './scene-canvas/scene-canvas.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(SceneCanvasComponent) sceneComponent!: SceneCanvasComponent;
  fullScreen: boolean = false
  defaultParameters: SimulationParameters = {
    pause: false,
    nextFrame: 0,
    forceAspectRatio: true,
    showGradient: true,
    LOD: 1,
    energy: false,
    boundary: 0,
    initialCondition: {
      type: 0,
      c1: 0,
      c2: 800,
      c3: 0.7,
      c4: 0.05,
    },
    aCeil: 1,
    speedMultiplier: 1,
    speedDivider: 1
  }
  parameters = this.defaultParameters

  toggleFullScreen(): void {
    this.fullScreen = !this.fullScreen
    this.sceneComponent.toggleFullScreen(this.fullScreen)
  }

  initialize() {
    if (this.sceneComponent) {
      this.sceneComponent.initialize()
    }
  }

  resetParameters() {
    this.parameters = this.defaultParameters
    localStorage.removeItem("parameters")
    this.initialize()
  }
}
