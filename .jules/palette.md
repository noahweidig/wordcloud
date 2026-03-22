## 2025-03-21 - Focus: Highlight "Upload .txt" Button
**Learning:** Actionable secondary buttons (like "Upload .txt") that reside next to destructive buttons (like "Clear") can blend in and be overlooked if they share the exact same styling. Applying a subtle focus ring or highlight border helps differentiate them.
**Action:** Created a `.btn-highlight` utility class in `App.css` adding a primary border and box-shadow ring, and applied it to the "Upload .txt" button. Also added an `aria-label` for screen readers.
