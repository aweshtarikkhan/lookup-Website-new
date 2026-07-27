const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\awesh\\Desktop\\new web\\frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const inlineScript = `\n<script>if(sessionStorage.getItem('lookupp_visited')){document.querySelector('.preloader').style.display='none';}</script>`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Only add if not already there
  if (!content.includes("sessionStorage.getItem('lookupp_visited')")) {
    content = content.replace(/(<div class="preloader">.*?<\/div>)/i, `$1${inlineScript}`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added splash script to ${file}`);
  }
});
