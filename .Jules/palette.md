## 2024-05-24 - Canvas Accessibility
**Learning:** HTML `<canvas>` elements are completely inaccessible to screen readers by default. Without a `role="img"` and an `aria-label`, assistive technologies either ignore them or read them as blank elements, leaving visually impaired users unaware of the core visualization.
**Action:** Always add `role="img"` and a descriptive `aria-label` (or fallback text content inside the tag) to data visualization canvases so screen reader users know what the component represents.

## 2024-05-24 - Focus Visible States
**Learning:** Many interactive elements like buttons don't have distinct `:focus-visible` styles, making keyboard navigation difficult.
**Action:** Ensure all buttons have a `:focus-visible` outline for keyboard users.
