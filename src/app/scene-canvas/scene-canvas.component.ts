import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ShaderService } from '../shader.service';

@Component({
  selector: 'app-scene-canvas',
  templateUrl: './scene-canvas.component.html',
  styleUrls: ['./scene-canvas.component.css']
})
export class SceneCanvasComponent implements OnInit {
  @ViewChild('glCanvas') public canvas!: ElementRef

  @Input() parameters: any = {};
  canvasWidthOffset = '270px'
  textureOffset = 0
  step = 0
  reset = false
  didInit: boolean = false
  buffers: any
  textures: any
  touch = {
    active: false,
    position: [0, 0]
  }

  get gradientSrc(): string {
    if (this.parameters.texture && this.parameters.texture.gradient) {
      return this.parameters.texture.gradient.src
    } else {
      return "/assets/images/grad.png"
    }
  }

  get canvasSize() {
    var height = "100vh"
    var width = ""
    if (this.parameters.texture && this.parameters.texture.background && this.parameters.forceAspectRatio) {
      var w = this.parameters.texture.background.width
      var h = this.parameters.texture.background.height
      width = `calc(100% - ${this.canvasWidthOffset})`
      return `left: ${this.canvasWidthOffset}; max-width: ${width}; max-height: ${height}; aspect-ratio: ${w / h}; object-fit: contain`
    } else {
      width = `calc(100% - ${this.canvasWidthOffset})`
      if (this.parameters.forceAspectRatio) {
        return `left: ${this.canvasWidthOffset}; max-width: ${width}; max-height: ${height}; aspect-ratio: 3 / 2; object-fit: contain`
      } else {
        return `left: ${this.canvasWidthOffset}; width: ${width}; height: ${height}`
      }
    }
  }

  constructor(private shaderService: ShaderService) { 
    shaderService.onInit.subscribe((val) => {
      if (this.didInit) {
        this.main()
      }
    })
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.shaderService.didInit && !this.didInit) {
      this.main()
    }
    this.didInit = true

