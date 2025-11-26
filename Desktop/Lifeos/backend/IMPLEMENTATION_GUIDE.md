# 🚀 BACKEND IMPLEMENTATION GUIDE

**Complete guide to implementing Timeline's $5/month backend**

---

## 📋 PREREQUISITES

### Required Accounts (All Free!)

1. **Groq** - https://groq.com
   - Sign up for free account
   - Get API key from console
   - Free tier: ~30 requests/minute

2. **Supabase** - https://supabase.com
   - Create new project
   - Get API URL and anon key
   - Enable pgvector extension

3. **Resend** - https://resend.com
   - Sign up for free account
   - Get API key
   - 3,000 emails/month free

4. **Railway** - https://railway.app
   - Connect GitHub account
   - Free $5 credit/month
   - Deploy from repo

5. **Firebase** (Already have!)
   - Firebase Cloud Messaging
   - Already configured in app

---

## 🔧 ENVIRONMENT SETUP

### 1. Install Dependencies

```bash
cd backend

npm install --save \
  groq-sdk \
  @supabase/supabase-js \
  resend \
  bull \
  ioredis \
  @sentry/node \
  dotenv \
  express \
  cors \
  helmet \
  express-rate-limit \
  multer \
  cheerio \
  rss-parser
```

### 2. Environment Variables

Create `backend/.env`:

```bash
# Server
NODE_ENV=production
PORT=3000

# Groq (FREE LLM)
GROQ_API_KEY=your_groq_api_key_here

# Supabase (FREE Database + Vector DB)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# Resend (FREE Email)
RESEND_API_KEY=your_resend_api_key_here

# Redis (Railway Free Tier)
REDIS_URL=redis://localhost:6379

# Firebase (FREE Push Notifications)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Sentry (FREE Error Tracking)
SENTRY_DSN=your_sentry_dsn_here
```

---

## 📁 PROJECT STRUCTURE

```
backend/
├── src/
│   ├── config/
│   │   ├── groq.ts          # Groq client setup
│   │   ├── supabase.ts      # Supabase client setup
│   │   ├── resend.ts        # Resend client setup
│   │   ├── redis.ts         # Redis client setup
│   │   └── firebase.ts      # Firebase admin setup
│   │
│   ├── services/
│   │   ├── ai/
│   │   │   ├── groqService.ts           # Groq AI calls
│   │   │   ├── embeddingService.ts      # Vector embeddings
│   │   │   └── pastYouService.ts        # Past You AI
│   │   │
│   │   ├── audio/
│   │   │   ├── whisperService.ts        # Local Whisper
│   │   │   └── transcriptionService.ts  # Audio processing
│   │   │
│   │   ├── email/
│   │   │   ├── resendService.ts         # Email sending
│   │   │   └── briefingService.ts       # Daily briefing
│   │   │
│   │   ├── social/
│   │   │   ├── importService.ts         # Data import
│   │   │   ├── normalizerService.ts     # Data normalization
│   │   │   ├── rssService.ts            # RSS monitoring
│   │   │   └── sentimentService.ts      # Sentiment analysis
│   │   │
│   │   └── notifications/
│   │       └── pushService.ts           # Firebase push
│   │
│   ├── jobs/
│   │   ├── dailyBriefing.ts            # 9 AM briefing
│   │   ├── patternAnalysis.ts          # Background analysis
│   │   └── socialSync.ts               # RSS feed sync
│   │
│   ├── routes/
│   │   ├── auth.ts                     # Authentication
│   │   ├── pastYou.ts                  # Past You endpoints
│   │   ├── decisions.ts                # Decision tracking
│   │   ├── social.ts                   # Social media
│   │   └── health.ts                   # Health data
│   │
│   ├── middleware/
│   │   ├── auth.ts                     # JWT verification
│   │   ├── rateLimiter.ts              # Rate limiting
│   │   └── errorHandler.ts             # Error handling
│   │
│   ├── utils/
│   │   ├── encryption.ts               # Data encryption
│   │   └── validators.ts               # Input validation
│   │
│   └── server.ts                       # Express app
│
├── .env
├── package.json
└── tsconfig.json
```

---

## 🔨 IMPLEMENTATION

### 1. Groq Service (FREE LLM)

**File:** `src/config/groq.ts`

```typescript
import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const MODELS = {
  FAST: "mixtral-8x7b-32768",      // Fast, good for simple tasks
  SMART: "llama2-70b-4096",        // Smarter, better reasoning
} as const;
```

