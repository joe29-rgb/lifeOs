# Timeline - AI-Powered Life Operating System

> **Your always-on AI life assistant that captures, analyzes, and predicts patterns in your life.**

Timeline is a revolutionary mobile application that combines continuous audio recording, behavioral analysis, decision tracking, relationship monitoring, procrastination intervention, and life path simulation to help you optimize your life.

---

## 🎯 Project Overview

Timeline is designed for:
- **Professionals** optimizing productivity and decision-making
- **Individuals** struggling with procrastination and self-sabotage
- **Anyone** wanting to understand their behavioral patterns
- **People** serious about personal growth and life optimization

### Core Value Proposition
Timeline acts as your personal AI analyst, identifying patterns you can't see yourself, predicting outcomes of decisions, and intervening before you self-sabotage.

---

## 🏗️ Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native with Expo (managed workflow)
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation v6
- **State Management**: React Context + Zustand (for complex state)
- **Audio Recording**: React Native Voice + Expo Audio API
- **Storage**: AsyncStorage (encrypted)
- **Authentication**: Firebase Auth (Email/Password, Google, Apple)
- **Push Notifications**: Expo Notifications

### Backend (API)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas (document-based)
- **Authentication**: Firebase Admin SDK + JWT
- **AI/ML**: OpenAI GPT-4 API + Whisper API
- **Job Queue**: Bull + Redis
- **Batch Processing**: Azure Functions
- **Logging**: Winston
- **Validation**: Joi

### Infrastructure
- **API Hosting**: Azure App Service (Dockerized)
- **Database**: MongoDB Atlas (multi-region)
- **Cache/Queue**: Redis (Azure Redis Cache in prod)
- **Batch Jobs**: Azure Functions
- **CI/CD**: GitHub Actions (planned)
- **Monitoring**: Azure Application Insights (planned)

---

## 📁 Project Structure

```
timeline/
├── src/                          # React Native app source
│   ├── components/               # Reusable UI components
│   ├── screens/                  # Main app screens
│   ├── modules/                  # Core functionality pillars
│   │   ├── audio/                # Pillar 1: Audio recording & transcription
│   │   ├── decisions/            # Pillar 2: Decision tracking & analysis
│   │   ├── relationships/        # Pillar 3: Relationship monitoring
│   │   ├── procrastination/      # Pillar 4: Anti-procrastination system
│   │   ├── simulation/           # Pillar 5: Life path simulator
│   │   ├── health/               # Pillar 6: Health & pattern tracking
│   │   └── briefing/             # Pillar 7: Daily briefing generator
│   ├── services/                 # API clients, external integrations
│   ├── utils/                    # Helper functions, constants
│   ├── context/                  # React Context providers
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript type definitions
│   └── config/                   # App configuration
├── backend/                      # Node.js backend
│   ├── functions/                # Azure Functions (batch jobs)
│   ├── models/                   # MongoDB schemas
│   ├── routes/                   # API route definitions
│   ├── controllers/              # Business logic
│   ├── middleware/               # Auth, validation, error handling
│   ├── utils/                    # Backend helpers
│   ├── server.js                 # Express app entry point
│   └── Dockerfile                # Docker configuration
├── assets/                       # Images, fonts, icons
├── .env.example                  # Environment variables template
├── app.json                      # Expo configuration
├── package.json                  # Frontend dependencies
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Expo CLI**: `npm install -g expo-cli`
- **MongoDB Atlas Account**: [Sign up here](https://www.mongodb.com/cloud/atlas)
- **Firebase Project**: [Create project](https://console.firebase.google.com/)
- **OpenAI API Key**: [Get API key](https://platform.openai.com/api-keys)

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd timeline
```

#### 2. Install Frontend Dependencies
```bash
npm install
```

#### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

#### 4. Configure Environment Variables

**Frontend (.env in root):**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

