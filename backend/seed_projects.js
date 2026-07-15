const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const html = fs.readFileSync('c:/Users/awesh/Desktop/new web/frontend/our-work.html', 'utf8');
const regex = /<div class="portfolio-card glass-card"\s+data-category="([^"]*)"\s+data-title="([^"]*)"\s+data-description="([^"]*)"\s+data-client="([^"]*)"/g;

let match;
const projects = [];

while ((match = regex.exec(html)) !== null) {
  projects.push({
    category: match[1],
    title: match[2],
    description: match[3],
    client: match[4]
  });
}

open({filename:'database.sqlite', driver:sqlite3.Database}).then(async db => {
  await db.run('DELETE FROM projects');
  const stmt = await db.prepare('INSERT INTO projects (title, category, client, description, image, active) VALUES (?, ?, ?, ?, ?, 1)');
  for(let p of projects) {
    await stmt.run(p.title, p.category, p.client, p.description, '');
  }
  await stmt.finalize();
  console.log('Seeded projects: ' + projects.length);
});
