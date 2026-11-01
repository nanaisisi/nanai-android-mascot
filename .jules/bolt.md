## 2023-11-09 - [Performance Optimization]
**Learning:** `processChromaKey` is a hot path for image processing. Using `Uint32Array` instead of standard RGBA loop improves processing speed significantly in JS Canvas element. It handles big vs little endian correctly to not break tests. In addition, Promise.all can be used for drawing non-interfering layers in `composeSurfaceElements`.
**Action:** Always prefer `Uint32Array` when processing image data channel iteration in HTML5 Canvas Context. Use concurrent fetches when appropriate.

## 2024-05-23 - [Canvas Image Processing Optimization]
**Learning:** In `ui/js/surface/compositor/chromakey.js`, the PNA alpha mask application loop originally iterated over an 8-bit `Uint8ClampedArray` processing 4 channels per pixel individually. We can significantly improve the performance of this hot path by interpreting the underlying array buffer as a 32-bit `Uint32Array`. However, when doing so, it is crucial to handle byte endianness properly (little-endian vs big-endian) to correctly identify and manipulate the Alpha or Red channels.
**Action:** When manually applying per-pixel manipulation on HTML5 Canvas ImageData, cast the buffer to a `Uint32Array` for faster memory access and manipulation, but always implement an endianness check to ensure correct bitwise operations across different hardware architectures.
