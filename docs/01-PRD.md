# ElectricQuote AI — Product Requirements Document (V1)

**Document owner:** Lead Engineering
**Status:** Approved for build
**Version:** 1.0

---

## 1. Executive Summary

### The business problem

Electricians lose jobs not because they lack skill, but because they lack speed and professionalism in the sales process. When a customer requests a quote, the electrician who responds first, with a clean, itemized, trustworthy-looking document, wins the job — often regardless of price. Today, most owner-operated electricians produce quotes hours or days after a site visit, using a mix of memory, a notebook, a calculator app, and a Word or Excel template on a home computer. This delay costs jobs directly (the customer books a faster-responding competitor) and costs revenue indirectly (rushed quotes under-price labor and materials, or omit line items entirely).

### The target customer

The primary customer is the **owner-operated electrician**: a licensed tradesperson running their own one-to-five-person electrical contracting business. They are the estimator, the electrician, the invoice-chaser, and the bookkeeper. They are not a software company's ideal user — they are busy, mobile, and impatient with anything that isn't immediately useful.

### Why this product should exist

No existing tool is built specifically for the electrician's quoting moment: standing in a customer's driveway, phone in hand, wanting to send a professional-looking quote before they've even reached their van. Generic invoicing tools (Wave, QuickBooks, Invoice2Go) are accounting-first and quote-second. Generic quoting tools are industry-agnostic and require the user to build pricing logic from scratch. ElectricQuote AI closes this gap by combining AI-assisted quote drafting, electrical-trade-specific pricing structures, and one-tap sharing into a single mobile-first workflow that produces a professional PDF quote in under 60 seconds. This is Version 1 of a broader vision: an operating system for electrical contractors that eventually spans quoting, invoicing, payments, scheduling, and customer management.

---

## 2. User Persona

**Name (archetype):** Dave, Owner-Operator Electrician

| Attribute | Detail |
|---|---|
| Age | 28–55, median ~38 |
| Business size | Solo, or with 1–4 employees/apprentices |
| Daily workflow | Drives between 2–5 job sites per day. Performs installs and repairs. Fits quoting, invoicing, and admin into evenings, truck downtime, or between jobs. |
| Biggest frustrations | Loses jobs to faster-quoting competitors. Under-quotes and eats the cost, or over-quotes and loses the job. Spends unpaid evening hours on admin instead of family time. Chases customers for payment. Feels his quotes look "unprofessional" compared to bigger competitors. |
| Current tools | Pen and paper or a notes app on-site; Word/Excel templates or a generic invoicing app back at the office; WhatsApp or SMS for sending quotes; bank transfer or EFT for payment, often with no automated reminders. |
| Technology comfort level | Moderate. Comfortable with WhatsApp, texting, basic apps, online banking. Not comfortable with complex software, multi-step forms, or anything requiring a desktop workflow. Expects consumer-app-level simplicity (think Uber, WhatsApp), not enterprise software complexity. |
| Business goals | Win more jobs. Look as professional as larger competitors. Get paid faster and with less chasing. Spend less unpaid time on admin. Grow the business without hiring office staff. |

---

## 3. Problem Statement

### Current workflow for creating a quote

1. Electrician visits the site, assesses the job, and either writes notes by hand or estimates mentally.
2. Later (often that evening, sometimes days later), they open a Word/Excel template or a generic invoicing app.
3. They manually reconstruct the job scope from memory or handwritten notes.
4. They manually calculate labor hours, material costs, and markup — frequently using rough mental math or an inconsistent personal formula.
5. They format the document, add their logo if they have one, and export or print it.
6. They send it via email, WhatsApp, or in person — sometimes the next day.
7. The customer, having likely requested quotes from 2–3 competitors, has often already chosen someone else by the time this quote arrives.

### Why existing solutions fail

