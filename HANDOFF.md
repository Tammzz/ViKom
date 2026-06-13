# Handoff — Scope: Call Flow ("Ring pasient")

Hey! Here's a rundown of what I just added. Short version: a caregiver can now open a patient's profile from the patient list and hit **"Ring pasient"** to ring that patient's TV. The call offer goes out over **Supabase Realtime**, and the TV's answer/reject comes back and flips the modal out of its "Ringer…" state.

The big milestone: the call signaling flow is now working end-to-end between the webapp and TV app. A caregiver can open a patient profile, click Ring pasient, the TV receives the incoming call, and the response comes back to the webapp through Supabase Realtime. This is still signaling-only with a dummy SDP (no real audio/video yet), but the complete round-trip communication path is now functioning.

The full plan for this is available in this doc: [`call-flow-plan.md`](call-flow-plan.md). I have implemented phases 1, 2, 3 and 4 of that plan. There are still phases 5 and 6 left to complete of that plan.

## What works today

The following flow is working end-to-end:

```text
Caregiver (Webapp)
↓
Patient Details Page
↓
Ring pasient
↓
call_offer sent through Supabase Realtime
↓
TV App receives call
↓
IncomingCallActivity opens
↓
Accept / Reject
↓
call_answer sent back through Supabase Realtime
↓
Webapp updates CallModal state
```

At the moment this proves the communication path between the two applications. The actual audio/video connection has not been implemented yet.

## How the webapp and TV app communicate

Before working on the call flow, the first challenge was understanding how the webapp and TV app were expected to communicate.

The architecture uses Supabase as the shared communication layer between the two applications.

The webapp does not communicate directly with the TV app.

Instead:

```text
Caregiver (Webapp)
↓
Supabase Realtime
↓
TV App
```

When a caregiver rings a patient, the webapp sends a realtime event to Supabase. The TV app subscribes to the same realtime channel and receives that event.

Likewise, when the TV app accepts or rejects a call, it sends a realtime response back through Supabase, which the webapp listens for.

The first part of this work was therefore getting both applications connected to the same Supabase project and ensuring they were using the same realtime channel (webrtc-signaling).

## What I discovered during integration

Once the basic Supabase connection was working, I discovered that the webapp and TV app were actually referring to patients differently.

The webapp used backend patient records.

The TV app used Supabase-authenticated users.

This meant a caregiver could see a patient in the webapp, but there was no reliable way to determine which TV user should receive the call.

Example:

**Webapp Patient**

```text
Ingrid Berg
↓
Backend Patient ID = 1
```

**TV App User**

```text
Ingrid Berg
↓
Supabase Profile ID = c9f53a55-1375-48e6-95ce-25917f55be2d
```

Those identities looked like the same person but were actually stored in different systems. Because of that, the call flow had no reliable routing mechanism.

The symptom was:

```text
Webapp knows patient
↓
TV knows Supabase user
↓
No connection between them
↓
No reliable call routing
```

To solve this, I introduced SupabaseProfileId as the bridge between the two systems.

```text
Backend Patient
↓
SupabaseProfileId
↓
Supabase Profile
↓
TV App User
```

This is why SupabaseProfileId was added to the backend models and DTOs. The call flow now uses that Supabase profile ID as the target when sending realtime signaling messages.

## Why I changed the demo patients

While testing the TV app, I discovered that the demo users in the backend and the demo users in Supabase were not fully aligned.

Some patients existed only in the backend.
Some users existed only in Supabase.
Some names matched but represented different accounts.

To reduce confusion and create a reliable proof of concept, I trimmed the demo data down and mapped the backend patients directly to known Supabase users.

Currently:

```text
Ingrid Berg
↓
Mapped to real Supabase account
↓
Callable from webapp
↓
Can log into TV app
```

```text
Erik Johansen
↓
Mapped to Supabase profile ID
↓
Callable from webapp
↓
Cannot log into TV app yet (no password setup for login so can't verify that the user receives this call)
```

The long-term goal is for every patient in the backend to have a matching Supabase profile and TV account.

## Final integration bug (resolved)

The last issue preventing the call flow from working was a payload mismatch between the two codebases.

The TV app expected the following fields inside a call_offer payload:

```text
callerId
callerUserId
callerName
callerUsername
sdp
mediaType
```

However, the webapp was not sending callerUsername.

This meant:

```text
Webapp sends call_offer
↓
TV receives event
↓
TV attempts to deserialize payload
↓
callerUsername missing
↓
Incoming call screen never appears
```

The fix was updating the webapp payload so it now includes the required callerUsername field.

After that change, the signaling flow started working correctly end-to-end.

This is worth remembering because if calls suddenly stop working in the future, the first thing I'd check is whether both codebases still agree on the exact payload structure.

## Backend — what I changed and why

The backend changes were mainly focused on giving the webapp enough information to support the new patient details page and call flow.

### Patient details support

I added support for fetching a single patient's full details so the caregiver can click into a patient profile instead of only seeing the patient list.

The patient details response now includes:

