const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const html = fs.readFileSync('c:/Users/awesh/Desktop/new web/frontend/services.html', 'utf8');
const regex = /<div class=\"glass-card service-detail-card.*?<span class=\"icon\">(.*?)<\/span>.*?<h3>(.*?)<\/h3>.*?<p>(.*?)<\/p>/g;
let match;
const servicesData = [];
while ((match = regex.exec(html)) !== null) {
  servicesData.push({ icon: match[1], name: match[2], description: match[3] });
}
open({filename:'database.sqlite', driver:sqlite3.Database}).then(async db => {
  for (let s of servicesData) {
    await db.run('UPDATE services SET description = ? WHERE name = ?', [s.description, s.name]);
  }
  console.log('Updated descriptions from HTML: ' + servicesData.length);
});
