const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf8');

const silenceCode = `
// --- Silence Supabase Deprecation Warnings for aaPanel ---
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('@supabase')) return;
  originalWarn(...args);
};
const originalEmit = process.emitWarning;
process.emitWarning = function(warning, ...args) {
  if (typeof warning === 'string' && warning.includes('@supabase')) return;
  return originalEmit.call(process, warning, ...args);
};
`;

if (!code.includes('Silence Supabase Deprecation Warnings')) {
  code = silenceCode + '\n' + code;
  fs.writeFileSync('backend/server.js', code);
  console.log('Patched server.js with silence warnings');
} else {
  console.log('Already patched');
}
