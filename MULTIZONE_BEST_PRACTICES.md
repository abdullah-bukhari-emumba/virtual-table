# Multi-Zone Architecture Best Practices

This guide provides best practices for developing, deploying, and maintaining the Multi-Zone architecture.

## 🏗️ Architecture Best Practices

### 1. Zone Independence

**Principle**: Each zone should be independently deployable and functional.

**Implementation**:
- ✅ Forms zone works without shell zone
- ✅ Shell zone can function with fallback if forms zone is down
- ✅ Each zone has its own dependencies
- ✅ No direct imports between zones

**Example - Bad**:
```typescript
// ❌ Don't do this - creates tight coupling
import { FormComponent } from '../../../forms/app/components/Form';
```

**Example - Good**:
```typescript
// ✅ Do this - use HTTP rewrites for cross-zone communication
// In shell zone next.config.ts
{
  source: '/forms/:path*',
  destination: `${process.env.FORMS_URL}/forms/:path*`,
}
```

### 2. Shared Code Organization

**Principle**: Share code through packages, not direct imports.

**Structure**:
```
packages/
├── database/      # Shared database layer
├── types/         # Shared TypeScript types
├── ui/            # Shared UI components
└── utils/         # Shared utilities
```

**Usage**:
```typescript
// ✅ Import from shared packages
import { Patient } from '@virtual-table/types';
import { getPatients } from '@virtual-table/database';
import { PerformanceMetrics } from '@virtual-table/ui';
```

### 3. Environment Variable Management

**Principle**: Use environment variables for cross-zone communication.

**Implementation**:
```typescript
// In shell zone
const formsUrl = process.env.FORMS_URL;

// In next.config.ts
async rewrites() {
  return [
    {
      source: '/forms/:path*',
      destination: `${process.env.FORMS_URL}/forms/:path*`,
    },
  ];
}
```

## 🚀 Development Best Practices

### 1. Local Development Setup

**Start both zones**:
```bash
pnpm dev
# Runs both shell (3000) and forms (3001) concurrently
```

**Or run individually**:
```bash
pnpm dev:shell    # Port 3000
pnpm dev:forms    # Port 3001
```

### 2. Testing Strategy

**Unit Tests**:
```bash
pnpm test
# Tests individual components and functions
```

**Integration Tests**:
```bash
pnpm test:all
# Tests across zones and shared packages
```

**E2E Tests**:
```bash
pnpm test:e2e
# Tests complete user workflows
```

### 3. Code Organization

**Follow feature-first structure**:
```
apps/shell/
├── app/
│   ├── api/           # API routes
│   ├── page.tsx       # Root page
│   └── layout.tsx     # Root layout
├── components/        # Reusable components
├── lib/              # Utilities
└── __tests__/        # Tests
```

## 📦 Deployment Best Practices

### 1. Deployment Order

**Always deploy forms zone first**:
1. Forms zone is independent
2. Shell zone depends on forms zone URL
3. If shell zone deploys first, it will have wrong FORMS_URL

**Correct order**:
```bash
# 1. Deploy forms zone
vercel deploy --prod --scope=org apps/forms

# 2. Update shell zone FORMS_URL environment variable
# (via Vercel dashboard)

# 3. Deploy shell zone
vercel deploy --prod --scope=org apps/shell
```

### 2. Environment Variables

**Use different values per environment**:

**Production**:
```env
FORMS_URL=https://forms.yourdomain.com
```

**Preview**:
```env
FORMS_URL=https://forms-git-[branch].vercel.app
```

**Development**:
```env
FORMS_URL=http://localhost:3001
```

### 3. Monitoring

**Enable monitoring for both zones**:
- [ ] Vercel Analytics
- [ ] Vercel Speed Insights
- [ ] Error tracking (Sentry)
- [ ] Custom metrics

## 🔐 Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env.local`
- ✅ Use Vercel's secure environment variables
- ✅ Rotate secrets regularly
- ✅ Use different secrets per environment

### 2. API Security

- ✅ Validate all inputs
- ✅ Use parameterized queries
- ✅ Implement rate limiting
- ✅ Add authentication/authorization

### 3. Cross-Zone Communication

- ✅ Use HTTPS only
- ✅ Validate origin headers
- ✅ Implement CORS properly
- ✅ Log all cross-zone requests

## 🐛 Troubleshooting Best Practices

### 1. Debugging Cross-Zone Issues

**Check browser console**:
- Look for CORS errors
- Check network tab for failed requests
- Verify response status codes

**Check server logs**:
```bash
vercel logs --follow
```

**Verify configuration**:
```bash
# Check FORMS_URL is set correctly
echo $FORMS_URL

# Test URL is accessible
curl https://your-forms-domain.com/forms/patient-intake
```

### 2. Performance Optimization

**Monitor metrics**:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

**Optimize**:
- Use Next.js Image component
- Implement code splitting
- Enable caching headers
- Use Edge Functions for API routes

### 3. Error Handling

**Implement graceful degradation**:
```typescript
// If forms zone is down, show message
try {
  const response = await fetch(`${FORMS_URL}/forms/patient-intake`);
  if (!response.ok) {
    return <ErrorMessage />;
  }
} catch (error) {
  return <FallbackUI />;
}
```

## 📊 Monitoring Best Practices

### 1. Key Metrics to Monitor

**Availability**:
- Forms zone uptime
- Shell zone uptime
- Cross-zone communication success rate

**Performance**:
- Page load time
- API response time
- Database query time

**Errors**:
- 4xx errors (client errors)
- 5xx errors (server errors)
- JavaScript errors

### 2. Alerting

**Set up alerts for**:
- Zone downtime
- High error rate (>1%)
- Slow response times (>3s)
- Database connection failures

### 3. Logging

**Log important events**:
- Deployments
- Environment variable changes
- Cross-zone requests
- Errors and exceptions

## 🔄 Maintenance Best Practices

### 1. Regular Updates

**Weekly**:
- Review error logs
- Check performance metrics
- Monitor uptime

**Monthly**:
- Update dependencies
- Review security advisories
- Optimize database queries

**Quarterly**:
- Conduct security audit
- Review architecture
- Plan improvements

### 2. Backup Strategy

- [ ] Database backups automated
- [ ] Backups tested regularly
- [ ] Restore procedure documented
- [ ] Backup retention policy defined

### 3. Documentation

- [ ] Keep README updated
- [ ] Document environment variables
- [ ] Document deployment process
- [ ] Document troubleshooting steps
- [ ] Document architecture decisions

## ✅ Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Code reviewed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Monitoring configured
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Maintenance window scheduled (if needed)

## 🎯 Common Pitfalls to Avoid

1. **Deploying shell zone before forms zone**
   - Forms zone URL won't be available
   - Cross-zone communication will fail

2. **Hardcoding URLs instead of using environment variables**
   - Won't work across environments
   - Difficult to maintain

3. **Tight coupling between zones**
   - Defeats purpose of Multi-Zone architecture
   - Makes independent deployment impossible

4. **Not monitoring cross-zone communication**
   - Issues go undetected
   - Users experience silent failures

5. **Insufficient error handling**
   - One zone failure crashes the other
   - Poor user experience


