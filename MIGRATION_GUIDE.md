# Next.js Multi-Zone Migration Guide

This guide provides step-by-step instructions for migrating the existing Next.js application to a Multi-Zone architecture.

## 📋 Overview

The migration creates two independent zones:
1. **Shell Zone** (`apps/shell`) - Main application with patient virtual table (port 3000)
2. **Forms Zone** (`apps/forms`) - Patient intake forms (port 3001)

## 🏗️ Architecture

```
virtual-table-v2/
├── apps/
│   ├── shell/          # Main zone (patient table)
│   └── forms/          # Forms zone (patient intake)
├── packages/
│   ├── database/       # Shared database layer
│   ├── types/          # Shared TypeScript types
│   ├── ui/             # Shared UI components
│   └── utils/          # Shared utilities
├── data/               # SQLite database (shared)
├── scripts/            # Data generation scripts (shared)
├── pnpm-workspace.yaml
├── turbo.json
└── package.json        # Root workspace config
```

## 🚀 Migration Steps

### Step 1: Install Dependencies

```bash
# Install PNPM if not already installed
npm install -g pnpm

# Install root dependencies
pnpm install

# Install dependencies for all workspaces
pnpm install -r
```

### Step 2: Copy Files to Shell Zone

Copy the following files from the root to `apps/shell/`:

#### Components (copy to `apps/shell/components/`)
- `components/PatientsPageClient.tsx`
- `components/PatientsPageSkeleton.tsx`
- `components/VirtualTable.tsx`
- `components/SearchBar.tsx`
- `components/TableHeader.tsx`

#### Library Files (copy to `apps/shell/lib/`)
- `lib/api/patientApi.ts` → `apps/shell/lib/api/patientApi.ts`
- `lib/virtualization/useVirtualization.ts` → `apps/shell/lib/virtualization/useVirtualization.ts`
- `lib/cache/` → `apps/shell/lib/cache/` (entire directory)

#### API Routes (copy to `apps/shell/app/api/`)
- `app/api/patients/` → `apps/shell/app/api/patients/` (entire directory)

#### Test Files (copy to `apps/shell/`)
- `components/__tests__/` → `apps/shell/components/__tests__/`
- `lib/api/__tests__/` → `apps/shell/lib/api/__tests__/`
- `lib/virtualization/__tests__/` → `apps/shell/lib/virtualization/__tests__/`
- `lib/hooks/__tests__/` → `apps/shell/lib/hooks/__tests__/`
- `e2e/` → `apps/shell/e2e/` (entire directory)
- `jest.config.js` → `apps/shell/jest.config.js`
- `playwright.config.ts` → `apps/shell/playwright.config.ts`

### Step 3: Update Imports in Shell Zone

After copying files, update imports in `apps/shell/` files:

**Replace:**
```typescript
import { getDatabase } from '@/lib/db';
import { getInitialPatients } from '@/lib/server/getInitialPatients';
import type { PatientRecord } from '@/lib/virtualization/types';
import { PerformanceTracker } from '../lib/performance-tracker';
import { useDebounce } from '../lib/hooks/useDebounce';
```

**With:**
```typescript
import { getDatabase, getInitialPatients } from '@virtual-table/database';
import type { PatientRecord } from '@virtual-table/database';
import { PerformanceTracker, useDebounce } from '@virtual-table/utils';
```

**Files to update:**
- `apps/shell/components/PatientsPageClient.tsx`
- `apps/shell/lib/api/patientApi.ts`
- `apps/shell/app/api/patients/route.ts`
- `apps/shell/app/api/patients/[id]/route.ts`
- `apps/shell/app/api/patients/bulk/route.ts`

### Step 4: Copy Files to Forms Zone

Copy the following files from the root to `apps/forms/`:

#### Form Components (copy to `apps/forms/app/patient-intake/`)
- `app/c-form/page.tsx` → `apps/forms/app/patient-intake/page.tsx`
- `app/c-form/components/` → `apps/forms/components/` (entire directory)
- `app/c-form/schemas/` → `apps/forms/schemas/` (entire directory)
- `app/c-form/types/` → `apps/forms/types/` (entire directory)
- `app/c-form/utils/` → `apps/forms/utils/` (entire directory)