- Contact information
- Appointment summaries
- Upcoming appointments
- The patient's `SupabaseProfileId`

The important addition here is `SupabaseProfileId`, because this is what links a backend patient record to a TV user in Supabase.

### Patient ↔ TV Linking

The biggest backend change was introducing `SupabaseProfileId` as a permanent part of the patient/user model.

This acts as the bridge between:

```text
Backend Patient
↓
Supabase Profile
↓
TV App User
```

Without this field, the webapp has no reliable way to know which TV device should receive a call.

### Database & migration work

I added the necessary migration and startup handling so existing local databases don't break when pulling these changes.

The goal was to make the changes as painless as possible for anyone updating an older development database.

### Demo data cleanup

I also cleaned up and simplified the seeded patient data.

The original demo patients didn't fully match the TV-side users stored in Supabase, which made testing confusing.

The seed data now focuses on:

- Ingrid Berg
- Erik Johansen

These patients are linked to known Supabase profiles and are intended to be used when testing the call flow.

### Files worth looking at

If you're trying to understand the backend changes, start here:

```text
backend/Controllers/PatientsController.cs
backend/Services/PatientService.cs
backend/Models/User.cs
backend/DAL/DBInit.cs
backend/DTOs/
```

## Frontend — what I changed and why

The frontend work focused on building the caregiver-side experience for viewing a patient and initiating a call.

### Patient details page

I added a dedicated patient details page that can be opened directly from the patient list.

Instead of only seeing a table of patients, caregivers can now:

- Open a patient profile
- View patient information
- View appointment summaries
- Initiate a call to the patient's TV

### Call flow UI

I added a call modal that handles the entire caregiver-side calling experience.

This includes states such as:

- Calling
- Ringing
- Accepted
- Rejected
- Ended

The goal was to make the call flow feel like a real feature instead of just firing a realtime event in the background.

### Supabase realtime signaling

I created the signaling layer responsible for communicating with the TV app through Supabase Realtime.

This is what sends:

```text
call_offer
```

and listens for:

```text
call_answer
call_rejected
call_ended
```

The webapp and TV app now communicate through the shared realtime channel:

```text
webrtc-signaling
```

### Reliability improvements

A few things were intentionally done to make the call flow more stable:

- Calling gracefully disables itself if Supabase environment variables are missing.
- Listeners are registered before offers are sent to avoid race conditions.
- Realtime subscriptions are cleaned up when the modal closes.
- Payloads were aligned with the TV app's expected structure.

### UI cleanup

While working on the feature, I also did some minor cleanup:

- Converted a few pages to use Bootstrap utility classes.
- Removed some older page-specific styling.
- Updated sidebar labels and icons.

### Files worth looking at

If you're trying to understand the frontend changes, start here:

```text
frontend/src/patients/pages/PatientDetailsPage.tsx
frontend/src/components/common/CallModal.tsx
frontend/src/services/SupabaseSignalingService.ts
frontend/src/patients/pages/PatientListPage.tsx
frontend/src/patients/types/patient.ts
frontend/src/App.tsx
```

## How to run & test it yourself

### Web side (caregiver)

1. Put these in `frontend/.env.local`:
   ```
   VITE_SUPABASE_URL=<dev supabase url>
   VITE_SUPABASE_ANON_KEY=<dev anon key>
   ```
   (Without them the app still loads fine — calling is just disabled.)
2. Run the backend + `npm run dev` in `frontend/`.
3. Log in as the nurse: **`nurse@homecare.local`** / **`Pass123!`**
4. Go to **Patients → Ingrid → "Ring pasient"**.

### TV side (Android Studio)

⚠️ **Only Ingrid is callable right now** — she's the one patient mapped to a working Supabase auth account. (Erik has a profile ID but no verified TV login yet.)

- Log the TV app into **Supabase Auth** as:
  - **Email:** `ingrid.berg@example.com`
  - **Password:** `Pass123!`
  - Dev Supabase project `ztgzlxzijzpbakbrybuw`, Ingrid's UID is `c9f53a55-1375-48e6-95ce-25917f55be2d`.
- Heads up: the web seed login `patient.ingrid@homecare.local` is the **backend** account — it is **not** the TV login. The TV authenticates against Supabase Auth, totally separate from the web app's SQLite identity.
- If TV login throws **"Database error querying schema"**, that's a known GoTrue/NULL-columns thing — ping me, I've got the fix-it SQL noted down.

### What you should see

Hitting Call dispatches a `call_offer` → the TV's `IncomingCallActivity` wakes up → you accept → a `call_answer` comes back over Supabase → the web `CallModal` leaves the "Ringer…" state and shows the call as active.

## Cross-repo touchpoints (so the TV side keeps matching)

- Both apps share the Supabase Realtime channel **`webrtc-signaling`**.
- The TV expects a specific inner payload on `call_offer`/`call_ended`: `callerId`, `callerUserId`, `callerName`, `callerUsername`, `sdp`, `mediaType`. If you change those field names on either side, the other stops deserializing.
- The web client filters inbound messages by **`targetUserId`**, so messages have to be addressed to the right UID.

