---
description: Apply strict backend rules to specific files
glob: src/backend/**/*.ts, server/**/*.py
---
# STRICT BACKEND ENFORCEMENT
When modifying files in this directory, you must:
1. Ensure all new functions have documented O(n) Time and Space complexity.
2. Verify that inputs are sanitized against SQLi and XSS.
3. Reject changes that introduce complexity worse than O(n) without a mathematical justification.
