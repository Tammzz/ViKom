# Integration Contracts — ViKom (.NET ↔ TV via Supabase)

**Date:** May 2026  
**Status:** Phase 0 (Contract Freeze)  
**Scope:** Unify healthcare workflow data under .NET backend as the single source of truth, while keeping Supabase only for realtime signaling/presence delivery.

## Purpose & Assumptions

- **.NET backend is source-of-truth** for business data (appointments/schedules/tasks/caregiver-patient links).
- **TV app retains Supabase auth + Realtime** for signaling/presence only.
- **TV app performs business writes to .NET backend** (after token-exchange mapping).
- **All realtime UI updates on TV** are driven by Supabase events published by the .NET backend.
- **Supabase auth remains on TV app** with backend identity mapping/token exchange bridge for secure access.

---

## Core Entities

### 1) Patient
- `id`: string (GUID) — backend `User.Id` (ASP.NET Identity)
- `name`: string (display-only, from `User.FullName`)
- `supabaseProfileId`: string — maps Supabase `profiles.id` (backend `User.SupabaseProfileId`, unique indexed)
- `role`: string ("Patient") — enforced by `User.Role`
- **Privacy rule:** only `id`, `name` included in realtime events; PII (address, DOB) removed

### 2) Caregiver (Personnel)
- `id`: string (GUID) — backend `User.Id`
- `name`: string — from `User.FullName`
- `role`: string ("Personnel") — enforced by `User.Role`
- `supabaseProfileId`: string — maps Supabase `profiles.id` (backend `User.SupabaseProfileId`, unique indexed)
- `contactHint`: string (optional, e.g., avatar URL or initials for TV display)

### 3) Appointment
- `id`: int — backend `Appointment.Id` (primary key)
- `patientId`: string (GUID) — backend `Appointment.PatientId` (FK to `User.Id`)
- `caregiverId`: string (GUID) — inferred from `Availability.PersonnelId` (via `Appointment.AvailabilityId` → `Availability.PersonnelId`)
- `scheduledStartUtc`: string (ISO 8601) — computed from `Availability.Date` + `Availability.StartTime` (combined into UTC datetime)
- `scheduledEndUtc`: string (ISO 8601) — computed from `Availability.Date` + `Availability.EndTime`
- `tasks`: string (comma-separated, e.g., "Medication, Vitals, Exercises") — backend `Appointment.Tasks`
  - **Note:** Array-of-objects format deferred to Phase 2 (Task normalization)
  - For TV consumption, parse comma-separated into array client-side or use minimal DTO wrapper
- `status`: string enum — `"Booked" | "InProgress" | "Completed" | "Cancelled"` (backend `Appointment.Status`, case-sensitive)
  - Map to TV enum: `"proposed"` (Booked), `"in_progress"` (InProgress), `"completed"` (Completed), `"cancelled"` (Cancelled)
- `createdAt`: string (ISO) — backend `Appointment.AvailabilityId` → `Availability.Date` (no explicit created_at on Appointment model; use Date as proxy)
- `lastUpdatedAt`: string (ISO) — same as createdAt for v1 (audit/update tracking deferred to Phase 2)
- `createdBy`: string (GUID) — inferred from `Availability.PersonnelId`
- `correlationId`: string (optional, for tracing) — client-supplied, propagated through publish events

### 4) Message (Realtime Event Payload Wrapper)
- `eventId`: string (GUID) — backend-generated, unique per event
- `eventType`: string — e.g., `"appointment.created"`, `"appointment.updated"`, `"call.started"`
- `version`: string — e.g., `"v1"` (for compatibility during upgrades)
- `timestamp`: string (ISO 8601 UTC) — when event was emitted
- `idempotencyKey`: string (optional) — for deduplication; matches client request key if applicable
- `payload`: object (event-specific, see Realtime Events section)
- `initiatedBy`: string (GUID, user id) — who triggered the change
- `correlationId`: string (optional) — traces back to original request