## What's still left (from [`Plan.md`](Plan.md))

- **Phase 4 — Appointment Flow:** have the backend emit realtime events on appointment create/update, build the TV `AppointmentActivity.kt` + listeners, and send responses back to the backend.
- **Phase 6 — WebRTC media layer:** swap the dummy SDP for a real `RTCPeerConnection` (actual browser camera/mic) and get ICE candidate exchange working between web and TV. This is what turns the POC into a real video call.
- **Smaller follow-ups:**
  - Map more patients to real TV Supabase accounts (only Ingrid works end-to-end today).
  - Decide whether `GET /api/patients/{id}` should be scoped to the caregiver's _linked_ patients — right now any personnel can fetch any patient by id, which matches the existing `/all` endpoint but is worth a conscious decision.

Shout if anything's unclear — the call flow in particular has a few moving parts across the two repos. 🙂

## Workspace & Device Setup

If you're pulling this for the first time, I'd strongly recommend setting things up the same way I did so it's easier to debug across both codebases.

### VS Code Workspace Setup

The project is much easier to work with when both the webapp and TV app are open in the same workspace.

1. Open VS Code.

2. Go to:

   ```text
   File → Add Folder to Workspace...
   ```

3. Add:

   ```text
   vikom-webapp/
   vikom-tv/
   ```

   (or whatever your local folder names are)

4. Save the workspace:

   ```text
   File → Save Workspace As...
   ```

   Example:

   ```text
   vikom.code-workspace
   ```

This lets you:

- Search across both repos at once.
- Jump between webapp and TV code quickly.
- Use Copilot/Claude across the whole project.
- Trace the full call flow from web → Supabase → TV.

## Webapp Environment Setup

Create:

```text
frontend/.env.local
```

and add:

```env
VITE_SUPABASE_URL=https://ztgzlxzijzpbakbrybuw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Z3pseHppanpwYmFrYnJ5YnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzgwNjcsImV4cCI6MjA3ODExNDA2N30.AddPx3wxPqxshp7Nd36GNbofbJOnslLlDkh_A7odauk
```

Then restart:

```bash
npm run dev
```

If these variables are missing:

- The webapp still loads.
- The call functionality is disabled.

## Running Everything Locally

You'll typically have 3 things running:

### Terminal 1

Backend:

```bash
cd backend
dotnet run
```

### Terminal 2

Frontend:

```bash
cd frontend
npm install
npm run dev
```

### Android Studio

TV app.

## Running the TV App on an Android Device

I tested using a Samsung Android tablet.

### Enable Developer Mode

On your Android device:

```text
Settings
→ About Tablet / About Phone
→ Software Information
→ Tap "Build Number" 7 times
```

You should see:

```text
Developer mode has been enabled
```

### Enable USB Debugging

Go to:

```text
Settings
→ Developer Options
→ USB Debugging
```

Enable it.

### Connect Device

Connect your Android device to your computer using USB.

When prompted:

```text
Allow USB debugging?
```

Choose:

```text
Allow
```

and optionally:

```text
Always allow from this computer
```

### Verify Android Studio Detects the Device

Open Android Studio.

At the top near the Run button you should see your device listed.

Example:

```text
Samsung SM-X...
```

If not, open a terminal and run:

```bash
adb devices
```

You should see something like:

```text
List of devices attached

R58M12345AB    device
```

### Run the TV App

1. Open the TV app project in Android Studio.
2. Wait for Gradle sync to finish.
3. Select your Android device from the device dropdown.
4. Press the green Run button.

Android Studio will install the TV app onto the device.

## Logging Into the TV App

For testing the current call flow:

Use Ingrid's Supabase account:

```text
Email:
ingrid.berg@example.com

Password:
Pass123!
```

Important:

```text
patient.ingrid@homecare.local
```

is the backend/webapp patient account.

It is NOT the TV login.

The TV app authenticates directly against Supabase Auth.

## Quick Smoke Test

Once everything is running:

### TV App

Log in as:

```text
ingrid.berg@example.com
```

### Web App

Log in as:

```text
nurse@homecare.local
```

Then:

```text
Patients
→ Ingrid
→ Ring pasient
```

Expected flow:

```text
Webapp:
Ringer Ingrid...
```

↓

```text
TV App:
Incoming call screen appears
```

↓

```text
Accept (atm voice comm isn't enabled so i was unable to accept the call)
```

↓

```text
Webapp:
Call modal updates from "Ringer..." to active call
```

## If Something Doesn't Work

Check these first:

### Browser Console

Press:

```text
F12
```

Look for:

- Supabase errors
- Realtime errors
- Call payload errors

### Android Studio Logcat

Open:

```text
View → Tool Windows → Logcat
```

Search for:

```text
call_offer
call_answer
IncomingCall
Supabase
Realtime
WebRTC
```

Most issues we've found so far have been somewhere in the:

```text
Webapp
↓
Supabase Realtime
↓
TV App
```

communication chain.
