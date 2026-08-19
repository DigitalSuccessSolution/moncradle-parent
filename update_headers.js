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
  let changed = false;

  if (content.includes('md:hidden') && content.includes('ChevronLeft')) {
    const oldContent = content;

    // Normalize header padding and margin for those with px-2 py-2
    content = content.replace(/px-2 py-2 mb-4 -mx-2/g, 'px-4 py-3 mb-4 -mx-4');

    // Normalize other headers that might have weird paddings
    content = content.replace(/px-6 py-4 (.*?)-mx-6/g, 'px-4 py-3 $1-mx-4');
    content = content.replace(/px-4 py-4 (.*?)-mx-4/g, 'px-4 py-3 $1-mx-4');

    // For headers that are NOT using -mx- (maybe they are outside the px-4 container)
    // we can just normalize their py padding
    content = content.replace(/px-6 py-4 sticky/g, 'px-4 py-3 sticky');
    content = content.replace(/px-4 py-4 sticky/g, 'px-4 py-3 sticky');

    if (content !== oldContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated height: ' + file);
      changed = true;
    }
  }
});
console.log('Done');
