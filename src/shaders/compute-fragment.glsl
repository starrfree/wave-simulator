# version 300 es
precision highp float;

uniform int u_Step;
uniform float u_Width;
uniform float u_Height;
uniform int u_Boundary;
uniform int u_InitCondition;
uniform float c1;
uniform float c2;
uniform float c3;
uniform float c4;
uniform float c5;
uniform float aCeil;
uniform float u_SpeedMultiplier;
uniform sampler2D u_Texture;
uniform sampler2D u_Background_Texture;
uniform float u_LOD;
uniform bool u_touchIsActive;

out vec4 o_FragColor;

const float dx = 1.0;
const float dy = 1.0;
const float dt = 0.7;

void main() {
  vec2 readId = gl_FragCoord.xy;
  // float frame = float(u_Step);
  // float x = readId.x;
  // float y = readId.y;
  // float w = u_Width;
  // float h = u_Height;
  // if (readId.x < 1.0 && u_Step <= 800) { // u_Step == 1
  //   // vec2 x = readId - vec2(u_Width / 1.5, u_Height / 2.0);
  //   // float v = 10.0 * exp(-0.001 * length(x) * length(x));
  //   float v = 0.7 * cos(float(u_Step) * 0.05);
  //   if (u_Step >= 800 - 2) {
  //     v = 0.0;
  //   }
  //   o_FragColor = vec4(v, v, 0.0, 1.0);
  // }
  bool isInitCondition = false;
  switch (u_InitCondition) {
    case 0:
      bool pos;
      if (int(c1) == 0) {
        pos = readId.x < 1.0;
      } else if (int(c1) == 1) {
        pos = readId.y < 1.0;
      } else if (int(c1) == 2) {
        pos = readId.x > u_Width - 2.0;
      } else if (int(c1) == 3) {
        pos = readId.y > u_Height - 2.0;
      }
      isInitCondition = pos && u_Step <= int(c2 / u_LOD);
      if (isInitCondition) {
        float v = c3 * cos(float(u_Step) * c4 * u_LOD);
        if (u_Step >= int(c2 / u_LOD) - 2) {
          v = 0.0;
        }
        o_FragColor = vec4(v, v, 0.0, 1.0);
      }
      break;
    case 1:
      isInitCondition = u_Step == 0;
      if (isInitCondition) {
        vec2 x = readId - vec2(c1, c2) * vec2(u_Width, u_Height);
        float v = c3 * exp(-0.001 * c4 * u_LOD * length(x) * length(x));
        o_FragColor = vec4(v, v, 0.0, 1.0);
      }
      break;
    case 2:
      vec2 x = readId - vec2(c1, c2) * vec2(u_Width, u_Height);
      isInitCondition = length(x) < 1.0 && u_Step <= int(c5 / u_LOD);
      if (isInitCondition) {
        float v = c3 * cos(float(u_Step) * c4 * u_LOD);
        if (u_Step >= int(c5 / u_LOD) - 2) {
          v = 0.0;
        }
        o_FragColor = vec4(v, v, 0.0, 1.0);
      }
      break;
  }
  if (!isInitCondition) {
    vec4 background = texture(u_Background_Texture, readId / vec2(u_Width, u_Height));
    float a = background.a;

    vec2 middleId = readId / vec2(u_Width, u_Height);
    vec2 rightId = (readId + vec2(1, 0)) / vec2(u_Width, u_Height);
    vec2 leftId = (readId + vec2(-1, 0)) / vec2(u_Width, u_Height);
    vec2 topId = (readId + vec2(0, -1)) / vec2(u_Width, u_Height);
    vec2 bottomId = (readId + vec2(0, 1)) / vec2(u_Width, u_Height);

    vec4 middle = texture(u_Texture, middleId);
    vec4 border;
    switch (u_Boundary) {
      case 0:
        border = vec4(middle.y, 0.0, 0.0 , 1.0);
        break;
      case 1:
        border = vec4(middle.x, 0.0, 0.0 , 1.0);
        break;
      case 2:
        border = vec4(0);
    }
    if (texture(u_Background_Texture, middleId).a > aCeil) {
      middle = vec4(0.0);
    }
    vec4 right = texture(u_Texture, rightId);
    if (readId.x >= u_Width - 2.0) {
      right = border;
    }
    if (texture(u_Background_Texture, rightId).a > aCeil) {
      right = vec4(0.0);
    }
    vec4 left = texture(u_Texture, leftId);
    if (readId.x <= 1.0) {
      left = border;
    }
    if (texture(u_Background_Texture, leftId).a > aCeil) {
      left = vec4(0.0);
    }
    vec4 top = texture(u_Texture, topId);
    if (readId.y <= 1.0) {
      top = border;
    }
    if (texture(u_Background_Texture, topId).a > aCeil) {
      top = vec4(0.0);
    }
    vec4 bottom = texture(u_Texture, bottomId);
    if (readId.y >= u_Height - 2.0) {
      bottom = border;
    }
    if (texture(u_Background_Texture, bottomId).a > aCeil) {
      bottom = vec4(0.0);
    }

    // bool isOnBoundary = readId.x >= u_Width - 2.0 || readId.x <= 1.0 || readId.y <= 1.0 || readId.y >= u_Height - 2.0;

    // laplacians
    float dfx = right.x - 2.0 * middle.x + left.x;
    float dfy = top.x - 2.0 * middle.x + bottom.x;

    // speed
    float c = 1.0 - a;

    // wave equation
    float newValue = c*c * (dfx / (dx * dx) + dfy / (dy * dy)) * dt*dt + 2.0 * middle.x - middle.y;

    float offsetValue = 0.0;
    if (u_InitCondition == 3 && u_touchIsActive) {
      vec2 x;
      if (int(c5) == 0) {
        x = readId - vec2(c1, c2) * vec2(u_Width, u_Height);
      } else if (int(c5) == 1) {
        x = vec2(readId.x - c1 * u_Width, 0.0);
      } else if (int(c5) == 2) {
        x = vec2(0.0, readId.y - c2 * u_Height);
      } else {
        x = vec2(0.0, 0.0);
      }
      float l = length(x);
      offsetValue = c3 * exp(-0.001 * c4 * u_LOD * l*l);
      if (int(c5) == 1 || int(c5) == 2) {
        offsetValue = offsetValue / 5.0;
      }
    }
    newValue = newValue + offsetValue;
    o_FragColor = vec4(newValue, middle.x + offsetValue, middle.z + newValue * newValue, 1.0);
  }
}