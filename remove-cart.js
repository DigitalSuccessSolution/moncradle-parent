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
  'src/app/wallet/page.tsx',
  // Should we remove from address? 
  'src/app/address/page.tsx',
  // Should we remove from doctor/page.tsx?
  'src/app/doctor/page.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Remove the button block
  // It looks like:
  // <button onClick={() => router.push('/shop/cart')} ...>
  //   <ShoppingCart ... />
  //   {cartTotalCount > 0 && ( ... )}
  // </button>
  const buttonRegex = /<button[^>]*onClick=\{\(\)\s*=>\s*router\.push\(['"]\/shop\/cart['"]\)\}[^>]*>[\s\S]*?<\/button>/g;
  content = content.replace(buttonRegex, '');

  // Remove cartTotalCount declaration
  const cartTotalRegex = /[ \t]*const cartTotalCount = useAppSelector\(\(state: any\) => state\.cart\?\.totalCount \|\| 0\);\n?/g;
  content = content.replace(cartTotalRegex, '');

  // Remove useAppSelector import if no longer needed
  if (!content.includes('useAppSelector(')) {
    const importSelectorRegex = /[ \t]*import \{ useAppSelector \} from "@\/store\/hooks";\n?/g;
    content = content.replace(importSelectorRegex, '');
  }

  // Remove ShoppingCart import
  if (!content.includes('<ShoppingCart')) {
    // Check if it's in a multi import
    const multiImportRegex = /import\s*\{([^}]*?)ShoppingCart([^}]*?)\}\s*from\s*['"]lucide-react['"]/g;
    content = content.replace(multiImportRegex, (match, p1, p2) => {
      const remaining = (p1 + p2).split(',').map(s => s.trim()).filter(Boolean);
      if (remaining.length === 0) {
        return '';
      }
      return `import { ${remaining.join(', ')} } from "lucide-react"`;
    });
    
    // Check if it's a single import
    const singleImportRegex = /[ \t]*import \{ ShoppingCart \} from "lucide-react";\n?/g;
    content = content.replace(singleImportRegex, '');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Removed cart from ${file}`);
});
