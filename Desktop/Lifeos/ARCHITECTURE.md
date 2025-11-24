# Timeline - Architecture Documentation

This document provides a deep dive into Timeline's technical architecture, design patterns, and implementation decisions.

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Audio   │  │ Decision │  │Procrastin│  │ Briefing │   │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │              │          │
│       └─────────────┴──────────────┴──────────────┘          │
│                          │                                    │
│                    Local Storage                             │
│                 (Encrypted AsyncStorage)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                      HTTPS/TLS
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                   Backend API (Express.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │   Data   │  │    AI    │  │  Sync    │   │
│  │Middleware│  │   CRUD   │  │Processing│  │  Logic   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        ├─────────────┴─────────────┴─────────────┤
        │                                          │
   ┌────▼────┐                              ┌─────▼─────┐
   │Firebase │                              │  MongoDB  │
   │  Auth   │                              │   Atlas   │
   └─────────┘                              └───────────┘
                                                   │
                                            ┌──────▼──────┐
                                            │   OpenAI    │
                                            │     API     │
                                            └─────────────┘
```

---

## 📱 Mobile App Architecture

### Layer Structure

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │  ← Screens, Components
├─────────────────────────────────────────┤
│         Business Logic Layer            │  ← Hooks, Context, Modules
├─────────────────────────────────────────┤
│         Data Access Layer               │  ← Services, API Clients
├─────────────────────────────────────────┤
│         Storage Layer                   │  ← AsyncStorage, SecureStore
└─────────────────────────────────────────┘
```

### Module Architecture (Pillar Pattern)

Each pillar (Audio, Decisions, etc.) follows this structure:

```
modules/audio/
├── components/          # UI components specific to this module
│   ├── AudioRecorder.tsx
│   ├── AudioWaveform.tsx
│   └── TranscriptView.tsx
├── hooks/              # Custom hooks for this module
│   ├── useAudioRecorder.ts
│   ├── useTranscription.ts
│   └── useAudioStorage.ts
├── services/           # API calls and external integrations
│   ├── audioService.ts
│   ├── transcriptionService.ts
│   └── whisperClient.ts
├── utils/              # Helper functions
│   ├── audioUtils.ts
│   └── encryptionUtils.ts
├── types/              # TypeScript types
│   └── audio.types.ts
├── context/            # React Context for module state
│   └── AudioContext.tsx
└── index.ts            # Public API of the module
```

**Benefits:**
- **Encapsulation**: Each module is self-contained
- **Reusability**: Modules can be used independently
- **Testability**: Easy to test in isolation
- **Scalability**: Add new modules without affecting existing ones

---

## 🔐 Data Flow & Security

### Audio Recording Flow

```
User Presses Record
       │
       ▼
┌──────────────────┐
│ Check Permissions│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Start Recording │
│  (React Native   │
│      Voice)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Save Audio File │
│   (Temporary)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Transcribe     │
│ (Local or API)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Encrypt Transcript│
│   (AES-256)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Save to Storage  │
│ (AsyncStorage)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Delete Audio File│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Sync to Backend  │
│  (if enabled)    │
└──────────────────┘
```

### Encryption Strategy

**At Rest (Mobile):**
```typescript
// Encrypt before storing
const encrypted = CryptoJS.AES.encrypt(
  JSON.stringify(data),
  encryptionKey
).toString();

await AsyncStorage.setItem(key, encrypted);

// Decrypt when reading
const encrypted = await AsyncStorage.getItem(key);
const decrypted = CryptoJS.AES.decrypt(encrypted, encryptionKey);
const data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
```

**In Transit:**
- All API calls use HTTPS/TLS 1.3
- JWT tokens for authentication
- Request signing for sensitive operations

**At Rest (Backend):**
- MongoDB field-level encryption for sensitive data
- Encryption keys stored in Azure Key Vault (production)

---

## 🔄 Offline-First Sync Strategy

### Sync Architecture

```
Mobile App                    Backend
    │                            │
    │  1. User makes change      │
    │     (offline)              │
    │                            │
    │  2. Save to local DB       │
    │     with sync flag         │
    │                            │
    │  3. Device comes online    │
    │                            │
    │  4. Check for pending      │
    │     sync items             │
    │                            │
    ├─── 5. Send changes ───────>│
    │                            │
    │                      6. Validate
    │                            │
    │                      7. Save to DB
    │                            │
    │<─── 8. Confirm sync ───────┤
    │                            │
    │  9. Mark as synced         │
    │                            │
```

### Conflict Resolution

**Strategy: Last Write Wins (LWW)**

```typescript
interface SyncableData {
  id: string;
  data: any;
  lastModified: number; // Unix timestamp
  syncStatus: 'pending' | 'synced' | 'conflict';
  version: number;
}

// On sync conflict
if (serverVersion > localVersion) {
  // Server wins, update local
  updateLocal(serverData);
} else if (localVersion > serverVersion) {
  // Local wins, update server
  updateServer(localData);
} else {
  // Same version, check timestamp
  if (serverTimestamp > localTimestamp) {
    updateLocal(serverData);
  } else {
    updateServer(localData);
  }
}
```

---

## 🤖 AI Processing Architecture

### Real-Time Processing

**Use Cases:**
- Procrastination detection
- Decision nudges
- Urgent insights

**Flow:**
```
User Action
    │
    ▼
Mobile App
    │
    ▼
Backend API
    │
    ▼
OpenAI API (streaming)
    │
    ▼
Backend API
    │
    ▼
Push Notification
    │
    ▼
Mobile App
```

### Batch Processing

**Use Cases:**
- Pattern analysis
- Life simulation
- Daily briefing generation

**Flow:**
```
Scheduled Trigger (Azure Functions)
    │
    ▼
Fetch User Data (MongoDB)
    │
    ▼
Process in Batches (100 users at a time)
    │
    ▼
OpenAI API (batch requests)
    │
    ▼
Save Results (MongoDB)
    │
    ▼
Send Push Notifications
```

**Cost Optimization:**
- Batch requests reduce API overhead
- Cache common prompts
- Use GPT-3.5 for simple tasks, GPT-4 for complex
- Rate limiting per user

---

## 🗄️ Database Schema

### MongoDB Collections

**users**
```javascript
{
  _id: ObjectId,
  firebaseUid: String,
  email: String,
  displayName: String,
  createdAt: Date,
  settings: {
    syncEnabled: Boolean,
    offlineMode: Boolean,
    audioRetention: Number, // hours
    theme: String,
    notifications: Object
  },
  subscription: {
    tier: 'free' | 'pro',
    expiresAt: Date
  }
}
```

**audio_transcripts**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  transcript: String, // Encrypted
  duration: Number, // seconds
  recordedAt: Date,
  tags: [String],
  sentiment: String,
  keyTopics: [String],
  aiInsights: String,
  syncStatus: String
}
```

**decisions**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  options: [{
    name: String,
    pros: [String],
    cons: [String],
    aiScore: Number
  }],
  chosenOption: String,
  outcome: String,
  createdAt: Date,
  decidedAt: Date,
  reviewedAt: Date
}
```