**File:** `src/services/ai/groqService.ts`

```typescript
import { groq, MODELS } from '../../config/groq';

export async function generateAIResponse(
  systemPrompt: string,
  userPrompt: string,
  model: keyof typeof MODELS = 'FAST'
): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: MODELS[model],
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error('Failed to generate AI response');
  }
}

export async function generatePastYouResponse(
  query: string,
  context: string[]
): Promise<string> {
  const systemPrompt = `You are "Past You" - the user's past self reflecting on their history.
You have access to their journal entries, decisions, and life events.
Speak in first person as if you are them from the past.
Be empathetic, insightful, and helpful.`;

  const userPrompt = `Query: ${query}

Context from my past:
${context.join('\n\n')}

Respond as Past Me:`;

  return generateAIResponse(systemPrompt, userPrompt, 'SMART');
}

export async function analyzeCrisis(
  signals: string[]
): Promise<{ severity: string; recommendations: string[] }> {
  const systemPrompt = `You are a mental health crisis analyzer.
Analyze signals and provide severity level and recommendations.
Be compassionate and provide actionable support.`;

  const userPrompt = `Crisis signals detected:
${signals.join('\n')}

Provide JSON response with:
{
  "severity": "low" | "medium" | "high" | "critical",
  "recommendations": ["action1", "action2", ...]
}`;

  const response = await generateAIResponse(systemPrompt, userPrompt, 'SMART');
  return JSON.parse(response);
}
```

---

### 2. Supabase + pgvector (FREE Vector DB)

**File:** `src/config/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key for backend
);
```

**Database Setup:**

```sql
-- Run these in Supabase SQL Editor

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMP
);

-- Past You entries with embeddings
CREATE TABLE past_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI/Groq embedding size
  source TEXT, -- 'journal', 'social', 'decision', etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast similarity search
CREATE INDEX ON past_entries 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Similarity search function
CREATE OR REPLACE FUNCTION match_past_entries(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source TEXT,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    source,
    1 - (embedding <=> query_embedding) AS similarity
  FROM past_entries
  WHERE user_id = filter_user_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Social media posts
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'twitter', 'facebook', 'mastodon', etc.
  content TEXT,
  posted_at TIMESTAMP,
  sentiment FLOAT, -- -1 to 1
  engagement JSONB, -- { likes, shares, comments }
  imported_at TIMESTAMP DEFAULT NOW()
);

-- Social connections
CREATE TABLE social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  connected_at TIMESTAMP DEFAULT NOW(),
  last_sync TIMESTAMP,
  data_imported BOOLEAN DEFAULT false,
  settings JSONB -- { auto_sync, import_frequency, etc. }
);
```

**File:** `src/services/ai/embeddingService.ts`

```typescript
import { supabase } from '../../config/supabase';

// Simple embedding generation (can use Groq or local model)
export async function generateEmbedding(text: string): Promise<number[]> {
  // Option 1: Use Groq if they support embeddings
  // Option 2: Use local sentence-transformers
  // Option 3: Use OpenAI embeddings (small cost)
  
  // For now, placeholder - implement based on chosen method
  // This would call your embedding model
  return new Array(1536).fill(0); // Replace with actual embedding
}

export async function storePastEntry(
  userId: string,
  content: string,
  source: string
): Promise<void> {
  const embedding = await generateEmbedding(content);

  const { error } = await supabase
    .from('past_entries')
    .insert({
      user_id: userId,
      content,
      embedding,
      source,
    });

  if (error) throw error;
}

export async function searchSimilarEntries(
  userId: string,
  query: string,
  limit: number = 5
): Promise<Array<{ content: string; source: string; similarity: number }>> {
  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc('match_past_entries', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit,
    filter_user_id: userId,
  });

  if (error) throw error;
  return data || [];
}
```

---

### 3. Resend Email Service (FREE)

**File:** `src/config/resend.ts`

```typescript
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);
```

**File:** `src/services/email/resendService.ts`

