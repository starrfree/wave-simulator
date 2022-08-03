import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ShaderService } from '../shader.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  defaultName = "default"
  gradientName = this.defaultName
  backgroundName = this.defaultName

  @Input() parameters: any = {}
  @Output() parametersChange = new EventEmitter<any>()

  constructor(private shaderService: ShaderService) { }

  ngOnInit(): void {
  }

  resetGradient() {
    this.gradientName = this.defaultName
    this.parameters.texture.gradient = undefined
  }

  resetBackground() {
    this.backgroundName = this.defaultName
    this.parameters.texture.background = undefined
    this.parametersChange.emit(this.parameters)
  }

  selectGradient(input: any) {
    if (input.files && input.files[0]) {
      var reader = new FileReader()
      reader.readAsDataURL(input.files[0])
      reader.onload = (event : any) => {
        var src = event.target.result
        this.gradientName = input.files[0].name
        this.shaderService.imageToTexture(this.shaderService.gl, src, texture => {
          if (this.parameters.texture) {
            this.parameters.texture.gradient = texture
          } else {
            this.parameters.texture = {
              gradient: texture
            }
          }
        })
      }
    }
  }

  selectBackground(input: any) {
    if (input.files && input.files[0]) {
      var reader = new FileReader()
      reader.readAsDataURL(input.files[0])
      reader.onload = (event : any) => {
        var src = event.target.result
        this.backgroundName = input.files[0].name
        this.shaderService.imageToTexture(this.shaderService.gl, src, texture => {
          if (this.parameters.texture) {
            this.parameters.texture.background = texture
          } else {
            this.parameters.texture = {
              background: texture
            }
          }
          this.parametersChange.emit(this.parameters)
        })
      }
    }
  }

  togglePause() {
    this.parameters.pause = !this.parameters.pause
  }

  reset() {
    this.parameters.pause = false
    this.parametersChange.emit(this.parameters)
  }
}
