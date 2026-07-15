const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

open({filename:'database.sqlite', driver:sqlite3.Database}).then(async db => {
  const row = await db.get(`SELECT data FROM key_value_store WHERE id = 'content'`);
  if (row) {
    const content = JSON.parse(row.data);
    
    // Migrate fields safely
    content.contact.info.registeredOffice = content.contact.info.address;
    if (content.contact.info['Branch Office']) {
      content.contact.info.branchOffice = content.contact.info['Branch Office'];
      delete content.contact.info['Branch Office'];
    } else {
      content.contact.info.branchOffice = "E-9 Govindpura, Bhopal, Madhya Pradesh, India, 462023";
    }
    
    delete content.contact.info.address;
    
    const jsonStr = JSON.stringify(content);
    await db.run(`UPDATE key_value_store SET data = ? WHERE id = 'content'`, [jsonStr]);
    console.log('Migrated office addresses successfully');
  }
});
