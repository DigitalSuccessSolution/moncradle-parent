const fs = require('fs');
const path = require('path');

const files = [
  'src/app/appointments/page.tsx',
  'src/app/baby-profile/page.tsx',
  'src/app/doctor/book/page.tsx',
  'src/app/health-records/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/settings/page.tsx',
  'src/app/wallet/page.tsx',
  'src/app/doctor/page.tsx',
  'src/app/address/page.tsx'
];

const bellJsx = `
          <button onClick={() => router.push('/notifications')} className="relative text-[#0F172A] active:scale-95 transition-transform mr-1">
            <Bell className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>`;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Insert the Bell JSX inside the Mobile Header
  // The header closing tag might be `</div>` just after the title div.
  // We can regex replace the end of the mobile header.
  
  const mobileHeaderRegex = /(<div className="md:hidden flex items-center justify-between[^>]*>[\s\S]*?<div className="flex items-center gap-2">[\s\S]*?<\/div>)\s*<\/div>/;
  
  if (mobileHeaderRegex.test(content) && !content.includes('<Bell ')) {
    content = content.replace(mobileHeaderRegex, `$1${bellJsx}`);
  }

  // Ensure Bell is imported from lucide-react
  if (content.includes('from "lucide-react"')) {
    const lucideImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/;
    const match = content.match(lucideImportRegex);
    if (match) {
      const importedIcons = match[1];
      if (!importedIcons.includes('Bell')) {
        const newImportedIcons = importedIcons + ', Bell';
        const newImport = `import { ${newImportedIcons} } from "lucide-react"`;
        content = content.replace(lucideImportRegex, newImport);
      }
    }
  } else {
    // If there is no lucide-react import at all, add it
    if (!content.includes('import { Bell } from "lucide-react"')) {
       const useClientRegex = /("use client"|'use client')[;\s]*\n/;
       let hasUseClient = useClientRegex.test(content);
       const insertIndex = hasUseClient ? content.match(useClientRegex)[0].length : 0;
       content = content.slice(0, insertIndex) + 'import { Bell } from "lucide-react";\n' + content.slice(insertIndex);
    }
  }

  // Ensure useRouter is imported and router is defined if we use router.push
  if (content.includes("router.push('/notifications')")) {
    if (!content.includes('useRouter')) {
      const useClientRegex = /("use client"|'use client')[;\s]*\n/;
      let hasUseClient = useClientRegex.test(content);
      const insertIndex = hasUseClient ? content.match(useClientRegex)[0].length : 0;
      content = content.slice(0, insertIndex) + 'import { useRouter } from "next/navigation";\n' + content.slice(insertIndex);
    }
    
    // Add const router = useRouter(); if not present
    if (!content.includes('const router = useRouter()')) {
      const functionRegex = /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/;
      content = content.replace(functionRegex, (match) => {
        return `${match}\n  const router = useRouter();`;
      });
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Added Notification Bell to ${file}`);
});
