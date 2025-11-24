# Timeline - Setup Guide

This guide will walk you through setting up the Timeline development environment from scratch.

---

## ⚡ Quick Start

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd backend
npm install
cd ..

# 3. Configure environment variables
cp .env.example .env
cp backend/.env.example backend/.env
# Edit both .env files with your credentials

# 4. Start the backend
cd backend
npm run dev

# 5. In a new terminal, start the mobile app
npm start
```

---

## 📋 Detailed Setup Instructions

### Step 1: Install Node.js and npm

**Required versions:**
- Node.js: v18.0.0 or higher
- npm: v9.0.0 or higher

**Check your versions:**
```bash
node --version
npm --version
```

**Install/Update:**
- Download from [nodejs.org](https://nodejs.org/)
- Or use nvm: `nvm install 18 && nvm use 18`

---

### Step 2: Install Expo CLI

```bash
npm install -g expo-cli
```

Verify installation:
```bash
expo --version
```

---

### Step 3: Install Dependencies

**Frontend (React Native):**
```bash
npm install
```

**Backend (Node.js):**
```bash
cd backend
npm install
cd ..
```

This will install all packages defined in `package.json`.

---

### Step 4: Set Up MongoDB Atlas

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: 
   - Choose free tier (M0)
   - Select region closest to you
   - Name it `timeline-dev`
3. **Create Database User**:
   - Go to Database Access
   - Add new user with username/password
   - Save credentials securely
4. **Whitelist IP**:
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allows all IPs - for development only)
5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

---

### Step 5: Set Up Firebase

1. **Create Project**: Go to [Firebase Console](https://console.firebase.google.com/)
2. **Add iOS/Android Apps**:
   - Click "Add app" and follow instructions
   - Download config files (we'll use them later)
3. **Enable Authentication**:
   - Go to Authentication → Sign-in method
   - Enable: Email/Password, Google, Apple
4. **Get Web Config**:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the config object

5. **Set Up Firebase Admin (Backend)**:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely
   - Extract: `project_id`, `client_email`, `private_key`

---

### Step 6: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create new secret key
5. Copy and save it securely (you won't see it again)

---

### Step 7: Configure Environment Variables

**Root `.env` file:**
```bash
cp .env.example .env
```

Edit `.env` and fill in:
```env
# Firebase (from Step 5)
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123:web:abc
FIREBASE_MEASUREMENT_ID=G-ABC123

# API URLs
API_BASE_URL_DEV=http://localhost:3000/api
```

**Backend `.env` file:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=3000

# MongoDB (from Step 4)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/timeline-dev?retryWrites=true&w=majority

# JWT Secret (generate random string)
JWT_SECRET=your_random_secret_here_change_this

# OpenAI (from Step 6)
OPENAI_API_KEY=sk-your_key_here
OPENAI_MODEL=gpt-4-turbo-preview

# Firebase Admin (from Step 5)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# Encryption Key (generate 64-character hex string)
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Redis (optional for now)
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Generate secure keys:**
```bash
# JWT Secret (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Encryption Key (64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 8: Install Redis (Optional for Development)

**macOS:**
```bash
brew install redis
brew services start redis
```

**Windows:**
- Download from [Redis Windows](https://github.com/microsoftarchive/redis/releases)
- Or use Docker: `docker run -d -p 6379:6379 redis:7-alpine`

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Skip Redis**: You can skip Redis for initial development. It's only needed for job queues (batch processing).

---

### Step 9: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Timeline Backend running on port 3000
📝 Environment: development
🏥 Health check: http://localhost:3000/health
```

Test it:
```bash
curl http://localhost:3000/health
```

**Terminal 2 - Mobile App:**
```bash
npm start
```

This will open Expo DevTools in your browser.

---

### Step 10: Run on Device/Simulator

**Option A: Physical Device (Recommended)**
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code from Expo DevTools
3. App will load on your device

**Option B: iOS Simulator (macOS only)**
1. Install Xcode from Mac App Store
2. Open Xcode → Preferences → Components → Install iOS Simulator
3. In Expo DevTools, press `i` to open in iOS Simulator

**Option C: Android Emulator**
1. Install Android Studio
2. Set up Android Virtual Device (AVD)
3. Start emulator
4. In Expo DevTools, press `a` to open in Android Emulator

---

## 🧪 Verify Setup

### Test Backend
```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api
```

### Test Frontend
1. Open app on device/simulator
2. You should see "Timeline" with "Foundation Setup Complete"

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Ensure backend is running on port 3000
- Check `API_BASE_URL_DEV` in `.env`
- If using physical device, use your computer's IP instead of `localhost`

### "MongoDB connection failed"
- Verify connection string in `backend/.env`
- Check MongoDB Atlas whitelist (Network Access)
- Ensure database user has correct permissions

### "Firebase auth not working"
- Verify all Firebase config values in `.env`
- Check Firebase Console for enabled auth methods
- Ensure Firebase project is active

### "Expo not starting"
- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for port conflicts (default: 19000, 19001, 19002)

### TypeScript errors
- Run `npm install` to install all dependencies
- Restart your IDE/editor
- Run `npm run type-check` to see all errors

---

## 📱 Development Tips

### Hot Reloading
- Changes to code will automatically reload the app
- Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android) for dev menu

### Debugging
- Use React Native Debugger or Chrome DevTools
- Add `console.log()` statements (visible in terminal)
- Use Expo DevTools for network requests

### Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Run tests
npm test
```

---

## 🚀 Next Steps

Once setup is complete:
1. ✅ Verify all services are running
2. ✅ Test basic API calls
3. ✅ Confirm app loads on device
4. 📖 Read the main README.md for architecture overview
5. 🏗️ Ready to start building features!

---

## 📞 Need Help?

If you're stuck:
1. Check this guide again carefully
2. Review error messages in terminal
3. Search for the error online
4. Ask the team for help

---

**You're all set! Happy coding! 🎉**
