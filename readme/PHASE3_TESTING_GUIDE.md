# Phase 3 Integration Testing Guide

## Prerequisites
- Backend has been built successfully (verified)
- Frontend has been built successfully (verified)
- No compilation errors in either project

---

## Step 1: Start the Backend

Open a terminal and run:

```powershell
cd c:\Users\tamar\Documents\Uni\ITPE3200\HomeCareApp-Workspace\HomeCareApp-React\backend
dotnet run
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5043
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**Verify:**
- Backend is running on `https://localhost:5043`
- Navigate to `https://localhost:5043/swagger` to see Swagger UI
- Swagger should show all API endpoints

---

## Step 2: Test Authentication in Swagger

1. **Open Swagger UI**: `https://localhost:5043/swagger`

2. **Register a Test User**:
   - Expand `POST /api/auth/register`
   - Click "Try it out"
   - Enter test data:
     ```json
     {
       "userName": "testuser",
       "email": "test@example.com",
       "password": "Test1234!",
       "fullName": "Test User",
       "role": "Personnel",
       "phoneNumber": "123-456-7890"
     }
     ```
   - Click "Execute"
   - Should return `200 OK` with message "User registered successfully"

3. **Login with Test User**:
   - Expand `POST /api/auth/login`
   - Click "Try it out"
   - Enter credentials:
     ```json
     {
       "userName": "testuser",
       "password": "Test1234!"
     }
     ```
   - Click "Execute"
   - Should return `200 OK` with response containing:
     ```json
     {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "userName": "testuser",
       "fullName": "Test User",
       "role": "Personnel",
       "userId": "..."
     }
     ```
   - **Copy the token value**

4. **Authorize Swagger**:
   - Click the "Authorize" button at the top right
   - In the "Value" field, enter: `Bearer <your-token>`
   - Click "Authorize"
   - Click "Close"

5. **Test a Protected Endpoint**:
   - Try `GET /api/users` or any other controller endpoint
   - Should return `200 OK` (even though it returns empty data for now)
   - This confirms JWT authentication is working

---

## Step 3: Start the Frontend

Open a **new terminal** (keep backend running) and run:

```powershell
cd c:\Users\tamar\Documents\Uni\ITPE3200\HomeCareApp-Workspace\HomeCareApp-React\frontend
npm run dev
```

**Expected Output:**
```
VITE v7.2.6  ready in X ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Verify:**
- Frontend is running on `http://localhost:5173`
- Browser should open automatically (or navigate to it)

---

## Step 4: Test Frontend → Backend Communication

### Test 1: Login Flow

1. **Navigate to Frontend**: `http://localhost:5173`

2. **Observe Redirect**:
   - Should automatically redirect to `/login` (not authenticated)

3. **Login with Test User**:
   - Username: `testuser`
   - Password: `Test1234!`
   - Click "Login"

4. **Verify Success**:
   - Should redirect to `/dashboard`
   - **NavBar should display "testuser"** in the top-right dropdown
   - Dropdown should show:
     - Full name: "Test User"
     - Role: "Personnel"
     - "Logout" button

5. **Test Navigation**:
   - Click each sidebar link:
     - ✓ Dashboard
     - ✓ Patients
     - ✓ Personnel
     - ✓ Appointments
     - ✓ Availability
     - ✓ Users (Admin)
   - All should load without errors (even if showing placeholder content)

### Test 2: Protected Routes

1. **Logout**: Click username → Logout
   - Should redirect to `/login`

2. **Try Accessing Protected Route**:
   - Manually navigate to `http://localhost:5173/dashboard`
   - Should immediately redirect to `/login`
   - This confirms PrivateRoute is working

3. **Login Again**:
   - Login with same credentials
   - Should redirect to `/dashboard`

### Test 3: Browser Console (DevTools)

1. **Open DevTools**: Press `F12`

2. **Check Console Tab**:
   - Should have **no errors** (some warnings are OK)
   - Look for any network errors or CORS issues

