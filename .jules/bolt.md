## 2024-03-13 - [Uint8Array for Image Masks]
**Learning:** Using `new Array(size)` with booleans for large canvases (e.g. 1920x1080) creates massive memory overhead due to non-contiguous object allocation in JS engines.
**Action:** Always prefer `Uint8Array` when building bitmaps or masking data for HTML5 Canvas applications to drastically reduce allocation time and memory consumption.
## 2024-03-22 - Canvas Masking Performance
**Learning:** `getImageData` and manual pixel iteration loops for masking (especially `maskPixels[i + 3] < 128` thresholding) are extremely slow and block the main thread for millions of iterations. `ctx.globalCompositeOperation = 'destination-in'` achieves the exact same result natively and instantly via GPU acceleration.
**Action:** Use native canvas `globalCompositeOperation` modes for blending and masking instead of manually iterating over pixel arrays.

## 2024-05-18 - Sequential Array Operations Bottleneck
**Learning:** Chaining multiple `.split()`, `.filter()`, and `.map()` calls on large arrays causes significant performance bottlenecks due to intermediate array allocations.
**Action:** When processing large collections, combine filtering and transformation operations into a single pass using a `for` loop to avoid creating intermediate arrays.

## 2024-05-19 - Efficient Filtering on Sorted Arrays
**Learning:** Using `.filter().slice()` on a pre-sorted array causes full array traversal and intermediate array creation, scaling O(n) which is slow for large datasets.
**Action:** Replace `.filter().slice()` on sorted arrays with a single `for` loop that uses `break` when thresholds or max size limits are reached, achieving O(min(n, limit)) and avoiding intermediate allocations.
