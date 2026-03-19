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

## 2024-05-24 - Empty States Should Drive Action, Not Just Inform
**Learning:** Static instructions referring to off-screen UI elements (like "paste text in the sidebar", which is hidden on mobile) cause friction.
**Action:** Replace instructional text in empty states with context-aware, actionable buttons that either initiate the primary action immediately or navigate the user directly to where the action can be taken.

## 2024-06-25 - Empty State Continuity
**Learning:** When a toggle state (like a mobile sidebar) only works on small screens, primary CTAs that trigger it fail silently on desktop. Focusing the logical next input field provides a fallback that works universally and improves the flow.
**Action:** Always auto-focus the next logical input field when a CTA opens a panel or transitions states, especially if the visual state change might be hidden on certain viewports.

## 2024-06-25 - Character Counts on Limited Inputs
**Learning:** When text inputs have a maximum length (e.g., to prevent DoS or memory issues), silently enforcing the limit causes frustration when users don't know why their input was truncated.
**Action:** Always provide a visual character count indicator near constrained text inputs to clearly set expectations.
