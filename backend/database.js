const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

let dbInstance = null;

async function initDB() {
  if (dbInstance) return dbInstance;
  
  // Open DB connection (creates the file if it doesn't exist)
  dbInstance = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Read and execute schema
  const schemaPath = path.join(__dirname, 'schema_local.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await dbInstance.exec(schema);

  // Initialize key_value_store rows if they don't exist
  await dbInstance.run(`INSERT OR IGNORE INTO key_value_store (id, data) VALUES ('settings', '{}')`);
  await dbInstance.run(`INSERT OR IGNORE INTO key_value_store (id, data) VALUES ('content', '{}')`);

  console.log('Local SQLite Database initialized successfully.');
  return dbInstance;
}

module.exports = {
  initDB,
  getDB: () => dbInstance
};
