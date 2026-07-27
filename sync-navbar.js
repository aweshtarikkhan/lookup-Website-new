const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\awesh\\Desktop\\new web\\frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const indexContent = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const navRegex = /<nav class="navbar[^>]*>([\s\S]*?)<\/nav>/i;
const navMatch = indexContent.match(navRegex);

if (!navMatch) {
  console.error('Navbar not found in index.html');
  process.exit(1);
}

const navHTML = navMatch[0];

files.forEach(file => {
  if (file === 'index.html') return;
  
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the entire navbar with index.html's navbar
  content = content.replace(/<nav class="navbar[^>]*>([\s\S]*?)<\/nav>/i, navHTML);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Synced navbar to ${file}`);
});
