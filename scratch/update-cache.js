const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'frontend');
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Update main.js cache buster (with or without existing version)
  content = content.replace(/main\.js(\?v=[0-9.]+)?/g, 'main.js?v=3.0');
  
  // Update style.css cache buster
  content = content.replace(/style\.css(\?v=[0-9.]+)?/g, 'style.css?v=3.0');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated: ' + file);
});
