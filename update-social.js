const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\awesh\\Desktop\\new web\\frontend';
const indexPath = path.join(dir, 'index.html');

let content = fs.readFileSync(indexPath, 'utf8');

// Replace social links in the footer of index.html with target="_blank" and data-cms-href
content = content.replace(/<a href="#" aria-label="Facebook">/g, '<a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" data-cms-href="contact.social.facebook">');
content = content.replace(/<a href="#" aria-label="Instagram">/g, '<a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" data-cms-href="contact.social.instagram">');
content = content.replace(/<a href="#" aria-label="LinkedIn">/g, '<a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" data-cms-href="contact.social.linkedin">');
content = content.replace(/<a href="#" aria-label="YouTube">/g, '<a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube" data-cms-href="contact.social.youtube">');
content = content.replace(/<a href="#" aria-label="Threads">/g, '<a href="#" target="_blank" rel="noopener noreferrer" aria-label="Threads" data-cms-href="contact.social.threads">');

fs.writeFileSync(indexPath, content, 'utf8');
console.log("Updated social links in index.html");
