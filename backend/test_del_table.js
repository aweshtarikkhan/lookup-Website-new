const { initDB, getDB } = require('./database-wasm.js');
async function run() {
  await initDB();
  const db = getDB();
  await db.run('CREATE TABLE IF NOT EXISTS deleted_users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
  console.log('Created deleted_users table');
}
run().catch(console.error);
