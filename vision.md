# ViKom — Vision & Solution Proposal

**A visit-support and communication platform for municipal homecare**

> Status: Early prototype + active research phase
> Audience: Municipal health & care leadership, procurement, and digitalisation stakeholders
> Date: June 2026
> Companion documents: [`municipal-homecare-research-report.md`](municipal-homecare-research-report.md), [`backend-integration-plan.md`](backend-integration-plan.md), [`integration-roadmap.md`](integration-roadmap.md)

---

## 1. Executive summary

Norwegian municipal homecare (_hjemmetjenesten_) exists to help people live safely at home for as long as possible. It is one of the most operationally complex services a municipality runs: a distributed, mobile, interruption-heavy workday in which nurses and health workers move between homes, vehicles, phones, records, and emergencies, while the municipality remains legally accountable for safe, lawful, documented care.

Municipalities already own electronic patient records (EPR/EPJ), scheduling systems, medication tools, and welfare technology. **The problem is not a lack of systems — it is the fragmentation between them.** Staff experience the day as one continuous flow, but they have to assemble it themselves out of route lists, patient records, medication tools, phone calls, messages, and memory. The cost of that fragmentation is cognitive load, delayed documentation, missed information at handover, and most importantly, avoidable safety risk.

**ViKom is the operational bridge.** Rather than replacing the municipality's record systems, ViKom is a workflow layer that supports the nurse through the moments that existing tools handle worst: starting a visit, reaching a hard-to-reach elderly patient, conducting physical _or_ digital visits, documenting exceptions quickly, escalating safely, and leaving an audit-ready trail — all without creating extra administrative work.

ViKom is built around **three connected users**:

1. **The nurse / health worker** — a fast, one-handed, interruption-tolerant _visit command centre_.
2. **The patient** — a radically simple, elderly-friendly TV interface that lets them receive care contact without navigating a smartphone.
3. **The team leader / municipality** — operational visibility into what is actually straining the service: failed contacts, deviations, route stress, and where digital visits replace (or fail to replace) physical ones.

The product centrepiece — already prototyped — is the **active visit session (_Besøk_)**: a single workspace that tracks a visit from start to close, including repeated call attempts to elderly patients, task completion, clinical context, quick structured notes, and cancellation-with-reason. This directly matches the real homecare reality the research identifies as the biggest unmet market gap.

This document describes what ViKom is, what is built today, what is planned, and the future integrations we believe can make ViKom the central operational system for municipal homecare visits. It is deliberately honest about maturity: ViKom is an early, working prototype, and our next phase is field research with nurses and other actors to validate and refine the direction.

---

## 2. The problem we are solving

The full clinical and operational analysis lives in the [research report](municipal-homecare-research-report.md). The essentials:

**The visible visit is the small part.** A 10-minute medication visit can generate 25+ minutes of real work: travel, parking, key/access, waiting, a clarification call to the GP, a deviation note, and a handover to the next shift. Workload is not the same as visit duration, yet most systems and dashboards only see scheduled time.

**The day rarely goes to plan.** Patients do not answer the door. Nurses discover deterioration. Hospitals discharge early. Medication is missing. A visit takes twice as long. A relative calls with new concerns. A colleague calls in sick. Static schedules are useful at 07:30 and obsolete by 09:30 — homecare needs _live_ operational support.

**Information scatters.** One fact is in the record, another in a phone call, a third in a team message, a fourth only in a nurse's memory. Handover — the single most important safety routine — is where this scattering becomes dangerous.

**Elderly patients are hard to reach.** Hearing impairment, poor vision, reduced dexterity, cognitive decline, anxiety, and low digital confidence mean a patient may not answer the phone or door. A nurse may try several times before deciding to cancel, escalate, or physically check. Almost no system models this reality as a first-class workflow.

**Exceptions are where safety, documentation, and workload pressure all meet** — and they are exactly what most homecare software handles worst. Tools are built for the happy path.

### The core gaps ViKom targets

Drawn directly from the research report's market-gap analysis:

