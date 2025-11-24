# Contributing to Timeline

Thank you for your interest in contributing to Timeline! This guide will help you get started.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Guidelines](#testing-guidelines)

---

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professionalism

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- Git
- Code editor (VS Code recommended)

### Setup
1. Clone the repository
2. Follow instructions in `SETUP.md`
3. Create a feature branch
4. Start coding!

---

## 🔄 Development Workflow

### Branch Strategy

```
main (production)
  ├── staging (pre-production)
  │     ├── feature/your-feature-name
  │     ├── bugfix/bug-description
  │     └── refactor/what-changed
  └── dev (development)
```

### Branch Naming

- **Features**: `feature/audio-recording`, `feature/decision-tracking`
- **Bug Fixes**: `bugfix/fix-crash-on-save`, `bugfix/auth-token-expiry`
- **Refactoring**: `refactor/simplify-encryption`, `refactor/optimize-queries`
- **Hotfixes**: `hotfix/critical-security-fix`

### Creating a Branch

```bash
# Update your local repository
git checkout main
git pull origin main

# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Push the branch to remote
git push -u origin feature/your-feature-name
```

---

## 💻 Coding Standards

### TypeScript

**Use strict typing:**
```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good
interface DataInput {
  value: string;
  timestamp: number;
}

function processData(data: DataInput): string {
  return data.value;
}
```

**Avoid `any` type:**
```typescript
// ❌ Bad
const result: any = await fetchData();

// ✅ Good
interface ApiResponse {
  data: string[];
  status: number;
}

const result: ApiResponse = await fetchData();
```

### React Components

**Use functional components with hooks:**
```typescript
// ❌ Bad (class component)
class MyComponent extends React.Component {
  render() {
    return <View />;
  }
}

// ✅ Good (functional component)
const MyComponent: React.FC = () => {
  return <View />;
};
```

**Destructure props:**
```typescript
// ❌ Bad
const Button = (props) => {
  return <TouchableOpacity onPress={props.onPress}>
    <Text>{props.title}</Text>
  </TouchableOpacity>;
};

// ✅ Good
interface ButtonProps {
  title: string;
  onPress: () => void;
}

const Button: React.FC<ButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};
```

### Naming Conventions

- **Components**: PascalCase (`AudioRecorder`, `DecisionCard`)
- **Functions**: camelCase (`handlePress`, `fetchUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Files**: PascalCase for components, camelCase for utilities
  - Components: `AudioRecorder.tsx`
  - Utilities: `encryptionUtils.ts`
  - Hooks: `useAudioRecorder.ts`

### File Organization

```typescript
// 1. Imports (grouped and sorted)
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AudioService } from '@services/audioService';
import { Button } from '@components/Button';
import { styles } from './AudioRecorder.styles';

// 2. Types/Interfaces
interface AudioRecorderProps {
  onComplete: (transcript: string) => void;
}

// 3. Constants
const MAX_RECORDING_DURATION = 3600; // 1 hour

// 4. Component
export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onComplete }) => {
  // Hooks
  const [isRecording, setIsRecording] = useState(false);
  const navigation = useNavigation();

  // Effects
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, []);

  // Handlers
  const handleStartRecording = () => {
    setIsRecording(true);
  };

  // Render
  return (
    <View style={styles.container}>
      <Button onPress={handleStartRecording} title="Start Recording" />
    </View>
  );
};
```

### Comments

**Use JSDoc for functions:**
```typescript
/**
 * Encrypts a string using AES-256 encryption
 * @param data - The string to encrypt
 * @param key - The encryption key (must be 32 bytes)
 * @returns The encrypted string in base64 format
 * @throws {Error} If the key is invalid
 */
function encrypt(data: string, key: string): string {
  // Implementation
}
```

**Use inline comments for complex logic:**
```typescript
// Calculate the average sentiment score across all transcripts
// Weight recent transcripts more heavily (exponential decay)
const averageSentiment = transcripts.reduce((acc, transcript, index) => {
  const weight = Math.exp(-0.1 * (transcripts.length - index - 1));
  return acc + transcript.sentiment * weight;
}, 0) / transcripts.length;
```

---

## 📝 Commit Guidelines

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
# Feature
git commit -m "feat(audio): add audio recording component"

# Bug fix
git commit -m "fix(auth): resolve token expiry issue"

# Documentation
git commit -m "docs(readme): update setup instructions"

# Refactoring
git commit -m "refactor(encryption): simplify encryption logic"

# With body
git commit -m "feat(decisions): add AI analysis

- Integrate OpenAI GPT-4 API
- Add decision scoring algorithm
- Display insights in UI"
```

---

## 🔀 Pull Request Process

### Before Creating a PR

1. **Update your branch:**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-feature
   git merge main
   ```

2. **Run tests:**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

3. **Test manually:**
   - Test on iOS and Android
   - Test offline mode
   - Test error cases

### Creating a PR

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature
   ```

2. **Open PR on GitHub:**
   - Use a descriptive title
   - Fill out the PR template
   - Link related issues
   - Add screenshots/videos if UI changes

3. **PR Title Format:**
   ```
   [Type] Brief description
   ```
   
   Examples:
   - `[Feature] Add audio recording module`
   - `[Fix] Resolve crash on decision save`
   - `[Refactor] Optimize database queries`

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Tested on iOS
- [ ] Tested on Android

## Screenshots/Videos
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass
```

### Code Review

- Address all review comments
- Keep discussions professional
- Be open to feedback
- Update PR based on feedback

### Merging

- Squash commits before merging
- Delete branch after merge
- Update related documentation

---

## 🧪 Testing Guidelines

### Unit Tests

**Test file naming:**
- `audioService.test.ts` (for `audioService.ts`)
- `AudioRecorder.test.tsx` (for `AudioRecorder.tsx`)

**Test structure:**
```typescript
describe('AudioService', () => {
  describe('encrypt', () => {
    it('should encrypt data correctly', () => {
      const data = 'test data';
      const encrypted = audioService.encrypt(data);
      expect(encrypted).not.toBe(data);
    });

    it('should throw error for invalid key', () => {
      expect(() => {
        audioService.encrypt('data', 'short');
      }).toThrow('Invalid encryption key');
    });
  });
});
```

### Integration Tests

```typescript
describe('POST /api/decisions', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup: Create test user and get token
    authToken = await getTestAuthToken();
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await cleanupTestData();
  });

  it('should create a new decision', async () => {
    const response = await request(app)
      .post('/api/decisions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Decision',
        options: [
          { name: 'Option A', pros: ['Pro 1'], cons: ['Con 1'] },
          { name: 'Option B', pros: ['Pro 2'], cons: ['Con 2'] }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

### Test Coverage

- Aim for 80%+ code coverage
- Focus on critical paths
- Test edge cases and error handling
- Mock external dependencies (APIs, databases)

---

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., iOS 17.0]
- Device: [e.g., iPhone 14]
- App Version: [e.g., 0.1.0]

## Screenshots/Logs
(if applicable)
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem It Solves
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other solutions you've thought about

## Additional Context
Any other relevant information
```

---

## 📚 Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Expo Documentation](https://docs.expo.dev/)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

## ❓ Questions?

If you have questions:
1. Check existing documentation
2. Search closed issues/PRs
3. Ask in team chat
4. Create a discussion on GitHub

---

**Thank you for contributing to Timeline! 🚀**
