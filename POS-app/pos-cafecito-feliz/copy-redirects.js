const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '_redirects');
const dest = path.join(__dirname, 'dist/pos-cafecito-feliz/browser/_redirects');

try {
  fs.copyFileSync(source, dest);
  console.log('✓ _redirects copiado correctamente a:', dest);
} catch (error) {
  console.error('✗ Error copiando _redirects:', error.message);
  process.exit(1);
}