import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ShaderService } from '../shader.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Input() parameters: any = {}
  @Output() parametersChange = new EventEmitter<any>()
  @Output() resetParameters = new EventEmitter<any>()

  defaultGradientName = "Blue White Red"
  defaultBackgroundName = "Lens"
  gradientName = this.defaultGradientName
  backgroundName = this.defaultBackgroundName
  isHovering: any = {
    gradient: false,
    background: false
  }
  
  frequency: string = "";
  setFrequency() {
    var x = +this.frequency;
    if (!isNaN(x)) {
      if (this.parameters.initialCondition.c4 != x) {
        this.parameters.initialCondition.c4 = x;
        this.parametersChange.emit(this.parameters)
        this.saveParameter()
      }
    }
  }

  duration: string = "";
  setDuration() {
    var x = +this.duration;
    if (!isNaN(x)) {
      if (this.parameters.initialCondition.c2 != x) {
        this.parameters.initialCondition.c2 = x;
        this.parametersChange.emit(this.parameters)
        this.saveParameter()
      }
    }
  }

  duration2: string = "";
  setDuration2() {
    var x = +this.duration2;
    if (!isNaN(x)) {
      if (this.parameters.initialCondition.c5 != x) {
        this.parameters.initialCondition.c5 = x;
        this.parametersChange.emit(this.parameters)
        this.saveParameter()
      }
    }
  }

  amplitude: string = "";
  setAmplitude() {
    var x = +this.amplitude;
    if (!isNaN(x)) {
      if (this.parameters.initialCondition.c3 != x) {
        this.parameters.initialCondition.c3 = x;
        this.parametersChange.emit(this.parameters)
        this.saveParameter()
      }
    }
  }

  x: string = "";
  setX() {
    var x = +this.x;
    if (!isNaN(x)) {
      if (this.parameters.initialCondition.c1 != x) {
        this.parameters.initialCondition.c1 = x;
        this.parametersChange.emit(this.parameters)
        this.saveParameter()
      }
    }
  }

  y: string = "";
  setY() {
    var x = +this.y;
    if (!isNaN(x)) {
      if (this.parameters.initialCondition.c2 != x) {
        this.parameters.initialCondition.c2 = x;
        this.parametersChange.emit(this.parameters)
        this.saveParameter()
      }
    }
  }

  constructor(private shaderService: ShaderService) { }

  ngOnInit(): void {
    // localStorage.removeItem("parameters")
    this.loadParameter()

  }

  saveParameter() {
    localStorage.setItem("parameters", JSON.stringify(this.parameters))
  }

  resetParameter() {
    if (confirm("Reset parameters to default?\nThis action cannot be undone.") == true) {
      this.resetParameters.emit(true)
    }
  }

  loadParameter() {
    const params = localStorage.getItem("parameters")
    if (params) {
      this.shaderService.onInit.subscribe(() => {
        const parameters: SimulationParameters = JSON.parse(params) // `{"pause":"false","nextFrame":0,"forceAspectRatio":true,"showGradient":true,"LOD":1,"energy":false,"boundary":0,"initialCondition":{"type":0,"c1":0,"c2":800,"c3":0.7,"c4":0.05},"aCeil":1,"speedMultiplier":1}`
        // parameters.test = {
        //   string: "string",
        //   number: 123.4,
        //   boolean: true
        // }
        this.parameters = parameters
        if (parameters.texture) {
          if (parameters.texture.gradient) {
            this.setGradientTexture(parameters.texture.gradient.src, parameters.texture.gradient.name)
          }
          if (parameters.texture.background) {
            this.setBackgroundTexture(parameters.texture.background.src, parameters.texture.background.name, true)
          }
        }
        // this.parametersChange.emit(parameters)
        this.initInitialConditionsParams()
      })
    } else {
      this.initInitialConditionsParams()
    }
  }

  initInitialConditionsParams() {
    this.frequency = `${this.parameters.initialCondition.c4}`
    this.duration = `${this.parameters.initialCondition.c2}`
    this.amplitude = `${this.parameters.initialCondition.c3}`
    this.x = `${this.parameters.initialCondition.c1}`
    this.y = `${this.parameters.initialCondition.c2}`
    this.duration2 = `${this.parameters.initialCondition.c5}`

    this.setFrequency()
    this.setDuration()
    this.setAmplitude()
    this.setX()
    this.setY()
    this.setDuration2()
  }

  blur() {
    (document.activeElement as HTMLElement).blur();
    window.onblur = function () {
      (document.activeElement as HTMLElement).blur();
    };
  }

  resetGradient() {
    this.gradientName = this.defaultGradientName
    delete this.parameters.texture.gradient
    this.parameters.nextFrame++
    this.saveParameter()
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
    this.isHovering.gradient = false
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
      this.setGradientTexture(src, file.name)
    }
  }

  setGradientTexture(src: string, name: string) {
    this.gradientName = name
    this.shaderService.imageToTexture(this.shaderService.gl, src, texture => {
      if (this.parameters.texture) {
        this.parameters.texture.gradient = {
          texture: texture,
          src: src,
          name: name
        }
      } else {
        this.parameters.texture = {
          gradient: {
            texture: texture,
            src: src,
            name: name
          }
        }
      }
      this.parameters.nextFrame++
      this.saveParameter()
    })
  }

  resetBackground() {
    this.backgroundName = this.defaultBackgroundName
    if (this.parameters.texture && this.parameters.texture.background) {
      delete this.parameters.texture.background
      this.parametersChange.emit(this.parameters)
    }
    this.saveParameter()
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
    this.isHovering.background = false
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
      this.setBackgroundTexture(src, file.name)
    }
  }

  setBackgroundTexture(src: string, name: string, reset: boolean = true) {
    this.backgroundName = name
    this.shaderService.imageToTexture(this.shaderService.gl, src, (texture, w, h) => {
      if (this.parameters.texture) {
        this.parameters.texture.background = {
          texture: texture,
          width: w,
          height: h,
          src: src,
          name: name
        }
      } else {
        this.parameters.texture = {
          background: {
            texture: texture,
            width: w,
            height: h,
            src: src,
            name: name
          },
        }
      }
      if (reset) {
        this.parametersChange.emit(this.parameters)
        this.saveParameter()
      }
    })
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

  nextFrame() {
    this.parameters.nextFrame += 5
  }

  toggleEnergy() {
    this.parameters.energy = !this.parameters.energy
    this.parameters.nextFrame++
    this.saveParameter()
  }

  setInitialCondition(event: any) {
    if (+event != this.parameters.initialCondition.type) {
      switch (+event) {
        case 0:
          this.parameters.initialCondition = {
            type: 0,
            c1: 0,
            c2: 800,
            c3: 0.7,
            c4: 0.05
          }
          this.parametersChange.emit(this.parameters)
          break;
        case 1:
          this.parameters.initialCondition = {
            type: 1,
            c1: 0.5,
            c2: 0.5,
            c3: 10,
            c4: 1
          }
          this.parametersChange.emit(this.parameters)
          break;
        case 2:
          this.parameters.initialCondition = {
            type: 2,
            c1: 0.5,
            c2: 0.5,
            c3: 10,
            c4: 0.04,
            c5: 1000
          }
          this.parametersChange.emit(this.parameters)
          break;
        case 3:
          this.parameters.initialCondition = {
            type: 3,
            c1: 0,
            c2: 0,
            c3: 10,
            c4: 1,
            c5: 0
          }
          this.parametersChange.emit(this.parameters)
          break;
      }
    }
    this.saveParameter()
  }
}
