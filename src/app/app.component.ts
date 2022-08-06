import { Component, ViewChild } from '@angular/core';
import { SceneCanvasComponent } from './scene-canvas/scene-canvas.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(SceneCanvasComponent) sceneComponent!: SceneCanvasComponent;
  title = 'wave-simulation';
  fullScreen: boolean = false
  parameters: any = {
    pause: false,
    nextFrame: 0,
    forceAspectRatio: true,
    LOD: 1,
    energy: false
  }

  toggleFullScreen(): void {
    this.fullScreen = !this.fullScreen
    this.sceneComponent.toggleFullScreen(this.fullScreen)
  }

  initialize() {
    this.sceneComponent.initialize()
  }
}
