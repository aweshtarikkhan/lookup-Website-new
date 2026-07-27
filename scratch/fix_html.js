const fs = require('fs');
const path = require('path');
const dir = 'c:\\Users\\awesh\\Desktop\\new web\\frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
  let p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  
  // Fix the active class hardcoded on Home
  c = c.replace(/<a href="index\.html" class="active">Home<\/a>/g, '<a href="index.html">Home</a>');
  
  // Fix logo size in index.html which was missed
  if(f === 'index.html') {
     c = c.replace(/<img src="assets\/images\/logo\.png" alt="LookUPp Logo">/g, '<img src="assets/images/logo.png" alt="LookUPp" style="height:80px;">');
  }
  
  fs.writeFileSync(p, c);
});
