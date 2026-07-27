const fs = require('fs');
const initSqlJs = require('sql.js');

async function test() {
  const SQL = await initSqlJs();
  try {
    const db = new SQL.Database(Buffer.alloc(0));
    console.log('Success');
  } catch(e) { console.error('Error:', e.message); }
}
test();
