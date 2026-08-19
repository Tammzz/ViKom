# ViKom — Homecare Management

ViKom is a homecare system split across two applications:

* **This repo** — the web portal used by healthcare personnel (React frontend + ASP.NET Core Web API), and the backend that both applications share.
* **[vikom-tv-app](../vikom-tv-app)** — an Android app used by patients on a TV or tablet, for video calls with their caregiver and for viewing their appointments.

The backend is the system of record for all clinical data. Supabase is used alongside it for patient identity on the TV app and as a realtime event bus between the two.

## Prerequisites

* .NET 8.0 SDK
* Node.js v22 or later
* A Supabase project (only needed for the calling feature and the TV app endpoints)

## Project Structure

* **backend/** — ASP.NET Core Web API with SQLite database
* **backend.Tests/** — xUnit test project
* **frontend/** — React + TypeScript + Vite application

## Installation & Setup

### 1. Clone and navigate

```bash
git clone <repository-url>
cd ViKom
```

### 2. Backend setup

```bash
dotnet restore
dotnet run --project backend
```

The API starts at **http://localhost:5084**, with Swagger at **http://localhost:5084/swagger**.

The SQLite database is created and seeded automatically on first run in Development.

#### Supabase secret (only needed for the TV app's endpoints)

`/api/tv/*` authenticates access tokens issued by Supabase Auth, so it needs the project's JWT secret. Unlike the anon key this is a real secret, so it is kept in .NET user secrets rather than in `appsettings*.json`, which are committed:

```bash
dotnet user-secrets set "Supabase:JwtSecret" "<Supabase dashboard: Settings > JWT Keys > Legacy JWT Secret>" --project backend
```

Run this in a **normal** terminal, not an elevated one — user secrets are stored per Windows user, so an admin shell writes them somewhere the app will not look.

Without the secret the app still starts and the web portal works normally. Only `/api/tv/*` returns 401, and a warning is logged at startup saying so.

#### Letting the TV app reach the backend

The simplest option for a tablet connected by USB needs nothing here at all — forward the port down the cable instead:

```bash
adb reverse tcp:5084 tcp:5084
```

The device can then reach the backend on `127.0.0.1:5084` regardless of which network it is on, with no firewall changes. See the TV app's `local.properties.example`.

Over the LAN instead, the default profiles bind to `localhost`, which a physical tablet cannot reach. The `http-lan` profile binds all interfaces:

```bash
dotnet run --project backend --launch-profile http-lan
```

You will also need an inbound firewall rule for TCP 5084 on your private network (Windows requires an administrator terminal for this):

```powershell
New-NetFirewallRule -DisplayName "ViKom backend dev 5084" -Direction Inbound -Protocol TCP -LocalPort 5084 -Action Allow -Profile Private
```

To check it works, open `http://<your-lan-ip>:5084/swagger` in the tablet's own browser. HTTPS redirection is disabled in Development so the device can use plain HTTP; production re-enables it automatically.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env.local` and fill in your Supabase project values:

```bash
cp .env.example .env.local
```

These are only used by the "Ring pasient" call feature. The portal runs without them, but the call button will report that Supabase is not configured.

```bash
npm run dev
```

The frontend starts at **http://localhost:5173**. In Development the backend accepts any loopback origin, so Vite picking a different port when 5173 is taken will not break CORS.

## Running the Application

1. Start the backend (`dotnet run --project backend`)
2. In a separate terminal, start the frontend (`npm run dev` from `frontend/`)
3. Open **http://localhost:5173**

## Default Accounts

Seeded automatically in Development. All use the password **Pass123!**

| Role | Username | Notes |
|---|---|---|
| Personnel | nurse@homecare.local | Nurse Nora — the main portal account |
| Patient | patient@homecare.local | Erik Johansen |
| Patient | patient.ingrid@homecare.local | Ingrid Berg — linked to a Supabase profile, so this is the one to use when testing the TV app |

The web portal is personnel-only: the patient accounts above are kept because a patient *is* a user row that appointments and visits point at, but they cannot log into the portal (login returns 403). Patients sign in on the TV app through Supabase instead.

Only patients with a `SupabaseProfileId` receive realtime appointment events or can be called on a TV. That field is currently set only by the seeder.

## Testing

```bash
dotnet test backend.Tests/backend.Tests.csproj
```

## Technology Stack

### Backend
* ASP.NET Core 8.0 Web API
* Entity Framework Core with SQLite
* ASP.NET Core Identity
* JWT bearer authentication — two schemes: the portal's own tokens, and Supabase-issued tokens for the TV app

### Frontend
* React 19 + TypeScript
* Vite
* React Router
* Bootstrap 5 + Bootstrap Icons + React Bootstrap
* Supabase JS client (realtime signaling for calls)

## Features

* Role-based authentication (Patient, Personnel)
* Personnel availability management with weekly and daily calendar views
* Appointment booking and scheduling
* Visit ("Besøk") execution workspace with task tracking and visit records
* Video/audio calls from the portal to a patient's TV app
* Realtime appointment events pushed to the patient's TV app on create, update and cancel
* User-specific dashboards
* Responsive design for mobile and desktop
