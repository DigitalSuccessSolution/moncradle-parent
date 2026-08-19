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

  // Add ShoppingCart to lucide-react import
  if (content.includes('from "lucide-react"')) {
    if (!content.includes('ShoppingCart')) {
      content = content.replace(/import\s*\{([^}]+)\}\s*from\s*"lucide-react"/, (match, p1) => {
        return `import {${p1}, ShoppingCart } from "lucide-react"`;
      });
    }
  } else {
      if (!content.includes('ShoppingCart')) {
          content = content.replace(/(import .*;\n)/, `$1import { ShoppingCart } from "lucide-react";\n`);
      }
  }

  // Add useAppSelector import
  if (!content.includes('useAppSelector')) {
    const importStatement = `import { useAppSelector } from "@/store/hooks";\n`;
    content = content.replace(/(import .*;\n)/, `$1${importStatement}`);
  }

  // Add cartTotalCount definition inside the component
  if (!content.includes('const cartTotalCount')) {
    // Find the default export function line
    const functionRegex = /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/;
    content = content.replace(functionRegex, (match) => {
      return `${match}\n  const cartTotalCount = useAppSelector((state: any) => state.cart?.totalCount || 0);`;
    });
  }

  // Also fix router issue for profile/page.tsx
  if (file === 'src/app/profile/page.tsx') {
    if (!content.includes('const router = useRouter();')) {
      const functionRegex = /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/;
      content = content.replace(functionRegex, (match) => {
        return `${match}\n  const router = useRouter();`;
      });
    }
    if (!content.includes('useRouter')) {
      const importStatement = `import { useRouter } from "next/navigation";\n`;
      content = content.replace(/(import .*;\n)/, `$1${importStatement}`);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${file}`);
});
