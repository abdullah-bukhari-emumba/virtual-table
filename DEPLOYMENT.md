# Deployment Guide - Next.js Multi-Zone Architecture

This guide provides detailed instructions for deploying the Multi-Zone architecture to Vercel.

## 📋 Overview

The Multi-Zone architecture consists of two independent Next.js applications:

1. **Shell Zone** (`apps/shell`) - Main application with patient virtual table
2. **Forms Zone** (`apps/forms`) - Patient intake forms

Each zone is deployed as a separate Vercel project and communicates via HTTP rewrites.

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─ https://yourdomain.com (Shell Zone)
                     │  ├─ / (Patient Table)
                     │  ├─ /api/patients/* (API Routes)
                     │  └─ /forms/* → Rewrite to Forms Zone
                     │
                     └─ https://forms.yourdomain.com (Forms Zone)
                        └─ /forms/patient-intake (Patient Form)
```

## 🚀 Deployment Steps

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket
3. **PNPM**: Ensure your project uses PNPM workspaces

### Step 1: Deploy Forms Zone First

The forms zone should be deployed first because the shell zone needs its URL.

#### 1.1 Create Vercel Project for Forms Zone

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure the project:

**Project Settings:**
```
Project Name: patient-forms (or your preferred name)
Framework Preset: Next.js
Root Directory: apps/forms
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
```

**Environment Variables:**
```
(None required for forms zone)
```

5. Click "Deploy"
6. Wait for deployment to complete
7. **Note the deployment URL** (e.g., `https://patient-forms.vercel.app`)

#### 1.2 Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add custom domain (e.g., `forms.yourdomain.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation

### Step 2: Deploy Shell Zone

#### 2.1 Create Vercel Project for Shell Zone

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository (same repo, different root)
4. Configure the project:

**Project Settings:**
```
Project Name: patient-table (or your preferred name)
Framework Preset: Next.js
Root Directory: apps/shell
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
```

**Environment Variables:**
```
FORMS_URL=https://patient-forms.vercel.app
```
(Use your actual forms zone URL from Step 1.1)

5. Click "Deploy"
6. Wait for deployment to complete

#### 2.2 Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add custom domain (e.g., `yourdomain.com` or `app.yourdomain.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation

#### 2.3 Update Forms URL (If Using Custom Domain)

If you configured a custom domain for the forms zone:

1. Go to Shell Zone project → Settings → Environment Variables
2. Update `FORMS_URL` to your custom domain:
   ```
   FORMS_URL=https://forms.yourdomain.com
   ```
3. Redeploy the shell zone

### Step 3: Verify Deployment

#### 3.1 Test Shell Zone

1. Visit your shell zone URL (e.g., `https://patient-table.vercel.app`)
2. Verify the patient table loads correctly
3. Test search functionality
4. Test sorting
5. Test scrolling performance

#### 3.2 Test Forms Zone

1. Visit your forms zone URL (e.g., `https://patient-forms.vercel.app/forms/patient-intake`)
2. Verify the form loads correctly
3. Test form validation
4. Test form submission

#### 3.3 Test Cross-Zone Navigation

1. From the shell zone, navigate to `/forms/patient-intake`
2. Verify you're redirected to the forms zone
3. Verify the navigation bar shows "Back to Patient Table" link
4. Click the link and verify you return to the shell zone

### Step 4: Configure Production Environment

#### 4.1 Database Configuration

If using a production database:

1. Update `packages/database/src/db.ts` to use environment variable for database path
2. Add database URL to both zones' environment variables:
   ```
   DATABASE_URL=your-production-database-url
   ```

#### 4.2 Error Tracking (Optional)

Add error tracking service (e.g., Sentry):

1. Install Sentry in both zones:
   ```bash
   pnpm add @sentry/nextjs --filter shell
   pnpm add @sentry/nextjs --filter forms
   ```

2. Configure Sentry in both zones
3. Add Sentry DSN to environment variables

#### 4.3 Analytics (Optional)

Add analytics (e.g., Vercel Analytics):

1. Enable Vercel Analytics in project settings
2. Or add custom analytics (Google Analytics, Plausible, etc.)

## 🔧 Advanced Configuration

### Monorepo Build Optimization

To optimize builds in a monorepo, configure Vercel to only rebuild changed zones:

**vercel.json** (in project root):
```json
{
  "buildCommand": "cd ../.. && pnpm build --filter=shell",
  "ignoreCommand": "bash .vercel/ignore-build.sh"
}
```

**.vercel/ignore-build.sh** (for shell zone):
```bash
#!/bin/bash

# Only build if shell zone or shared packages changed
git diff HEAD^ HEAD --quiet apps/shell/ packages/ || exit 1
```

### Custom Headers

Add security headers in `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ];
},
```

### Preview Deployments

Vercel automatically creates preview deployments for pull requests.

**Configure Preview Environment Variables:**

1. Go to Project Settings → Environment Variables
2. Set environment-specific values:
   - Production: `FORMS_URL=https://forms.yourdomain.com`
   - Preview: `FORMS_URL=https://patient-forms-git-[branch].vercel.app`

## 📊 Monitoring & Observability

### Vercel Analytics

1. Enable in Project Settings → Analytics
2. View metrics:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics (Web Vitals)

### Vercel Speed Insights

1. Enable in Project Settings → Speed Insights
2. Monitor:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)
   - First Input Delay (FID)

### Logs

View deployment and runtime logs:
1. Go to Project → Deployments
2. Click on a deployment
3. View "Build Logs" and "Function Logs"

## 🐛 Troubleshooting

### Issue: 404 on /forms/* routes

**Cause**: Forms zone URL not configured correctly in shell zone

**Solution**:
1. Verify `FORMS_URL` environment variable in shell zone
2. Ensure forms zone is deployed and accessible
3. Redeploy shell zone after updating environment variable

### Issue: Assets not loading (404 on /_next/*)

**Cause**: Asset prefix misconfiguration

**Solution**:
1. Verify `assetPrefix` in `apps/forms/next.config.ts` is set to `/forms-static`
2. Verify rewrites in `apps/shell/next.config.ts` include `/forms-static/:path*`
3. Redeploy both zones

### Issue: CORS errors

**Cause**: Cross-origin requests between zones

**Solution**:
Add CORS headers in `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
      ],
    },
  ];
},
```

### Issue: Build fails with "Module not found"

**Cause**: Workspace dependencies not installed

**Solution**:
1. Ensure `pnpm-workspace.yaml` is in repository root
2. Verify `Install Command` in Vercel is set to `pnpm install`
3. Check that all workspace dependencies use `workspace:*` protocol

### Issue: Environment variables not working

**Cause**: Environment variables not set in Vercel

**Solution**:
1. Go to Project Settings → Environment Variables
2. Add required variables for each environment (Production, Preview, Development)
3. Redeploy

## 📈 Performance Optimization

### Edge Functions

Convert API routes to Edge Functions for lower latency:

```typescript
// apps/shell/app/api/patients/route.ts
export const runtime = 'edge';
```

### Image Optimization

Use Next.js Image component:

```tsx
import Image from 'next/image';

<Image
  src="/patient-avatar.jpg"
  alt="Patient"
  width={40}
  height={40}
/>
```

### Caching

Configure caching headers:

```typescript
// In API routes
export async function GET() {
  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
```

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **HTTPS Only**: Enforce HTTPS in production
3. **CSP Headers**: Add Content Security Policy headers
4. **Rate Limiting**: Implement rate limiting for API routes
5. **Input Validation**: Validate all user inputs
6. **SQL Injection**: Use parameterized queries (already implemented)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Multi-Zones](https://nextjs.org/docs/app/guides/multi-zones)
- [PNPM Workspaces](https://pnpm.io/workspaces)
- [Vercel CLI](https://vercel.com/docs/cli)

## 🎯 Deployment Checklist

- [ ] Forms zone deployed and accessible
- [ ] Shell zone deployed with correct `FORMS_URL`
- [ ] Custom domains configured (if applicable)
- [ ] Environment variables set for all environments
- [ ] Cross-zone navigation tested
- [ ] Database connection verified
- [ ] Error tracking configured
- [ ] Analytics enabled
- [ ] Performance metrics monitored
- [ ] Security headers configured
- [ ] Preview deployments working
- [ ] Production deployment tested end-to-end