- **Generic invoicing apps** (Wave, Invoice2Go, Zoho) are built for the invoicing/payment step, not the on-site quoting moment. They require manual line-item entry with no trade-specific intelligence, and are usually used back at a desk, not standing at a customer's door.
- **Word/Excel templates** require a computer, manual formatting, and manual calculation — all friction that adds delay.
- **Enterprise field-service platforms** (ServiceTitan, Jobber) are powerful but expensive, complex, built for larger operations with dispatchers and back-office staff, and have long onboarding curves that a solo operator won't tolerate.
- **Pen and paper / notes apps** produce quotes that look amateurish next to a competitor's polished PDF, undermining trust even when the underlying work quality is equal or better.

### Cost of the current workflow

- **Lost time:** Estimated 3–7 hours per week on quote drafting, formatting, and re-sending.
- **Lost revenue:** Delayed quotes lose jobs to faster competitors; inconsistent pricing leads to systematic under-charging, particularly on materials markup and callout/travel time.
- **Customer frustration:** Customers who don't hear back quickly assume disorganization and choose a competitor who responds faster and looks more professional, independent of actual trade quality.

---

## 4. Product Goals

Measurable goals for Version 1:

1. Enable a user to generate a complete, itemized, professional quote in **under 60 seconds** from open-app to shareable PDF.
2. Reduce time-to-first-quote-sent (from job assessment to customer receipt) from an industry-typical 24–48 hours to **under 10 minutes**.
3. Increase the proportion of quotes that include full itemization (labor, materials, callout fee) from an estimated **<40% today to >90%** with ElectricQuote AI.
4. Reduce total weekly admin time spent on quoting by **at least 70%** relative to self-reported baseline.
5. Achieve a quote-to-share action (WhatsApp/Email send) on **80%+** of quotes created, indicating the tool is used at the point of decision, not abandoned mid-flow.
6. Deliver a quote appearance that customers and electricians rate as "professional" or "very professional" in **90%+** of post-use surveys.

---

## 5. Success Metrics

| Metric | Definition | V1 Target |
|---|---|---|
| Time to first quote | Time from account creation to first quote sent | < 10 minutes |
| Quote creation time | Time from "New Quote" tap to PDF generated | < 60 seconds (after customer/pricing setup) |
| Quotes created per active user per week | Count of quotes created | ≥ 3 |
| Weekly Active Users (WAU) | Users creating or editing ≥1 quote per week | Growth tracked cohort-over-cohort |
| Quote share rate | % of created quotes that are shared (WhatsApp/Email/PDF export) | ≥ 80% |
| 4-week retention | % of users still active 4 weeks after signup | ≥ 40% |
| Conversion to paid plan | % of trial users converting to paid subscription | ≥ 15% (V1 target, industry-typical for SMB SaaS) |
| Quote-to-win rate (self-reported) | % of sent quotes electricians report as accepted | Tracked as a leading indicator, no hard V1 target |
| Average revenue per quote | Average $ value of quotes created | Tracked as a baseline for future pricing/upsell features |

---

## 6. User Stories

Organized by workflow area. Each is written from the electrician's perspective unless noted.

### Onboarding & Account
1. As an electrician, I want to sign up with just my phone number or email so I can start using the app in under a minute.
2. As an electrician, I want to add my business name, logo, and contact details once so every quote looks professionally branded automatically.
3. As an electrician, I want to set my default hourly labor rate and callout fee once so I don't have to re-enter them on every quote.
4. As an electrician, I want to skip advanced setup steps during onboarding so I can create my first quote immediately and configure details later.
5. As a new user, I want a short guided first-quote flow so I understand how the app works without reading a manual.

### Customer Management
6. As an electrician, I want to save a customer's name, address, and phone number so I don't have to retype it for repeat customers.
7. As an electrician, I want to search my existing customers by name so I can quickly find someone I've quoted before.
8. As an electrician, I want to see a customer's quote history so I know what work I've previously proposed or completed for them.
9. As an electrician, I want to edit a customer's contact details so I can correct mistakes or update information.
10. As an electrician, I want to merge or flag duplicate customer entries so my customer list doesn't get cluttered.

