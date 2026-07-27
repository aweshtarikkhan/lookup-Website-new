const { initDB, getDB } = require('./database-wasm');

async function test() {
  await initDB();
  const db = getDB();
  const res = await db.all('SELECT * FROM clients');
  console.log('Clients:', res);
}

test();
