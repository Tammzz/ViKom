# HomeCare Backend API

This is the .NET 8 Web API backend for the HomeCare application. This backend follows the architecture patterns from the course demos and serves as the API layer for the React frontend.

## Project Structure

```
backend/
├── Controllers/          # API Controllers (REST endpoints)
│   ├── AuthController.cs          # JWT authentication (register/login/logout)
│   ├── AppointmentsController.cs  # Appointment management
│   ├── AvailabilityController.cs  # Personnel availability
│   ├── ClientsController.cs       # Client (Patient) management
│   ├── StaffController.cs         # Personnel management
│   ├── ServiceRequestsController.cs # Service requests
│   └── UsersController.cs         # User management
├── Models/              # Entity models
│   ├── User.cs          # User entity (extends IdentityUser)
│   ├── Appointment.cs   # Appointment entity
│   └── Availability.cs  # Availability entity
├── DTOs/                # Data Transfer Objects
│   ├── UserDto.cs
│   ├── AppointmentDto.cs
│   ├── AvailabilityDto.cs
│   ├── RegisterDto.cs
│   └── LoginDto.cs
├── DAL/                 # Data Access Layer
│   ├── ApplicationDbContext.cs  # EF Core DbContext
│   └── DBInit.cs                # Database seeding
├── Repositories/        # Repository pattern implementation
│   ├── IUserRepository.cs
│   ├── UserRepository.cs
│   ├── IAppointmentRepository.cs
│   ├── AppointmentRepository.cs
│   ├── IAvailabilityRepository.cs
│   └── AvailabilityRepository.cs
├── Services/            # Business logic layer (to be implemented)
├── Mappings/            # DTO <-> Entity mapping (to be implemented)
└── Program.cs           # Application configuration
```

## Technology Stack

- **.NET 8 Web API**
- **Entity Framework Core 8** with SQLite
- **ASP.NET Core Identity** for user management
- **JWT Bearer Authentication**
- **Swagger/OpenAPI** for API documentation

## Configuration

### Database
- **Connection String**: SQLite database (`HomeCareDatabase.db`)
- Configured in `appsettings.json`

### JWT Settings
JWT authentication is configured with:
- **Key**: Secret key for token signing
- **Issuer**: API server URL
- **Audience**: API server URL
- Token lifetime: 24 hours

### CORS
CORS is configured to allow requests from the React frontend:
- **Frontend URL**: `http://localhost:5173` (Vite default port)

## API Endpoints

### Authentication (`/api/Auth`)
- `POST /api/Auth/register` - Register new user
- `POST /api/Auth/login` - Login and receive JWT token
- `POST /api/Auth/logout` - Logout

### Users (`/api/Users`)
- `GET /api/Users` - Get all users
- `GET /api/Users/{id}` - Get user by ID
- `GET /api/Users/role/{role}` - Get users by role (Personnel/Patient)
- `PUT /api/Users/{id}` - Update user
- `DELETE /api/Users/{id}` - Delete user

### Clients (`/api/Clients`)
- `GET /api/Clients` - Get all clients (Patients)
- `GET /api/Clients/{id}` - Get client by ID
- `POST /api/Clients` - Create new client
- `PUT /api/Clients/{id}` - Update client
- `DELETE /api/Clients/{id}` - Delete client

### Staff (`/api/Staff`)
- `GET /api/Staff` - Get all staff (Personnel)
- `GET /api/Staff/{id}` - Get staff member by ID
- `POST /api/Staff` - Create new staff member
- `PUT /api/Staff/{id}` - Update staff member
- `DELETE /api/Staff/{id}` - Delete staff member

### Appointments (`/api/Appointments`)
- `GET /api/Appointments` - Get all appointments
- `GET /api/Appointments/{id}` - Get appointment by ID
- `GET /api/Appointments/client/{clientId}` - Get appointments for client
- `POST /api/Appointments` - Create new appointment
- `PUT /api/Appointments/{id}` - Update appointment
- `DELETE /api/Appointments/{id}` - Delete appointment

### Availability (`/api/Availability`)
- `GET /api/Availability` - Get all availabilities
- `GET /api/Availability/{id}` - Get availability by ID
- `GET /api/Availability/personnel/{personnelId}` - Get availabilities for personnel
- `POST /api/Availability` - Create new availability
- `PUT /api/Availability/{id}` - Update availability
- `DELETE /api/Availability/{id}` - Delete availability

### Service Requests (`/api/ServiceRequests`)
- `GET /api/ServiceRequests` - Get all service requests
- `GET /api/ServiceRequests/{id}` - Get service request by ID
- `POST /api/ServiceRequests` - Create new service request
- `PUT /api/ServiceRequests/{id}` - Update service request
- `DELETE /api/ServiceRequests/{id}` - Delete service request

## Setup Instructions

### Prerequisites
- .NET 8 SDK
- Visual Studio Code (or Visual Studio)

### Installation

1. Navigate to the backend folder:
   ```bash
   cd HomeCareApp-React/backend
   ```

2. Restore NuGet packages:
   ```bash
   dotnet restore
   ```

3. Build the project:
   ```bash
   dotnet build
   ```

4. Run the application:
   ```bash
   dotnet run
   ```

5. Access Swagger UI:
   - Open browser to: `https://localhost:5001/swagger` (or the port shown in terminal)

### Database Seeding

The database is automatically seeded in development mode with:
- Two roles: `Personnel` and `Patient`
- Sample users:
  - Personnel: `staff@homecare.com` / `Password123!`
  - Patient: `patient@homecare.com` / `Password123!`
- Sample availability records

## Development Notes

### Current Status
This is **Phase 2 scaffolding** - the backend structure is complete but business logic is not yet implemented:

✅ **Completed:**
- Project structure and folder organization
- Entity models based on MVC domain
- DTOs for all entities
- Repository interfaces and base implementations
- Empty controller structure with proper routing
- ApplicationDbContext with Identity integration
- JWT authentication with AuthController
- Program.cs configuration (CORS, Swagger, JWT, EF Core)
- Database seeding

❌ **To Be Implemented (Phase 3):**
- Business logic in controllers
- Service layer implementation
- DTO/Entity mapping logic
- Validation and error handling
- Authorization attributes on protected endpoints
- Logging enhancements

### Testing with Swagger

1. Run the backend
2. Open Swagger UI
3. Use the `/api/Auth/register` endpoint to create a test user
4. Use the `/api/Auth/login` endpoint to get a JWT token
5. Click the "Authorize" button in Swagger
6. Enter: `Bearer <your-token-here>`
7. Test protected endpoints

## Database

- **Type**: SQLite
- **File**: `HomeCareDatabase.db` (auto-generated on first run)
- **Location**: Backend root directory
- **Note**: Database files are excluded from version control (see `.gitignore`)

## Design Patterns

This backend follows course-mandated patterns:
- **Repository Pattern**: Data access abstraction
- **DTO Pattern**: Separation between API contracts and entities
- **Dependency Injection**: Services registered in Program.cs
- **Async/Await**: All repository and controller methods

## Related Documentation

- See `/demos` for course demo summaries
- See `/rules/workspace_rules.md` for project constraints
- See frontend README for React application setup