### Quote Creation
11. As an electrician, I want to create a professional quote from my phone while standing at a customer's property so I can send it before I leave the site.
12. As an electrician, I want to describe the job in plain language (e.g., "rewire kitchen, add 4 outlets, new panel") and have the AI suggest itemized line items so I don't have to manually build every quote from scratch.
13. As an electrician, I want the AI to suggest reasonable labor hours and material costs based on the job description so my estimates are more consistent and less likely to under-charge.
14. As an electrician, I want to manually add, edit, or delete any line item the AI suggests so I retain full control over the final quote.
15. As an electrician, I want to add a custom line item with my own description, quantity, unit price, and category so I can quote for anything not covered by AI suggestions.
16. As an electrician, I want the app to automatically calculate subtotal, tax, and total so I don't do manual math on-site.
17. As an electrician, I want to apply a standard markup percentage to materials so my pricing stays consistent across jobs.
18. As an electrician, I want to attach a photo of the job site or existing wiring to a quote so the customer and I have shared visual context.
19. As an electrician, I want to save a quote as a draft so I can finish it later if I'm interrupted.
20. As an electrician, I want to duplicate a previous quote as a starting point for a similar job so I don't rebuild common quotes from scratch.

### Quote Management & History
21. As an electrician, I want to see a list of all my quotes with their status (draft, sent, accepted, declined, expired) so I know what needs follow-up.
22. As an electrician, I want to filter and sort my quote history by customer, date, or status so I can find a specific quote quickly.
23. As an electrician, I want to edit a quote after creating it (before or after sending) so I can make corrections or adjustments.
24. As an electrician, I want to set an expiry date on a quote so customers understand pricing is time-limited.
25. As an electrician, I want to manually mark a quote as accepted or declined so my records stay accurate even when a customer responds outside the app.
26. As an electrician, I want to see a simple dashboard of my quoting activity (quotes this week, total quoted value, acceptance rate) so I understand how my business is performing.

### Sharing & Delivery
27. As an electrician, I want to generate a clean PDF of my quote so I have a professional, shareable document.
28. As an electrician, I want to share a quote directly via WhatsApp so I can send it the way I already communicate with customers.
29. As an electrician, I want to share a quote via email with a pre-filled subject and message so I don't have to write it from scratch every time.
30. As an electrician, I want to get a shareable link to a quote so a customer can view it in their browser without downloading a PDF.
31. As a customer receiving a quote, I want to view it clearly on my phone without needing an account so I can quickly understand and respond to it.

### Account & Settings
32. As an electrician, I want to update my business details, logo, and default rates at any time so my quotes stay accurate as my business evolves.
33. As an electrician, I want to log out and log back in on a new device without losing my data so I can switch phones or use a tablet.
34. As an electrician, I want to reset my password securely if I forget it so I'm never locked out of my business data.
35. As an electrician, I want to know my data is backed up and secure so I trust the app with sensitive customer and business information.

---

## 7. Functional Requirements

### 7.1 User Registration
- Users register via email + password, or phone number + OTP (SMS-based one-time passcode).
- Required fields at registration: email or phone, password (if email flow), business name.
- Password rules (email flow): minimum 8 characters, at least one number and one letter. Reject common/breached passwords via a denylist check.
- Duplicate email/phone registration is rejected with a clear "account already exists" message and a link to log in.
- Email verification is sent post-registration but does not block core app usage (soft verification) — full verification is required before enabling payment-related features in later phases.
- Edge cases: malformed email, invalid phone number format, password confirmation mismatch, network failure mid-registration (must not create a partial/orphaned account record).

### 7.2 Login
- Login via email/password or phone/OTP, matching the registration method.
- "Forgot password" flow sends a time-limited (15-minute) reset link/token to the registered email.
- Account lockout after 10 failed login attempts within 15 minutes, with exponential backoff on retries.
- Session persists via refresh token so users are not repeatedly asked to log in on the same device.
- Edge cases: expired reset token, reused reset token, login attempt on unverified account, login from a new device (no blocking in V1, but device/session is logged).

