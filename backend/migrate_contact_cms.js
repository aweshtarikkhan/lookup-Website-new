const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

open({filename:'database.sqlite', driver:sqlite3.Database}).then(async db => {
  const row = await db.get(`SELECT data FROM key_value_store WHERE id = 'content'`);
  if (row) {
    const content = JSON.parse(row.data);
    
    // Ensure contact exists
    if (!content.contact) content.contact = {};
    
    // Add info and social sections
    content.contact.info = {
      phone: "+91 98765 43210",
      email: "hello@lookupp.in",
      address: "123, Business Hub, MG Road, Mumbai, Maharashtra 400001",
      businessHours: "Monday - Saturday: 10:00 AM - 7:00 PM",
      googleMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1234567890"
    };
    
    content.contact.social = {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      linkedin: "https://linkedin.com",
      youtube: "https://youtube.com",
      threads: "https://threads.net"
    };
    
    const jsonStr = JSON.stringify(content);
    await db.run(`UPDATE key_value_store SET data = ? WHERE id = 'content'`, [jsonStr]);
    console.log('Migrated contact info to CMS successfully');
  }
});
