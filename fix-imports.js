const fs = require('fs');
const path = require('path');

const files = [
  'src/app/appointments/page.tsx',
  'src/app/baby-profile/page.tsx',
  'src/app/doctor/book/page.tsx',
  'src/app/health-records/page.tsx',
  'src/app/help-support/page.tsx',
  'src/app/notifications/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/settings/page.tsx',
  'src/app/subscriptions/page.tsx',
  'src/app/wallet/page.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if ShoppingCart is in the lucide-react import
  const lucideImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/;
  const match = content.match(lucideImportRegex);
  
  if (match) {
    const importedIcons = match[1];
    if (!importedIcons.includes('ShoppingCart')) {
      const newImportedIcons = importedIcons + ', ShoppingCart';
      const newImport = `import { ${newImportedIcons} } from "lucide-react"`;
      content = content.replace(lucideImportRegex, newImport);
    }
  } else {
    // If there is no lucide-react import at all, add it
    if (!content.includes('import { ShoppingCart } from "lucide-react"')) {
       const useClientRegex = /("use client"|'use client')[;\s]*\n/;
       let hasUseClient = useClientRegex.test(content);
       const insertIndex = hasUseClient ? content.match(useClientRegex)[0].length : 0;
       content = content.slice(0, insertIndex) + 'import { ShoppingCart } from "lucide-react";\n' + content.slice(insertIndex);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed imports for ${file}`);
});
