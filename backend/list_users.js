const { initDB, getDB } = require('./database-wasm.js');
async function run() {
  await initDB();
  const db = getDB();
  const users = await db.all('SELECT id, name, email, role FROM users');
  console.log(users);
}
run();
