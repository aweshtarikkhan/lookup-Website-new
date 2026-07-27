const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
for (const f of files) {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/id="signup-brand" class="form-control" placeholder="yourbrand.com" required/g, 'id="signup-brand" class="form-control" placeholder="yourbrand.com"');
  content = content.replace(/id="signup-goal" class="form-control" required/g, 'id="signup-goal" class="form-control"');
  fs.writeFileSync(p, content);
}
console.log('Updated HTML files');
