# ViKom backend integration plan

**Date:** May 2026  
**Status:** Plan proposal  
**Scope:** Preliminary plan for connecting the web app and TV app through the .NET backend, while keeping Supabase for auth and realtime only.

## Summary

This document outlines our proposed direction for how the ViKom ecosystem should communicate across devices.

The goal of the project is not only to build another healthcare application, but to improve communication and coordination between caregivers and elderly patients through a connected digital system.

The system is built around three main parts:
- A caregiver-facing web/tablet application
- A .NET backend that manages business logic and healthcare data
- A Smart TV application designed for elderly users

Supabase will continue to be used for:
- authentication
- realtime communication

The .NET backend will remain the main source of truth for healthcare-related data such as appointments, scheduling, patient-caregiver links, and visit records.

We intentionally want to keep the first phase relatively small and realistic. Instead of overengineering the system early, we want to establish a stable foundation that can evolve gradually as the project grows.

## 1) Project goal

The main goal of the system is to create a smoother and more flexible communication flow between caregivers and elderly patients.

Today, communication often relies on:
- phone calls
- manual coordination
- physical visits for issues that could potentially be solved digitally

The ViKom solution aims to improve this by allowing:
- caregivers to communicate digitally with patients
- patients to respond directly through their TV interface
- appointment coordination to happen more efficiently
- municipal staff to organize visits more intelligently

The Smart TV application is designed to function as a simplified communication interface for elderly users.
The caregiver web/tablet application functions as the management and coordination interface.
Together, the two apps form one connected ecosystem.

## 2) Device roles

To keep responsibilities clear, each part of the system has a specific role.

| Device/System | Main Responsibility |
|---|---|
| Web/Tablet App | Caregiver planning, scheduling, communication, administration |
| Smart TV App | Simplified patient interaction and communication |
| .NET Backend | Business logic, healthcare data, validation |
| Supabase | Authentication and realtime message delivery |

This separation helps avoid confusion and prevents multiple systems from owning the same healthcare data.

## 3) Architecture

We are connecting three main parts:

- **Web app**: used by caregivers to manage appointments and patient communication
- **.NET backend**: stores and validates healthcare business data
- **TV app**: used by patients to receive updates and respond

Supabase stays in the middle for two purposes only:

- authentication
- realtime updates

This means we avoid turning Supabase into a second business database.

We chose this approach because:

- it keeps the architecture simpler
- it reduces synchronization issues
- it gives us one clear source of truth
- it allows the project to scale gradually

# 4) Simple Communication Flow

### Appointment creation flow

1. A caregiver creates or updates an appointment in the web app.
2. The web app sends the request to the backend.
3. The backend validates and stores the appointment.
4. The backend sends a realtime event through Supabase.
5. The TV app receives the update and shows it to the patient.
6. The patient can respond directly from the TV interface.
7. The response is sent back to the backend.
8. The caregiver receives the updated status.

## 5) User experience goals

### Caregiver experience

The caregiver interface should help healthcare workers:

- manage appointments and schedules
- communicate with patients more efficiently
- reduce unnecessary travel
- organize visits geographically
- receive patient responses in realtime

The system should support faster planning and reduce administrative friction.

### Patient (TV) experience

The Smart TV interface should remain:

- simple
- calm
- readable
- easy to navigate with a remote

The patient should be able to:

- receive appointment requests
- confirm or decline visits
- receive reminders and messages
- participate in video communication when needed

The TV application is intentionally simplified to reduce cognitive load for elderly users.

## 6) Shared data (First phase)

For the initial phase, we only need a small set of shared records.

### Core entities

- **Patient**: the person receiving care
- **Caregiver**: the healthcare worker
- **Appointment**: the scheduled visit or interaction
- **PatientUserLink**: relationship between patient and caregiver
- **Message/Event**: realtime communication between systems

### What we keep simple for now

To avoid unnecessary complexity in the first phase:

- appointment tasks remain a simple string field
- appointment statuses stay minimal
- only essential data is sent to the TV app

### What we avoid for now

- advanced task normalization
- overly complex event systems
- unnecessary fields and relationships
- large-scale infrastructure optimization

The focus of the first phase is proving the communication flow between devices.

## 7) Realtime messages

A realtime message is the small JSON package sent through Supabase Realtime.

It allows both applications to receive updates instantly.

Each message contains:

- event type
- timestamp
- payload data
- version

Example:

```json
{
  "eventType": "appointment.created",
  "version": "v1",
  "timestamp": "2026-05-13T09:00:00Z",
  "payload": {
    "appointmentId": 42,
    "caregiverName": "Nurse Nora"
  }
}
```

We want to keep the event system simple and consistent.

## 8) Versioning

We include a simple version field because the system will likely evolve over time.

For example:

- tasks may later become structured objects instead of plain text
- new appointment states may be added
- additional TV features may appear later

Versioning helps us:

- avoid breaking older clients
- roll out updates gradually
- maintain stability during development

For the first phase, we only use:

```text
v1
```

## 9) Security & Access Control

We keep the security model straightforward.

### Supabase responsibilities

- handles user login
- verifies identity

### Backend responsibilities

- determines what data a user can access
- validates caregiver-patient relationships
- protects healthcare data

This creates a clear separation:

- Supabase proves who the user is
- the backend decides what the user is allowed to do

## 10) Existing Supabase Tables

The current Supabase project already contains tables such as:

- profiles
- contacts
- priority_contacts
- call_history

Our approach is:

- keep authentication-related data in Supabase
- gradually move business-critical healthcare data into the backend
- avoid duplicating important records across systems

## 11) First Build Plan

### Phase 1

- establish backend ↔ TV communication
- add token exchange flow
- implement basic appointment response flow
- keep realtime events minimal and stable

### Phase 2

- improve reliability of realtime events
- prevent duplicate requests
- improve synchronization between devices

### Phase 3

- improve logging and monitoring
- refine scheduling logic
- improve task structure if needed
- expand analytics and reporting

## 12) Long-Term Direction

As the project evolves, the system may later support:

- more advanced route optimization
- better caregiver planning tools
- richer TV communication features
- family-member interaction
- cross-device synchronization across mobile, tablet, and TV

However, our current focus is establishing a stable and understandable communication foundation between the caregiver platform and the Smart TV application.

The first priority is proving that the ecosystem works together in a reliable and user-friendly way.
