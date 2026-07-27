const { initDB, getDB } = require('./database-wasm.js');
async function run() {
  await initDB();
  const db = getDB();
  try {
    const res = await db.run(`UPDATE users SET role = 'super_admin' WHERE email = 'prprince46@gmail.com'`);
    console.log('Update result:', res);
  } catch(e) {
    console.error('Error during update:', e.message);
  }
}
run();
