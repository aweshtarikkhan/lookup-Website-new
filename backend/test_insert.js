const { initDB, getDB } = require('./database-wasm');
async function test() {
  await initDB();
  const db = getDB();
  try {
    const res1 = await db.run("INSERT INTO users (name, email) VALUES ('User 1', 'u1@ex.com')");
    console.log('Res1:', res1);
    const res2 = await db.run("INSERT INTO users (name, email) VALUES ('User 2', 'u2@ex.com')");
    console.log('Res2:', res2);
  } catch (err) {
    console.error(err.message);
  }
}
test();