    var canvas = this.canvas.nativeElement;
    canvas.addEventListener('pointerup', (event: any) => {
      this.touch.active = true
      this.touch.position = [event.offsetX / canvas.clientWidth, 1 - event.offsetY / canvas.clientHeight]
    }, false)
    canvas.addEventListener('contextmenu', (ev: any) => {
      ev.preventDefault();
    });
  }

  public initialize = () => {
    if (this.shaderService.didInit) {
      this.reset = true
    }
  }

  public toggleFullScreen = (state: boolean) => {
    this.canvasWidthOffset = state ? '0px' : '270px'
    setTimeout(() => this.initialize(), 310)
  }

  main(): void {
    const gl = this.canvas.nativeElement.getContext("webgl2")
    this.shaderService.gl = gl
    gl.getExtension("EXT_color_buffer_float")
    if (gl === null) {
      console.error("Unable to initialize WebGL")
      alert("Unable to initialize WebGL. Your browser or machine may not support it.")
      return
    }
    this.buffers = this.initBuffers(gl)
    this.textures = this.initTextures(gl, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
    const computeShaderProgram = this.shaderService.initShaderProgram(gl, this.shaderService.computeVertexSource, this.shaderService.computeFragmentSource)
    const renderShaderProgram = this.shaderService.initShaderProgram(gl, this.shaderService.renderVertexSource, this.shaderService.renderFragmentSource)
    
    const programInfo = {
      computeProgram: computeShaderProgram,
      renderProgram: renderShaderProgram,
      uniformLocations: {
        compute: {
          step: gl.getUniformLocation(computeShaderProgram, 'u_Step'),
          width: gl.getUniformLocation(computeShaderProgram, 'u_Width'),
          height: gl.getUniformLocation(computeShaderProgram, 'u_Height'),
          boundary: gl.getUniformLocation(computeShaderProgram, 'u_Boundary'),
          initialCondition: gl.getUniformLocation(computeShaderProgram, 'u_InitCondition'),
          c1: gl.getUniformLocation(computeShaderProgram, 'c1'),
          c2: gl.getUniformLocation(computeShaderProgram, 'c2'),
          c3: gl.getUniformLocation(computeShaderProgram, 'c3'),
          c4: gl.getUniformLocation(computeShaderProgram, 'c4'),
          c5: gl.getUniformLocation(computeShaderProgram, 'c5'),
          aCeil: gl.getUniformLocation(computeShaderProgram, 'aCeil'),
          speedMultiplier: gl.getUniformLocation(computeShaderProgram, 'u_SpeedMultiplier'),
          texture: gl.getUniformLocation(computeShaderProgram, 'u_Texture'),
          backgroundTexture: gl.getUniformLocation(computeShaderProgram, 'u_Background_Texture'),
          LOD: gl.getUniformLocation(computeShaderProgram, 'u_LOD'),
          touchIsActive: gl.getUniformLocation(computeShaderProgram, 'u_touchIsActive'),
        },
        render: {
          step: gl.getUniformLocation(renderShaderProgram, 'u_Step'),
          width: gl.getUniformLocation(renderShaderProgram, 'u_Width'),
          height: gl.getUniformLocation(renderShaderProgram, 'u_Height'),
          energy: gl.getUniformLocation(renderShaderProgram, 'u_Energy'),
          texture: gl.getUniformLocation(renderShaderProgram, 'u_Texture'),
          backgroundTexture: gl.getUniformLocation(renderShaderProgram, 'u_Background_Texture'),
          gradientTexture: gl.getUniformLocation(renderShaderProgram, 'u_Gradient_Texture')
        }
      },
      attribLocations: {
        render: {
          vertexPosition: gl.getAttribLocation(renderShaderProgram, 'i_VertexPosition')
        },
        compute: {
          vertexPosition: gl.getAttribLocation(renderShaderProgram, 'i_VertexPosition')
        }
      }
    }

    this.step = 0
    var renders = 0
    var render = (time: number) => {
      if (this.reset) {
        this.reset = false
        this.main()
      } else {
        if ((!this.parameters.pause && renders % this.parameters.speedDivider == 0) || this.parameters.nextFrame > 0) {
          // var n = 3
          // if (this.parameters.LOD == 2) {
          //   n = 2
          // } else if (this.parameters.LOD > 2) {
          //   n = 1
          // }
          this.drawScene(gl, programInfo, 3); // * this.parameters.speedMultiplier
          if (this.parameters.nextFrame > 0) {
            this.parameters.nextFrame--
          }
        }
        requestAnimationFrame(render);
      }
      renders++
    }
    requestAnimationFrame(render)

    const resizeCanvas = () => {
      var ratio: number = this.canvas.nativeElement.clientWidth / this.canvas.nativeElement.clientHeight
      if (this.parameters.texture && this.parameters.texture.background) {
        if (this.parameters.forceAspectRatio) {
          this.canvas.nativeElement.width = this.parameters.texture.background.width / this.parameters.LOD
          this.canvas.nativeElement.height = this.parameters.texture.background.height / this.parameters.LOD
        } else {
          this.canvas.nativeElement.width = this.parameters.texture.background.width / this.parameters.LOD
          this.canvas.nativeElement.height = (this.parameters.texture.background.width / ratio) / this.parameters.LOD
        }
      } else {
        if (this.parameters.forceAspectRatio) {
          this.canvas.nativeElement.width = 3000 / this.parameters.LOD
          this.canvas.nativeElement.height = 2000 / this.parameters.LOD
        } else {
          this.canvas.nativeElement.width = 3000 / this.parameters.LOD
          this.canvas.nativeElement.height = (2000 / ratio) / this.parameters.LOD
        }
      }
      
      this.textures = this.initTextures(gl, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
      this.step = 0
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      this.parameters.pause = false
      this.drawScene(gl, programInfo)
    }
    window.removeEventListener('resize', () => {})
    window.addEventListener('resize', resizeCanvas, false)
    resizeCanvas()
  }

  initBuffers(gl: WebGL2RenderingContext) {
    var positions: number[] = [1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
      -1.0, -1.0]
    const corners = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, corners)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    return {
      corners: corners
    }
  }

  initTextures(gl: WebGL2RenderingContext, width: number, height: number) {
    var textures = []
    var frameBuffers = []
    for (let i = 0; i < 2; i++) {
      const targetTexture = gl.createTexture();
      textures.push(targetTexture)
      gl.bindTexture(gl.TEXTURE_2D, targetTexture);

      const level = 0;
      const internalFormat = gl.RGBA32F;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.FLOAT;
      const data = null;
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    width, height, border,
                    format, type, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const fb = gl.createFramebuffer();
      frameBuffers.push(fb)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.viewport(0, 0, width, height)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, level);
    }

    this.shaderService.imageToTexture(gl, "/assets/images/lens.png", texture => {
      this.textures.background = texture
    })

    this.shaderService.imageToTexture(gl, "/assets/images/grad.png", texture => {
      this.textures.gradient = texture
    })

    return {
      textures: textures,
      frameBuffers: frameBuffers
    }
  }

  drawScene(gl: WebGL2RenderingContext, programInfo: any, iterations: number = 1) {
    for (let i = 0; i < iterations; i++) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clearDepth(1.0)
      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      gl.useProgram(programInfo.computeProgram)
      gl.uniform1i(programInfo.uniformLocations.compute.step, this.step)
      gl.uniform1f(programInfo.uniformLocations.compute.width, gl.canvas.width)
      gl.uniform1f(programInfo.uniformLocations.compute.height, gl.canvas.height)
      gl.uniform1i(programInfo.uniformLocations.compute.boundary, this.parameters.boundary)
      gl.uniform1i(programInfo.uniformLocations.compute.initialCondition, this.parameters.initialCondition.type)
      if (this.parameters.initialCondition.c1 != undefined) {
        gl.uniform1f(programInfo.uniformLocations.compute.c1, this.parameters.initialCondition.c1)
      }
      if (this.parameters.initialCondition.c2 != undefined) {
        gl.uniform1f(programInfo.uniformLocations.compute.c2, this.parameters.initialCondition.c2)
      }
      if (this.parameters.initialCondition.c3 != undefined) {
        gl.uniform1f(programInfo.uniformLocations.compute.c3, this.parameters.initialCondition.c3)
      }
      if (this.parameters.initialCondition.c4 != undefined) {
        gl.uniform1f(programInfo.uniformLocations.compute.c4, this.parameters.initialCondition.c4)
      }
      if (this.parameters.initialCondition.c5 != undefined) {
        gl.uniform1f(programInfo.uniformLocations.compute.c5, this.parameters.initialCondition.c5)
      }
      if (this.parameters.initialCondition.type == 3) {
        gl.uniform1f(programInfo.uniformLocations.compute.touchIsActive, this.touch.active ? 1 : 0)
        gl.uniform1f(programInfo.uniformLocations.compute.c1, this.touch.position[0])
        gl.uniform1f(programInfo.uniformLocations.compute.c2, this.touch.position[1])
      }
      gl.uniform1f(programInfo.uniformLocations.compute.aCeil, this.parameters.aCeil)
      gl.uniform1f(programInfo.uniformLocations.compute.speedMultiplier, this.parameters.speedMultiplier)
      gl.uniform1i(programInfo.uniformLocations.compute.texture, 0);
      gl.uniform1i(programInfo.uniformLocations.compute.backgroundTexture, 1);
      gl.uniform1f(programInfo.uniformLocations.compute.LOD, this.parameters.LOD)
      {
        const numComponents = 2
        const type = gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.corners)
        gl.vertexAttribPointer(
          programInfo.attribLocations.compute.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset)
        gl.enableVertexAttribArray(programInfo.attribLocations.compute.vertexPosition)
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.textures.frameBuffers[(this.textureOffset + 1) % 2])
      // gl.bindTexture(gl.TEXTURE_2D, this.textures.textures[(this.textureOffset) % 2])
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.textures[(this.textureOffset) % 2]);
      gl.activeTexture(gl.TEXTURE1);
      var backgroundTexture = this.textures.background
      if (this.parameters.texture && this.parameters.texture.background) {
        backgroundTexture = this.parameters.texture.background.texture
      }
      gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      gl.useProgram(programInfo.renderProgram)
      gl.uniform1i(programInfo.uniformLocations.render.step, this.step)
      gl.uniform1f(programInfo.uniformLocations.render.width, gl.canvas.width)
      gl.uniform1f(programInfo.uniformLocations.render.height, gl.canvas.height)
      gl.uniform1i(programInfo.uniformLocations.render.energy, this.parameters.energy ? 1 : 0)
      gl.uniform1i(programInfo.uniformLocations.render.texture, 0);
      gl.uniform1i(programInfo.uniformLocations.render.backgroundTexture, 1);
      gl.uniform1i(programInfo.uniformLocations.render.gradientTexture, 2);
      {
        const numComponents = 2
        const type = gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.corners)
        gl.vertexAttribPointer(
          programInfo.attribLocations.render.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset)
        gl.enableVertexAttribArray(programInfo.attribLocations.compute.vertexPosition)
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.textures[(this.textureOffset + 1) % 2]);
      gl.activeTexture(gl.TEXTURE1);
      var backgroundTexture = this.textures.background
      if (this.parameters.texture && this.parameters.texture.background) {
        backgroundTexture = this.parameters.texture.background.texture
      }
      gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
      gl.activeTexture(gl.TEXTURE2);
      var gradientTexture = this.textures.gradient
      if (this.parameters.texture && this.parameters.texture.gradient) {
        gradientTexture = this.parameters.texture.gradient.texture
      }
      gl.bindTexture(gl.TEXTURE_2D, gradientTexture);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      this.textureOffset += 1
      this.step += 1
      this.touch.active = false
    }
  } 
}
