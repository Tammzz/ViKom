# Phase 4 Preview: Business Logic Migration

## Overview

Phase 4 will migrate the complete business logic, data access, and UI from the MVC project to the new React + API architecture.

---

## Phase 4 Task Breakdown

### 1. Models & DTOs Migration

#### From MVC Project (`HomeCareApp/Models/`)
- `User.cs` ✅ (Already in backend)
- `Appointment.cs` → Migrate
- `Availability.cs` → Migrate
- Map properties to DTOs

#### Create Missing DTOs (`backend/DTOs/`)
- `AppointmentDto.cs`
- `AvailabilityDto.cs`
- `PatientDto.cs`
- `PersonnelDto.cs`
- Ensure all DTOs use proper data annotations

### 2. Repository Implementation

#### Implement Actual Data Access
- `IAppointmentRepository` → Full CRUD with EF Core
- `IAvailabilityRepository` → Full CRUD with EF Core
- `IUserRepository` → Extend with patient/personnel queries

#### Business Logic
- Appointment scheduling validation
- Availability conflict checking
- Date/time handling
- Status management

### 3. Controller Implementation

Replace all `// To be implemented` stubs with:
- Actual repository calls
- Proper error handling
- Input validation
- Business rule enforcement
- Appropriate HTTP status codes

### 4. Frontend Type Definitions

#### Update/Create Types (`frontend/src/types/`)
- `appointment.ts` - Match backend DTOs
- `availability.ts` - Match backend DTOs
- `patient.ts` - Based on User model
- `personnel.ts` - Based on User model

### 5. UI Components

#### Patients Module
- `PatientListPage.tsx` - Data table with search/filter
- `PatientForm.tsx` - Create/Edit form
- `PatientDetail.tsx` - View details

#### Personnel Module
- `PersonnelListPage.tsx` - Data table with search/filter
- `PersonnelForm.tsx` - Create/Edit form
- `PersonnelDetail.tsx` - View details

#### Appointments Module
- `AppointmentListPage.tsx` - Calendar/list view
- `AppointmentForm.tsx` - Booking form with validation
- `AppointmentDetail.tsx` - View/cancel appointment

#### Availability Module
- `AvailabilityPage.tsx` - Personnel schedule grid
- `AvailabilityForm.tsx` - Set availability slots
- `AvailabilityCalendar.tsx` - Visual calendar view

#### Users Module (Admin)
- `UsersPage.tsx` - Admin user management
- `UserForm.tsx` - User creation/editing
- Role-based access control

### 6. Dashboard Implementation

#### Dashboard Components
- Statistics widgets (total patients, appointments, etc.)
- Upcoming appointments list
- Recent activity feed
- Quick actions based on role

### 7. Business Rules

Migrate from MVC project:
- Appointment scheduling rules
- Availability overlap prevention
- Role-based permissions
- Date/time validation
- Status transitions

---

## Migration Strategy

### Step 1: Database & Models (Week 1)
1. Verify all models exist in backend
2. Create missing DTOs
3. Test database migrations
4. Seed test data

### Step 2: Repositories (Week 1-2)
1. Implement one repository at a time
2. Write unit tests for each
3. Test with Swagger
4. Validate business rules

### Step 3: Controllers (Week 2)
1. Implement controller logic
2. Add error handling
3. Test all endpoints in Swagger
4. Verify JWT authorization

### Step 4: Frontend Services (Week 2-3)
1. Update service methods to handle real data
2. Add error handling and loading states
3. Test integration with backend

### Step 5: UI Components (Week 3-4)
1. Start with simplest module (Patients or Personnel)
2. Build list view → form → detail
3. Replicate pattern for other modules
4. Add validation and user feedback

### Step 6: Polish & Testing (Week 4)
1. End-to-end testing
2. Error handling refinement
3. UI/UX improvements
4. Documentation

---

## Key Reference Points from MVC

### Appointment Logic (MVC)
- `AppointmentController.cs` - Controller patterns
- `IAppointmentRepository.cs` - Repository interface
- `AppointmentRepository.cs` - EF Core implementation
- Views: Create, Edit, Delete, Index, MyAppointments

### Availability Logic (MVC)
- `AvailabilityController.cs` - Controller patterns
- `IAvailabilityRepository.cs` - Repository interface
- `AvailabilityRepository.cs` - EF Core implementation
- Views: Create, Edit, Delete, Index

### Patient/Personnel (MVC)
- `PatientController.cs` - Client management
- `PersonnelController.cs` - Staff management
- Note: MVC uses "Client" → Map to "Patient"
- Note: MVC uses "Staff" → Map to "Personnel"

### Dashboard (MVC)
- `DashboardController.cs` - Statistics and overview
- ViewModels for dashboard data

---

## Demo Patterns to Follow

### CRUD Operations (Demo 7)
- Update page with URL params
- Delete with confirmation
- Form validation
- Error handling

