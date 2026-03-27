## 2025-03-21 - Focus: Highlight "Upload .txt" Button
**Learning:** Actionable secondary buttons (like "Upload .txt") that reside next to destructive buttons (like "Clear") can blend in and be overlooked if they share the exact same styling. Applying a subtle focus ring or highlight border helps differentiate them.
**Action:** Created a `.btn-highlight` utility class in `App.css` adding a primary border and box-shadow ring, and applied it to the "Upload .txt" button. Also added an `aria-label` for screen readers.

## 2024-03-27 - Palette: Explicit Label-Input Associations for a11y
**Learning:** In complex configuration panels like `ControlPanel.tsx`, text labels (e.g., `<label><span>Min frequency</span></label>`) visually represent the adjacent inputs but are essentially "dead" to screen readers and clicks if they lack an explicit `htmlFor` attribute that points to the input's `id`.
**Action:** Always add unique `id` attributes to inputs and `htmlFor` to their wrapping or adjacent labels. This small semantic change provides a massive accessibility win: it correctly announces the control type/value to assistive tech and increases the clickable hit area for mouse/touch users.
