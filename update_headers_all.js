const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('page.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('f:/Dss-Project/moncradle/frontend/parent-pwa/src/app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('md:hidden flex items-center')) {
    const newContent = content.replace(/<div className="md:hidden flex items-center[^>]*>([\s\S]*?)<\/div>/g, (match, inner) => {
      const titleMatch = inner.match(/<h1[^>]*>([^<]*)<\/h1>/);
      const title = titleMatch ? titleMatch[1].trim() : '';
      return `<div className="md:hidden flex items-center px-4 py-3 mb-4 -mx-4 sticky top-0 z-10 bg-[var(--color-background)]">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">${title}</h1>
        </div>`;
    });
    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Updated header in: ' + file);
    }
  }
});
console.log('All headers normalized');
