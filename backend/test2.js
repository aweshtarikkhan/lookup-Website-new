const { initDB, getDB } = require('./database-wasm');

async function test() {
  await initDB();
  const db = getDB();
  const res = await db.all('PRAGMA table_info(users)');
  console.log('Columns in users:', res);
}

test();
