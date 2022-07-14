# version 300 es
precision highp float;

uniform sampler2D u_Texture;

in vec4 i_VertexPosition;

void main() {
  gl_Position = i_VertexPosition;
}