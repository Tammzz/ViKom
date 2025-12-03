# Quick Start Guide - HomeCareApp Frontend

## 🚀 Getting Started in 3 Steps

### 1. Navigate to Frontend Directory
```bash
cd HomeCareApp-React/frontend
```

### 2. Install Dependencies (if not already done)
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Open browser at: **http://localhost:5173**

---

## 📁 Project Structure at a Glance

```
src/
├── auth/           → PrivateRoute component
├── components/     → NavBar, Sidebar, Layout
├── pages/          → LoginPage, Dashboard, etc.
├── services/       → API calls (Auth, Appointments, Users, etc.)
├── types/          → TypeScript interfaces
└── shared/         → config.ts (API_URL)
```

---

## 🔑 Key Files to Know

| File | Purpose |
|------|---------|
| `App.tsx` | Main routing configuration |
| `services/AuthService.ts` | Login, logout, token management |
| `auth/PrivateRoute.tsx` | Protects authenticated routes |
| `shared/config.ts` | **Set your API URL here** |
| `types/index.ts` | All TypeScript types exported |

---

## 🛠️ Common Commands

```bash
# Development
npm run dev          # Start dev server (port 5173)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Check code quality
```

---

## 🔧 Configuration

### Change API URL
Edit `src/shared/config.ts`:
```typescript
export const API_URL = 'http://localhost:5043'; // Your backend URL
```

---

## 🎯 What's Implemented

✅ **Routing** - All routes configured with protection  
✅ **Authentication** - JWT login/logout flow  
✅ **Service Layer** - All API calls centralized  
✅ **Type Safety** - Full TypeScript coverage  
✅ **UI Components** - NavBar, Sidebar, Layout  
✅ **Page Scaffolds** - 6 placeholder pages ready  

---

## 📝 What's Next (Phase 2)

1. Implement dashboard data fetching
2. Build appointment CRUD forms
3. Add availability calendar
4. Create user management UI
5. Add validation and error handling

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS errors
Ensure your backend API allows requests from `http://localhost:5173`

### TypeScript errors
```bash
# Check for errors
npm run build
```

---

## 📚 Resources

- **Frontend README**: `frontend/README.md` (detailed docs)
- **Phase 1 Summary**: `PHASE1_SUMMARY.md`
- **Verification Report**: `VERIFICATION.md`

---

## ✅ Quick Verification

Test that everything works:

1. Start server: `npm run dev`
2. Open: http://localhost:5173
3. Should see: Login page
4. Build test: `npm run build` (should succeed)

---

**You're all set!** 🎉

The frontend is fully configured and ready for feature development.
