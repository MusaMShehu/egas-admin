
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

let found = false;

function scan(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);

    if (item.isDirectory()) {
      scan(file);
      continue;
    }

    if (!file.endsWith('.css')) continue;

    try {
      const css = fs.readFileSync(file, 'utf8');
      postcss.parse(css, { from: file });
    } catch (error) {
      found = true;
      console.log('\n❌ CSS ERROR');
      console.log('File:', file);
      console.log('Line:', error.line);
      console.log('Column:', error.column);
      console.log('Message:', error.reason);
    }
  }
}

scan('./src');

if (!found) {
  console.log('No CSS parsing errors found in src.');
}
