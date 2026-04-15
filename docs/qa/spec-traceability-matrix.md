# Spec Traceability Matrix Template

Use this matrix for each change before final archive.

## Metadata

- Change:
- Spec version/date:
- QA owner:
- Test run date:

## Matrix

| Requirement | Scenario | Test Layer | Automated Test ID / File | Manual Check Ref | Evidence (artifact/link) | Status |
|-------------|----------|------------|---------------------------|------------------|--------------------------|--------|
| Example: Global Section Tracking | User scrolls down smoothly | E2E | `e2e/navigation.behavior.spec.ts` | M-01 | Playwright HTML report | ✅ |
| Example: Semantic Navigation | Keyboard and screen-reader navigation | Integration + Manual | `components/ui/CommandNav.test.tsx` | M-02 | CI logs + checklist | ⚠️ PARTIAL |
| Example: Grid Expansion | Selecting consecutive items | E2E | `e2e/grid-expansion.spec.ts` | M-03 | Playwright trace | ❌ |

## Status Legend

- ✅ COMPLIANT: runtime evidence exists and passed
- ⚠️ PARTIAL: evidence exists but does not cover full scenario
- ❌ UNTESTED/FAILING: missing or failing evidence

## Manual Checklist Mapping

| Ref | Check | Result | Notes |
|-----|-------|--------|-------|
| M-01 | Smooth section navigation mobile/desktop |  |  |
| M-02 | Keyboard tab order and focus visibility |  |  |
| M-03 | Active marker across all sections |  |  |
| M-04 | External links and `mailto` semantics |  |  |
