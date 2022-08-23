export {};

declare global {
  interface SimulationParameters {
    discriminator: 'SimulationParametersDiscriminator',
     
    pause: boolean,
    nextFrame: number,
    forceAspectRatio: boolean,
    showGradient: boolean,
    LOD: number,
    energy: boolean,
    boundary: 0,
    initialCondition: {
      type: number,
      c1: number,
      c2: number,
      c3: number,
      c4: number,
    },
    aCeil: number,
    speedMultiplier: number,
    speedDivider: number
    texture?: {
      gradient?: {
        texture: WebGLTexture,
        src: string,
        name: string
      },
      background?: {
        texture: WebGLTexture,
        width: number,
        height: number,
        src: string,
        name: string
      }
    },
    test?: any
  }
}