### 7.3 Dashboard
- Displays: quotes created this week, total quoted value (rolling 30 days), quote acceptance rate, and a shortcut to "New Quote."
- Displays a list of the 5 most recent quotes with status badges.
- Empty state (no quotes yet) shows a clear call-to-action to create the first quote.

### 7.4 Customer Management
- Create customer: name (required), phone (required), email (optional), address (optional), notes (optional).
- Edit and soft-delete (archive, not hard-delete) customer records.
- Search by name or phone number, case-insensitive, partial match.
- View customer detail page showing full quote history for that customer.
- Duplicate detection: warn (not block) when a new customer's phone number matches an existing record.
- Edge cases: invalid phone format, customer with no quotes yet, archived customer referenced by an existing quote (quote must still display the customer's data; archiving is non-destructive).

### 7.5 Quote Creation
- Entry points: "New Quote" from dashboard, "Duplicate" from an existing quote, "New Quote for this customer" from a customer detail page.
- Step 1 — Customer: select existing customer or create new inline.
- Step 2 — Job description: free-text input describing the job. User submits to AI assistant, which returns suggested line items (description, category [labor/material/other], quantity, unit price).
- Step 3 — Line items: AI-suggested items are editable and deletable; user can add custom line items manually. Each line item requires: description (required, max 200 chars), quantity (required, positive number), unit price (required, non-negative number), category (required, enum: labor/material/callout/other).
- Step 4 — Pricing summary: automatic calculation of subtotal, tax (configurable rate, default per user's region), total. Optional markup percentage applied to material line items only, configurable per quote or as a saved default.
- Step 5 — Review & finalize: preview of the rendered quote as it will appear in PDF form, with quote validity/expiry date (default 14 days, editable), optional notes/terms field, optional photo attachment (max 5 photos, 10MB each).
- Draft auto-save: quote state is persisted after each step so an interrupted session can be resumed.
- Validation: quote cannot be finalized/sent with zero line items, a $0.00 total (warns but does not hard-block, since some quotes may legitimately be free assessments), or a missing customer.
- Edge cases: AI suggestion service timeout or failure (must gracefully fall back to manual entry, never block quote creation), duplicate line items, negative quantities/prices (rejected client- and server-side), extremely large totals (sanity-check warning above a configurable threshold, not a hard block).

### 7.6 Quote Editing
- Quotes in "draft" or "sent" status are editable. Quotes marked "accepted" require explicit confirmation before edits are allowed (to preserve accuracy of accepted-agreement records).
- All edits are timestamped; a lightweight edit history (who/when, not full diff) is retained for audit purposes in V1.
- Edge cases: concurrent edits from two sessions (last-write-wins with a warning if the record was modified since load), editing a quote that has already been converted/duplicated elsewhere (no cross-effect — duplicates are independent records).

### 7.7 Quote History
- List view with filters: status (draft/sent/accepted/declined/expired), customer, date range.
- Sort by date created, date modified, or total value.
- Status auto-transitions: draft → sent (on share action) → expired (automatically, based on expiry date, via scheduled job). Accepted/declined are manually set by the electrician.
- Pagination for users with large quote volumes (cursor-based, 20 per page default).

### 7.8 PDF Generation
- Generates a branded PDF including: business logo/name/contact info, customer info, itemized line items grouped by category, subtotal/tax/total, validity date, optional notes/terms, optional attached photos (as a final page or thumbnail row).
- PDF generation must complete in under 3 seconds for a typical quote (≤30 line items).
- PDF is stored in cloud object storage and linked to the quote record; regenerating a PDF (after an edit) replaces the stored file and updates the shareable link content, while preserving version history for accepted quotes.
- Edge cases: quote with no photos (photos section omitted, not blank), extremely long line item descriptions (text wraps, does not overflow/clip), quotes with 0 or 1 line items (layout remains professional, not visually broken).

### 7.9 Share by WhatsApp
- Generates a WhatsApp deep link (`wa.me` or Business API, see architecture) pre-filled with a message containing the customer's name, business name, total, and a link to the hosted quote view (not a raw PDF attachment, to avoid file-size/compatibility issues on the customer's end).
- If the customer's phone number is on file, the link opens a chat directly with that number; otherwise, opens the general share sheet.
- Edge cases: customer has no phone number on file (fallback to generic share sheet), WhatsApp not installed on user's device (fallback to web WhatsApp link).

### 7.10 Share by Email
- Sends via a transactional email service with a pre-filled, editable subject ("Quote from [Business Name]") and body, with the PDF attached and a hosted link included as a fallback.
- Edge cases: customer has no email on file (field must be filled before this share method is available), email delivery failure (user is notified in-app; quote status does not falsely show "sent" if delivery hard-bounces — status shows "send failed" and allows retry).

### 7.11 Hosted Quote View (Web)
- Public, unauthenticated, token-secured link (`/q/{quote_token}`) rendering a mobile-responsive view of the quote.
- No customer account or login required.
- Includes a lightweight "Accept" / "Decline" action for the customer, which updates quote status in real time and notifies the electrician (push/in-app notification).
- Edge cases: expired quote (view still loads but shows an "expired" banner and disables Accept), revoked/deleted quote (returns a clear "no longer available" state, not a raw error).

---

## 8. Non-Functional Requirements

### Performance
- Quote creation flow (excluding AI call latency) must respond to user input within 200ms for all local interactions.
- AI line-item suggestion must return within 5 seconds at p95; a loading state with cancel/manual-entry fallback is shown beyond 2 seconds.
- PDF generation under 3 seconds at p95 for quotes up to 30 line items.
- API endpoints must respond within 300ms at p95 for all non-AI, non-PDF operations.

### Security
- All traffic over HTTPS/TLS 1.2+.
- Passwords hashed with bcrypt (or argon2), never stored or logged in plaintext.
- JWT-based authentication with short-lived access tokens and rotating refresh tokens.
- Role-based access: a user can only access their own customers, quotes, and business data (strict tenant isolation).
- All PII (customer contact details, business info) encrypted at rest.
- Rate limiting on all public and authenticated endpoints to prevent abuse.

### Reliability
- Target 99.5% uptime for V1 (single-region deployment).
- Automated daily database backups with point-in-time recovery capability.
- Graceful degradation: if the AI suggestion service is down, quote creation must still be fully possible via manual entry.

### Scalability
- Architecture must support horizontal scaling of the API layer without code changes.
- Database schema and indexing must support at least 100,000 users and 10M+ quotes without redesign (see Scalability Plan in the architecture document).

### Accessibility
- Mobile-first responsive design; core flows usable on screen widths from 360px up.
- Minimum WCAG 2.1 AA contrast ratios on all text.
- Touch targets minimum 44x44px on mobile.
- Form fields have associated labels and error messages compatible with screen readers.

### Maintainability
- Codebase follows a documented architecture (see Technical Architecture document) with clear separation of concerns.
- All business logic covered by automated tests (see Testing Strategy).
- Infrastructure defined as code where practical; no manual, undocumented production configuration.

---

## 9. MVP Scope

### Included in V1
- Email/password and phone/OTP registration and login.
- Business profile setup (name, logo, contact info, default labor rate, default callout fee, default tax rate).
- Customer create/edit/archive/search.
- AI-assisted quote line-item generation from a plain-text job description.
- Manual quote line-item add/edit/delete.
- Automatic subtotal/tax/markup/total calculation.
- Quote draft save, edit, duplicate.
- Quote status tracking (draft/sent/accepted/declined/expired), with manual accept/decline override.
- Branded PDF generation.
- Hosted, unauthenticated web view of a quote with Accept/Decline.
- Share via WhatsApp deep link and via email.
- Photo attachments on quotes (up to 5 per quote).
- Basic dashboard with weekly quote count, total quoted value, and acceptance rate.
- Quote history with filter/sort/search.

### Explicitly excluded from V1 (future phases)
- Invoicing and payment collection (Paystack/Stripe integration).
- Automated payment reminders/chasing.
- Scheduling/calendar/job dispatch.
- Multi-user/team accounts with role permissions (V1 is single-user-per-business).
- Native mobile apps (V1 is a responsive mobile web app; native iOS/Android is a later phase).
- Customer-side accounts or portals beyond the single hosted quote view.
- Offline mode / full offline-first sync.
- Multi-language support (V1 ships in English only).
- Integrations with accounting software (QuickBooks, Xero, etc.).
- Advanced analytics/reporting beyond the basic dashboard.
- In-app messaging/chat with customers.

---

## 10. Risks

| Risk | Category | Mitigation |
|---|---|---|
| AI-suggested pricing is inaccurate or regionally inconsistent, damaging trust | Technical / Product | AI suggestions are always editable and clearly labeled as suggestions, never auto-sent; collect regional pricing data over time to improve accuracy; allow users to set and reuse their own rate defaults. |
| AI service downtime blocks quote creation | Technical | Manual quote creation path never depends on the AI service; AI is strictly additive, with graceful fallback and clear UI messaging. |
| Electricians distrust an AI-generated quote enough to not use the feature | Adoption | Position AI as a drafting assistant, not an autonomous decision-maker; make manual editing prominent and effortless; onboarding demonstrates full user control. |
| Low mobile data connectivity in the field disrupts real-time flows | Technical | Aggressive client-side caching of drafts; minimize payload sizes; design forms to tolerate intermittent connectivity with retry logic. |
| Customers dislike an unfamiliar hosted-link quote format vs. a plain PDF/email they're used to | Adoption | Always provide the PDF as a fallback/attachment alongside the hosted link; keep hosted view extremely simple and fast-loading. |
| Competitive response from larger field-service platforms (Jobber, ServiceTitan) adding faster quoting | Competition | Differentiate on simplicity, speed-to-first-quote, and price point targeted specifically at solo/micro operators who are underserved by enterprise tools. |
| Data breach involving customer PII (names, addresses, phone numbers) | Business / Security | Encryption at rest and in transit, strict tenant isolation, regular dependency/security audits, minimal data collection principle. |
| Regulatory/tax miscalculation liability (quotes showing incorrect tax) | Business | Tax rate is user-configurable and clearly editable, not hardcoded; PRD/UI explicitly frames the app as a tool, with final pricing responsibility resting with the licensed electrician. |
| Low initial user trust in a new, unbranded startup product | Adoption | Free trial with no credit card required; fast time-to-value (first quote in minutes); referral/word-of-mouth mechanics built into the sharing flow (quotes carry the electrician's brand, not ElectricQuote AI's). |
| Underestimating the diversity of electrical trade pricing structures (flat-rate vs. hourly vs. project-based) across regions | Product | V1 supports flexible line-item categorization (labor/material/callout/other) rather than rigid pricing templates, allowing electricians to model their own pricing approach. |

---

## 11. Roadmap

### Phase 1 — V1 Launch (this document's scope)
AI-assisted quote creation, customer management, PDF generation, WhatsApp/email sharing, hosted quote view with accept/decline, basic dashboard.

### Phase 2 — Get Paid Faster
Invoicing (convert an accepted quote into an invoice with one tap), payment collection integration (e.g., Paystack for South African market), automated payment reminders, payment status tracking on the dashboard.

### Phase 3 — Reduce Admin Further
Job scheduling and calendar view, team accounts (multiple electricians/apprentices under one business), basic expense tracking tied to jobs, customer communication history in one place, native mobile apps (iOS/Android).

### Future Vision — The Operating System for Electrical Contractors
Full job lifecycle management (lead → quote → schedule → invoice → payment → review request), supplier/materials price integrations for more accurate AI cost suggestions, multi-trade expansion (plumbers, HVAC) using the same core platform, marketplace/lead-generation features connecting customers directly to electricians on the platform, business analytics and benchmarking against anonymized regional peer data.
