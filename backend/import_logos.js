const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const logosDir = path.join(__dirname, '../clients-logos');

async function importLogos() {
  console.log('Ensuring Supabase storage bucket "lookupp-uploads" exists...');
  try {
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('lookupp-uploads', {
      public: true,
      fileSizeLimit: 5242880 // 5MB
    });
    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('Bucket "lookupp-uploads" already exists.');
      } else {
        console.warn('Could not create bucket:', bucketError.message);
      }
    } else {
      console.log('Successfully created public bucket "lookupp-uploads"');
    }
  } catch (err) {
    console.warn('Bucket creation check failed, trying upload anyway...', err.message);
  }

  console.log('Reading logo files from:', logosDir);
  if (!fs.existsSync(logosDir)) {
    console.error('Directory clients-logos does not exist!');
    return;
  }

  const files = fs.readdirSync(logosDir);
  console.log(`Found ${files.length} files to import.`);

  for (const file of files) {
    if (!file.toLowerCase().endsWith('.png') && !file.toLowerCase().endsWith('.jpg') && !file.toLowerCase().endsWith('.jpeg') && !file.toLowerCase().endsWith('.svg')) {
      console.log(`Skipping non-image file: ${file}`);
      continue;
    }

    const filePath = path.join(logosDir, file);
    const clientName = path.basename(file, path.extname(file)); // e.g. "Evercraft Publication"
    const cleanedFileName = `${Date.now()}-${file.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const destinationPath = `clients/${cleanedFileName}`;

    console.log(`Uploading ${clientName}...`);

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const mimeType = file.toLowerCase().endsWith('.svg') ? 'image/svg+xml' : 'image/png';

      // 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lookupp-uploads')
        .upload(destinationPath, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });

      if (uploadError) {
        console.error(`Error uploading ${file} to storage:`, uploadError.message);
        continue;
      }

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('lookupp-uploads')
        .getPublicUrl(destinationPath);

      const logoUrl = publicUrlData.publicUrl;
      console.log(`Public URL: ${logoUrl}`);

      // 3. Save to clients table
      const newItem = {
        id: Date.now() + Math.floor(Math.random() * 1000), // Unique ID
        name: clientName,
        logo_url: logoUrl
      };

      const { error: dbError } = await supabase.from('clients').insert([newItem]);
      if (dbError) {
        console.error(`Error saving ${clientName} to database:`, dbError.message);
      } else {
        console.log(`Successfully imported client: ${clientName}`);
      }

    } catch (err) {
      console.error(`Error processing file ${file}:`, err.message);
    }
  }

  console.log('Logo import process completed!');
}

importLogos();
