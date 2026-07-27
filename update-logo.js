const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\awesh\\Desktop\\new web\\frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  if (file === 'index.html') return; // index.html is already correct
  
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace logo to match index.html
  content = content.replace(/<a href="index\.html" class="nav-logo">\s*<img src="assets\/images\/logo\.png" alt="LookUPp Logo">\s*<\/a>/, 
    '<a href="index.html" class="nav-logo"><img src="assets/images/logo.png" alt="LookUPp" style="height:80px;"></a>');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated logo in ${file}`);
});
