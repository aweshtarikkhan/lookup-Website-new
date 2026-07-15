const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

open({filename:'database.sqlite', driver:sqlite3.Database}).then(async db => {
  const row = await db.get(`SELECT data FROM key_value_store WHERE id = 'content'`);
  if (row) {
    const content = JSON.parse(row.data);
    console.log(JSON.stringify(content.contact, null, 2));
  }
});
