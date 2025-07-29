#!/usr/bin/env node

/**
 * Migration script to update API calls to use the new config system
 * Run this script to find and replace hardcoded API calls
 */

const fs = require('fs');
const path = require('path');

// Patterns to search for
const patterns = [
    {
        name: 'fetch with apiUrl',
        regex: /const\s+apiUrl\s*=\s*process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"]http:\/\/localhost:8000['"]/g,
        replacement: '// Use config.ts instead'
    },
    {
        name: 'fetch with localhost',
        regex: /fetch\(`\${apiUrl}\/api\/([^`]+)`/g,
        replacement: 'api.get(API_URLS.$1)'
    },
    {
        name: 'POST requests',
        regex: /fetch\(`\${apiUrl}\/api\/([^`]+)`,\s*{\s*method:\s*['"]POST['"]/g,
        replacement: 'api.post(API_URLS.$1'
    },
    {
        name: 'PUT requests',
        regex: /fetch\(`\${apiUrl}\/api\/([^`]+)`,\s*{\s*method:\s*['"]PUT['"]/g,
        replacement: 'api.put(API_URLS.$1'
    },
    {
        name: 'DELETE requests',
        regex: /fetch\(`\${apiUrl}\/api\/([^`]+)`,\s*{\s*method:\s*['"]DELETE['"]/g,
        replacement: 'api.delete(API_URLS.$1'
    }
];

// Files to process
const filesToProcess = [
    'app/dashboard/page.tsx',
    'app/budgets/page.tsx',
    'app/cards/page.tsx',
    'app/transactions/page.tsx',
    'app/signin/page.tsx',
    'components/NavigationSidebar.tsx',
    'components/SignupPage.tsx',
    'components/OnboardingPage.tsx',
    'components/PersonalSettingsModal.tsx',
    'components/CardModal.tsx',
    'components/BudgetModal.tsx',
    'components/TransactionModal.tsx'
];

function processFile(filePath) {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    console.log(`\n📁 Processing: ${filePath}`);

    // Check if config is already imported
    const hasConfigImport = content.includes("import.*config");
    if (!hasConfigImport) {
        console.log(`  ➕ Adding config import...`);
        content = `import { API_URLS, api } from '../config'\n${content}`;
        modified = true;
    }

    // Apply patterns
    patterns.forEach(pattern => {
        const matches = content.match(pattern.regex);
        if (matches) {
            console.log(`  🔍 Found ${matches.length} ${pattern.name} pattern(s)`);
            // Note: This is a simplified replacement - manual review needed
        }
    });

    if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`  ✅ Updated: ${filePath}`);
    } else {
        console.log(`  ℹ️  No changes needed: ${filePath}`);
    }
}

console.log('🚀 Starting API call migration...\n');

filesToProcess.forEach(processFile);

console.log('\n✅ Migration script completed!');
console.log('\n📝 Next steps:');
console.log('1. Review the changes in each file');
console.log('2. Update the config.ts with your production API URL');
console.log('3. Test all functionality locally');
console.log('4. Deploy to Vercel');
console.log('\n⚠️  Note: This script provides guidance but manual review is required for accurate replacements.'); 