**procrastination_events**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  task: String,
  detectedAt: Date,
  interventionSent: Boolean,
  interventionType: String,
  userResponse: String,
  completed: Boolean,
  completedAt: Date
}
```

---

## 🚀 Performance Optimization

### Mobile App

**1. Code Splitting**
- Lazy load modules
- Dynamic imports for heavy components

**2. Image Optimization**
- Use WebP format
- Lazy load images
- Cache with react-native-fast-image

**3. State Management**
- Memoize expensive computations
- Use React.memo for pure components
- Debounce user inputs

**4. Audio Processing**
- Stream audio instead of loading entire file
- Use native modules for heavy processing
- Background tasks for transcription

### Backend API

**1. Database Indexing**
```javascript
// MongoDB indexes
db.audio_transcripts.createIndex({ userId: 1, recordedAt: -1 });
db.decisions.createIndex({ userId: 1, createdAt: -1 });
db.users.createIndex({ firebaseUid: 1 }, { unique: true });
```

**2. Caching Strategy**
- Redis for session data
- Cache AI responses for common queries
- CDN for static assets

**3. Query Optimization**
- Pagination (limit + skip)
- Projection (select only needed fields)
- Aggregation pipelines for complex queries

**4. Rate Limiting**
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});
```

---

## 🔒 Security Best Practices

### Authentication
- Firebase Auth for user management
- JWT tokens with short expiry (7 days)
- Refresh token rotation
- Secure token storage (SecureStore)

### Authorization
- Role-based access control (RBAC)
- User can only access their own data
- Admin endpoints protected

### Input Validation
```javascript
const Joi = require('joi');

const decisionSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(1000),
  options: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      pros: Joi.array().items(Joi.string()),
      cons: Joi.array().items(Joi.string())
    })
  ).min(2).max(10)
});
```

### API Security
- Helmet.js for security headers
- CORS configuration
- SQL injection prevention (using Mongoose)
- XSS protection
- CSRF tokens for sensitive operations

---

## 📊 Monitoring & Logging

### Application Monitoring
- Azure Application Insights (planned)
- Error tracking with Sentry (planned)
- Performance metrics

### Logging Strategy
```javascript
// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

**Log Levels:**
- `error`: Critical errors requiring immediate attention
- `warn`: Warning messages
- `info`: General information
- `debug`: Detailed debugging information

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Example: Audio service test
describe('AudioService', () => {
  it('should encrypt transcript before saving', async () => {
    const transcript = 'Test transcript';
    const encrypted = await audioService.saveTranscript(transcript);
    expect(encrypted).not.toBe(transcript);
  });
});
```

### Integration Tests
```typescript
// Example: API endpoint test
describe('POST /api/decisions', () => {
  it('should create a new decision', async () => {
    const response = await request(app)
      .post('/api/decisions')
      .set('Authorization', `Bearer ${token}`)
      .send(decisionData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

### E2E Tests (Detox)
```typescript
describe('Audio Recording Flow', () => {
  it('should record and transcribe audio', async () => {
    await element(by.id('record-button')).tap();
    await waitFor(element(by.id('recording-indicator')))
      .toBeVisible()
      .withTimeout(2000);
    
    await element(by.id('stop-button')).tap();
    await waitFor(element(by.id('transcript')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

---

## 🔄 CI/CD Pipeline (Planned)

```
GitHub Push
    │
    ▼
GitHub Actions
    │
    ├─> Lint & Type Check
    │
    ├─> Run Unit Tests
    │
    ├─> Build Backend Docker Image
    │
    ├─> Push to Azure Container Registry
    │
    ├─> Deploy to Azure App Service (Staging)
    │
    ├─> Run Integration Tests
    │
    ├─> Manual Approval
    │
    └─> Deploy to Production
```

---

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless backend API (can run multiple instances)
- Load balancer (Azure Load Balancer)
- MongoDB sharding for large datasets

### Vertical Scaling
- Upgrade Azure App Service plan
- Increase MongoDB Atlas tier
- Redis cluster for high availability

### Cost Optimization
- Auto-scaling based on load
- Scheduled scaling (scale down at night)
- Optimize OpenAI API usage
- CDN for static assets

---

This architecture is designed to scale from MVP to millions of users while maintaining performance, security, and cost-efficiency.
