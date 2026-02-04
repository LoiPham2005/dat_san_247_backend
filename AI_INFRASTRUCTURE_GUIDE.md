# AI Infrastructure - Complete Implementation Guide

## 🎯 Overview

This document explains the new AI Infrastructure layer that has been added to the Dat San 247 project. This infrastructure provides enterprise-grade AI capabilities including multi-model support, cost optimization, quota management, and comprehensive monitoring.

## 🏗️ Architecture

### New Entities (4 Core Infrastructure)

#### 1. **AIModel** - AI Model Registry
**Purpose:** Central registry for all AI models used in the system

**Key Features:**
- Support for multiple AI providers (OpenAI, Anthropic, Google, AWS, etc.)
- Cost tracking per model (input/output tokens)
- Performance monitoring (latency, success rate)
- Rate limiting configuration
- Model capabilities tracking (vision, function calling, streaming)

**Example Models:**
```typescript
{
  name: 'gpt-4-turbo',
  displayName: 'GPT-4 Turbo',
  type: AIModelType.LLM,
  provider: AIProvider.OPENAI,
  costPer1kInputTokens: 0.01,
  costPer1kOutputTokens: 0.03,
  maxContextLength: 128000
}
```

#### 2. **AIInteraction** - Universal AI Request/Response Log
**Purpose:** Log ALL AI interactions for debugging, monitoring, and billing

**Key Features:**
- Universal design - works with ANY entity type
- Flexible input/output (JSONB)
- Performance tracking (latency, cost)
- Error handling and retry tracking
- Session tracking for conversations

**Use Cases:**
- Debugging failed AI calls
- Cost analysis per user/feature
- Performance monitoring
- Audit trails

#### 3. **AIQuota** - Usage Quota Management
**Purpose:** Control and limit AI usage to prevent abuse and manage costs

**Key Features:**
- Per-user or per-feature quotas
- Multiple period types (hourly, daily, weekly, monthly)
- Track requests, tokens, and costs
- Auto-reset based on period
- Alert notifications at threshold

**Example Quota:**
```typescript
{
  userId: 'user-123',
  featureCode: 'chatbot',
  period: QuotaPeriod.DAILY,
  maxRequests: 100,
  maxTokens: 50000,
  maxCost: 5.00
}
```

#### 4. **AICache** - Response Caching
**Purpose:** Cache AI responses to dramatically reduce costs

**Key Features:**
- SHA256 hash-based cache keys
- TTL (Time To Live) support
- Hit count tracking
- Cost savings calculation
- Automatic expiration

**Cost Savings:**
- Typical savings: 50-70% on repeated queries
- Example: "What are the best football venues in Hanoi?" asked 100 times = 1 API call instead of 100

## 📊 Complete AI Module Structure

```
AI Module (13 entities)
├── Core Infrastructure (4 - NEW)
│   ├── AIModel (model registry)
│   ├── AIInteraction (universal log)
│   ├── AIQuota (usage limits)
│   └── AICache (cost optimization)
│
├── Chatbot (3 - EXISTING)
│   ├── AIConversation
│   ├── AIMessage
│   └── AIFeedback
│
├── Recommendations (1 - EXISTING)
│   └── AIRecommendation
│
├── Search (2 - EXISTING)
│   ├── AISearchQuery
│   └── AISearchRanking
│
└── Automation (3 - EXISTING)
    ├── AIAssistance
    ├── AISmartNotification
    └── UserPreferencesAI
```

## 🚀 Usage Examples

### Example 1: Register an AI Model

```typescript
const gpt4 = await aiModelRepo.save({
  name: 'gpt-4-turbo',
  displayName: 'GPT-4 Turbo',
  version: '2024-01-01',
  type: AIModelType.LLM,
  provider: AIProvider.OPENAI,
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  apiKeyName: 'OPENAI_API_KEY',
  capabilities: {
    vision: true,
    functionCalling: true,
    streaming: true
  },
  maxTokens: 4096,
  maxContextLength: 128000,
  costPer1kInputTokens: 0.01,
  costPer1kOutputTokens: 0.03,
  rateLimitRpm: 500,
  defaultConfig: {
    temperature: 0.7,
    topP: 1,
    maxTokens: 2000
  },
  status: ModelStatus.ACTIVE
});
```

### Example 2: Log an AI Interaction

```typescript
// Before calling AI
const interaction = await aiInteractionRepo.save({
  modelId: gpt4.id,
  type: InteractionType.CHAT,
  userId: user.id,
  sessionId: 'session-123',
  entityType: 'venue',
  entityId: venue.id,
  inputData: {
    messages: [
      { role: 'user', content: 'Tell me about this venue' }
    ]
  },
  status: InteractionStatus.PROCESSING,
  startedAt: new Date()
});

// After AI response
await aiInteractionRepo.update(interaction.id, {
  outputData: {
    text: 'This is a great football venue...'
  },
  inputTokens: 15,
  outputTokens: 50,
  latencyMs: 1200,
  cost: 0.00065,
  status: InteractionStatus.COMPLETED,
  completedAt: new Date()
});
```

### Example 3: Check Quota Before AI Call

```typescript
async function checkQuota(userId: string, featureCode: string): Promise<boolean> {
  const quota = await aiQuotaRepo.findOne({
    where: {
      userId,
      featureCode,
      periodEnd: MoreThan(new Date())
    }
  });

  if (!quota) return true; // No quota = unlimited

  // Check limits
  if (quota.maxRequests && quota.currentRequests >= quota.maxRequests) {
    throw new Error('Request quota exceeded');
  }

  if (quota.maxCost && quota.currentCost >= quota.maxCost) {
    throw new Error('Cost quota exceeded');
  }

  return true;
}
```