| #   | Gap                                           | ViKom response                                                                  |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | No true "active visit session"                | The _Besøk_ workspace — a live session spanning attempts, tasks, notes, outcome |
| 2   | Communication detached from documentation     | Calls and attempts auto-captured into the visit record                          |
| 3   | Patient-side experience treated as secondary  | TV-first, elderly-friendly interface as a primary surface                       |
| 4   | Software built only for the happy path        | Exception-first flows: no-answer, refusal, access problems, deterioration       |
| 5   | Communication that ignores route impact       | (Planned) route-aware delay handling and reassignment                           |
| 6   | Heavy record vs. "what I need before I knock" | Lightweight pre-visit clinical context card                                     |
| 7   | Physical and digital care handled separately  | Hybrid visits: start digital, escalate to physical, and vice-versa              |
| 8   | Uncontrolled relative phone burden            | (Planned) structured, permission-based relative updates                         |
| 9   | Short visits over- or under-documented        | Structured micro-documentation + quick notes                                    |
| 10  | Management analytics that miss real work      | (Planned) analytics on failed contacts, deviations, route stress                |

---

## 3. Vision statement

> **ViKom is a visit-support and communication platform for municipal homecare, designed to help nurses complete physical and digital visits safely, document exceptions quickly, and keep patients, relatives, and care teams connected — especially when the visit does not go exactly as planned.**

We explicitly **do not** aim to replace the municipality's electronic patient record. The EPR is the system of record around which procurement and law are already organised. ViKom is the _workflow layer_ that sits closer to the frontline than the EPR can, integrates with the existing ecosystem over time, and makes the daily reality of homecare safer and less fragmented.

Our long-term ambition is for ViKom to become the **central operational surface for the homecare visit** — the screen a nurse starts their day on, the screen a patient sees when care reaches out, and the dashboard a team leader trusts to understand where the service is actually under strain.

---

## 4. The three users

ViKom is designed as one connected system serving three users with very different needs.

### 4.1 The nurse / health worker

The nurse is the primary user. The design goal is a **visit command centre**: one place to start the day and one workspace to run each visit.

**What the nurse needs**

- One screen for today's visits, status, time windows, and priority.
- A live visit session that tolerates pauses, repeated attempts, urgent inserts, and incomplete visits.
- The _right_ clinical context before knocking — not the entire record.
- Fast, structured documentation that captures enough clinical detail without becoming a burden.
- Easy, structured ways to record exceptions and escalate.
- Protection: a clear audit trail that shows they acted correctly when something went wrong.

**How ViKom serves the nurse (built today)**

- **Appointment list** → start a physical or digital visit.
- **Active visit session (_Besøk_)** with a live _økt_ (session) timer.
- **Patient clinical profile inline** — diagnoses, medications, treatment plan, allergies, next-of-kin, GP, condition flags — surfaced at the point of care.
- **Task checklist** seeded from the appointment, each task individually completed or skipped-with-reason.
- **Repeated digital call attempts** (up to 3) to reach hard-to-reach patients, each attempt logged with outcome (answered / no-answer / declined / technical failure).
- **Auto-saving visit notes** (debounced) so notes survive interruptions.
- **Complete** (with follow-up flag) or **cancel with structured reason**.
- **Visit archive** of completed/closed visits, and pre-visit plan + post-visit record documents surfaced from the appointment list and patient history.

**Design principle: build for staff trust.** If staff feel the app exists only to monitor them, they will resist it. ViKom must visibly _save_ time — fewer repeated calls, faster notes, less re-keying — and _protect_ the nurse when a visit goes wrong.

### 4.2 The patient (elderly)

The patient-side experience is a deliberate differentiator. Most digital health tools assume the patient can navigate a normal app. Homecare patients often cannot.

**What the patient needs**

- A radically simple interface: large buttons, large text, loud and visual call alerts.
- A clear "Nurse is calling" screen with simple accept/decline — no menus.
- A device they already use and trust: the **television**.
- Reassurance, not complexity.

**How ViKom serves the patient (built today)**

