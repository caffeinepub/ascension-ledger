# Specification

## Summary
**Goal:** Add a rank display box to the Dashboard that shows the user's current rank, styled similarly to the existing level display box.

**Planned changes:**
- Add a new rank display box component on the Dashboard page, placed adjacent to the existing level box
- Use the existing `getRank` function from `rankUtils.ts` to derive the rank label and color from the user's current level
- Style the rank box to match the visual appearance (card shape, sizing, typography) of the level display box
- Display the rank label text colored with the corresponding rank color from `rankUtils.ts`

**User-visible outcome:** Users can see their current rank (e.g., "E Rank", "Shadow Monarch") displayed in a styled box on the Dashboard, next to the level box, with the rank label colored according to their rank tier.
