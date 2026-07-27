const fs = require('fs');
const path = require('path');
const html = fs.readFileSync('frontend/index.html', 'utf8');
const lines = html.split('\n');
let startIdx = -1;
let endIdx = -1;
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('const SUPABASE_URL =')) {
    startIdx = i - 1; // <script> line
  }
  if (startIdx !== -1 && lines[i].includes('</script>') && i > startIdx) {
    endIdx = i;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  const jsLines = lines.slice(startIdx + 1, endIdx);
  fs.writeFileSync('frontend/js/auth.js', jsLines.join('\n'));
  console.log('Created auth.js');
  
  lines.splice(startIdx, endIdx - startIdx + 1, '  <script src=\"js/auth.js\"></script>');
  fs.writeFileSync('frontend/index.html', lines.join('\n'));
  console.log('Updated index.html');
} else {
  console.log('Not found lines');
}

const dir = 'frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');
files.forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  if(c.includes('id=\"login-modal\"') && !c.includes('auth.js')) {
    c = c.replace(/<\/body>/, '  <script src=\"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2\"></script>\n  <script src=\"js/auth.js\"></script>\n</body>');
    fs.writeFileSync(p, c);
    console.log('Updated ' + f);
  }
});
