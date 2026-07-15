const fs = require('fs');
let html = fs.readFileSync('c:/Users/awesh/Desktop/new web/frontend/our-work.html', 'utf8');
// regex to clear out portfolio-grid
html = html.replace(/<div class=\"portfolio-grid reveal\">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, '<div class=\"portfolio-grid reveal\"></div></div></section>');
// Cache bust
html = html.replace(/<script src="js\/main.js"><\/script>/, '<script src="js/main.js?v=1.4"></script>');
html = html.replace(/<script src="js\/main.js\?v=.*?"><\/script>/, '<script src="js/main.js?v=1.4"></script>');
fs.writeFileSync('c:/Users/awesh/Desktop/new web/frontend/our-work.html', html);
console.log('Cleared grid and cache busted');
