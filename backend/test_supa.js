const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://ctdfpuwkicqadhchticn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGZwdXdraWNxYWRoY2h0aWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA4NTE3NiwiZXhwIjoyMDk0NjYxMTc2fQ.MXAbdVzy8_n-y0Y-pUF3fY-h1B4vOZo1Imyd-suw2oM');
async function test() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) console.error('Error:', error);
  else console.log('Users count:', data.users.length, 'First user email:', data.users[0]?.email);
}
test();
