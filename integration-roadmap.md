## ViKom Integration Roadmap

This plan establishes the realtime ecosystem between the Caregiver Webapp, backend, and TV app using Supabase, culminating in WebRTC calls and appointment sync. We prioritized the **Call Flow (Phase 4)** ahead of the **Appointment Flow (Phase 5)** to ship a fast, high-value proof-of-concept (POC) using the TV app's pre-existing call activities.

**Status:** Phases 1–4 are implemented and the call signaling round-trip works end-to-end between webapp and TV (signaling only, dummy SDP — no real audio/video yet). Phases 5–6 are not started. See [`HANDOFF.md`](HANDOFF.md) for the narrative walkthrough and step-by-step test instructions.

Legend: ✅ done · ⬜ not started

**Phases & Steps (Execution Order)**

**Phase 1: Patient & Device Linking** ✅

1. Backend: Expose `SupabaseProfileId` on `PatientListDto.cs` (and the new `PatientDetailsDto.cs`), mapped from `User.cs`.
2. Backend: `PatientService.cs` populates the TV device identifier so the frontend receives it via `PatientsController.cs`.
   - Also landed here: EF migration `AddSupabaseProfileId`, a defensive runtime `ALTER TABLE` + `MigrateAsync` "already exists" guard, and the demo-seed rework — all in `DBInit.cs`.

**Phase 2: Webapp Patient Flow** ✅

3. Backend: Implement `GET /api/patients/{id}` in `PatientsController.cs` (backed by `GetPatientByIdAsync` in `PatientService.cs`).
4. Frontend: Add the matching `PatientService.ts` `getById` method and build `PatientDetailsPage.tsx`, routed at `/patients/:id` in `App.tsx` and linked from `PatientListPage.tsx`.

**Phase 3: Supabase Realtime Bridge** ✅

5. Frontend: Install `@supabase/supabase-js`, inject `.env.local` secrets (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`), and build `SupabaseSignalingService.ts` to coordinate the shared channel (`webrtc-signaling`) and payloads. Client is created lazily and inbound messages are filtered by `targetUserId`.

**Phase 4: Call Flow (Prioritized for POC)** ✅

6. Frontend: Build `CallModal.tsx`. It emits `call_offer` events (dummy SDP) toward the target TV user's `SupabaseProfileId`, and sends `call_ended` on hang-up/cancel.
7. Frontend: Map incoming `call_answer` / `call_rejected` / `call_ended` events from the TV app back into UI state changes.
   - Gotcha: the `call_offer` payload **must** include `callerUsername` or the TV fails to deserialize the offer and the incoming-call screen never appears (see HANDOFF).

**Phase 5: Appointment Flow** ⬜

8. Backend: Bind `AppointmentsController.cs` and related services to emit realtime JSON events upon appointment status updates/creations.
9. Android TV: Construct a new `AppointmentActivity.kt`, view models, and realtime listeners for the `.appointment` namespace.
10. System: Form responses back to the backend.

**Phase 6: WebRTC Media Layer** ⬜

11. Frontend: Implement `RTCPeerConnection` to replace the dummy SDP string with live browser camera/microphone media.
12. System: Ensure ICE candidate exchange passes between Webapp and Android TV WebRTC managers.

**Verification**

1. ✅ Caregiver can view a specific patient and their details include the `SupabaseProfileId`.
2. ✅ Hitting "Ring pasient" dispatches a `call_offer` that the TV app catches, waking up the `IncomingCallActivity`.
3. ✅ Accepting on the TV flows a `call_answer` back via Supabase, shifting the Webapp `CallModal` out of the "Ringer…" state.
4. ⬜ Appointment CRUD actions reliably mirror to the new Android TV activities (Phase 5).

**Decisions**

- Phase 4 (Call) runs before Phase 5 (Appointments) to hit POC deadlines, as the TV side for calls already exists.
- Supabase is used strictly as a realtime event bus; .NET remains system-of-record over healthcare data.
- Calls target the patient's `SupabaseProfileId`. Only **Ingrid** is end-to-end testable today; Erik is mapped to a profile ID but has no TV login yet.
