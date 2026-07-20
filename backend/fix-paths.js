const { initDB, getDB } = require('./database-wasm');

async function fixDB() {
  await initDB();
  const db = getDB();
  
  // Fix clients
  let clients = await db.all('SELECT * FROM clients WHERE logo_url LIKE "/uploads/%"');
  for (let c of clients) {
    let newUrl = c.logo_url.replace('/uploads/', '/api/uploads/');
    await db.run('UPDATE clients SET logo_url = ? WHERE id = ?', [newUrl, c.id]);
  }

  // Fix team
  let team = await db.all('SELECT * FROM team WHERE image LIKE "/uploads/%"');
  for (let t of team) {
    let newUrl = t.image.replace('/uploads/', '/api/uploads/');
    await db.run('UPDATE team SET image = ? WHERE id = ?', [newUrl, t.id]);
  }

  // Fix projects
  let projects = await db.all('SELECT * FROM projects WHERE image LIKE "/uploads/%"');
  for (let p of projects) {
    let newUrl = p.image.replace('/uploads/', '/api/uploads/');
    await db.run('UPDATE projects SET image = ? WHERE id = ?', [newUrl, p.id]);
  }

  console.log('Database image paths fixed successfully.');
}

fixDB();
