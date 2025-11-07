# Patient Virtual Table - Next.js Multi-Zone Architecture

A high-performance patient management system built with Next.js 16, featuring a virtual table capable of handling 100,000+ records with 60 FPS scrolling performance, implemented using Vercel's Multi-Zone architecture for micro-frontends.

## 🏗️ Architecture

This project uses **Next.js Multi-Zone architecture** to split the application into independently deployable micro-frontends:

```
┌─────────────────────────────────────────────────────────────┐
│                   Monorepo Structure                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  apps/                                                      │
│  ├── shell/          Shell Zone (Main App)                 │
│  │   ├── Patient Virtual Table (/)                         │
│  │   ├── API Routes (/api/patients/*)                      │
│  │   └── Routing Orchestrator                              │
│  │                                                          │
│  └── forms/          Forms Zone                            │
│      └── Patient Intake Form (/forms/patient-intake)       │
│                                                             │
│  packages/                                                  │
│  ├── database/       Shared database layer                 │
│  ├── types/          Shared TypeScript types               │
│  ├── ui/             Shared UI components                  │
│  └── utils/          Shared utilities & hooks              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

✅ **Multi-Zone Architecture**: Independent deployment of shell and forms zones  
✅ **Error Isolation**: Errors in one zone don't crash the other  
✅ **Virtual Scrolling**: Smooth 60 FPS performance with 100,000+ records  
✅ **Server Components**: Optimized data fetching with Next.js App Router  
✅ **Streaming SSR**: Progressive rendering with Suspense boundaries  
✅ **Partial Hydration**: Only interactive components hydrate on client  
✅ **Shared Packages**: Reusable code across zones via PNPM workspaces  
✅ **TypeScript**: Full type safety across the entire codebase  
✅ **Testing**: Unit tests (Jest) and E2E tests (Playwright)  

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PNPM 8+

### Installation

```bash
# Install PNPM globally (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Generate sample data (100,000 patient records)
pnpm data:reset
```

### Development

```bash
# Run both zones in parallel
pnpm dev

