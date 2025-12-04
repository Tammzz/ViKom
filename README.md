# Carely - Homecare Management WebApp V2
**Carely Homecare Management WebApp V2** is the second iteration of the homecare management system, rebuilt with a modern tech stack using React for the frontend and ASP.NET Core Web API for the backend. This version maintains the core functionalities of scheduling, availability, and booking management while introducing a decoupled architecture with JWT-based authentication and a more responsive user interface.

## Prerequisites
Ensure you have the following installed on your system:
* .NET 8.0 SDK
* Node.js v22.14.0

## Project Structure
The project is divided into two main parts:
* **backend/** - ASP.NET Core Web API with SQLite database
* **frontend/** - React + TypeScript + Vite application

## Installation & Setup

### 1. Extract and Navigate
* Download and extract the zip file
* Open terminal/PowerShell in the project folder

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd HomeCareApp-React\backend
```

Restore .NET dependencies:
```bash
dotnet restore
```

Run the backend API:
```bash
dotnet run
```

The backend API will start at: **http://localhost:5084**
Swagger documentation available at: **http://localhost:5084/swagger**

### 3. Frontend Setup

Open a **new terminal** and navigate to the frontend directory:
```bash
cd HomeCareApp-React\frontend
```

Install Node.js dependencies:
```bash
npm install
```

Run the frontend development server:
```bash
npm run dev
```

The frontend application will start at: **http://localhost:5173**

## Running the Application

1. Start the backend server first (from the `backend` directory):
   ```bash
   dotnet run
   ```

2. In a separate terminal, start the frontend server (from the `frontend` directory):
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to: **http://localhost:5173**

## Default Accounts
To test the application, the following default accounts are available:

* **Patient User**
  * Username: patient@homecare.local
  * Password: Pass123!

* **Personnel User**
  * Username: nurse@homecare.local
  * Password: Pass123!

* **Admin User**
  * Username: admin@homecare.local
  * Password: Pass123!

You can also register your own account(s) through the application interface!

## Technology Stack
### Backend
* ASP.NET Core 8.0 Web API
* Entity Framework Core with SQLite
* ASP.NET Core Identity for authentication
* JWT Bearer tokens for API security

### Frontend
* React 19.2.0
* TypeScript
* Vite (build tool)
* React Router for navigation
* Bootstrap 5 for styling
* React Bootstrap components

## Features
* Role-based authentication (Patient, Personnel, Admin)
* Personnel availability management
* Appointment booking and scheduling
* User-specific dashboards
* Real-time availability slots
* Responsive design for mobile and desktop
