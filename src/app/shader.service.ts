import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShaderService {
  computeVertexSource = ""
  computeFragmentSource = ""
  renderVertexSource = ""
  renderFragmentSource = ""

  didInit = false
  onInit: Observable<any>

  constructor(private http: HttpClient) {
    this.onInit =  new Observable((observer) => {
      this.http.get("shaders/compute-vertex.glsl", {responseType: 'text'})
        .subscribe(res => {
          this.computeVertexSource = res
          this.http.get("shaders/render-vertex.glsl", {responseType: 'text'})
            .subscribe(res => {
              this.renderVertexSource = res
              this.http.get("shaders/render-fragment.glsl", {responseType: 'text'})
              .subscribe(res => {
                this.renderFragmentSource = res
                this.http.get("shaders/compute-fragment.glsl", {responseType: 'text'})
                  .subscribe(res => {
                    this.computeFragmentSource = res
                    this.didInit = true
                    observer.next(true)
                  })
              })
            })
        })
    })
  }

  public initShaderProgram(gl: any, vsSource: string, fsSource: string, transform_feedback_varyings: string[] | null = null): any {
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource)
    if (!vertexShader || !fragmentShader) {
      return null
    }

    const shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    if (transform_feedback_varyings != null) {
      gl.transformFeedbackVaryings(
        shaderProgram,
        transform_feedback_varyings,
        gl.INTERLEAVED_ATTRIBS)
    }  
    gl.linkProgram(shaderProgram) 

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram))
      // alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram))
      return null
    }

    return shaderProgram
  }

  public loadShader(gl: any, type: any, source: string): any {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader))
      // alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  }
}
