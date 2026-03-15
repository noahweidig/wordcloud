## 2024-05-24 - Canvas Accessibility
**Learning:** HTML `<canvas>` elements are completely inaccessible to screen readers by default. Without a `role="img"` and an `aria-label`, assistive technologies either ignore them or read them as blank elements, leaving visually impaired users unaware of the core visualization.
**Action:** Always add `role="img"` and a descriptive `aria-label` (or fallback text content inside the tag) to data visualization canvases so screen reader users know what the component represents.

## 2024-05-24 - Focus Visible States
**Learning:** Many interactive elements like buttons don't have distinct `:focus-visible` styles, making keyboard navigation difficult.
**Action:** Ensure all buttons have a `:focus-visible` outline for keyboard users.

## 2024-03-14 - Replace Reactive Errors with Proactive States
**Learning:** This app originally used reactive error toast notifications ("Nothing to export yet. Generate a word cloud first.") when users clicked export buttons without an active canvas. This is a common pattern that causes unnecessary cognitive load.
**Action:** Replaced reactive errors with proactive disabled states on buttons (`disabled={!hasWords}`), along with helpful native tooltips explaining why the action is unavailable. Also applied this pattern to the "Clear" button when the text input is already empty. This makes the interface's current state immediately obvious without requiring trial and error.

## 2024-05-25 - Keyboard Shortcuts for Primary Actions
**Learning:** For primary text input forms, power users expect keyboard shortcuts (like Ctrl/Cmd + Enter) to trigger the primary action (like "Generate") so they don't have to switch to the mouse.
**Action:** Always add `onKeyDown` listeners to primary textareas for instant action submission via `Ctrl/Cmd + Enter`, and surface these shortcuts in button tooltips (`title` attribute) so users can discover them. Also add tooltips to explain disabled states when clear.
