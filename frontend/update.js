const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\awesh\\Desktop\\new web\\frontend';

function processFiles() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.html')) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf8');

      // Update Logo
      content = content.replace(/<img src="assets\/images\/logo\.png" alt="LookUPp" style="height:40px;">/g, 
        '<img src="assets/images/logo.png" alt="LookUPp" style="height:80px;">');
      
      // Update Social Icons (handle minified or formatted)
      const socialRegex = /<div class="footer-social">[\s\S]*?<\/div>/;
      const newSocial = `<div class="footer-social">
            <a href="#" aria-label="Facebook"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.81l.53-4H14V7a1 1 0 0 1 1-1h3z"></path></svg></a>
            <a href="#" aria-label="Instagram"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
            <a href="#" aria-label="LinkedIn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>
            <a href="#" aria-label="YouTube"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></a>
            <a href="#" aria-label="Threads"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.5-6.5h3c2.5 0 2.5-3.5 0-3.5h-3v3.5z"></path></svg></a>
          </div>`;
      content = content.replace(socialRegex, newSocial);

      // Update Contact Info
      const oldContactInfoRegex = /<div class="footer-col">\s*<h4>Contact(?: Info)?<\/h4>[\s\S]*?<\/div>\s*<\/div>\s*<div class="footer-bottom">/;
      const newContactInfo = `<div class="footer-col">
          <h4>Contact Info</h4>
          <div class="footer-contact-item"><span>📞</span> <span>+91 94065 45047</span></div>
          <div class="footer-contact-item"><span>💬</span> <span>WhatsApp: +91 94248 25919</span></div>
          <div class="footer-contact-item"><span>📧</span> <span>info@lookupp.in</span></div>
          <div class="footer-contact-item" style="align-items:flex-start;"><span>📍</span> <span>Registered Office: Flat No. 501, T-4 Sagar Lekh View Home, Bhopal, MP, India</span></div>
          <div class="footer-contact-item" style="align-items:flex-start;"><span>🏢</span> <span>Branch Office: E-9 Govindpura, Bhopal, Madhya Pradesh, India, 462023</span></div>
        </div></div><div class="footer-bottom">`;
      content = content.replace(oldContactInfoRegex, newContactInfo);

      // Floating Buttons
      const floatingCallRegex = /<a href="tel:\+919876543210" class="float-btn call" aria-label="Call us">📞<\/a>/;
      const newFloatingButton = `<a href="https://wa.me/919424825919" class="float-btn whatsapp" aria-label="WhatsApp Us" style="background:#25D366; display:flex; align-items:center; justify-content:center; text-decoration:none;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>`;
      content = content.replace(floatingCallRegex, newFloatingButton);

      fs.writeFileSync(filePath, content);
      console.log('Processed', file);
    }
  }
}

processFiles();
