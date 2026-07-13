const fs = require('fs');
const lucide = require('./lucide_test.js');
const validIcons = new Set(Object.keys(lucide.icons).map(k => k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()));
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('app.js', 'utf8');
const matches = [...html.matchAll(/data-lucide="([^"]+)"/g), ...js.matchAll(/data-lucide="([^"]+)"/g)];
const used = new Set(matches.map(m => m[1]));
console.log('Used icons:', Array.from(used));
console.log('Invalid icons:', Array.from(used).filter(i => !validIcons.has(i)));
