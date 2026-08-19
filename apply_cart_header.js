const fs = require('fs');
const path = require('path');

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results.push(...walk(fullPath));
    } else if (fullPath.endsWith('page.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('f:/Dss-Project/moncradle/frontend/parent-pwa/src/app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('md:hidden') || !content.includes('ChevronLeft')) return;

  const newContent = content.replace(/<div className="md:hidden flex items-center[^"]*">([\s\S]*?)<\/div>/g, (match, inner) => {
    // find title text inside <h1>
    const titleMatch = inner.match(/<h1[^>]*>([^<]*)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : 'Title';
    // keep any existing class for title if present (ignore for simplicity)
    return `<div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="text-[#0F172A] active:scale-95 transition-transform">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[19px] font-medium text-[#0F172A] ml-1">${title}</h1>
          </div>
          <button onClick={() => router.push('/shop/cart')} className="relative text-[#0F172A] active:scale-95 transition-transform mr-1">
            <ShoppingCart className="w-6 h-6" strokeWidth={2} />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#FF3B30] text-white text-[11px] font-black min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full">
                {cartTotalCount}
              </span>
            )}
          </button>
        </div>`;
  });

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated header in: ' + file);
  }
});
console.log('All headers updated');
