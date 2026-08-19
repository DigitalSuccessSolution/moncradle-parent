const fs = require('fs');
const path = require('path');

const targetFiles = [
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/doctor/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/health-records/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/wallet/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/settings/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/profile/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/baby-profile/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/doctor/book/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/appointments/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/account/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/address/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/help-support/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/notifications/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/orders/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/shop/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/shop/wishlist/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/shop/cart/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/nutrition/meal-plans/page.tsx',
  'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/subscriptions/page.tsx'
];

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const redDotRegex = /<span className="absolute top-1\.5 right-2 w-2\.5 h-2\.5 bg-red-500 rounded-full border-2 border-white shadow-sm"><\/span>/g;

  if (redDotRegex.test(content)) {
    // 1. Replace static dot
    content = content.replace(redDotRegex, '{unreadNotificationsCount > 0 && <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>}');
    changed = true;

    // 2. Add useAppSelector import if missing
    if (!content.includes('useAppSelector')) {
      const useClientRegex = /("use client"|'use client')[;\s]*\n/;
      let hasUseClient = useClientRegex.test(content);
      const insertIndex = hasUseClient ? content.match(useClientRegex)[0].length : 0;
      content = content.slice(0, insertIndex) + 'import { useAppSelector } from "@/store/hooks";\n' + content.slice(insertIndex);
    } else if (!content.includes('import { useAppSelector') && !content.includes('import { useAppDispatch, useAppSelector')) {
      // if used but not imported
      const useClientRegex = /("use client"|'use client')[;\s]*\n/;
      let hasUseClient = useClientRegex.test(content);
      const insertIndex = hasUseClient ? content.match(useClientRegex)[0].length : 0;
      content = content.slice(0, insertIndex) + 'import { useAppSelector } from "@/store/hooks";\n' + content.slice(insertIndex);
    }

    // 3. Add unreadNotificationsCount inside the default export component
    if (!content.includes('const unreadNotificationsCount')) {
      const functionRegex = /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/;
      if (functionRegex.test(content)) {
        content = content.replace(functionRegex, (match) => {
          return `${match}\n  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);`;
        });
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated notifications dot in ${file}`);
  }
});
