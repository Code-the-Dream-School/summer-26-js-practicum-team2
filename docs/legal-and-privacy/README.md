# Legal & Privacy

This folder holds the content deliverables for **US 1.8 — Legal and privacy foundation**. Frontend routes, the consent banner component, signup enforcement, and analytics gating live in their own branches (T-1.8.5 through T-1.8.9, and T-1.8.11) and consume the copy stored here.

## Files

| File                                       | Task             | Purpose                                                              |
| ------------------------------------------ | ---------------- | -------------------------------------------------------------------- |
| [privacy-policy.md](privacy-policy.md)     | T-1.8.1          | Long-form Privacy Policy rendered at `/privacy`.                     |
| [terms-of-service.md](terms-of-service.md) | T-1.8.2          | Long-form Terms of Service rendered at `/terms`.                     |
| [consent-banner.md](consent-banner.md)     | T-1.8.3, T-1.8.6 | Banner copy + implementation notes for the analytics consent banner. |
| [../legal-copy.md](../legal-copy.md)       | T-1.8.4, T-1.8.9 | Reusable strings (currently the "not financial advice" disclaimer).  |

## Story acceptance criteria — status

| #   | Criterion                                                                  | Owner                             | Status                                                                                                      |
| --- | -------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1   | Privacy and Terms pages exist and are linked from at least 3 places        | Frontend (T-1.8.5, T-1.8.7)       | Content ready; frontend linking pending                                                                     |
| 2   | Signup blocks submit until the TOS checkbox is ticked                      | Frontend + backend (T-1.8.8)      | Pending implementation                                                                                      |
| 3   | Consent banner is dismissible and preference persists                      | Frontend (T-1.8.6)                | Copy + spec ready; component pending                                                                        |
| 4   | Declining consent stops analytics events from firing                       | Frontend + QA (T-1.8.6, T-1.8.11) | Contract documented; implementation + verification pending                                                  |
| 5   | "Not financial advice" disclaimer visible on landing footer and onboarding | Frontend (T-1.8.9)                | Copy in `legal-copy.md`; placement pending                                                                  |
| 6   | Policies list every third-party service in use                             | Docs (this branch)                | Structured table added to Privacy Policy §5; provider names to be filled in when US 1.5 finalizes the stack |

## Task deliverables — status

| Task                                              | Type               | Status                                                                                   |
| ------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| T-1.8.1 Draft Privacy Policy                      | docs               | **Done (draft)** — awaiting review review                                                |
| T-1.8.2 Draft Terms of Service                    | docs               | **Done (draft)** — awaiting review review                                                |
| T-1.8.3 Draft consent banner copy                 | docs               | **Done (draft)** — awaiting review review                                                |
| T-1.8.4 Draft "not financial advice" disclaimer   | docs               | **Done (draft)** — file at `docs/legal-copy.md`                                          |
| T-1.8.5 `/privacy` and `/terms` routes            | frontend           | Not started (no frontend code on this branch)                                            |
| T-1.8.6 Consent banner component                  | frontend           | Not started; contract documented in `consent-banner.md`                                  |
| T-1.8.7 Link Privacy + Terms in 3 places          | frontend           | Not started                                                                              |
| T-1.8.8 Enforce TOS checkbox on signup            | frontend + backend | Not started                                                                              |
| T-1.8.9 Disclaimer in footer + onboarding         | frontend           | Not started; copy ready in `../legal-copy.md`                                            |
| T-1.8.10 Mentor legal review                      | legal              | **In progress** — header slots waiting for reviewer name + date in each of the four docs |
| T-1.8.11 Verify consent banner disables analytics | qa                 | Blocked on T-1.8.6                                                                       |

## Follow-up before this story can close

1. Route the four docs (privacy policy, terms of service, consent banner, legal copy) to a mentor reviewer. 
2. Once US 1.5 finalizes the tech stack, fill in the concrete provider names in the third-party services table in `privacy-policy.md` §5. TOS §11 refers back to that table.
3. Replace `[App Name]`, `[Organization or Team Name]`, `[State and Country]`, `[County and State]`, `[Privacy Contact Email]`, `[Support Email]`, and `[Business or Organization Mailing Address]` placeholders with real values before the app is launched publicly.
4. Frontend/backend tickets (T-1.8.5 – T-1.8.9, T-1.8.11) pick up the copy from this folder and implement the routes, banner, checkbox enforcement, and analytics gating.