### Data Tables (Demo 4)
- Bootstrap Table styling
- Sorting and filtering
- Pagination
- Action buttons

### Forms (Demo 3)
- Controlled components
- Validation
- Submit handling
- Error display

### Authentication (Demo 9)
- Already implemented ✅
- Extend for role-based UI

---

## Phase 4 Milestones

### Milestone 1: Data Layer Complete
- ✅ All models migrated
- ✅ All DTOs created
- ✅ All repositories implemented
- ✅ All controllers functional

### Milestone 2: Basic UI Complete
- ✅ Patients CRUD working
- ✅ Personnel CRUD working
- ✅ Appointments CRUD working
- ✅ Availability CRUD working

### Milestone 3: Business Logic Complete
- ✅ All validation rules enforced
- ✅ Scheduling logic working
- ✅ Conflict detection working
- ✅ Role-based access working

### Milestone 4: Production Ready
- ✅ All features tested
- ✅ Error handling complete
- ✅ UI polished
- ✅ Documentation complete

---

## Tools & Technologies to Use

### Already Set Up ✅
- .NET 8 Web API
- Entity Framework Core
- SQLite Database
- ASP.NET Core Identity
- JWT Authentication
- React 18 with TypeScript
- React Router v6
- React-Bootstrap
- Vite build tool

### Additional (If Needed)
- React Hook Form - Form validation
- date-fns or Day.js - Date handling
- React Query - Data fetching optimization
- Chart.js - Dashboard charts

---

## Testing Strategy

### Backend Tests
1. Unit tests for repositories
2. Integration tests for controllers
3. Test authentication/authorization
4. Test business rule validation

### Frontend Tests
1. Component rendering tests
2. Form validation tests
3. Integration tests for key flows
4. E2E tests for critical paths

---

## Success Criteria for Phase 4

A Phase 4 implementation is complete when:

1. **Backend**
   - ✅ All endpoints return real data
   - ✅ All CRUD operations work
   - ✅ Business rules are enforced
   - ✅ Error handling is comprehensive
   - ✅ All endpoints have proper authorization

2. **Frontend**
   - ✅ All modules have functional UIs
   - ✅ Users can perform all CRUD operations
   - ✅ Forms have proper validation
   - ✅ Loading and error states handled
   - ✅ Navigation works smoothly

3. **Integration**
   - ✅ Frontend and backend communicate flawlessly
   - ✅ Authentication works in all scenarios
   - ✅ Real-time data updates work
   - ✅ No console errors
   - ✅ Meets all MVC functionality

4. **User Experience**
   - ✅ Role-based UI (different for Patient vs Personnel)
   - ✅ Dashboard shows relevant information
   - ✅ Appointment booking is intuitive
   - ✅ Responsive design works on mobile
   - ✅ Accessible and user-friendly

---

## Recommended Development Order

1. **Patients Module** (Simplest - good starting point)
   - Backend: Implement patient repository methods
   - Frontend: Build patient list and form
   - Test: Create, read, update, delete patients

2. **Personnel Module** (Similar to Patients)
   - Backend: Implement personnel repository methods
   - Frontend: Build personnel list and form
   - Test: Create, read, update, delete personnel

3. **Availability Module** (Adds complexity with dates)
   - Backend: Implement availability repository + conflict checking
   - Frontend: Build availability calendar/form
   - Test: Set availability, check conflicts

4. **Appointments Module** (Most complex - combines all)
   - Backend: Implement appointment repository + scheduling logic
   - Frontend: Build appointment booking system
   - Test: Book, view, cancel appointments

5. **Dashboard** (Final integration point)
   - Backend: Implement statistics endpoints
   - Frontend: Build widgets and charts
   - Test: Verify data accuracy

6. **Users Module** (Admin-only features)
   - Backend: Implement user management
   - Frontend: Build admin UI
   - Test: User administration

---

## Phase 4 Kickoff Checklist

Before starting Phase 4, ensure:
- ✅ Phase 3 testing guide completed successfully
- ✅ Both projects build without errors
- ✅ Authentication flow works end-to-end
- ✅ All service stubs are in place
- ✅ MVC project is available for reference
- ✅ Demo summaries are reviewed
- ✅ Workspace rules are understood

---

## Estimated Timeline

- **Week 1**: Backend implementation (models, repos, controllers)
- **Week 2**: Frontend types and services
- **Week 3**: UI components (Patients, Personnel, Availability)
- **Week 4**: UI components (Appointments, Dashboard, Users)
- **Week 5**: Testing, polish, and documentation

**Total: 4-5 weeks of focused development**

---

## Ready to Start Phase 4?

✅ Phase 3 complete - Integration infrastructure in place
✅ All patterns and tools identified
✅ Clear roadmap established

**Next command: Begin with Patients module backend implementation**
