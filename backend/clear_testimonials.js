const fs = require('fs');
let html = fs.readFileSync('c:/Users/awesh/Desktop/new web/frontend/index.html', 'utf8');
// regex to clear out testimonial-slider
html = html.replace(/<div class=\"testimonial-slider reveal\" id=\"tslider\">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/, '<div class=\"testimonial-slider reveal\" id=\"tslider\"></div></div></div></section>');
// Cache bust
html = html.replace(/<script src="js\/main.js\?v=.*?"><\/script>/, '<script src="js/main.js?v=1.5"></script>');
fs.writeFileSync('c:/Users/awesh/Desktop/new web/frontend/index.html', html);
console.log('Cleared testimonial grid and cache busted');
