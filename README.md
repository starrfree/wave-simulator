# Wave Simulator

[Wave Simulator](https://wavesimulator.starfree.app) is a web app that allows you to simulate 2D waves in your browser.
<br>Simply choose a background image, a color gradient and tweak the different parameters, then start the simulation and let the app simulate the wave.

https://user-images.githubusercontent.com/98308569/186477567-ce8e010d-3b65-49e4-96be-27e33a91a427.mp4

| | |
| --- | --- |
| <img width="640" alt="lens" src="https://user-images.githubusercontent.com/98308569/186478581-bb9ff162-330f-4024-81e1-6a9e98c71a95.png"> | <img width="640" alt="double slit" src="https://user-images.githubusercontent.com/98308569/186478595-a563e027-26ad-4f1e-9ed8-86faa22b7a87.png"> |
| <img width="640" alt="ellipse" src="https://user-images.githubusercontent.com/98308569/186479520-8a8f3baa-4e8f-4f1e-9aca-966e6f86962c.png"> | <img width="640" alt="parabolla" src="https://user-images.githubusercontent.com/98308569/186478601-7b86e228-2a35-4da0-aadc-ea3255063eaa.png"> |

The simulation is done by numerically solving the wave equation:
### $\nabla^2u - \frac{1}{c^2}\frac{\partial^2u}{\partial t^2} = 0$
where **u** is the wave function.
<br>
<br>
It uses this formula to compute the second deriviative:
### $f''(x) \approx \frac{f(x+h) - 2 f(x) + f(x-h)}{h^{2}}$

The simulation is performed on every pixel at each frame using WebGL: a JavaScript API for GPU-accelerated processing.

---

The following is the documentation of [Wave Simulator](https://wavesimulator.starfree.app):

## Background image

This image defines the behaviour of the wave throughout the canvas. At any given point, if the alpha value is greater than the [alpha threshold](https://github.com/starrfree/wave-simulator#alpha-threshold), the value is set to zero (acting like a wall).
Otherwise, if the alpha value is smaller than the [alpha threshold](https://github.com/starrfree/wave-simulator#alpha-threshold), the alpha value dictates the speed of the wave. For example, if the alpha value of a pixel is `0.5` and the [alpha threshold](https://github.com/starrfree/wave-simulator#alpha-threshold) is `1.0`, the wave will be 2 times slower in that pixel.
<br>This image can be created using a vector graphics software.
<br>
- Download an example image: *click on Background > File > Download Example*
- Use your own files: *click on Background > File > Open*

## Gradient image

This image defines the color of the simulated wave. The color is read from top to bottom.
<br>If [average energy](https://github.com/starrfree/wave-simulator#average-energy) is set to false, the range is `-1.0` to `1.0`,
<br>Otherwise, if [average energy](https://github.com/starrfree/wave-simulator#average-energy) is set to true, the range is `0.0` to `1.0`
<br>
- Download an example image: *click on Gradient > File > Download Example*
- Use your own files: *click on Gradient > File > Open*

## Average energy

This checkbox controls whether the app displays the value of the wave or the average energy carried by the wave (average of its squared value).

## Boundary conditions

It controls the way the wave interacts with the boundary of the canvas by setting a virtual value outside the canvas.

| Condition | Virtual value |
| --------- | ------------- |
| **Absorb**  | equal to the previous value of the wave at the neighbour pixel |
| **Reflect** | equal to the value of the wave at the neighbour pixel |
| **Zero**    | `0.0` |


## Alpha threshold

This slider controls the alpha threshold, i.e. any pixel with an alpha value greater than this is considered a wall.
<br>This can prevent antialiasing on images to cause unwanted behaviour such as the wave looking like it's emitted from a wall (see video bellow).

https://user-images.githubusercontent.com/98308569/186481053-4528f4a0-6ea2-4afa-a929-e3b4564a3f39.mp4

## Keep aspect ratio

This checkbox controls whether the simulation canvas keeps the same aspect ratio as the [background image](https://github.com/starrfree/wave-simulator#background-image).

## Show gradient legend

This checkbox controls whether the gradient legend is shown on the bottom right of the canvas.

## Level of detail

It controls the pixel density of the simulation, i.e. the size of a simulation pixel compared to the [background image](https://github.com/starrfree/wave-simulator#background-image) pixels.
<br>**This parameter is only available on desktop (not mobile).**

| LOD | simulation pixels per background pixel |
| --------- | ------------- |
| **High**  | `1` |
| **Medium** | `2` |
| **Low**    | `2.8` |

## Speed

Controls the speed of the simulation (by skipping frames).

| Speed | frames skipped |
| --------- | ------------- |
| **Max**  | `O` |
| **Medium** | `3` |
| **Slow**    | `8` |


## Initial conditions

Defines the way the wave is created. There are four types:

<details>
<summary>Plane wave</summary>
This creates a sinusoidal plane wave by forcing the edge pixels to have an oscillating value.

### Direction
Controls the edge from which the wave comes from.

### Duration
Controls the duration of the oscillation, in frames.

### Frequency
Controls the frequency of the oscillation.

### Amplitude
Controls the amplitude of the oscillation.
</details>

<details>
<summary>Pulse</summary>
This creates a pulse by setting the value of the wave at frame zero to a Gaussian function.

### Shape
Controls the shape of the pulse:
- **Circular**: the Gaussian function depends on the distance to the center
- **Vertical**: the Gaussian function depends on the x position of the pixel
- **Horizontal**: the Gaussian function depends on the y position of the pixel

### Position
Controls the position of the center of the Gaussian function.
<br>`(x, y) = (0.0, 0.0)` is bottom left.
<br>`(x, y) = (1.0, 1.0)` is top right.

### Amplitude
Controls the amplitude of the Gaussian function.

### Frequency
Controls how much the Gaussian function is spread. Higher value results in a less spread wave.
</details>

<details>
<summary>Spherical wave</summary>
This creates a sinusoidal spherical wave by forcing the center pixel to have an oscillating value.

### Position
Controls the position of the center pixel.
<br>`(x, y) = (0.0, 0.0)` is bottom left.
<br>`(x, y) = (1.0, 1.0)` is top right.

### Duration
Controls the duration of the oscillation, in frames.

### Frequency
Controls the frequency of the oscillation.

### Amplitude
Controls the amplitude of the oscillation.
</details>

<details>
<summary>Interactive pulse</summary>
This adds a pulse to the wave where you click.
A pulse is a Gaussian function shaped wave.

### Shape
Controls the shape of the pulse:
- **Circular**: the Gaussian function depends on the distance to the click
- **Vertical**: the Gaussian function depends on the x position of the pixel
- **Horizontal**: the Gaussian function depends on the y position of the pixel

### Amplitude
Controls the amplitude of the Gaussian function.

### Frequency
Controls how much the Gaussian function is spread. Higher value results in a less spread wave.
</details>