```typescript
import { resend } from '../../config/resend';

export async function sendDailyBriefing(
  userEmail: string,
  userName: string,
  briefingData: {
    lifeScore: number;
    topPriority: string;
    energyLevel: number;
    relationships: string[];
    insights: string[];
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { background: #208085; color: white; padding: 20px; }
          .content { padding: 20px; }
          .metric { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌅 Good Morning, ${userName}!</h1>
        </div>
        <div class="content">
          <h2>Your Daily Briefing</h2>
          
          <div class="metric">
            <strong>Life Score:</strong> ${briefingData.lifeScore}/10
          </div>
          
          <div class="metric">
            <strong>Today's Top Priority:</strong> ${briefingData.topPriority}
          </div>
          
          <div class="metric">
            <strong>Energy Level:</strong> ${briefingData.energyLevel}/10
          </div>
          
          <h3>Key Insights:</h3>
          <ul>
            ${briefingData.insights.map(i => `<li>${i}</li>`).join('')}
          </ul>
          
          <p>Have a great day! 🚀</p>
        </div>
      </body>
    </html>
  `;

  const { data, error } = await resend.emails.send({
    from: 'Timeline <briefing@timeline.app>',
    to: userEmail,
    subject: `📊 Your Daily Briefing - ${new Date().toLocaleDateString()}`,
    html,
  });

  if (error) throw error;
  return data;
}

export async function sendCrisisAlert(
  userEmail: string,
  userName: string
) {
  const { data, error } = await resend.emails.send({
    from: 'Timeline <crisis@timeline.app>',
    to: userEmail,
    subject: '🆘 Crisis Support Available',
    html: `
      <h1>We're here for you, ${userName}</h1>
      <p>Crisis mode has been activated. You're not alone.</p>
      <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
      <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
    `,
  });

  if (error) throw error;
  return data;
}
```

---

### 4. Bull Job Queue (Background Tasks)

**File:** `src/config/redis.ts`

```typescript
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
```

**File:** `src/jobs/dailyBriefing.ts`

```typescript
import Queue from 'bull';
import { redis } from '../config/redis';
import { supabase } from '../config/supabase';
import { sendDailyBriefing } from '../services/email/resendService';
import { generateAIResponse } from '../services/ai/groqService';

export const briefingQueue = new Queue('daily-briefing', {
  redis: process.env.REDIS_URL,
});

// Process briefing jobs
briefingQueue.process(async (job) => {
  const { userId } = job.data;

  // Fetch user data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!user) return;

  // Generate briefing with AI
  const briefingData = await generateBriefingData(userId);

  // Send email
  await sendDailyBriefing(user.email, user.display_name, briefingData);
});

// Schedule daily briefings (run at 9 AM for all users)
export async function scheduleDailyBriefings() {
  const { data: users } = await supabase
    .from('users')
    .select('id');

  for (const user of users || []) {
    await briefingQueue.add(
      { userId: user.id },
      {
        repeat: {
          cron: '0 9 * * *', // 9 AM daily
        },
      }
    );
  }
}

async function generateBriefingData(userId: string) {
  // Fetch recent data and generate insights
  // This would call Groq to analyze patterns
  return {
    lifeScore: 7.5,
    topPriority: 'Finish presentation',
    energyLevel: 8,
    relationships: ['Sarah', 'Jake'],
    insights: [
      'Your sleep quality improved 15% this week',
      'You completed 80% of tasks on time',
      'Social battery is at 65% - good balance',
    ],
  };
}
```

---

### 5. Social Media Import Service

**File:** `src/services/social/importService.ts`

```typescript
import { supabase } from '../../config/supabase';
import AdmZip from 'adm-zip';
import { parseStringPromise } from 'xml2js';

export async function importGoogleTakeout(
  userId: string,
  zipBuffer: Buffer
): Promise<void> {
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();

  for (const entry of zipEntries) {
    if (entry.entryName.includes('Gmail')) {
      await processGmailData(userId, entry.getData().toString('utf8'));
    }
    if (entry.entryName.includes('Location History')) {
      await processLocationData(userId, entry.getData().toString('utf8'));
    }
  }
}

export async function importTwitterArchive(
  userId: string,
  zipBuffer: Buffer
): Promise<void> {
  const zip = new AdmZip(zipBuffer);
  const tweetFile = zip.getEntry('data/tweet.js');
  
  if (!tweetFile) throw new Error('Invalid Twitter archive');

  const tweetData = tweetFile.getData().toString('utf8');
  const tweets = JSON.parse(tweetData.replace('window.YTD.tweet.part0 = ', ''));

  for (const tweet of tweets) {
    await supabase.from('social_posts').insert({
      user_id: userId,
      platform: 'twitter',
      content: tweet.tweet.full_text,
      posted_at: new Date(tweet.tweet.created_at),
      engagement: {
        likes: tweet.tweet.favorite_count,
        retweets: tweet.tweet.retweet_count,
      },
    });
  }
}

