const { initDB, getDB } = require('./database-wasm');
async function test() {
  await initDB();
  const db = getDB();
  const rows = await db.all('SELECT * FROM users LIMIT 1');
  console.log(rows);
}
test();