### 5) PatientUserLink (existing model)
- `id`: int — backend `PatientUserLink.Id`
- `patientId`: string (GUID) — backend `PatientUserLink.PatientId`
- `secondaryUserId`: string (GUID) — backend `PatientUserLink.SecondaryUserId` (Caregiver/Personnel)
- `relationshipType`: string — `"Personnel" | "Relative"` (backend `PatientUserLink.RelationshipType`)

---

## Entity Relationships

```
User (1) ──(many PatientUserLink.PatientId)──> Patient
User (1) ──(many PatientUserLink.SecondaryUserId)──> Caregiver (Personnel)
Caregiver (1) ──(many Availability)──> Availability
AvailabilityWindow (1) ──(many Availibity slots)──> Availability  [Cascade Delete]
Availability slot (1) ──(0 or 1 Appointment)──> Appointment  [Cascade Delete]
Patient (1) ←─ (many Appointment)
```

**Note:** `AvailabilityWindow` groups recurring availability slots. Each slot (`Availability`) can be booked by 0 or 1 `Appointment`. Therefore, 1 AvailabilityWindow can indirectly have many Appointments across its multiple Availability slots.

---

## Core Flows (Sequence Diagrams)

### Flow A — Caregiver Proposes Appointment

1. **Caregiver uses web app** → `POST /api/appointments` to .NET backend with `AppointmentDto`:
   ```json
   {
     "patientId": "550e8400-e29b-41d4-a716-446655440000",
     "availabilityId": 42,
     "tasks": "Medication, Vitals",
     "idempotencyKey": "req-12345-uuid"
   }
   ```

2. **Backend validates:**
   - Caregiver → patient link exists (via `PatientUserLink`)
   - `Availability` with id `availabilityId` exists and is unbooked
   - Appointment status transitions are valid

3. **Backend writes** `Appointment` with `Status: "Booked"`, sets `PatientId`, derives `caregiverId` from `Availability.PersonnelId`, sets `createdBy`.

4. **Backend responds** `201 Created` with `AppointmentDto` representation including computed `scheduledStartUtc`, `scheduledEndUtc`.

5. **Backend publishes Supabase event** `appointment.created` on channel `patient:{patientSupabaseProfileId}` with Message wrapper.

### Flow B — TV Receives Appointment Request

1. **TV app subscribes** to Supabase realtime channel `patient:{patientSupabaseProfileId}` and receives `appointment.created` message.

2. **TV parses event** and shows incoming appointment UI to patient with:
   - Caregiver display name (from payload)
   - Scheduled time (ISO datetimes from payload)
   - Tasks summary (comma-separated string, optionally parsed client-side)
   - `appointmentId` (int), `correlationId` for later responses

3. **Patient taps Accept/Decline** → TV calls backend response endpoint (Flow C).

### Flow C — Patient Responds to Appointment

1. **TV performs token exchange:**
   - Send Supabase JWT token to backend → `POST /api/auth/supabase-exchange` (new Phase 1 endpoint)
   - Backend resolves `User.SupabaseProfileId`, returns scoped backend JWT token

2. **TV calls:**
   ```
   POST /api/appointments/{appointmentId}/respond
   ```
   with body:
   ```json
   {
     "action": "accept",
     "notes": "optional patient notes",
     "idempotencyKey": "req-xyz-uuid",
     "correlationId": "corr-trace-id"
   }
   ```

3. **Backend authenticates** mapped user, verifies `patientId` matches caller identity (from mapped token).

4. **Backend updates** `Appointment.Status` to `"InProgress"` (if accepted) or `"Cancelled"` (if declined).

5. **Backend publishes** `appointment.updated` event to channels:
   - `patient:{patientSupabaseProfileId}`
   - `caregiver:{caregiverSupabaseProfileId}` (notify caregiver of patient response)

### Flow D — Backend Updates Appointment (Other Sources)

- Any backend write (caregiver reschedules, web app cancels, system transitions status) follows same pattern:
  - Validate, write to database, respond with updated `AppointmentDto`
  - Publish `appointment.updated` event to relevant Supabase channels

