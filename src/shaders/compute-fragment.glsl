# version 300 es
precision highp float;

uniform int u_Step;
uniform float u_Width;
uniform float u_Height;
uniform sampler2D u_Texture;
uniform sampler2D u_Background_Texture;

out vec4 o_FragColor;

const float dx = 1.0;
const float dy = 1.0;
const float dt = 0.7;
const float aCeil = 0.95 * 255.0;

void main() {
  vec2 readId = gl_FragCoord.xy;
  if (readId.x < 1.0 && u_Step <= 800) { // u_Step == 1
    // vec2 x = readId - vec2(u_Width / 3.0, u_Height / 2.0);
    // float v = 3.0 * exp(-0.001 * length(x) * length(x));
    float v = 0.7 * cos(float(u_Step) * 0.05);
    if (u_Step >= 800 - 2) {
      v = 0.0;
    }
    o_FragColor = vec4(v, 0.0, 0.0, 1.0);
  } else {
    vec4 background = texture(u_Background_Texture, readId / vec2(u_Width, u_Height));
    float a = background.a;

    vec2 middleId = readId / vec2(u_Width, u_Height);
    vec2 rightId = (readId + vec2(1, 0)) / vec2(u_Width, u_Height);
    vec2 leftId = (readId + vec2(-1, 0)) / vec2(u_Width, u_Height);
    vec2 topId = (readId + vec2(0, -1)) / vec2(u_Width, u_Height);
    vec2 bottomId = (readId + vec2(0, 1)) / vec2(u_Width, u_Height);

    vec4 middle = texture(u_Texture, middleId);
    vec4 border = vec4(middle.y, 0.0, 0.0 , 1.0);//vec4(0);//vec4(middle.x, 0.0, 0.0 , 1.0);//
    if (texture(u_Background_Texture, middleId).a > aCeil) {
      middle = border;
    }
    vec4 right = texture(u_Texture, rightId);
    if (readId.x >= u_Width - 2.0 || texture(u_Background_Texture, rightId).a > aCeil) {
      right = border;
    }
    vec4 left = texture(u_Texture, leftId);
    if (readId.x <= 1.0 || texture(u_Background_Texture, leftId).a > aCeil) {
      left = border;
    }
    vec4 top = texture(u_Texture, topId);
    if (readId.y <= 1.0 || texture(u_Background_Texture, topId).a > aCeil) {
      top = border;
    }
    vec4 bottom = texture(u_Texture, bottomId);
    if (readId.y >= u_Height - 2.0 || texture(u_Background_Texture, bottomId).a > aCeil) {
      bottom = border;
    }

    // bool isOnBoundary = readId.x >= u_Width - 2.0 || readId.x <= 1.0 || readId.y <= 1.0 || readId.y >= u_Height - 2.0;

    // laplacians
    float dfx = right.x - 2.0 * middle.x + left.x;
    float dfy = top.x - 2.0 * middle.x + bottom.x;
    float c = 1.0 - a;
    float newValue = c*c * (dfx / (dx * dx) + dfy / (dy * dy)) * dt*dt + 2.0 * middle.x - middle.y;
    o_FragColor = vec4(newValue, middle.x, middle.z + newValue * newValue, 1.0);
  }
}