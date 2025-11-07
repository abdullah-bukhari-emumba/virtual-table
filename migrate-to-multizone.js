#!/usr/bin/env node

/**
 * Migration Script for Next.js Multi-Zone Architecture
 * 
 * This script automates the migration of files from the monolith structure
 * to the multi-zone architecture with shell and forms zones.
 * 
 * Usage: node migrate-to-multizone.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function copyFile(src, dest) {
  try {
    // Create destination directory if it doesn't exist
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Copy file
    fs.copyFileSync(src, dest);
    log(`  ✓ Copied: ${src} → ${dest}`, 'green');
    return true;
  } catch (error) {
    log(`  ✗ Failed to copy ${src}: ${error.message}`, 'red');
    return false;
  }
}

function copyDirectory(src, dest) {
  try {
    // Create destination directory
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    // Read source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    log(`  ✓ Copied directory: ${src} → ${dest}`, 'green');
    return true;
  } catch (error) {
    log(`  ✗ Failed to copy directory ${src}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║   Next.js Multi-Zone Migration Script                     ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝\n', 'bright');

  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    log('Error: package.json not found. Please run this script from the project root.', 'red');
    process.exit(1);
  }

  log('Step 1: Migrating files to Shell Zone (apps/shell)...', 'blue');
  log('─'.repeat(60), 'blue');

  // Shell Zone - Components
  const shellComponents = [
    ['components/PatientsPageClient.tsx', 'apps/shell/components/PatientsPageClient.tsx'],
    ['components/PatientsPageSkeleton.tsx', 'apps/shell/components/PatientsPageSkeleton.tsx'],
    ['components/VirtualTable.tsx', 'apps/shell/components/VirtualTable.tsx'],
    ['components/SearchBar.tsx', 'apps/shell/components/SearchBar.tsx'],
    ['components/TableHeader.tsx', 'apps/shell/components/TableHeader.tsx'],
  ];

  shellComponents.forEach(([src, dest]) => {
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    } else {
      log(`  ⚠ Source file not found: ${src}`, 'yellow');
    }
  });

  // Shell Zone - Library files
  log('\nCopying library files...', 'blue');
  const shellLibFiles = [
    ['lib/api/patientApi.ts', 'apps/shell/lib/api/patientApi.ts'],
    ['lib/virtualization/useVirtualization.ts', 'apps/shell/lib/virtualization/useVirtualization.ts'],
  ];

  shellLibFiles.forEach(([src, dest]) => {
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    } else {
      log(`  ⚠ Source file not found: ${src}`, 'yellow');
    }
  });

  // Shell Zone - Directories
  log('\nCopying directories...', 'blue');
  const shellDirs = [
    ['lib/cache', 'apps/shell/lib/cache'],
    ['app/api/patients', 'apps/shell/app/api/patients'],
    ['components/__tests__', 'apps/shell/components/__tests__'],
    ['lib/api/__tests__', 'apps/shell/lib/api/__tests__'],
    ['lib/virtualization/__tests__', 'apps/shell/lib/virtualization/__tests__'],
    ['lib/hooks/__tests__', 'apps/shell/lib/hooks/__tests__'],
    ['e2e', 'apps/shell/e2e'],
  ];

  shellDirs.forEach(([src, dest]) => {
    if (fs.existsSync(src)) {
      copyDirectory(src, dest);
    } else {
      log(`  ⚠ Source directory not found: ${src}`, 'yellow');
    }
  });

  // Shell Zone - Config files
  log('\nCopying configuration files...', 'blue');
  const shellConfigFiles = [
    ['jest.config.js', 'apps/shell/jest.config.js'],
    ['playwright.config.ts', 'apps/shell/playwright.config.ts'],
    ['tailwindcss.config.ts', 'apps/shell/tailwindcss.config.ts'],
    ['postcss.config.mjs', 'apps/shell/postcss.config.mjs'],
    ['.eslintrc.json', 'apps/shell/.eslintrc.json'],
  ];

  shellConfigFiles.forEach(([src, dest]) => {
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    } else {
      log(`  ⚠ Source file not found: ${src}`, 'yellow');
    }
  });

  log('\n\nStep 2: Migrating files to Forms Zone (apps/forms)...', 'blue');
  log('─'.repeat(60), 'blue');

  // Forms Zone - Components and files
  const formsFiles = [
    ['app/c-form/page.tsx', 'apps/forms/app/patient-intake/page.tsx'],
  ];

  formsFiles.forEach(([src, dest]) => {
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    } else {
      log(`  ⚠ Source file not found: ${src}`, 'yellow');
    }
  });

  // Forms Zone - Directories
  log('\nCopying directories...', 'blue');
  const formsDirs = [
    ['app/c-form/components', 'apps/forms/components'],
    ['app/c-form/schemas', 'apps/forms/schemas'],
    ['app/c-form/types', 'apps/forms/types'],
    ['app/c-form/utils', 'apps/forms/utils'],
    ['app/c-form/__tests__', 'apps/forms/__tests__'],
  ];

  formsDirs.forEach(([src, dest]) => {
    if (fs.existsSync(src)) {
      copyDirectory(src, dest);
    } else {
      log(`  ⚠ Source directory not found: ${src}`, 'yellow');
    }
  });

  // Forms Zone - Config files
  log('\nCopying configuration files...', 'blue');
  const formsConfigFiles = [
    ['tailwindcss.config.ts', 'apps/forms/tailwindcss.config.ts'],
    ['postcss.config.mjs', 'apps/forms/postcss.config.mjs'],
    ['.eslintrc.json', 'apps/forms/.eslintrc.json'],
    ['jest.config.js', 'apps/forms/jest.config.js'],
  ];

  formsConfigFiles.forEach(([src, dest]) => {
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    } else {
      log(`  ⚠ Source file not found: ${src}`, 'yellow');
    }
  });

  // Copy data generation scripts to database package
  log('\n\nStep 3: Copying data generation scripts...', 'blue');
  log('─'.repeat(60), 'blue');

  if (fs.existsSync('scripts')) {
    copyDirectory('scripts', 'packages/database/scripts');
  } else {
    log('  ⚠ Scripts directory not found', 'yellow');
  }

  log('\n\n╔════════════════════════════════════════════════════════════╗', 'green');
  log('║   Migration Complete!                                      ║', 'green');
  log('╚════════════════════════════════════════════════════════════╝\n', 'green');

  log('Next steps:', 'bright');
  log('1. Review the MIGRATION_GUIDE.md for detailed instructions', 'yellow');
  log('2. Update imports in copied files to use shared packages', 'yellow');
  log('3. Run: pnpm install', 'yellow');
  log('4. Run: pnpm dev', 'yellow');
  log('5. Test both zones at http://localhost:3000 and http://localhost:3001\n', 'yellow');

  log('⚠️  Important: You need to manually update imports in the copied files!', 'red');
  log('See MIGRATION_GUIDE.md Step 3 for details.\n', 'red');
}

// Run the migration
main();