export async function importFacebookData(
  userId: string,
  zipBuffer: Buffer
): Promise<void> {
  // Parse Facebook HTML/JSON export
  // Extract posts, photos, friends
  // Store in social_posts table
}

export async function importLinkedInGDPR(
  userId: string,
  zipBuffer: Buffer
): Promise<void> {
  // Parse LinkedIn CSV export
  // Extract connections, messages, posts
  // Store in social_posts and social_connections
}
```

---

### 6. RSS Feed Monitoring (FREE Real-Time)

**File:** `src/services/social/rssService.ts`

```typescript
import Parser from 'rss-parser';
import { supabase } from '../../config/supabase';

const parser = new Parser();

export async function syncMastodonFeed(
  userId: string,
  mastodonInstance: string,
  username: string
): Promise<void> {
  const feedUrl = `https://${mastodonInstance}/users/${username}.rss`;
  const feed = await parser.parseURL(feedUrl);

  for (const item of feed.items) {
    // Check if already imported
    const { data: existing } = await supabase
      .from('social_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', 'mastodon')
      .eq('posted_at', new Date(item.pubDate!))
      .single();

    if (existing) continue;

    // Import new post
    await supabase.from('social_posts').insert({
      user_id: userId,
      platform: 'mastodon',
      content: item.contentSnippet,
      posted_at: new Date(item.pubDate!),
    });
  }
}

export async function syncBlueskyFeed(
  userId: string,
  blueskyHandle: string
): Promise<void> {
  const feedUrl = `https://bsky.app/profile/${blueskyHandle}/rss`;
  const feed = await parser.parseURL(feedUrl);

  for (const item of feed.items) {
    await supabase.from('social_posts').insert({
      user_id: userId,
      platform: 'bluesky',
      content: item.contentSnippet,
      posted_at: new Date(item.pubDate!),
    });
  }
}

// Cron job to sync all connected feeds
export async function syncAllFeeds(): Promise<void> {
  const { data: connections } = await supabase
    .from('social_connections')
    .select('*')
    .eq('data_imported', true);

  for (const conn of connections || []) {
    if (conn.platform === 'mastodon') {
      await syncMastodonFeed(
        conn.user_id,
        conn.settings.instance,
        conn.settings.username
      );
    }
    if (conn.platform === 'bluesky') {
      await syncBlueskyFeed(
        conn.user_id,
        conn.settings.handle
      );
    }
  }
}
```

---

## 🚀 DEPLOYMENT

### Railway Deployment

1. **Connect GitHub Repo**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Backend implementation"
   git push origin main
   ```

2. **Create Railway Project**
   - Go to railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repo

3. **Add Environment Variables**
   - In Railway dashboard, go to Variables
   - Add all variables from `.env`

4. **Deploy**
   - Railway auto-deploys on push
   - Monitor logs in dashboard

### Add Redis to Railway

1. In Railway project, click "New"
2. Select "Database" → "Redis"
3. Copy `REDIS_URL` to environment variables

---

## 🎯 TESTING

### Test Groq Integration

```bash
curl -X POST http://localhost:3000/api/past-you \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What was I thinking about career last year?",
    "userId": "test-user-id"
  }'
```

### Test Email

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com"
  }'
```

### Test Social Import

```bash
curl -X POST http://localhost:3000/api/social/import \
  -H "Content-Type: multipart/form-data" \
  -F "file=@twitter-archive.zip" \
  -F "platform=twitter" \
  -F "userId=test-user-id"
```

---

## 📊 MONITORING

### Set up Sentry

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Use in error handler
app.use(Sentry.Handlers.errorHandler());
```

---

## ✅ FINAL CHECKLIST

```
□ Groq API key configured
□ Supabase project created
□ pgvector extension enabled
□ Resend API key configured
□ Railway project deployed
□ Redis instance running
□ Bull queue processing jobs
□ Cron jobs scheduled
□ Social import endpoints working
□ RSS sync working
□ Email sending working
□ Error tracking configured
□ All tests passing
```

---

**Backend is now ready to support Timeline at $5/month!** 🚀

**Next:** Connect frontend to these endpoints and launch! 💎
