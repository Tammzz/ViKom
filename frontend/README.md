# HomeCareApp React Frontend

This is the React + TypeScript + Vite frontend for the HomeCareApp project, following the patterns and conventions from the course demos.

## Project Structure

```
frontend/
├── src/
│   ├── auth/              # Authentication components
│   │   └── PrivateRoute.tsx
│   ├── components/        # Reusable UI components
│   │   ├── Layout.tsx
│   │   ├── NavBar.tsx
│   │   └── Sidebar.tsx
│   ├── css/               # Custom CSS files
│   │   └── sidebar.css
│   ├── pages/             # Page-level components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AppointmentListPage.tsx
│   │   ├── AvailabilityPage.tsx
│   │   ├── PatientListPage.tsx
│   │   └── PersonnelListPage.tsx
│   ├── services/          # API service layer
│   │   ├── AuthService.ts
│   │   ├── AppointmentService.ts
│   │   ├── AvailabilityService.ts
│   │   ├── UserService.ts
│   │   └── DashboardService.ts
│   ├── shared/            # Shared utilities and config
│   │   └── config.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── user.ts
│   │   ├── appointment.ts
│   │   ├── availability.ts
│   │   ├── dashboard.ts
│   │   └── index.ts
│   ├── App.tsx            # Main app component with routing
│   └── main.tsx           # Application entry point
├── package.json
└── README.md
```

## Technology Stack

- **React 18** - UI framework (functional components only)
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **React-Bootstrap** - UI component library
- **Bootstrap 5** - CSS framework

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running at `http://localhost:5043` (configurable in `src/shared/config.ts`)

### Installation

```bash
cd frontend
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Architecture Patterns

### 1. Feature-Folder Structure
Components are organized by feature/module, not by technical role.

### 2. Service Layer Pattern
All API calls are centralized in service files (`services/`). Components never call `fetch()` directly.

**Example:**
```typescript
// ❌ Don't do this in components
const response = await fetch('/api/appointments');

// ✅ Do this instead
import * as AppointmentService from '../services/AppointmentService';
const appointments = await AppointmentService.fetchAppointments();
```

### 3. Component Types

- **Page Components** - Located in `pages/`, contain business logic, state, and data fetching
- **UI Components** - Located in `components/`, display-only, receive props
- **Layout Components** - Handle navigation and page structure

### 4. Authentication Flow

1. User logs in via `LoginPage`
2. JWT token is stored in `localStorage`
3. `AuthService` attaches token to all API requests
4. `PrivateRoute` protects authenticated pages
5. `NavBar` displays user info and logout option

### 5. TypeScript Usage

All models are strongly typed:
- Props: `React.FC<Props>`
- State: `useState<Type>()`
- API responses: Return types defined in services

### 6. Routing

- Public routes: `/login`
- Protected routes: `/dashboard`, `/appointments`, `/availability`, `/patients`, `/personnel`
- Default redirect: `/` → `/dashboard`

## API Configuration

Update the API URL in `src/shared/config.ts`:

```typescript
export const API_URL = 'http://localhost:5043';
```

## Authentication

JWT tokens are stored in `localStorage` and automatically attached to all authenticated requests via the service layer.

### Protected Routes
All routes except `/login` require authentication. Unauthenticated users are redirected to the login page.

## Styling

- Uses **React-Bootstrap** components for consistent UI
- Custom CSS in `src/css/` using **rem units**
- Responsive design with mobile support
- Sidebar collapses on small screens

## Components Overview

### NavBar
- Fixed top navigation
- Shows "HomeCare App" branding
- Account dropdown with logout (when authenticated)
- Login link (when not authenticated)

### Sidebar
- Fixed left navigation panel
- Links to all main sections
- Active route highlighting
- Responsive (collapses on mobile)

### Layout
- Wraps all pages
- Conditionally renders sidebar for authenticated users
- Provides consistent structure

### PrivateRoute
- Protects routes requiring authentication
- Redirects to `/login` if no token found

## Service Layer

Each service file contains CRUD operations for its domain:

- `AuthService.ts` - Login, register, logout, token management
- `AppointmentService.ts` - Appointment CRUD operations
- `AvailabilityService.ts` - Personnel availability management
- `UserService.ts` - User management (patients/personnel)
- `DashboardService.ts` - Dashboard data fetching

All services:
- Use shared headers
- Include JWT tokens automatically
- Handle errors consistently
- Return typed responses

## TypeScript Models

Models mirror the C# backend models:

- `User` - Application users (Personnel/Patient)
- `Appointment` - Service appointments
- `Availability` - Personnel availability slots
- `PatientViewModel` - Patient dashboard data
- `PersonnelViewModel` - Personnel dashboard data

## Next Steps

1. Implement actual page logic (currently placeholders)
2. Create form components for CRUD operations
3. Add validation and error handling
4. Implement role-based UI rendering
5. Add loading states and spinners
6. Create appointment booking workflow
7. Build dashboard statistics displays

## Code Conventions

- Use **functional components** only
- Use **React-Bootstrap** for all UI elements
- Keep components small and focused
- Use TypeScript for all files (`.ts`, `.tsx`)
- Place fetch calls only in service files
- Use present-tense comments explaining intent
- Follow demo patterns for consistency

## Troubleshooting

### CORS Errors
Ensure the backend API has CORS configured to allow requests from `http://localhost:5173`

### 401 Unauthorized
Token may be expired or invalid. Log out and log back in.

### Type Errors
Ensure TypeScript definitions match backend DTOs exactly.

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React-Bootstrap](https://react-bootstrap.github.io)
- [React Router](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
