const fs = require('fs');
const path = require('path');

const directories = [
  'src/app'
];

function applyAccountStyles(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      applyAccountStyles(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      // Don't modify account/page.tsx or shop/page.tsx since they are slightly different
      if (fullPath.includes('account\\page.tsx') || fullPath.includes('account/page.tsx')) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // The current header block usually looks like:
      /*
        <div className="md:hidden flex items-center justify-between px-4 py-5 pt-6 -mx-4 -mt-4 sticky top-0 z-40 bg-white">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="text-[#0F172A] active:scale-95 transition-transform">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[19px] font-medium text-[#0F172A] ml-1">Title</h1>
          </div>
          <button onClick={() => router.push('/notifications')} className="relative text-[#0F172A] active:scale-95 transition-transform mr-1">
            <Bell className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>
      */

      // We want to replace it with a structure similar to the account page:
      /*
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Title</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => router.push('/notifications')} className="relative p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group">
              <Bell className="w-6 h-6 text-gray-800 group-hover:text-black transition-colors" />
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
            </button>
          </div>
        </div>
      */
      
      const headerRegex = /<div className="md:hidden flex items-center justify-between[^>]*>[\s\S]*?<div className="flex items-center[^>]*>[\s\S]*?<button onClick=\{\(\) => router\.back\(\)\}[^>]*>[\s\S]*?<ChevronLeft[^>]*>[\s\S]*?<\/button>\s*<h1 className="[^"]*"[^>]*>([^<]*)<\/h1>\s*<\/div>\s*<button onClick=\{\(\) => router\.push\('\/notifications'\)\}[^>]*>[\s\S]*?<Bell[^>]*>[\s\S]*?<\/button>\s*<\/div>/g;

      if (headerRegex.test(content)) {
        content = content.replace(headerRegex, (match, title) => {
          return `<div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white mb-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">${title}</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => router.push('/notifications')} className="relative p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group">
              <Bell className="w-6 h-6 text-gray-800 group-hover:text-black transition-colors" />
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
            </button>
          </div>
        </div>`;
        });
        changed = true;
      }
      
      // Some pages might not have the Bell yet or have different structure, so let's fallback to modifying the pieces
      if (!changed) {
         // 1. Revert padding (if it has the py-5 pt-6 padding we added)
         const paddingRegex = /className="md:hidden flex items-center justify-between px-4 py-5 pt-6([^"]*)"/g;
         if (paddingRegex.test(content)) {
           content = content.replace(paddingRegex, 'className="md:hidden flex items-center justify-between px-4 py-3$1"');
           changed = true;
         }
         
         // 2. Change text-[19px] to text-[17px]
         const textRegex = /text-\[19px\]([^>]*>)/g;
         if (textRegex.test(content)) {
           content = content.replace(textRegex, 'text-[17px]$1');
           changed = true;
         }

         // 3. Update the Chevron button styling if it matches the old one
         const btnRegex = /<button onClick=\{\(\) => router\.back\(\)\}\s*className="text-\[#0F172A\] active:scale-95 transition-transform">/g;
         if (btnRegex.test(content)) {
           content = content.replace(
             btnRegex, 
             '<button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">'
           );
           changed = true;
         }

         // 4. Update the Bell styling
         const bellBtnRegex = /<button onClick=\{\(\) => router\.push\('\/notifications'\)\}\s*className="relative text-\[#0F172A\] active:scale-95 transition-transform mr-1">\s*<Bell className="w-6 h-6" strokeWidth=\{2\} \/>\s*<\/button>/g;
         if (bellBtnRegex.test(content)) {
            content = content.replace(bellBtnRegex, 
             `<div className="flex items-center gap-1">
            <button onClick={() => router.push('/notifications')} className="relative p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group">
              <Bell className="w-6 h-6 text-gray-800 group-hover:text-black transition-colors" />
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
            </button>
          </div>`
            );
            changed = true;
         }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Applied exact account styles to ${fullPath}`);
      }
    }
  }
}

applyAccountStyles(path.join(__dirname, directories[0]));