# Or run individually:
pnpm dev:shell   # Shell zone at http://localhost:3000
pnpm dev:forms   # Forms zone at http://localhost:3001
```

### Access the Application

- **Shell Zone (Patient Table)**: http://localhost:3000
- **Forms Zone (Patient Intake)**: http://localhost:3001/forms/patient-intake

## 📁 Project Structure

```
virtual-table-v2/
├── apps/
│   ├── shell/                    # Shell Zone (Main App)
│   │   ├── app/
│   │   │   ├── page.tsx         # Patient table (Server Component)
│   │   │   ├── layout.tsx       # Root layout
│   │   │   └── api/patients/    # API routes
│   │   ├── components/
│   │   │   ├── PatientsPageClient.tsx
│   │   │   ├── VirtualTable.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── TableHeader.tsx
│   │   ├── lib/
│   │   │   ├── api/             # API client
│   │   │   ├── cache/           # Caching utilities
│   │   │   └── virtualization/  # Virtual scrolling logic
│   │   ├── next.config.ts       # Zone configuration + rewrites
│   │   └── package.json
│   │
│   └── forms/                    # Forms Zone
│       ├── app/
│       │   ├── patient-intake/  # Patient intake form
│       │   └── layout.tsx       # Forms layout
│       ├── components/
│       │   ├── Form.tsx
│       │   ├── FormContext.tsx
│       │   └── FormErrorBoundary.tsx
│       ├── schemas/
│       │   └── patientFormSchema.ts
│       ├── next.config.ts       # Zone configuration
│       └── package.json
│
├── packages/
│   ├── database/                 # Shared database layer
│   │   ├── src/
│   │   │   ├── db.ts            # SQLite connection
│   │   │   ├── getInitialPatients.ts
│   │   │   └── virtualization-types.ts
│   │   └── package.json
│   │
│   ├── types/                    # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── patient.ts
│   │   │   └── form.ts
│   │   └── package.json
│   │
│   ├── ui/                       # Shared UI components
│   │   ├── src/
│   │   │   └── PerformanceMetrics.tsx
│   │   └── package.json
│   │
│   └── utils/                    # Shared utilities
│       ├── src/
│       │   ├── performance-tracker.ts
│       │   └── useDebounce.ts
│       └── package.json
│
├── data/
│   └── patients.db              # SQLite database (100k records)
│
├── scripts/
│   ├── generate-data.js         # Generate sample data
│   └── import-data.js           # Import data to SQLite
│
├── pnpm-workspace.yaml          # PNPM workspace config
├── turbo.json                   # Turborepo config
├── package.json                 # Root package.json
├── MIGRATION_GUIDE.md           # Migration instructions
├── DEPLOYMENT.md                # Deployment guide
└── README-MULTIZONE.md          # This file
```

## 🔧 Available Scripts

### Root Level

```bash
pnpm dev              # Run all zones in parallel
pnpm build            # Build all zones
pnpm test             # Run all tests
pnpm lint             # Lint all zones
pnpm clean            # Clean all build artifacts
pnpm data:generate    # Generate sample data
pnpm data:import      # Import data to database
pnpm data:reset       # Reset database and regenerate data
```

### Zone-Specific

```bash
pnpm dev:shell        # Run shell zone only
pnpm dev:forms        # Run forms zone only
pnpm build:shell      # Build shell zone only
pnpm build:forms      # Build forms zone only
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui
```

## 🎯 Performance Metrics

### Virtual Table Performance

- **Initial Load**: <100ms (Server-Side Rendering)
- **Scroll FPS**: 60 FPS (maintained via requestAnimationFrame)
- **Memory Usage**: ~5-10 MB (stable, no leaks)
- **API Response**: 5-10ms for 50 records
- **Dataset Size**: 100,000+ patient records
- **Visible Rows**: 15-20 (out of 100,000+)

### Multi-Zone Benefits

- **Independent Deployments**: Deploy zones separately
- **Faster Builds**: Only rebuild changed zones
- **Error Isolation**: Errors in one zone don't affect others
- **Team Autonomy**: Different teams can own different zones

## 🔀 Cross-Zone Navigation

### Important: Use `<a>` tags for cross-zone navigation

```tsx
// ❌ DON'T use Next.js Link for cross-zone navigation
import Link from 'next/link';
<Link href="/forms/patient-intake">Go to Form</Link>

// ✅ DO use regular anchor tags
<a href="/forms/patient-intake">Go to Form</a>
```

Cross-zone navigation triggers a hard navigation (full page reload), which is expected behavior in Multi-Zone architecture.

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. **Deploy Forms Zone**:
   - Root Directory: `apps/forms`
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`

2. **Deploy Shell Zone**:
   - Root Directory: `apps/shell`
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
   - Environment Variable: `FORMS_URL=https://your-forms-zone.vercel.app`

## 📚 Documentation

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Step-by-step migration instructions
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide for Vercel
- [Next.js Multi-Zones](https://nextjs.org/docs/app/guides/multi-zones) - Official documentation

## 🛠️ Technology Stack

- **Framework**: Next.js 16.0.0 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **Database**: SQLite (better-sqlite3)
- **Validation**: Yup
- **Testing**: Jest + React Testing Library + Playwright
- **Monorepo**: PNPM Workspaces + Turborepo
- **Deployment**: Vercel

## 🏛️ Architecture Decisions

### Why Multi-Zone?

1. **Independent Deployments**: Deploy patient table and forms separately
2. **Error Isolation**: Form errors don't crash the patient table
3. **Team Autonomy**: Different teams can own different zones
4. **Scalability**: Add new zones without affecting existing ones

### Why PNPM Workspaces?

1. **Efficient**: Saves disk space with content-addressable storage
2. **Fast**: Faster than npm/yarn for monorepos
3. **Strict**: Prevents phantom dependencies

### Why Server Components?

1. **Performance**: Faster initial page load
2. **SEO**: Better search engine optimization
3. **Bundle Size**: Reduced client JavaScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Vercel](https://vercel.com/) - Deployment platform and Multi-Zone architecture
- [PNPM](https://pnpm.io/) - Fast, disk space efficient package manager
- [Turborepo](https://turbo.build/) - High-performance build system

## 📞 Support

For questions or issues, please open an issue on GitHub.

