const { initDB, getDB } = require('./database-wasm.js');
async function run() {
  await initDB();
  const db = getDB();
  await db.run('CREATE TABLE IF NOT EXISTS banned_emails (email TEXT PRIMARY KEY)');
  console.log('Created banned_emails table');
}
run().catch(console.error);
