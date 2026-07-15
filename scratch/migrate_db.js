const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  const db = await open({
    filename: path.join(__dirname, '../backend/database.sqlite'),
    driver: sqlite3.Database
  });

  const tables = ['services', 'projects', 'team', 'testimonials', 'inquiries', 'quotations', 'feedback', 'users'];

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
  console.log('Migration complete!');
}

migrate().catch(console.error);
