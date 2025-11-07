# Production Deployment Guide - Multi-Zone Architecture

This guide provides a comprehensive, step-by-step approach to deploying the Multi-Zone architecture to production following Vercel's best practices.

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Strategy](#deployment-strategy)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Incident Response](#incident-response)

## Pre-Deployment Checklist

### Code Quality

```bash
# Run all tests
pnpm test:all

# Check for TypeScript errors
pnpm build

# Run linting
pnpm lint

# Check bundle size
pnpm build && npm install -g @vercel/ncc && ncc build apps/shell/app/api/patients/route.ts
```

### Environment Preparation

- [ ] Vercel account created and team configured
- [ ] Git repository pushed to GitHub/GitLab/Bitbucket
- [ ] Domain name registered and DNS configured
- [ ] SSL certificates ready (Vercel handles this automatically)
- [ ] Database prepared (if using external database)
- [ ] Error tracking service configured (Sentry, etc.)
- [ ] Analytics service configured (Vercel Analytics, Google Analytics, etc.)
- [ ] Backup strategy documented
- [ ] Rollback procedure tested

### Documentation

- [ ] Deployment runbook created
- [ ] Environment variables documented
- [ ] Team trained on deployment process
- [ ] Incident response plan documented
- [ ] Monitoring alerts configured

## Deployment Strategy

### Recommended Approach: Blue-Green Deployment

1. **Blue Environment** (Current Production)
   - Running stable version
   - Receiving all traffic
   - Can be rolled back to immediately

2. **Green Environment** (New Deployment)
   - New version deployed
   - Tested before traffic switch
   - Minimal downtime

### Implementation Steps

1. Deploy forms zone to preview environment
2. Run smoke tests on preview
3. Deploy shell zone to preview environment
4. Run full integration tests
5. Switch traffic to production (blue-green swap)
6. Monitor for issues
7. Keep previous version available for quick rollback

## Step-by-Step Deployment

### Phase 1: Forms Zone Deployment

```bash
# 1. Verify forms zone builds locally
cd apps/forms
pnpm build
pnpm start

# 2. Test locally
# - Visit http://localhost:3001/forms/patient-intake
# - Test form validation
# - Test form submission

# 3. Deploy to Vercel
vercel deploy --prod --scope=your-org
```

**Verification**:
- [ ] Forms zone accessible at production URL
- [ ] Form loads without errors
- [ ] Form validation works
- [ ] Form submission works
- [ ] No console errors

### Phase 2: Shell Zone Deployment

```bash
# 1. Update FORMS_URL environment variable
# Go to Vercel Dashboard → Shell Zone → Settings → Environment Variables
# Set: FORMS_URL=https://your-forms-domain.com

# 2. Verify shell zone builds locally
cd apps/shell
FORMS_URL=https://your-forms-domain.com pnpm build
pnpm start

# 3. Test locally
# - Visit http://localhost:3000
# - Test patient table loads
# - Test search functionality
# - Test navigation to forms

# 4. Deploy to Vercel
vercel deploy --prod --scope=your-org
```

**Verification**:
- [ ] Shell zone accessible at production URL
- [ ] Patient table loads with data
- [ ] Search functionality works
- [ ] Navigation to forms works
- [ ] No console errors

### Phase 3: Cross-Zone Integration Testing

```bash
# Test from shell zone
1. Visit https://your-domain.com
2. Click "Add Patient" or navigate to /forms/patient-intake
3. Verify forms zone loads
4. Fill and submit form
5. Verify success message
6. Navigate back to patient table

# Test direct forms zone access
1. Visit https://your-forms-domain.com/forms/patient-intake
2. Verify form loads
3. Test form functionality
```

## Post-Deployment Verification

### Automated Checks

```bash
# Run E2E tests against production
pnpm test:e2e --baseURL=https://your-domain.com

# Check performance metrics
curl -I https://your-domain.com
curl -I https://your-forms-domain.com/forms/patient-intake
```

### Manual Verification

1. **Functionality Testing**
   - [ ] Patient table displays correctly
   - [ ] Search works with various queries
   - [ ] Sorting works on all columns
   - [ ] Virtual scrolling performs smoothly
   - [ ] Forms load and submit correctly
   - [ ] Cross-zone navigation works

2. **Performance Testing**
   - [ ] Page load time < 3 seconds
   - [ ] First Contentful Paint < 1.5 seconds
   - [ ] Largest Contentful Paint < 2.5 seconds
   - [ ] Cumulative Layout Shift < 0.1
   - [ ] Virtual table scrolls at 60 FPS

3. **Security Testing**
   - [ ] HTTPS enforced
   - [ ] Security headers present
   - [ ] No sensitive data in logs
   - [ ] API authentication working
   - [ ] CORS properly configured

4. **Browser Compatibility**
   - [ ] Chrome/Edge (latest)
   - [ ] Firefox (latest)
   - [ ] Safari (latest)
   - [ ] Mobile browsers

## Monitoring & Maintenance

### Real-Time Monitoring

1. **Vercel Dashboard**
   - Monitor deployments
   - Check function logs
   - View analytics

2. **Error Tracking**
   - Set up Sentry alerts
   - Configure email notifications
   - Create incident response procedures

3. **Performance Monitoring**
   - Enable Vercel Speed Insights
   - Monitor Web Vitals
   - Set up performance alerts

### Regular Maintenance

- Weekly: Review error logs and performance metrics
- Monthly: Update dependencies and security patches
- Quarterly: Review and optimize database queries
- Annually: Conduct security audit

## Incident Response

### Critical Issues

**If Forms Zone is Down**:
1. Check Vercel dashboard for deployment status
2. Review error logs
3. Rollback to previous version if needed
4. Notify users of issue
5. Investigate root cause

**If Shell Zone is Down**:
1. Check Vercel dashboard for deployment status
2. Review error logs
3. Verify database connection
4. Rollback to previous version if needed
5. Notify users of issue

**If Cross-Zone Communication Fails**:
1. Verify FORMS_URL environment variable
2. Check network connectivity
3. Review CORS configuration
4. Check firewall rules
5. Restart shell zone deployment

### Rollback Procedure

```bash
# Via Vercel CLI
vercel rollback

# Via Dashboard
# 1. Go to Deployments
# 2. Find previous stable deployment
# 3. Click menu → Promote to Production
```

### Post-Incident

1. Document what happened
2. Identify root cause
3. Implement fix
4. Update runbooks
5. Conduct team debrief
6. Update monitoring/alerts


