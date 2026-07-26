# Reusable Legal Copy

Shared copy strings that must appear consistently across the application (footer, onboarding, etc.). Frontend and content contributors should import or copy from this file rather than rewriting the wording, so language stays consistent and reviewable in one place.

<!--
Document metadata (US 1.8 — T-1.8.4 / T-1.8.10)
-->

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| Drafter            | Mikey Nichols                        |
| Draft date         | 2026-07-20                           |
| Mentor reviewer    | _pending_                            |
| Mentor review date | _pending_                            |
| Status             | Draft — awaiting mentor legal review |

> **Reviewer note:** Once a mentor (or other qualified adult) has approved the wording below, fill in the reviewer name and date above and update the **Last Updated** stamps in `privacy-policy.md` and `terms-of-service.md` if any wording here changed.

---

## 1. "Not financial advice" disclaimer

**Purpose:** Reused in the landing footer and on the first step of onboarding (US 1.8, T-1.8.9). Also referenced from the Terms of Service and Privacy Policy.

### 1a. Short form (landing footer, tight spaces)

> This app provides general financial education only and is not personalized financial, legal, tax, investment, or credit advice.

### 1b. Standard form (onboarding first step, about page)

> **Educational content, not financial advice.** This app provides general financial education only and does not offer personalized financial, legal, tax, investment, or credit advice. Consider consulting a qualified professional before making important financial decisions.

### Usage rules

- Do not paraphrase either form when embedding it in the UI — copy the exact wording so mentor review stays valid.
- If a design needs a shorter fit than 1a, open a docs PR that adds a new named variant here instead of shortening it inline.
- The disclaimer must remain visible (not hidden behind a tooltip or expandable section) in the two required placements.

---

## 2. Related reusable copy

- **Consent banner text** — see [legal-and-privacy/consent-banner.md](legal-and-privacy/consent-banner.md).
- **Privacy Policy** — see [legal-and-privacy/privacy-policy.md](legal-and-privacy/privacy-policy.md).
- **Terms of Service** — see [legal-and-privacy/terms-of-service.md](legal-and-privacy/terms-of-service.md).
