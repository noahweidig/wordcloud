## 2024-03-13 - [Uint8Array for Image Masks]
**Learning:** Using `new Array(size)` with booleans for large canvases (e.g. 1920x1080) creates massive memory overhead due to non-contiguous object allocation in JS engines.
**Action:** Always prefer `Uint8Array` when building bitmaps or masking data for HTML5 Canvas applications to drastically reduce allocation time and memory consumption.
## 2024-03-22 - Canvas Masking Performance
**Learning:** `getImageData` and manual pixel iteration loops for masking (especially `maskPixels[i + 3] < 128` thresholding) are extremely slow and block the main thread for millions of iterations. `ctx.globalCompositeOperation = 'destination-in'` achieves the exact same result natively and instantly via GPU acceleration.
**Action:** Use native canvas `globalCompositeOperation` modes for blending and masking instead of manually iterating over pixel arrays.
