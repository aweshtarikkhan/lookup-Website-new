// database-wasm.js - Pure JavaScript/WASM SQLite (No native bindings, works on all systems)
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

class AsyncDB {
  constructor(sqlDb) {
    this.db = sqlDb;
  }

  _toArray(params) {
    if (!params) return [];
    if (Array.isArray(params)) return params;
    return Object.values(params);
  }

  _save() {
    try {
      const data = this.db.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    } catch(e) {
      console.error('DB save error:', e.message);
    }
  }

  async all(sql, params) {
    try {
      const stmt = this.db.prepare(sql);
      const arr = this._toArray(params);
      if (arr.length > 0) stmt.bind(arr);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch(e) {
      throw new Error(`DB.all error: ${e.message} | SQL: ${sql}`);
    }
  }

  async get(sql, params) {
    try {
      const stmt = this.db.prepare(sql);
      const arr = this._toArray(params);
      if (arr.length > 0) stmt.bind(arr);
      let result = null;
      if (stmt.step()) {
        result = stmt.getAsObject();
      }
      stmt.free();
      return result;
    } catch(e) {
      throw new Error(`DB.get error: ${e.message} | SQL: ${sql}`);
    }
  }

  async run(sql, params) {
    try {
      const arr = this._toArray(params);
      this.db.run(sql, arr.length > 0 ? arr : undefined);
      const changes = this.db.getRowsModified();
      let lastID = null;
      try {
        const r = this.db.exec("SELECT last_insert_rowid()");
        if (r.length > 0) lastID = r[0].values[0][0];
      } catch(e) {}
      this._save();
      return { lastID, changes };
    } catch(e) {
      throw new Error(`DB.run error: ${e.message} | SQL: ${sql}`);
    }
  }

  async exec(sql) {
    try {
      this.db.exec(sql);
      this._save();
    } catch(e) {
      // Ignore "already exists" errors from schema creation
      if (!e.message.includes('already exists')) {
        throw new Error(`DB.exec error: ${e.message}`);
      }
    }
  }

  prepare(sql) {
    const self = this;
    const stmt = this.db.prepare(sql);
    return {
      async run(...args) {
        const params = args.flat();
        if (params.length > 0) stmt.bind(params);
        stmt.step();
        stmt.reset();
        self._save();
      },
      free() { stmt.free(); }
    };
  }
}

let dbInstance = null;

async function initDB() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  let sqlDb;

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(fileBuffer);
    console.log('Loaded existing database.sqlite');
  } else {
    sqlDb = new SQL.Database();
    console.log('Created new database.sqlite');
  }

  dbInstance = new AsyncDB(sqlDb);

  const schemaPath = path.join(__dirname, 'schema_local.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Split schema by semicolons and run each statement
  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    try {
      sqlDb.run(stmt);
    } catch(e) {
      if (!e.message.includes('already exists')) {
        console.warn('Schema warning:', e.message);
      }
    }
  }

  try {
    sqlDb.run(`INSERT OR IGNORE INTO key_value_store (id, data) VALUES ('settings', '{}')`);
    sqlDb.run(`INSERT OR IGNORE INTO key_value_store (id, data) VALUES ('content', '{}')`);
    dbInstance._save();
  } catch(e) {}

  console.log('Local SQLite Database (WASM) initialized successfully.');
  return dbInstance;
}

module.exports = {
  initDB,
  getDB: () => dbInstance
};
