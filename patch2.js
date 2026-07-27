const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf8');

const newDeleteLogic = `app.delete('/api/users/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    const user = await db.get('SELECT email FROM users WHERE id = ?', [id]);
    if (user && user.email) {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const supabaseAdmin = require('@supabase/supabase-js').createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
          const { data, error } = await supabaseAdmin.auth.admin.listUsers();
          if (!error && data && data.users) {
            const supaUser = data.users.find(u => u.email === user.email);
            if (supaUser) {
              await supabaseAdmin.auth.admin.deleteUser(supaUser.id);
            }
          }
        } catch(e) { console.error('Supabase delete error:', e); }
      }
      await db.run('INSERT INTO deleted_users (email, deleted_at) VALUES (?, ?)', [user.email, new Date().toISOString()]);
    }
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`;

code = code.replace(
  /app\.delete\('\/api\/users\/:id', async \(req, res\) => \{[\s\S]*?createCrudEndpoints\(app, '\/api\/users', 'users'\);/,
  newDeleteLogic + '\n\ncreateCrudEndpoints(app, \'/api/users\', \'users\');'
);

fs.writeFileSync('backend/server.js', code);
console.log('Patched server.js with Supabase delete logic!');
