# version 300 es
precision highp float;

uniform int u_Step;
uniform float u_Width;
uniform float u_Height;
uniform bool u_Energy;
uniform sampler2D u_Texture;
uniform sampler2D u_Background_Texture;
uniform sampler2D u_Gradient_Texture;

out vec4 o_FragColor;

void main() {
  vec4 values = texture(u_Texture, gl_FragCoord.xy / vec2(u_Width, u_Height));
  vec4 background = texture(u_Background_Texture, gl_FragCoord.xy / vec2(u_Width, u_Height));
  float currentValue;
  if (u_Energy) {
    currentValue = values.z / float(u_Step);
  } else {
    currentValue = (values.x + 1.0) / 2.0;
  }
  vec4 color = texture(u_Gradient_Texture, vec2(0.0, currentValue));
  float a = background.a;
  vec4 wallColor = vec4(0.1, 0.1, 0.3, 1.0);
  color = color * (1.0 - a) + wallColor * a;
  o_FragColor = vec4(color);
}