### Example 4: Use Cache to Save Costs

```typescript
async function getCachedOrCallAI(input: any, modelId: string): Promise<any> {
  // Generate cache key
  const cacheKey = crypto
    .createHash('sha256')
    .update(JSON.stringify(input))
    .digest('hex');

  // Check cache
  const cached = await aiCacheRepo.findOne({
    where: {
      cacheKey,
      expiresAt: MoreThan(new Date())
    }
  });

  if (cached) {
    // Cache hit!
    await aiCacheRepo.update(cached.id, {
      hitCount: cached.hitCount + 1,
      lastHitAt: new Date()
    });
    return cached.outputData;
  }

  // Cache miss - call AI
  const result = await callAI(input, modelId);

  // Save to cache
  await aiCacheRepo.save({
    cacheKey,
    modelId,
    inputData: input,
    outputData: result,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  });

  return result;
}
```

## 💰 Cost Optimization Benefits

### Before Infrastructure:
```
User asks: "Best football venues in Hanoi?"
- Direct API call: $0.002
- Asked 1000 times/day = $2/day = $60/month
```

### After Infrastructure (with caching):
```
User asks: "Best football venues in Hanoi?"
- First time: $0.002 (API call)
- Next 999 times: $0 (from cache)
- Total: $0.002/day = $0.06/month

Savings: 99.9% = $59.94/month
```

## 📈 Monitoring & Analytics

### Query Examples:

**1. Total AI cost per day:**
```sql
SELECT 
  DATE(completed_at) as date,
  SUM(cost) as total_cost,
  COUNT(*) as total_requests
FROM ai_interactions
WHERE status = 'COMPLETED'
GROUP BY DATE(completed_at)
ORDER BY date DESC;
```

**2. Most expensive users:**
```sql
SELECT 
  u.email,
  SUM(i.cost) as total_cost,
  COUNT(i.id) as total_requests
FROM ai_interactions i
JOIN users u ON i.user_id = u.id
WHERE i.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email
ORDER BY total_cost DESC
LIMIT 10;
```

**3. Cache hit rate:**
```sql
SELECT 
  COUNT(*) as total_cached,
  SUM(hit_count) as total_hits,
  SUM(cost_saved) as total_saved
FROM ai_cache
WHERE created_at > NOW() - INTERVAL '7 days';
```

**4. Model performance comparison:**
```sql
SELECT 
  m.name,
  COUNT(i.id) as requests,
  AVG(i.latency_ms) as avg_latency,
  SUM(i.cost) as total_cost,
  COUNT(CASE WHEN i.status = 'COMPLETED' THEN 1 END)::DECIMAL / 
    NULLIF(COUNT(*), 0) as success_rate
FROM ai_models m
LEFT JOIN ai_interactions i ON m.id = i.model_id
WHERE i.created_at > NOW() - INTERVAL '7 days'
GROUP BY m.id, m.name
ORDER BY requests DESC;
```

## 🔧 Migration Steps

### 1. Run Database Migration
```bash
npm run migration:generate -- -n AddAIInfrastructure
npm run migration:run
```

### 2. Seed Initial AI Models
```typescript
// Create seeder: src/database/seeders/ai-models.seeder.ts
const models = [
  {
    name: 'gpt-4-turbo',
    displayName: 'GPT-4 Turbo',
    type: AIModelType.LLM,
    provider: AIProvider.OPENAI,
    // ... config
  },
  {
    name: 'claude-sonnet-4',
    displayName: 'Claude Sonnet 4',
    type: AIModelType.LLM,
    provider: AIProvider.ANTHROPIC,
    // ... config
  }
];
```

### 3. Set Default Quotas
```typescript
// For free users
{
  featureCode: 'chatbot',
  period: QuotaPeriod.DAILY,
  maxRequests: 50,
  maxTokens: 10000,
  maxCost: 1.00
}

// For premium users
{
  featureCode: 'chatbot',
  period: QuotaPeriod.DAILY,
  maxRequests: 500,
  maxTokens: 100000,
  maxCost: 10.00
}
```

## 🎯 Next Steps

### Phase 1: Integration (Week 1-2)
1. Create `AIService` to wrap all AI calls
2. Integrate quota checking into all AI features
3. Implement caching for common queries
4. Add interaction logging to existing AI features

### Phase 2: Monitoring (Week 3-4)
1. Create admin dashboard for AI metrics
2. Set up cost alerts
3. Implement quota notifications
4. Add performance monitoring

### Phase 3: Optimization (Month 2)
1. Analyze cache hit rates
2. Optimize quota limits based on usage
3. A/B test different AI models
4. Implement smart model routing (use cheaper models when possible)

## 🏆 Expected Results

After full implementation:

- **Cost Reduction:** 50-70% through caching
- **Better Control:** Quota management prevents abuse
- **Improved Debugging:** Complete audit trail of all AI calls
- **Performance Insights:** Know which models work best
- **Scalability:** Can easily add new AI models/providers

## 📝 Best Practices

1. **Always log interactions** - Even for cached responses
2. **Set reasonable quotas** - Start conservative, increase based on usage
3. **Monitor costs daily** - Set up alerts for unusual spikes
4. **Cache aggressively** - Most queries are repetitive
5. **Use cheaper models when possible** - GPT-3.5 for simple tasks, GPT-4 for complex ones

---

**Status:** ✅ Infrastructure Complete - Ready for Integration
**Next:** Implement AIService wrapper and integrate into existing features