- A dedicated **Android TV application** designed for elderly users, navigable with a remote.
- Supabase-backed authentication, contacts, quick-dial, and call history.
- Incoming / outgoing / in-call screens for receiving care contact.
- A simplified, calm, readable interface that reduces cognitive load.

**Planned**

- Receiving appointment notifications and confirming/declining visits from the TV.
- Real audio/video media (the current call flow exchanges signaling only).
- Auto-answer options where legally and ethically appropriate, and remote assistance from approved contacts.

### 4.3 The team leader / municipality

The third user is the one most existing frontline tools forget. Managers need more than "how many visits were completed" — they need to understand **workload pressure** and **where the service is straining**.

**What the team leader / municipality needs**

- Operational visibility: completion, delays, failed contacts, deviations, route stress.
- Evidence of where digital visits prevent physical ones — and where they fail and require physical follow-up.
- An audit-ready trail for quality, safety, and accountability (toward the _Statsforvalter_ and internal control).
- The two-level separation the law implies: the **service decision** (what was granted) vs. the **operational visit** (what was delivered today), and visibility into deviations between them.

**How ViKom serves the team leader (built today)**

- Personnel dashboard with patient counts, appointments this week, pending/cancelled counts, upcoming/recent appointments, and availability.
- Availability calendar (weekly/daily) for staff capacity.
- Every visit action carries a responsible user, timestamp, and patient/visit context — the foundation of an audit trail.

**Planned**

- A dedicated **team-leader / municipality role** (today the system has only Personnel and Patient roles — see §6.4).
- A **manager dashboard** surfacing: repeated failed contacts, time lost to unreachable patients, visits frequently overrunning, patients with many deviations, routes with too little buffer, medication visits at risk of delay, documentation backlog, and digital-visit success/failure rates.
- Reassignment and route-aware delay handling.

---

## 5. The ViKom ecosystem (architecture)

ViKom is three applications connected through a deliberately thin realtime layer.

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   Web / Tablet App       │         │   Smart TV App           │
│   (React + Vite + TS)    │         │   (Android TV / Kotlin)  │
│   Nurse & team leader    │         │   Elderly patient        │
└───────────┬─────────────┘         └───────────┬─────────────┘
            │  REST (JWT)                        │  Supabase SDK
            │                                    │
            ▼                                    ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   .NET Backend           │◀───────▶│   Supabase               │
