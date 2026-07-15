const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

open({filename:'database.sqlite', driver:sqlite3.Database}).then(async db => {
  const row = await db.get(`SELECT data FROM key_value_store WHERE id = 'content'`);
  if (row) {
    const content = JSON.parse(row.data);
    
    // Update contact page content
    content.contact = {
      hero: {
        title: "Contact <span class=\"text-primary\">Us</span>"
      },
      section1: {
        badge: "Get In Touch",
        title: "Let's Start a <span class=\"text-primary\">Conversation</span>",
        description: "Have a project in mind? We'd love to hear from you. Reach out and let's make something great together."
      },
      form: {
        title: "Send Us a <span class=\"text-primary\">Message</span>",
        description: "Fill out the form and our team will get back to you within 24 hours."
      }
    };
    
    const jsonStr = JSON.stringify(content);
    await db.run(`UPDATE key_value_store SET data = ? WHERE id = 'content'`, [jsonStr]);
    console.log('Updated contact CMS data successfully');
  }
});
