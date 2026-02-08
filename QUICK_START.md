# Lokeet Web App - Quick Start

Get the Lokeet web app running in under 2 minutes!

---

## 🚀 Start Development Server

```bash
# 1. Navigate to the web app directory
cd ps-webapp-next

# 2. Install dependencies (first time only)
npm install

# 3. Start the development server
npm run dev
```

**Done!** Open http://localhost:3000

---

## 🧪 Quick Test

1. **Visit Landing Page**
   - Go to http://localhost:3000
   - See the Lokeet landing page

2. **Create Account**
   - Click "Log in/Sign Up"
   - Click "Sign Up"
   - Enter: `test@lokeet.io` / `TestPass123!`

3. **Dashboard**
   - Auto-redirects to `/dashboard`
   - Click "+ New Save" to create a test save

4. **Profile**
   - Click your profile link in header
   - Click "Edit Profile"
   - Set username: `testuser`
   - Visit: http://localhost:3000/@testuser

---

## 📦 What's Included

### Pages
- **`/`** - Landing page
- **`/login`** - Login form
- **`/signup`** - Registration form
- **`/dashboard`** - Main app (authenticated)
- **`/@username`** - User profile (public)

### Features
- ✅ Authentication (Supabase)
- ✅ Dashboard with saves CRUD
- ✅ Category filtering & sorting
- ✅ Instagram-style profiles (`/@username`)
- ✅ Profile editing
- ✅ Share functionality
- ✅ Responsive design

---

## 🔧 Configuration

The app is pre-configured to use your Railway backend:
```
API: https://web-production-5630.up.railway.app/v1
```

To change the backend URL, edit `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/v1  # for local backend
```

---

## 📚 Next Steps

1. **Read TESTING_GUIDE.md** - Comprehensive testing instructions
2. **Test all features** - Use the checklist in testing guide
3. **Deploy** - Push to Vercel or your preferred host

---

## 🐛 Troubleshooting

**Server won't start?**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

**API not connecting?**
- Check `.env.local` exists
- Verify Railway backend is running: https://web-production-5630.up.railway.app/health

**Build errors?**
```bash
npm run build
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables on Vercel
Add in dashboard:
```
NEXT_PUBLIC_API_URL=https://web-production-5630.up.railway.app/v1
```

---

**That's it!** You're ready to test and deploy.

For detailed testing, see `TESTING_GUIDE.md`
