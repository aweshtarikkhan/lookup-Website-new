const { initDB, getDB } = require('./database-wasm.js');
async function test() {
  await initDB();
  const db = getDB();
  const res = await db.all('SELECT * FROM users');
  console.log(typeof res[0].id, res[0].id);
}
test();