│   System of record       │  auth   │   • Auth (identity)      │
│   • Patients/appointments│  events │   • Realtime event bus   │
│   • Visits / visit tasks │         │     (WebRTC signaling)   │
│   • Call logs, clinical  │         │                          │
│   • EF Core + SQLite(dev)│         │   NOT a second business  │
│   • ASP.NET Identity+JWT │         │   database               │
└─────────────────────────┘         └─────────────────────────┘
```

### Device roles (clear ownership, no duplicated truth)

| Component            | Responsibility                                                                     | Technology                                                                 |
| -------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Web / Tablet app** | Caregiver planning, scheduling, visit execution, administration, team-leader views | React 19, Vite, TypeScript, React Router, React-Bootstrap, Bootstrap Icons |
| **Smart TV app**     | Simplified patient interaction and communication                                   | Android TV, Kotlin, WebRTC, Supabase SDK, FCM                              |
| **.NET backend**     | Business logic + system of record for all healthcare data                          | ASP.NET Core, EF Core, ASP.NET Identity, JWT; SQLite in dev                |
| **Supabase**         | Authentication + realtime event delivery **only**                                  | Supabase Auth + Realtime                                                   |

**Key architectural decision:** Supabase is used strictly as an **auth provider and realtime event bus** — never as a second business database. The .NET backend remains the single source of truth for healthcare data (patients, appointments, visits, call logs, clinical profiles). This keeps the architecture simple, avoids synchronisation conflicts, gives one clear source of truth, and lets the system scale gradually. (See [`backend-integration-plan.md`](backend-integration-plan.md).)

**Security model:** Supabase proves _who the user is_; the backend decides _what the user is allowed to do_ (validating caregiver–patient relationships and protecting healthcare data). The web app authenticates via backend-issued JWT with role-based authorisation (Personnel / Patient).

---

## 6. What exists today (honest prototype status)

ViKom is an **early working prototype**. The following is built and runs end-to-end; the gaps are stated plainly.

### 6.1 Backend domain model (.NET, EF Core)

The data model already encodes the research report's most important insight — **the separation between the plan and the execution**:

- **`User`** — extends ASP.NET Identity. Role is `Personnel` or `Patient`. Carries an optional `SupabaseProfileId` (link to the TV app's identity) and a `ProfileUsername` for human-readable URLs. For patients, it also holds a **clinical profile**: date of birth, next-of-kin (_pårørende_) name & relation, GP (_fastlege_), allergies, diagnoses, condition flags, treatment plan (_behandlingsplan_), free-text care notes (with timestamp), and a collection of medications.
- **`Appointment`** — _the plan_. Patient, availability slot, comma-separated tasks, start/end time, and status (`Booked` / `InProgress` / `Completed` / `NotCompleted` / `Cancelled`).
- **`Visit`** — _what actually happened_. One per appointment. Visit type (`Physical` / `Digital`), status (`Active` / `Completed` / `Incomplete` / `Cancelled`), started/ended/completed timestamps, notes, follow-up flag, and an outcome reason for incomplete/cancelled visits. _"An appointment is the plan; a visit is what really happened."_
- **`VisitTask`** — individual tasks within a visit, seeded from the appointment, each `Pending` / `Completed` / `Skipped` with an optional skip reason and completion timestamp.
- **`CallLog`** — every call attempt from personnel to a patient's TV profile, with status (`Initiated` / `Answered` / `Declined` / `Ended` / `Missed` / `Failed`), optional link to a visit + appointment, a **1-based attempt number**, duration, and failure reason. This is the data spine of the "repeated call attempts to elderly patients" workflow.
- **`Availability`** & **`AvailabilityWindow`** — personnel capacity/scheduling.
- **`PatientUserLink`** — links a patient to a secondary user as `Personnel` or `Relative` (the relative relationship is modelled but not yet a feature surface).
- **`PatientMedication`** — current medications (name, dosage, schedule, sort order).

**API surface:** Auth, Patients, Appointments, Availability, Dashboard, Personnel, PatientUserLinks, and a full **Visits** controller (`start`, `get`, `by-appointment`, `by-patient`, `mine`, `notes`, task add/update, `complete`, `cancel`, `call-attempts`). Migrations show a clear build-out history through the visit/clinical-data features.

### 6.2 Web app (React) — implemented features

- **Authentication** — login/register with role-based route guards (private, personnel-only, patient-only, public-only).
- **Dashboards** — distinct personnel and patient dashboards.
- **Patients** — list and a rich **patient details page** with clinical overview, diagnoses, medications, treatment plan, and editable care notes.
- **Appointments** — list with create/edit/delete, task selection, and an appointment-to-visit entry point.
- **Availability** — weekly/daily calendar with availability windows.
- **Visits (the centrepiece)** — the **`Besøk` visit-execution workspace** (`/besok/:appointmentId`): live session timer, patient clinical profile, task checklist, digital call attempts with a call modal, auto-saving notes, complete/cancel-with-reason. Plus visit archive, task selection, preferred-time, and planning-overview pages.
- **Design system** — a standardised, Bootstrap-first design system with reusable `vk-` components (PageHeader, Tabs, AppointmentCard, StatTile, Timeline, EmptyState, Badge, etc.) so pages stay consistent.
- **Realtime** — `SupabaseSignalingService` + `CallModal` exchange WebRTC signaling events with the TV app over a shared Supabase channel, targeting the patient's `SupabaseProfileId`.

### 6.3 TV app (Android / Kotlin) — implemented features

- Supabase-backed **auth** (login/register, email verification, session management & refresh).
- **Contacts, quick-dial, profiles, call history**, settings, and a TV-optimised UI (welcome, main, incoming/outgoing/in-call activities, hamburger menu).
- **WebRTC** calling stack (peer connection, signaling manager, audio device handling, foreground signaling service) and **FCM** push for incoming calls.
- An `AppointmentActivity` scaffold exists but the appointment realtime flow is **not yet wired** (see roadmap Phase 5).

### 6.4 Integration status (what works, what doesn't)

Per the [integration roadmap](integration-roadmap.md):

- ✅ **Phases 1–4 done:** patient/device linking (`SupabaseProfileId`), webapp patient flow, Supabase realtime bridge, and the **call signaling round-trip** — a nurse hitting "Ring pasient" wakes the TV's incoming-call screen, and accept/reject/end flows back to the webapp.
- ⚠️ **Signaling only, dummy SDP** — there is **no real audio/video media yet** (Phase 6 not started).
- ⬜ **Appointment realtime sync not started** (Phase 5): the backend does not yet emit appointment events to the TV, and the TV's `AppointmentActivity` is not listening.
- **Single-municipality demo** with a controlled seed (a handful of patients/appointments and real visit records). Only one patient is end-to-end call-testable today.
- **No dedicated team-leader/municipality role yet** — the role model is Personnel/Patient. The manager dashboard is conceptual.

**In short:** the visit-execution workflow and the call-signaling bridge are real and demonstrable. Live media, appointment sync, relative communication, route-awareness, and the manager analytics layer are designed but not yet built.

---

## 7. The core innovation: the active visit session (_Besøk_)

The research identifies the single biggest market gap as the absence of a true **active visit session**. Most systems have _tasks_ and _notes_, but no first-class concept of a live session that begins when the nurse _starts trying_ to complete a visit — not only when they are physically inside the home.

ViKom's _Besøk_ workspace is exactly this, and it is the heart of the product:

```
Nurse opens appointment
        │
        ▼