3. **Check Network Tab**:
   - After login, you should see:
     - `POST https://localhost:5043/api/auth/login` → `200 OK`
   - Response should contain token and user info

4. **Check Application/Storage Tab**:
   - Navigate to "Local Storage" → `http://localhost:5173`
   - Should see:
     - `jwt`: Your JWT token
     - `userInfo`: JSON with userName, fullName, role, userId

---

## Step 5: Test CORS

CORS is working correctly if:
- ✓ Login request succeeds from `http://localhost:5173` to `https://localhost:5043`
- ✓ No CORS errors in browser console
- ✓ Response data is received properly

**Common CORS Issues (should NOT occur):**
- ❌ "Access to fetch at ... has been blocked by CORS policy"
- ❌ "No 'Access-Control-Allow-Origin' header is present"

If you see these, check `Program.cs` to ensure CORS policy is correctly configured.

---

## Step 6: Test Service Stubs (Optional)

You can verify service stubs are properly wired by checking network calls:

1. **Login to the application**

2. **Open DevTools → Console Tab**

3. **Run test commands in console**:

```javascript
// Test PatientService
import('http://localhost:5173/src/services/PatientService.ts').then(m => 
  m.fetchPatients().then(console.log).catch(console.error)
);

// Test PersonnelService  
import('http://localhost:5173/src/services/PersonnelService.ts').then(m =>
  m.fetchPersonnel().then(console.log).catch(console.error)
);
```

**Expected Result:**
- Request should go to backend
- Backend returns empty data (placeholder)
- No CORS or network errors

---

## Verification Checklist

After completing all steps, verify:

- ✅ Backend builds without errors
- ✅ Frontend builds without errors
- ✅ Backend runs on `https://localhost:5043`
- ✅ Frontend runs on `http://localhost:5173`
- ✅ Swagger UI shows all endpoints
- ✅ Can register a new user in Swagger
- ✅ Can login and receive JWT token in Swagger
- ✅ Can authorize requests in Swagger with JWT
- ✅ Frontend login page works
- ✅ Successful login stores token in localStorage
- ✅ NavBar displays username after login
- ✅ NavBar displays full name and role in dropdown
- ✅ All sidebar links are accessible
- ✅ PrivateRoute redirects when not authenticated
- ✅ Logout clears token and redirects to login
- ✅ No CORS errors in browser console
- ✅ Network requests show proper Authorization headers
- ✅ All service stubs are importable

---

## Common Issues & Solutions

### Issue 1: Backend Port Conflict
**Symptom:** Backend fails to start - "Address already in use"
**Solution:** 
```powershell
# Kill process using port 5043
netstat -ano | findstr :5043
taskkill /PID <process-id> /F
```

### Issue 2: Frontend Port Conflict
**Symptom:** Frontend fails to start - "Port 5173 is already in use"
**Solution:**
- Vite will automatically try the next available port
- Or kill the process using port 5173

### Issue 3: Login Returns 401 Unauthorized
**Symptom:** Login fails in frontend but works in Swagger
**Solution:**
- Check browser console for exact error
- Verify `config.ts` has correct backend URL
- Check if backend is running

### Issue 4: CORS Errors
**Symptom:** "blocked by CORS policy" in console
**Solution:**
- Verify backend `Program.cs` has CORS policy for `http://localhost:5173`
- Ensure `app.UseCors("AllowFrontend")` is called before `app.UseAuthentication()`

### Issue 5: Token Not Stored
**Symptom:** Login succeeds but NavBar doesn't show username
**Solution:**
- Check browser DevTools → Application → Local Storage
- Verify `jwt` and `userInfo` are present
- Check AuthService.ts implementation

---

## Next Steps

Once all verification steps pass:

✅ **Phase 3 is complete**
✅ Frontend and backend are fully integrated
✅ Ready to proceed to Phase 4 (Business Logic Migration)

In Phase 4, you will:
1. Implement actual database operations in repositories
2. Replace controller placeholders with real logic
3. Build complete CRUD UIs for all modules
4. Migrate business rules from MVC project
5. Add validation and error handling
