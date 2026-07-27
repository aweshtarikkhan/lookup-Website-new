const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\awesh\\Desktop\\new web\\frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const indexContent = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const footerRegex = /<footer class="footer">[\s\S]*?<\/footer>/;
const match = indexContent.match(footerRegex);
const footerHTML = match[0];

files.forEach(file => {
  if (file === 'index.html') return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, footerHTML);
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
