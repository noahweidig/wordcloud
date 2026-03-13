## 2024-03-13 - [Uint8Array for Image Masks]
**Learning:** Using `new Array(size)` with booleans for large canvases (e.g. 1920x1080) creates massive memory overhead due to non-contiguous object allocation in JS engines.
**Action:** Always prefer `Uint8Array` when building bitmaps or masking data for HTML5 Canvas applications to drastically reduce allocation time and memory consumption.