Start active visit session  ──────────────┐
        │                                  │  (live "økt" timer running)
        ▼                                  │
Review patient context (the right info)    │
        │                                  │
        ▼                                  │
Physical visit            Digital visit    │
   │                          │            │
   │                    Call attempt 1..3  │
   │                          │            │
   │                  answered / no-answer │
   │                  / declined / failed  │
   ▼                          ▼            │
Complete task checklist (done / skipped)   │
        │                                  │
        ▼                                  │
Quick structured note (auto-saved)         │
        │                                  │
        ▼                                  │
Close: Complete (+follow-up)  OR           │
       Cancel with structured reason  ─────┘
        │
        ▼
Audit trail preserved automatically
```

Why this matters for a municipal pitch:

- It **matches reality** — including the elderly-patient reality of multiple call attempts before a decision.
- It makes **exceptions first-class and easy to document**, turning the riskiest part of homecare into structured, auditable data.
- It produces **handover-ready information** as a by-product of normal work, not as extra admin.
- It generates the **operational signal** (failed contacts, deviations, overruns, digital-vs-physical outcomes) that the municipality needs to manage the service.

---

## 8. Design principles

These principles, drawn from the research and embodied in the prototype, govern every decision:

1. **Build for interruption.** The day is not linear; the app must handle pauses, repeated attempts, urgent inserts, and incomplete visits.
2. **Build for one-handed, fast use.** Staff are standing in hallways, sitting in cars, wearing gloves, moving quickly.
3. **Build for elderly accessibility.** The patient side is _simpler_ than a normal app — large text, clear sound, visible call state, minimal navigation, TV-first.
4. **Make exceptions easy to document.** Don't hide deviations — make them quick, structured, and normal to record.
5. **Don't replace the EPR too early.** Be a workflow-support layer that integrates with existing systems over time.
6. **Keep privacy and auditability in the core.** Every action carries responsible user, timestamp, patient relation, and visit/session context — automatically.
7. **Design for staff trust.** The app must visibly save time and protect staff, not merely monitor them.

### What ViKom deliberately avoids

A generic video-call app with healthcare branding · a premature EPR replacement · a route optimiser that ignores clinical reality · a documentation system that adds work · a patient app that assumes digital fluency · a dashboard that helps managers but not the frontline · a rigid checklist that makes care feel mechanical.

---

## 9. Roadmap

### Already delivered (prototype)

- Visit-execution workspace (_Besøk_) with sessions, tasks, call attempts, notes, complete/cancel.
- Patient clinical profiles, appointments, availability, dashboards, design system.
- Call-signaling bridge between web app and TV app over Supabase.

### Near term

- **Real WebRTC media** (audio/video) to replace dummy-SDP signaling.
- **Appointment realtime sync** to the TV (Phase 5): backend emits appointment events; TV displays and lets the patient confirm/decline.
- **Reliability hardening** of realtime events (deduplication, reconnection, ordering).

### Mid term

- **Team-leader / municipality role** and a **manager dashboard** built on the operational signal ViKom already captures (failed contacts, deviations, overruns, route stress, digital-vs-physical outcomes).
- **Structured deviation & escalation flows** (GP, team lead, relative, next shift) tied to the visit record.
- **Auto-generated handover summary** at end of visit/shift.
- **Structured micro-documentation** for very short visits.

### Longer term

- **Route-aware operations**: understand how one delay cascades, flag at-risk medication visits, support reassignment.
- **Relative communication**: permission-based, structured updates that reduce uncontrolled phone burden while preserving privacy.
- **Hybrid care orchestration**: fluidly convert digital ↔ physical visits with recorded rationale.

---

## 10. Future integrations (not yet built — direction of travel)

To become the central operational system, ViKom will need to connect into the existing municipal and national ecosystem. Candidate integrations, to be prioritised with municipal partners:

- **Electronic patient record (EPR/EPJ)** — the major Norwegian municipal systems (e.g. Gerica, Profil/Visma, CosDoc, and the _Helseplattformen_ in the Central-Norway region). ViKom as a workflow layer that reads relevant context and writes back structured visit outcomes, rather than duplicating the record.
- **National health infrastructure** — _Helsenorge_ / _Digihelse_ for patient-facing messaging; _Kjernejournal_ and the shared medication list (_Pasientens legemiddelliste_) for medication safety; HelseID for clinician identity.
- **Medication / eMAR** — safer medication confirmation, discrepancy capture, and escalation around multidose and post-discharge changes.
- **Welfare technology (_velferdsteknologi_)** — safety alarms, sensors, and digital supervision, with alerts routed into the visit workflow instead of creating parallel noise.
- **Scheduling / route-optimisation engines** — to make ViKom's live session data feed back into intelligent, geography-aware re-planning.
- **Identity & access** — municipal SSO / ID-porten alignment; relative access via delegated, consent-based permissions.
- **Analytics / BI & national reporting** (e.g. KPR/IPLOS-aligned reporting) — turning real operational signal into service-level insight and statutory reporting.

These are **aspirations to validate**, not commitments. The right integration order will be decided with municipal partners during field research and any pilot.

---

## 11. Research & validation plan

ViKom is in a research phase by design. The [research report](municipal-homecare-research-report.md) is our desk-research baseline; the next step is **primary research in the field**.

We intend to:

- **Interview frontline nurses and assistant nurses** across shift types (morning, evening, night) about the real shape of their day, their pain points, and where time disappears.
- **Interview team leaders and allocation-office staff** about planning, deviations, reporting, and accountability.
- **Engage adjacent actors** — GPs, hospital discharge coordinators, relatives, and welfare-technology providers.
- **Shadow real routes** (with consent and appropriate approvals) to observe interruptions, access problems, and documentation timing.
- **Run a small, controlled pilot** in one homecare unit to test the _Besøk_ workflow against the happy path _and_ the exception cases.

The goal is to ensure ViKom solves the _actual_ problems of the field — not the problems we assume from the outside — and to prioritise integrations and features against real frontline value.

---

## 12. Positioning: why ViKom

|                         | Existing tools                                                                   | ViKom                                                            |
| ----------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Built for**           | The happy path; one category (record, route, eMAR, video, alerts, messaging, BI) | The continuous frontline flow, **especially exceptions**         |
| **Visit model**         | Tasks and notes                                                                  | A live **active visit session** spanning attempts → outcome      |
| **Patient side**        | Smartphone app assuming digital fluency                                          | **TV-first**, radically simple, elderly-friendly                 |
| **Communication**       | Separate from documentation                                                      | Calls & attempts **auto-captured** into the record               |
| **Manager view**        | "How many visits completed"                                                      | **Workload pressure**: failed contacts, deviations, route stress |
| **Relationship to EPR** | Often tries to be the record                                                     | A **workflow layer** that integrates, not replaces               |

ViKom's defensible position is to **solve one painful workflow gap deeply**: how nurses start, conduct, document, and close physical or digital homecare visits — especially when the patient is hard to reach or the visit does not go as planned.

---

## 13. Privacy, security & compliance

Homecare data is among the most sensitive personal data there is. ViKom's design treats privacy and auditability as core, not bolt-on:

- **Auditability by construction** — every visit action carries responsible user, timestamp, patient relation, and session context automatically.
- **Clear authority boundaries** — Supabase proves identity; the backend authorises access and validates caregiver–patient relationships before exposing healthcare data.
- **Single source of truth** — healthcare data lives in the backend, avoiding the privacy and consistency risks of duplicated records across systems.
- **Consent-based relative access** — modelled in the data layer (`PatientUserLink` with a `Relative` relationship) for future, permission-controlled family communication.

A production deployment will require formal alignment with **GDPR / the Norwegian Personal Data Act**, the **Patient Records Act (_pasientjournalloven_)** and **Normen** (the health-sector code of conduct for information security), a **DPIA**, data-processor agreements, and Norwegian data residency. These are explicitly part of the path from prototype to pilot to procurement, to be undertaken with municipal and security stakeholders.

---

## 14. Appendix

### A. Technology stack

| Layer           | Technology                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Web app         | React 19, Vite, TypeScript, React Router, React-Bootstrap, Bootstrap Icons, `@supabase/supabase-js` |
| Backend         | ASP.NET Core, EF Core, ASP.NET Identity, JWT auth, Swagger; SQLite (dev)                            |
| TV app          | Android TV, Kotlin, WebRTC, Supabase SDK, Firebase Cloud Messaging                                  |
| Realtime / auth | Supabase (Auth + Realtime)                                                                          |

### B. Core domain entities

`User` (Personnel/Patient + clinical profile) · `Appointment` (the plan) · `Visit` (the execution) · `VisitTask` · `CallLog` (call attempts) · `Availability` / `AvailabilityWindow` · `PatientUserLink` (personnel/relative) · `PatientMedication`.

### C. Glossary (Norwegian ⇄ ViKom)

| Norwegian         | Meaning                                           | In ViKom                                  |
| ----------------- | ------------------------------------------------- | ----------------------------------------- |
| _Hjemmetjenesten_ | Municipal homecare service                        | The domain ViKom serves                   |
| _Besøk_           | Visit                                             | The active visit session workspace        |
| _Økt_             | Session                                           | The live visit timer                      |
| _Pårørende_       | Next of kin / relative                            | `PatientUserLink` (Relative)              |
| _Fastlege_        | General practitioner                              | Patient clinical profile field            |
| _Behandlingsplan_ | Treatment/care plan                               | Patient clinical profile field            |
| _Vedtak_          | Formal service decision                           | The "plan" level (future EPR integration) |
| _Statsforvalter_  | State administrator (supervises legality/quality) | Audience for audit/quality trail          |

### D. Source documents

- [`municipal-homecare-research-report.md`](municipal-homecare-research-report.md) — full domain & market-gap analysis.
- [`backend-integration-plan.md`](backend-integration-plan.md) — device roles, architecture, and the Supabase-as-bus decision.
- [`integration-roadmap.md`](integration-roadmap.md) — phased integration status (Phases 1–4 done; 5–6 pending).

---

_ViKom is an early prototype built on careful desk research. This vision describes both what we have proven and where we intend to go. The next phase — field research with nurses and municipal actors — will sharpen this direction into a solution that genuinely serves the people doing the work, the patients receiving care, and the municipalities accountable for both._
