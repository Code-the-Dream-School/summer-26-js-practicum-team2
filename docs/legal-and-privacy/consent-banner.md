### Consent Banner

<!--
Document metadata (US 1.8 — T-1.8.3 / T-1.8.10)
-->

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| Drafter            | Mikey Nichols                        |
| Draft date         | 2026-07-20                           |
| Mentor reviewer    | _pending_                            |
| Mentor review date | _pending_                            |
| Status             | Draft — awaiting mentor legal review |

> **Reviewer note:** Update the reviewer name and date above once a mentor has approved the wording. The frontend banner component (T-1.8.6) must use this exact text — no dark patterns, no pre-checked options, both buttons equally prominent.

---

**Your privacy choices**

We use essential cookies to keep the app working. With your permission, we may also use optional analytics cookies to understand how the app is used and improve the learning experience.

You can accept or decline optional cookies. The app will still work if you decline.

**Buttons:**

- **Accept Optional Cookies**
- **Decline Optional Cookies**

**Optional link:**

- **View Privacy Policy**

---

## Implementation notes for T-1.8.6 / T-1.8.11

- Store the user's choice as `consent.analytics = "accepted" | "declined"` in `localStorage` (or a first-party cookie). Do not fall back to "accepted" when the value is missing — treat unknown as declined until the user chooses.
- The banner must be shown on the first visit and stay dismissed on subsequent visits once a choice is recorded.
- While the value is `declined` (or missing), the analytics `track()` helper from US 1.6 must be a no-op for non-essential events. Essential product events required for security or account integrity may still fire and must be documented in the Privacy Policy.
- Provide a way for users to change their choice later (e.g. a "Privacy choices" link in the footer or profile) so declining is not a one-way door.
- The banner is non-modal: keyboard users must be able to tab past it and interact with the rest of the page. Both Accept and Decline buttons must be reachable by keyboard and have visible focus states.
