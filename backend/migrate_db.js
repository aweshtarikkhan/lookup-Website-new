const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  const db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  const tables = ['services', 'projects', 'team', 'testimonials', 'inquiries', 'quotations', 'feedback', 'users', 'clients'];

  for (const table of tables) {
    console.log(`Migrating ${table}...`);
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      continue;
    }
    
    if (data && data.length > 0) {
      for (const row of data) {
        const keys = Object.keys(row);
        const values = Object.values(row);
        const placeholders = keys.map(() => '?').join(',');
        
        try {
          await db.run(`INSERT OR IGNORE INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`, values);
        } catch (err) {
          console.error(`Failed to insert into ${table}:`, err.message);
        }
      }
      console.log(`Migrated ${data.length} rows for ${table}`);
    } else {
      console.log(`No data in ${table}`);
    }
  }
  
  // Settings & Content
  for (const key of ['settings', 'content']) {
    try {
      const { data } = await supabase.from('key_value_store').select('*').eq('id', key).single();
      if (data) {
        await db.run(`INSERT INTO key_value_store (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = ?`, [key, data.data, data.data]);
        console.log(`Migrated key_value_store for ${key}`);
      }
    } catch(e) {}
  }

  console.log('Migration complete!');
}

migrate().catch(console.error);
