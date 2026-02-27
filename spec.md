# Specification

## Summary
**Goal:** Add the next small batch (up to 5) of discipline skills to the skill matrix in the backend and reflect them on the frontend Skills page.

**Planned changes:**
- Add up to 5 new discipline skills to the backend skill matrix in `main.mo`, each with all required fields (id, name, description, category, stat requirements, level requirement, unlock status defaults)
- Update `SkillsPage.tsx` to display the newly added skills in the correct category group, showing unlock requirements and status consistently with existing entries

**User-visible outcome:** The Skills page shows the new batch of discipline skills with their unlock requirements and status, while all existing skills and game state remain intact.