---

## Realtime Events (Names & Schemas)

### 1) `appointment.created`
Published when a new appointment is created (status `Booked`).

```json
{
  "eventId": "evt-550e8400-e29b-41d4-a716-446655440001",
  "eventType": "appointment.created",
  "version": "v1",
  "timestamp": "2026-05-12T12:00:00Z",
  "idempotencyKey": "req-12345-uuid",
  "initiatedBy": "550e8400-e29b-41d4-a716-446655440099",
  "correlationId": "corr-trace-id",
  "payload": {
    "appointment": {
      "id": 42,
      "patientId": "550e8400-e29b-41d4-a716-446655440000",
      "caregiverId": "550e8400-e29b-41d4-a716-446655440011",
      "caregiverName": "Nurse Nora",
      "scheduledStartUtc": "2026-05-13T09:00:00Z",
      "scheduledEndUtc": "2026-05-13T09:30:00Z",
      "tasks": "Medication, Vitals",
      "status": "Booked",
      "createdAt": "2026-05-12T12:00:00Z"
    }
  }
}
```

### 2) `appointment.updated`
Published on status changes or important edits.

```json
{
  "eventId": "evt-550e8400-e29b-41d4-a716-446655440002",
  "eventType": "appointment.updated",
  "version": "v1",
  "timestamp": "2026-05-12T13:30:00Z",
  "idempotencyKey": "req-xyz-uuid",
  "initiatedBy": "550e8400-e29b-41d4-a716-446655440000",
  "correlationId": "corr-trace-id",
  "payload": {
    "appointment": {
      "id": 42,
      "patientId": "550e8400-e29b-41d4-a716-446655440000",
      "caregiverId": "550e8400-e29b-41d4-a716-446655440011",
      "scheduledStartUtc": "2026-05-13T09:00:00Z",
      "scheduledEndUtc": "2026-05-13T09:30:00Z",
      "tasks": "Medication, Vitals",
      "status": "InProgress",
      "lastUpdatedAt": "2026-05-12T13:30:00Z"
    },
    "delta": {
      "status": ["Booked", "InProgress"]
    }
  }
}
```

### 3) `call.started` (Phase 5)
Published when TV app initiates or enters a call session (optional minimal schema, planned for Phase 5).

```json
{
  "eventId": "evt-call-001",
  "eventType": "call.started",
  "version": "v1",
  "timestamp": "2026-05-13T09:05:00Z",
  "payload": {
    "callId": "call-550e8400-e29b-41d4",
    "appointmentId": 42,
    "callerId": "550e8400-e29b-41d4-a716-446655440000",
    "calleeId": "550e8400-e29b-41d4-a716-446655440011",
    "mediaType": "audio",
    "startedAt": "2026-05-13T09:05:00Z"
  }
}
```

---

## Channels & Routing

- **Per-patient channel** for patient-facing appointment events: `patient:{patientSupabaseProfileId}`
  - Publish: `appointment.created`, `appointment.updated` (when patient is involved)
  
- **Per-caregiver channel** for caregiver notifications: `caregiver:{caregiverSupabaseProfileId}`
  - Publish: `appointment.created` (patient notified), `appointment.updated` (patient response notifications)

- **For system-wide events** (not used in v1): `appointments:global` (reserved, minimal payload only)

- **Privacy rule:** Publisher must route events to minimum necessary audience. Do not broadcast to `public` channel.

---

## Versioning & Compatibility

- Every `Message` must include `version` and `eventType` fields.
- Keep `v1` stable through Phase 2.
- For breaking changes (e.g., restructuring `tasks` from string to array), create new event types `appointment.v2.created` or bump `version: "v2"` and support both client-side.
- Migration window: support both old and new formats for 1–2 releases before deprecation.

---

## Security & Privacy

### Authentication & Authorization