**Backend (backend/.env):**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your actual credentials
```

**Required credentials:**
- Firebase config (from Firebase Console)
- MongoDB connection string (from MongoDB Atlas)
- OpenAI API key
- JWT secret (generate a random string)
- Encryption key (64-character hex string)

#### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Mobile App:**
```bash
npm start
```

**Terminal 3 - Redis (if running locally):**
```bash
redis-server
```

#### 6. Run on Device/Simulator
- **iOS**: Press `i` in the Expo terminal or scan QR code with Expo Go
- **Android**: Press `a` in the Expo terminal or scan QR code with Expo Go

---

## 🏛️ Architecture Decisions

### 1. Privacy-First Design
**Decision**: All sensitive data encrypted at rest with AES-256.

**Rationale**: Users are trusting us with their most personal data (audio, decisions, relationships). Encryption is non-negotiable. Keys stored in device keychain (iOS Keychain, Android Keystore).

**Trade-off**: Slight performance overhead on read/write operations, but modern mobile devices handle this easily.

### 2. Local-First Architecture
**Decision**: App works 100% offline with optional cloud sync.

**Rationale**: 
- Privacy-conscious users can use app without cloud
- Works in areas with poor connectivity
- Reduces API costs for free tier users

**Trade-off**: More complex sync logic with conflict resolution needed.

### 3. Modular Pillar Structure
**Decision**: Each feature (Audio, Decisions, etc.) is a self-contained module.

**Rationale**:
- Easy to add/remove features
- Clear separation of concerns
- Different team members can work on different pillars
- Can release features incrementally

**Implementation**: Each module has its own folder with components, hooks, services, and types.

### 4. Hybrid AI Processing
**Decision**: Real-time AI for urgent insights, batch processing for deep analysis.

**Rationale**:
- Real-time: Procrastination alerts, decision nudges (must be instant)
- Batch: Pattern analysis, life simulation (can wait, saves costs)

**Cost savings**: ~70% reduction in OpenAI API costs vs. all real-time.

### 5. MongoDB Over SQL
**Decision**: Use MongoDB for primary database.

**Rationale**:
- Flexible schema (different data types: audio transcripts, decisions, health logs)
- Easy to add new fields without migrations
- Excellent performance for document-based queries
- Native JSON support (perfect for mobile apps)

**Trade-off**: Less strict data integrity, but our use case doesn't require complex joins.

### 6. Expo Managed Workflow (Initially)
**Decision**: Start with Expo managed, migrate to bare if needed.

**Rationale**:
- Faster development (no native code setup)
- Over-the-air updates
- Easier testing on real devices
- Can eject to bare workflow if we need custom native modules

**Migration path**: If background audio recording requires native code, we'll eject.

### 7. Zustand Over Redux
**Decision**: Use React Context for simple state, Zustand for complex global state.

**Rationale**:
- Zustand is lighter than Redux (less boilerplate)
- Better TypeScript support
- Easier to learn for new developers
- Sufficient for our needs (we're not building a massive app)

**When to use each**:
- Context: Theme, auth state, simple UI state
- Zustand: Audio recordings, decisions history, sync state

### 8. Docker for Backend
**Decision**: Dockerize backend API for deployment.

**Rationale**:
- Cloud-agnostic (can move from Azure to AWS/GCP easily)
- Consistent environments (dev/staging/prod)
- Easy scaling with container orchestration
- Simplified deployment process

---

## 🔐 Security & Privacy

### Data Encryption
- **At Rest**: AES-256 encryption for all sensitive data
- **In Transit**: HTTPS/TLS 1.3 for all API calls
- **Keys**: Stored in device secure storage (Keychain/Keystore)

### Authentication
- Firebase Auth with email/password, Google, Apple sign-in
- JWT tokens for API authentication (7-day expiry)
- Refresh token rotation

### Privacy Features
- **Offline Mode**: Use app without any cloud sync
- **Audio Deletion**: Audio deleted immediately after transcription
- **Data Export**: Users can export all their data (GDPR compliance)
- **Data Deletion**: Users can permanently delete their account and data

### Compliance
- **GDPR**: Right to access, right to deletion, data portability
- **CCPA**: Opt-out of data sale (we don't sell data anyway)
- **HIPAA**: Not currently compliant (future consideration for health data)

---

## 🧪 Testing Strategy

### Unit Tests
- **Framework**: Jest
- **Coverage Target**: 80% for critical modules
- **Run**: `npm test`

### Integration Tests
- **Backend API**: Supertest
- **Database**: In-memory MongoDB for tests

### E2E Tests
- **Framework**: Detox (planned)
- **Scope**: Critical user flows (signup, audio recording, decision tracking)

### Manual Testing
- **Beta Users**: Handpicked test users for feedback
- **Platforms**: iOS (iPhone 12+), Android (Pixel 5+)

---

## 📊 Development Workflow

### Git Workflow
```
main (production)
  ├── staging (pre-production)
  │     ├── feature/audio-recording
  │     ├── feature/decision-tracking
  │     └── feature/procrastination-alerts
  └── dev (development)
```

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Production hotfixes
- `refactor/what-changed` - Code refactoring

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add audio recording module
fix: resolve crash on decision save
docs: update README with setup instructions
refactor: simplify encryption logic
test: add unit tests for audio service
```

### Code Review
- All PRs require 1 approval before merge
- Run linter and tests before pushing
- Keep PRs small and focused (< 500 lines)

---

## 🎯 MVP Roadmap (Phase 1)

### Pillar 1: Audio Recording & Transcription
- [ ] User-initiated audio recording
- [ ] Local speech-to-text (iOS/Android)
- [ ] Fallback to OpenAI Whisper API
- [ ] Encrypted storage of transcripts
- [ ] Audio deletion after transcription

### Pillar 2: Decision Tracking
- [ ] Log decisions with context
- [ ] AI analysis of decision patterns
- [ ] Outcome tracking
- [ ] Decision quality scoring

### Pillar 4: Procrastination Intervention
- [ ] Detect procrastination patterns
- [ ] Real-time nudges and alerts
- [ ] Task prioritization
- [ ] Progress tracking

### Core Infrastructure
- [ ] User authentication (Firebase)
- [ ] Backend API (Express + MongoDB)
- [ ] Data encryption (AES-256)
- [ ] Offline-first sync
- [ ] Push notifications

---

## 💰 Monetization Strategy

### Free Tier
- Core features (Audio, Decisions, Procrastination)
- 1 hour of audio transcription per month
- 30 days data retention
- Single device

### Pro Tier ($9.99/month)
- All features (including Simulation, Relationships)
- Unlimited audio transcription
- 1 year data retention
- Multi-device sync
- Priority support
- Always-on recording mode (future)

---

## 🤝 Contributing

We're not open to external contributions yet, but we will be once we reach v1.0.

---

## 📄 License

Proprietary - All rights reserved.

---

## 📞 Support

For questions or issues:
- **Email**: support@timeline-app.com (placeholder)
- **Docs**: [Coming soon]

---

## 🙏 Acknowledgments

Built with:
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [OpenAI](https://openai.com/)
- [MongoDB](https://www.mongodb.com/)
- [Firebase](https://firebase.google.com/)

---

**Timeline** - Your life, optimized. 🚀
