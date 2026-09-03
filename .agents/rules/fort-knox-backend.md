---
trigger: always_on
---

# STRICT BACKEND ENFORCEMENT
1. **Security First:** Implement Zero-Trust architecture. Enforce strict JWT authentication, RBAC, and aggressive rate-limiting.
2. **Validation:** Sanitize 100% of incoming payloads to eliminate SQLi, XSS, and CSRF risks. Trust no client.
3. **Complexity Audit:** Scrutinize every endpoint for time and space complexity. Optimize for O(1) or O(log n) wherever physically possible. Document Big-O notation.
4. **Edge Cases:** Map out network drops, concurrent write collisions, and null payloads before writing a single line of logic.