1. **TV app authenticates with Supabase** (existing flow, unchanged).
2. **TV app exchanges Supabase JWT for backend JWT** (Phase 1 new flow):
   - Endpoint: `POST /api/auth/supabase-exchange` (to be implemented in `AuthController.cs`)
   - Request: `{ "supabaseToken": "..." }`
   - Response: `{ "backendJwt": "...", "expiresIn": 3600 }`
   - Backend resolves `User.SupabaseProfileId` to `User.Id`, validates mapping, returns scoped JWT
3. **Backend enforces RBAC** on appointment endpoints:
   - Patient role can only read/update own appointments (check `patientId` == caller)
   - Personnel role can create appointments for linked patients (via `PatientUserLink`)
4. **Validate `SupabaseProfileId` → backend `User.Id` mapping** with strict **uniqueness constraint** on `User.SupabaseProfileId` (already in place).

### Data Minimization in Events

- Events must NOT include sensitive PII (full address, DOB, medical history, full notes).
- Sensitive details (e.g., detailed visit notes) should be fetched via authenticated HTTP endpoints, not embedded in Supabase events.
- Realtime events include only: appointment id, user ids, time, tasks summary, status, caregiver/patient names.

---

## Idempotency & Retries

### Client Side (TV App)

- All write requests must include `idempotencyKey` header: `X-Idempotency-Key: {UUID}`
- Example: `POST /api/appointments/{id}/respond` includes `"idempotencyKey": "req-12345-uuid"` in body

### Backend Side

- **Idempotent writes:** Store `(endpoint, idempotencyKey, statusCode, responseBody)` in cache/outbox for 24 hours
- **Conflict detection:** Return `409 Conflict` if same `idempotencyKey` used with different request payload
- **Retry safety:** Repeated requests with same `idempotencyKey` return cached response (idempotent)

### Event Publishing (Supabase)

- Embed `idempotencyKey` in events to allow subscriber deduplication
- **Retry policy:** Exponential backoff (1s → 2s → 4s → 8s) with jitter, up to 5 retries
- **Dead-letter queue:** After 5 failures, log to dead-letter table for manual review (Phase 3)

---

## Reconciliation & Snapshots

### Snapshot Endpoint

```
GET /api/appointments/snapshot?patientId={patientId}
```
**Note:** Reuses existing `GET /api/appointments/patient/{patientId}` endpoint. Alternatively, add explicit snapshot endpoint in `AppointmentsController.cs` with `lastSnapshotAt` metadata.

**Response:**
```json
{
  "appointments": [...],
  "lastSnapshotAt": "2026-05-12T12:00:00Z",
  "count": 5
}
```

### TV Reconciliation Logic

- On app startup, call snapshot endpoint to fetch canonical state
- Subscribe to realtime events and apply incrementally
- Periodically (every 5 minutes) if no events received, fetch snapshot again to detect any missed updates
- Use `lastSnapshotAt` to determine freshness tolerance

---

## Observability & Tracing

### Correlation IDs

- Every operation (client request, backend write, event publish) should accept and propagate a `correlationId`:
  - **Header:** `X-Correlation-ID: {UUID}` (standard HTTP header)
  - **Event payload:** Embedded in `Message.correlationId`
  - **Logs:** Include `correlationId` in all backend logs for cross-system tracing

### Metrics & Alerts

- **Publish latency:** Time from write commit to Supabase event delivery (target: < 500ms)
- **Failed event count:** Track dead-letter queue size and alert if > 10 per hour
- **Token exchange failures:** Track 401/403 rates and alert if > 1% of requests
- **TV cache staleness:** Track age of last received event and alert if > 5 minutes

---

## Errors & Common Failure Modes

### Unmapped Supabase Profile
- **Scenario:** TV app has valid Supabase token but user not yet linked to backend
- **Response:** `401 Unauthorized` with JSON body:
  ```json
  {
    "errorCode": "UNMAPPED_SUPABASE_PROFILE",
    "message": "Supabase profile not linked to backend account. Please contact support.",
    "remediationUrl": "https://app.example.com/link-profile"
  }
  ```

### Unauthorized Patient Access
- **Scenario:** Patient token attempts to read another patient's appointment
- **Response:** `403 Forbidden` with `errorCode: "NOT_OWNER"`

