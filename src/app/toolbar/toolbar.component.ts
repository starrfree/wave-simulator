import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
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
  isHovering: any = {
    gradient: false,
    background: false
  }

  @Input() parameters: any = {}
  @Output() parametersChange = new EventEmitter<any>()

  constructor(private shaderService: ShaderService) { }

  ngOnInit(): void {
  }

  resetGradient() {
    this.gradientName = this.defaultName
    this.parameters.texture.gradient = undefined
  }

  selectGradient(input: any) {
    if (input.files && input.files[0]) {
      this.setGradient(input.files[0])
    }
  }
  
  onDropGradient(event: any)  {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.setGradient(files[0])
    }
  }
  
  dragOverGradient(event: any) {
    event.preventDefault();
    this.isHovering.gradient = true
  }

  dragLeaveGradient(event: any) {
    event.preventDefault();
    this.isHovering.gradient = false
  }

  setGradient(file: any) {
    var reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event : any) => {
      var src = event.target.result
      this.gradientName = file.name
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

  resetBackground() {
    this.backgroundName = this.defaultName
    this.parameters.texture.background = undefined
    this.parametersChange.emit(this.parameters)
  }

  selectBackground(input: any) {
    if (input.files && input.files[0]) {
      this.setBackground(input.files[0])
    }
  }
  
  onDropBackground(event: any)  {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.setBackground(files[0])
    }
  }
  
  dragOverBackground(event: any) {
    event.preventDefault();
    this.isHovering.background = true
  }

  dragLeaveBackground(event: any) {
    event.preventDefault();
    this.isHovering.background = false
  }

  setBackground(file: any) {
    var reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event : any) => {
      var src = event.target.result
      this.backgroundName = file.name
      this.shaderService.imageToTexture(this.shaderService.gl, src, (texture, w, h) => {
        if (this.parameters.texture) {
          this.parameters.texture.background = {
            texture: texture,
            width: w,
            height: h
          }
        } else {
          this.parameters.texture = {
            background: {
              texture: texture,
              width: w,
              height: h
            },
          }
        }
        this.parametersChange.emit(this.parameters)
      })
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event: KeyboardEvent) { 
  //   switch (event.key) {
  //     case ' ':
  //       this.togglePause()
  //       break
  //     case 'r':
  //       this.reset()
  //   }
  // }

  togglePause() {
    this.parameters.pause = !this.parameters.pause
  }

  reset() {
    this.parameters.pause = false
    this.parametersChange.emit(this.parameters)
  }
}
