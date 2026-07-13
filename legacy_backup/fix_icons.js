const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');
js = js.replace(/data-lucide="edit-3"/g, 'data-lucide="edit"');
js = js.replace(/data-lucide="trash-2"/g, 'data-lucide="trash"');
fs.writeFileSync('app.js', js, 'utf8');
console.log('Fixed app.js icons');
