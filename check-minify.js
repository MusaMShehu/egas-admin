
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssnano = require('cssnano');

const root = path.join(__dirname, 'src');

let checked = 0;
let failed = 0;

async function scan(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const file = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await scan(file);
      continue;
    }

    if (!file.endsWith('.css')) continue;

    checked++;

    try {
      const source = fs.readFileSync(file, 'utf8');

      await postcss([cssnano()]).process(source, {
        from: file,
      });
    } catch (error) {
      failed++;

      console.log('\n========== CSS MINIFICATION ERROR ==========');
      console.log('File:', file);
      console.log('Line:', error.line || 'Unknown');
      console.log('Column:', error.column || 'Unknown');
      console.log('Reason:', error.reason || error.message);
      console.log('============================================');
    }
  }
}

async function main() {
  await scan(root);

  console.log('\n========== RESULTS ==========');
  console.log('Files tested:', checked);
  console.log('Files with errors:', failed);

  if (failed === 0) {
    console.log('All individual CSS files passed cssnano.');
    console.log('The issue may be in combined CSS or imported dependencies.');
  }
}

main().catch(console.error);
