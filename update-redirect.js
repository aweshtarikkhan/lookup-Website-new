const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\awesh\\Desktop\\new web\\frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  if (file === 'index.html') return; // already updated index.html
  
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace redirect with seamless login
  const target = `window.location.href = 'profile.html';`;
  const replacement = `closeLoginModal();\n        checkLoginState();\n        showToast('success', '🎉', 'Logged in successfully!');`;
  
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated redirect in ${file}`);
  }
});
