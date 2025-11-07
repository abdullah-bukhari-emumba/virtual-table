# Environment Configuration Guide

This guide explains how to configure environment variables for the Multi-Zone architecture across different environments.

## 📋 Environment Variables Overview

### Forms Zone (`apps/forms`)

**Development**:
```env
# No environment variables required for development
# Forms zone runs independently on port 3001
```

**Production**:
```env
# No environment variables required
# Forms zone is self-contained
```

### Shell Zone (`apps/shell`)

**Development** (`.env.local`):
```env
# Forms zone URL for development
FORMS_URL=http://localhost:3001

# Optional: Database configuration
DATABASE_URL=file:./data/patients.db

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

**Production** (Vercel Environment Variables):
```env
# Forms zone production URL
FORMS_URL=https://your-forms-domain.com

# Optional: Database configuration
DATABASE_URL=your-production-database-url

# Optional: Error tracking
SENTRY_DSN=your-sentry-dsn

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-production-analytics-id
```

## 🔧 Setting Up Environment Variables

### Local Development

1. **Create `.env.local` in project root**:
```bash
cp .env.example .env.local
```

2. **Edit `.env.local`**:
```env
FORMS_URL=http://localhost:3001
```

3. **Run development servers**:
```bash
pnpm dev
```

### Vercel Deployment

#### Step 1: Forms Zone Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select Forms Zone project
3. Go to Settings → Environment Variables
4. Add variables for each environment:

**Production**:
```
(No variables required)
```

**Preview**:
```
(No variables required)
```

#### Step 2: Shell Zone Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select Shell Zone project
3. Go to Settings → Environment Variables
4. Add variables for each environment:

**Production**:
```
FORMS_URL=https://your-forms-domain.com
```

**Preview**:
```
FORMS_URL=https://your-forms-domain-git-[branch].vercel.app
```

**Development**:
```
FORMS_URL=http://localhost:3001
```

## 🔐 Security Best Practices

### Never Commit Secrets

1. **Use `.env.local` for local development**:
   - Add to `.gitignore` (already done)
   - Never commit to repository

2. **Use Vercel Environment Variables for production**:
   - Stored securely in Vercel
   - Not visible in repository
   - Encrypted at rest

3. **Use different secrets per environment**:
   - Production secrets
   - Preview/staging secrets
   - Development secrets

### Rotating Secrets

1. **Generate new secret**
2. **Add new secret to Vercel**
3. **Update applications to use new secret**
4. **Redeploy applications**
5. **Remove old secret from Vercel**

## 📊 Environment-Specific Configuration

### Development Environment

**Purpose**: Local development and testing

**Configuration**:
```env
FORMS_URL=http://localhost:3001
NODE_ENV=development
```

**Characteristics**:
- Fast builds
- Source maps enabled
- Verbose logging
- No optimization

### Preview Environment

**Purpose**: Testing pull requests before merge

**Configuration**:
```env
FORMS_URL=https://your-forms-domain-git-[branch].vercel.app
NODE_ENV=production
```

**Characteristics**:
- Automatic deployment on PR
- Isolated from production
- Full optimization
- Production-like environment

### Production Environment

**Purpose**: Live application serving users

**Configuration**:
```env
FORMS_URL=https://your-forms-domain.com
NODE_ENV=production
```

**Characteristics**:
- Maximum optimization
- Full monitoring
- Error tracking enabled
- Analytics enabled

## 🔄 Updating Environment Variables

### Adding New Environment Variable

1. **Add to `.env.example`**:
```env
NEW_VARIABLE=example-value
```

2. **Add to `.env.local` for development**:
```env
NEW_VARIABLE=your-local-value
```

3. **Add to Vercel**:
   - Go to Project Settings → Environment Variables
   - Add for each environment (Production, Preview, Development)

4. **Update code to use variable**:
```typescript
const newVariable = process.env.NEW_VARIABLE;
```

5. **Redeploy applications**:
```bash
vercel deploy --prod
```

### Removing Environment Variable

1. **Remove from `.env.example`**
2. **Remove from `.env.local`**
3. **Remove from Vercel**:
   - Go to Project Settings → Environment Variables
   - Delete from each environment
4. **Remove from code**
5. **Redeploy applications**

## 🧪 Testing Environment Variables

### Local Testing

```bash
# Test that environment variables are loaded
node -e "console.log(process.env.FORMS_URL)"

# Test in Next.js
pnpm dev
# Check browser console for any errors
```

### Production Testing

```bash
# Check environment variables in Vercel logs
vercel logs

# Test API endpoint
curl -H "Authorization: Bearer $TOKEN" https://your-domain.com/api/test
```

## 📝 Environment Variable Checklist

### Before Deployment

- [ ] All required environment variables defined
- [ ] No secrets in `.env.local` committed to git
- [ ] `.env.local` in `.gitignore`
- [ ] `.env.example` updated with new variables
- [ ] Vercel environment variables configured
- [ ] Different values for each environment
- [ ] Sensitive values encrypted/masked

### After Deployment

- [ ] Environment variables loaded correctly
- [ ] No "undefined" errors in logs
- [ ] Application behaves correctly
- [ ] Cross-zone communication works
- [ ] Database connection works (if applicable)
- [ ] Error tracking works (if applicable)
- [ ] Analytics works (if applicable)

## 🆘 Troubleshooting

### Issue: "Cannot find module" or "undefined" errors

**Cause**: Environment variable not set

**Solution**:
1. Check `.env.local` has the variable
2. Check Vercel has the variable set
3. Restart development server
4. Redeploy to Vercel

### Issue: Wrong value being used

**Cause**: Environment variable override or precedence issue

**Solution**:
1. Check `.env.local` for overrides
2. Check Vercel environment variables
3. Check system environment variables
4. Verify variable name spelling

### Issue: Cross-zone communication fails

**Cause**: FORMS_URL not set correctly

**Solution**:
1. Verify FORMS_URL in shell zone
2. Test URL is accessible
3. Check for CORS issues
4. Verify forms zone is deployed