#### Test Files (copy to `apps/forms/`)
- `app/c-form/__tests__/` → `apps/forms/__tests__/` (entire directory)

### Step 5: Update Imports in Forms Zone

Update imports in `apps/forms/` files to use shared packages where applicable.

### Step 6: Copy Shared Resources

#### Database and Scripts
The `data/` and `scripts/` directories remain at the root level and are shared by both zones.

#### Configuration Files
- Copy `tailwindcss.config.ts` to both `apps/shell/` and `apps/forms/`
- Copy `postcss.config.mjs` to both `apps/shell/` and `apps/forms/`
- Copy `.eslintrc.json` to both `apps/shell/` and `apps/forms/`

### Step 7: Development

Run both zones in development mode:

```bash
# Terminal 1: Run all zones in parallel
pnpm dev

# OR run individually:
# Terminal 1: Shell zone (port 3000)
pnpm dev:shell

# Terminal 2: Forms zone (port 3001)
pnpm dev:forms
```

Access the application:
- Shell zone (main app): http://localhost:3000
- Forms zone: http://localhost:3001/forms/patient-intake

### Step 8: Testing

```bash
# Run all tests
pnpm test

# Run tests for specific zone
pnpm --filter shell test
pnpm --filter forms test

# Run E2E tests
pnpm test:e2e
```

### Step 9: Build

```bash
# Build all zones
pnpm build

# Build specific zone
pnpm build:shell
pnpm build:forms
```

## 🔗 Cross-Zone Navigation

### Important: Use `<a>` tags for cross-zone navigation

```tsx
// ❌ DON'T use Next.js Link for cross-zone navigation
import Link from 'next/link';
<Link href="/forms/patient-intake">Go to Form</Link>

// ✅ DO use regular anchor tags
<a href="/forms/patient-intake">Go to Form</a>
```

### Same-Zone Navigation

```tsx
// ✅ Within the same zone, use Next.js Link
import Link from 'next/link';
<Link href="/patients/123">View Patient</Link>
```

## 🚢 Deployment (Vercel)

### Deploy Each Zone Separately

1. **Shell Zone**:
   - Create new Vercel project
   - Set root directory to `apps/shell`
   - Set environment variable: `FORMS_URL=https://forms.yourdomain.com`

2. **Forms Zone**:
   - Create new Vercel project
   - Set root directory to `apps/forms`
   - No environment variables needed

### Environment Variables

**Shell Zone (`.env.local` in Vercel)**:
```bash
FORMS_URL=https://forms-zone.vercel.app
```

## 🎯 Benefits of Multi-Zone Architecture

✅ **Independent Deployments**: Deploy shell and forms zones separately  
✅ **Error Isolation**: Errors in one zone don't crash the other  
✅ **Team Autonomy**: Different teams can own different zones  
✅ **Faster Builds**: Only rebuild changed zones  
✅ **Technology Flexibility**: Each zone can use different Next.js versions  

## ⚠️ Important Notes

1. **Hard Navigation**: Cross-zone navigation triggers a full page reload
2. **Shared State**: State is not shared between zones (use URL params or cookies)
3. **Database Path**: Update database path in `packages/database/src/db.ts` if needed
4. **Asset Prefix**: Forms zone uses `/forms-static` prefix to avoid conflicts

## 📚 Additional Resources

- [Next.js Multi-Zones Documentation](https://nextjs.org/docs/app/guides/multi-zones)
- [Vercel Microfrontends Guide](https://vercel.com/docs/microfrontends)
- [PNPM Workspaces](https://pnpm.io/workspaces)
- [Turborepo Documentation](https://turbo.build/repo/docs)

## 🐛 Troubleshooting

### Issue: Module not found errors
**Solution**: Run `pnpm install` in the root directory

### Issue: Database not found
**Solution**: Ensure `data/patients.db` exists. Run `pnpm data:reset` from root

### Issue: Port already in use
**Solution**: Kill the process using the port or change port in package.json scripts

### Issue: Cross-zone navigation not working
**Solution**: Ensure `FORMS_URL` environment variable is set correctly in shell zone

## 📝 Next Steps

After completing the migration:
1. Test all functionality in both zones
2. Update tests to work with new structure
3. Set up CI/CD pipelines for each zone
4. Deploy to Vercel and test production environment
5. Monitor performance and error rates

