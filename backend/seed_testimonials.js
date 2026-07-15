const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const html = fs.readFileSync('c:/Users/awesh/Desktop/new web/frontend/index.html', 'utf8');
const regex = /<div class="glass-card testimonial-card">[\s\S]*?<p>(.*?)<\/p>[\s\S]*?<div class="name">(.*?)<\/div>[\s\S]*?<div class="company">(.*?)<\/div>/g;

let match;
const testimonials = [];

while ((match = regex.exec(html)) !== null) {
  testimonials.push({
    message: match[1],
    name: match[2],
    company: match[3],
    rating: 5
  });
}

open({filename:'database.sqlite', driver:sqlite3.Database}).then(async db => {
  await db.run('DELETE FROM testimonials');
  const stmt = await db.prepare('INSERT INTO testimonials (client_name, company, feedback, rating, active) VALUES (?, ?, ?, ?, 1)');
  for(let t of testimonials) {
    await stmt.run(t.name, t.company, t.message, t.rating);
  }
  await stmt.finalize();
  console.log('Seeded testimonials: ' + testimonials.length);
});
