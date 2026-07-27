const { initDB, getDB } = require('./database-wasm');

async function testUpdate() {
  await initDB();
  const db = getDB();
  const id = '1778938791666.0';
  const table = 'users';
  const reqBody = {
    name: 'Prince Raj',
    email: 'prprince46@gmail.com',
    password: '',
    role: 'super_admin'
  };

  const keys = Object.keys(reqBody);
  const values = Object.values(reqBody);
  
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  
  try {
    await db.run(`UPDATE ${table} SET ${setClause} WHERE id = ?`, [...values, id]);
    console.log("UPDATE SUCCESS");
  } catch (err) {
    console.error("UPDATE ERROR:", err);
  }
}

testUpdate();
