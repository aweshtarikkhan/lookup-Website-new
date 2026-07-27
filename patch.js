const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf8');

// Replace authMiddleware logic
code = code.replace(
  /const banned = await db\.get\(`SELECT email FROM banned_emails WHERE email = \?`, \[supaUser\.email\]\);\s*if \(banned\) \{\s*return res\.status\(403\)\.json\(\{ error: 'This account has been deleted by an administrator\.' \}\);\s*\}/,
  `const deletedRecord = await db.get('SELECT deleted_at FROM deleted_users WHERE email = ? ORDER BY id DESC LIMIT 1', [supaUser.email]);
        if (deletedRecord) {
          const decodedToken = jwt.decode(token);
          if (decodedToken && decodedToken.iat) {
            const tokenIat = decodedToken.iat * 1000;
            const deletedAt = new Date(deletedRecord.deleted_at).getTime();
            if (tokenIat < deletedAt) {
              return res.status(401).json({ error: 'Session expired. Please log in again.' });
            }
          }
        }`
);

// Replace DELETE logic
code = code.replace(
  /app\.delete\('\/api\/users\/:id', async \(req, res\) => \{[\s\S]*?createCrudEndpoints\(app, '\/api\/users', 'users'\);/,
  `app.delete('/api/users/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    const user = await db.get('SELECT email FROM users WHERE id = ?', [id]);
    if (user && user.email) {
      await db.run('INSERT INTO deleted_users (email, deleted_at) VALUES (?, ?)', [user.email, new Date().toISOString()]);
    }
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

createCrudEndpoints(app, '/api/users', 'users');`
);

// Replace table creation logic
code = code.replace(
  /await db\.exec\('CREATE TABLE IF NOT EXISTS banned_emails \(email TEXT PRIMARY KEY\);'\);/,
  `await db.exec('CREATE TABLE IF NOT EXISTS deleted_users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP);');`
);

fs.writeFileSync('backend/server.js', code);
console.log('Patched server.js successfully!');
