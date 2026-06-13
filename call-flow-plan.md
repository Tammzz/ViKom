## Plan: ViKom Integration & Call Flow

This plan establishes the complete realtime ecosystem between the Caregiver Webapp, backend, and TV app using Supabase, culminating in WebRTC calls and Appointment sync. We've prioritized the Call Flow (Phase 5) ahead of the Appointment Flow (Phase 4) to ensure a fast, high-value POC using the TV app's pre-existing call activities.

**Phases & Steps (Execution Order)**

**Phase 1: Patient & Device Linking**

1. Backend: Update `PatientListDto.cs` to expose `SupabaseProfileId` and ensure it maps from `User.cs`.
2. Backend: Wire up any mapping needed in `PatientsController.cs` so the frontend receives TV device identifiers.

**Phase 2: Webapp Patient Flow** 3. Backend: Implement `GET /api/patients/{id}` in `PatientsController.cs`. 4. Frontend: Add matching `PatientService.ts` method and build `PatientDetailsPage.tsx` with routing for the caregiver to select a unique patient.

**Phase 3: Supabase Realtime Bridge** 5. Frontend: Install `@supabase/supabase-js`, inject `.env` secrets, and build a `SupabaseSignalingService.ts` to coordinate channels and payloads.

**Phase 4: Call Flow (Prioritized for POC)** 6. Frontend: Build `CallModal.tsx`. Connect it to the signaling service to emit `call_offer` events with dummy SDP data payload toward the target TV user. 7. Frontend: Map incoming `call_answer`/`call_rejected` events from the TV app back into UI state changes.

**Phase 5: Appointment Flow** 8. Backend: Bind `AppointmentsController.cs` and related services to emit realtime JSON events upon appointment status updates/creations. 9. Android TV: Construct brand new `AppointmentActivity.kt`, view models, and realtime listeners for the `.appointment` namespace. 10. System: Form responses back to the backend.

**Phase 6: WebRTC Media Layer** 11. Frontend: Implement `RTCPeerConnection` to replace dummy SDP string data with live browser camera/microphone media blobs. 12. System: Ensure ICE candidate exchange passes perfectly between Webapp and Android TV WebRTC managers.

**Relevant files**

- `backend/Models/User.cs`
- `backend/DTOs/PatientListDto.cs`
- `backend/Controllers/PatientsController.cs`
- `frontend/src/patients/pages/PatientDetailsPage.tsx` (New)
- `frontend/src/shared/components/CallModal.tsx` (New)
- `frontend/src/services/SupabaseSignalingService.ts` (New)
- `vikom_project/.../activities/AppointmentActivity.kt` (New)

**Verification**

1. Caregiver can view a specific patient and their details include the `SupabaseProfileId`.
2. Hitting "Call" correctly dispatches a `call_offer` that the TV app catches, waking up the `IncomingCallActivity`.
3. Accepting on the TV flows back a `call_answer` event via Supabase, correctly shifting the Webapp `CallModal` out of the 'Ringing' state.
4. Appointment CRUD actions reliably mirror to the new Android TV activities.

**Decisions**

- Phase 5 runs before Phase 4 to hit POC deadlines, as the TV side for Call is already built.
- Supabase is used strictly as a realtime event bus; .NET maintains system-of-record over Healthcare Data.
