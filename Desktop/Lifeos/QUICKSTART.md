# ⚡ Timeline - Quick Start Guide

Get Timeline running in **under 10 minutes**.

---

## 🚀 Fast Track Setup

### 1. Install Dependencies (2 minutes)

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Configure Environment (3 minutes)

**Copy templates:**
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

**Edit `.env` (root):**
```env
# Minimum required for local dev
FIREBASE_API_KEY=your_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
API_BASE_URL_DEV=http://localhost:3000/api
```

**Edit `backend/.env`:**
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/timeline-dev
JWT_SECRET=your_random_secret_here
OPENAI_API_KEY=sk-your_key_here
```

### 3. Start Development Servers (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Mobile App:**
```bash
npm start
```

### 4. Run on Device (2 minutes)

- **iOS**: Press `i` or scan QR with Expo Go
- **Android**: Press `a` or scan QR with Expo Go

---

## 🔑 Get Credentials Fast

### MongoDB Atlas (2 minutes)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up → Create free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0`
5. Get connection string

### Firebase (3 minutes)
1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. Create project
3. Add web app → Copy config
4. Enable Authentication → Email/Password
5. Project Settings → Service Accounts → Generate key

### OpenAI (1 minute)
1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up/Login
3. API Keys → Create new key
4. Copy key

---

## ✅ Verify It Works

### Test Backend
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok",...}
```

### Test Mobile App
- Open app on device
- Should see "Timeline" with "Foundation Setup Complete"

---

## 🐛 Quick Troubleshooting

### "Cannot connect to backend"
```bash
# Check backend is running
curl http://localhost:3000/health

# If using physical device, update .env:
API_BASE_URL_DEV=http://YOUR_COMPUTER_IP:3000/api
```

### "MongoDB connection failed"
- Verify connection string in `backend/.env`
- Check IP whitelist in MongoDB Atlas

### "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

---

## 📚 Next Steps

Once running:
1. ✅ Read `README.md` for project overview
2. ✅ Review `ARCHITECTURE.md` for system design
3. ✅ Check `PROJECT_STATUS.md` for roadmap
4. ✅ Start building features!

---

## 💡 Development Commands

```bash
# Frontend
npm start              # Start Expo dev server
npm test               # Run tests
npm run lint           # Check code style
npm run lint:fix       # Fix code style
npm run type-check     # Check TypeScript

# Backend
cd backend
npm run dev            # Start with auto-reload
npm start              # Start production mode
npm test               # Run tests
npm run lint           # Check code style
```

---

**You're all set! Start coding! 🎉**