### Event Publish Failure
- **Scenario:** Backend commits appointment change but Supabase event publish fails
- **Handling:**
  - Backend still returns 200 to client (change is durable)
  - Flag response with `"publishStatus": "pending"` if needed for client awareness
  - Retry publisher in background (Phase 3)
  - TV client will reconcile via snapshot if event never arrives

---

## Minimal API Endpoints (Backend)

### Appointment CRUD

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/appointments` | List appointments (role-aware filter) |
| `GET` | `/api/appointments/{id}` | Get single appointment |
| `GET` | `/api/appointments/patient/{patientId}` | List appointments for patient (snapshot) |
| `POST` | `/api/appointments` | Create appointment (idempotent) |
| `PUT` | `/api/appointments/{id}` | Update appointment (status, tasks) |
| `POST` | `/api/appointments/{id}/respond` | Patient accept/decline (NEW, Phase 1) |
| `DELETE` | `/api/appointments/{id}` | Cancel appointment |

### Authentication & Mapping (Phase 1)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/auth/supabase-exchange` | Exchange Supabase token for backend JWT (NEW) |
| `POST` | `/api/auth/supabase-link` | Link existing user to Supabase profile (NEW) |

### Call Logging (Phase 5)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/calls/log` | Log call lifecycle (started/connected/ended) (NEW) |

---

## Compatibility Notes

### ID Types
- **Appointment ID:** `int` (primary key in `Appointment` table)
- **User IDs (patientId, caregiverId):** `string` (GUID from ASP.NET Identity)
- **Supabase Profile ID:** `string` (UUID from Supabase)
- Convert types in DTOs/events as needed (e.g., JSON serialization handles int/string)

### Task Format (Current vs. Planned)

**Current (v1):** Tasks stored as comma-separated string on `Appointment.Tasks`
- Example: `"Medication, Vitals, Exercises"`
- TV app parses client-side into array if needed

**Planned (Phase 2):** Normalize into dedicated `Task` table
- Create new `Task` model with `id`, `appointmentId`, `title`, `completed`, `notes`, `order`
- Update `AppointmentDto.tasks` to return array of task objects
- Provide separate endpoint `GET /api/appointments/{id}/tasks` for detailed task management

### Date/Time Handling

- **Backend storage:** `Availability.Date` (DateOnly) + `Availability.StartTime`/`EndTime` (TimeSpan)
- **TV consumption:** Compose into `scheduledStartUtc` / `scheduledEndUtc` (ISO 8601 UTC strings)
- **Backend DTOs:** `AppointmentDto` includes computed UTC datetime strings for TV
- **TV display:** Parse ISO datetime, convert to local timezone client-side

### Existing Endpoints Reused

- `GET /api/appointments/patient/{patientId}` — serves as snapshot endpoint
- `GET /api/dashboard/patient/{patientId}` — (optional) aggregated patient view for future use

---

## Appendix: Sample Minimal Appointment DTO (TV-Facing)

```json
{
  "id": 42,
  "caregiverDisplayName": "Nurse Nora",
  "scheduledStartUtc": "2026-05-13T09:00:00Z",
  "scheduledEndUtc": "2026-05-13T09:30:00Z",
  "tasks": "Medication, Vitals",
  "status": "Booked",
  "correlationId": "corr-trace-id",
  "createdAt": "2026-05-12T12:00:00Z"
}
```

---

## Phase 0 Checkpoint

- [x] Core entities defined with field-level mappings to backend models
- [x] Flows A–D documented with exact API endpoints and request/response payloads
- [x] Realtime event schemas finalized
- [x] Channel routing strategy defined (per-patient, per-caregiver)
- [x] Security model (auth exchange, RBAC, PII minimization) documented
- [x] ID types, task format, and date/time handling clarified
- [ ] Next: Phase 1 — Identity bridge implementation in backend (AuthController, token exchange)

**Reviewed & Approved By:** [Pending team sign-off]  
**Last Updated:** 2026-05-12
