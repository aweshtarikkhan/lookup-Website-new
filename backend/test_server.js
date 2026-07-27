const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

console.log('Uploads dir:', path.join(__dirname, 'uploads'));
console.log('Exists:', fs.existsSync(path.join(__dirname, 'uploads', 'clients', '1784550594124-ChatGPT_Image_Jul_11__2026__05_26_43_PM.png')));

app.use(['/uploads', '/api/uploads'], express.static(path.join(__dirname, 'uploads')));

app.use((req, res) => res.status(401).send('Not found!'));

app.listen(3006, () => {
  console.log('started');
  require('http').get('http://localhost:3006/api/uploads/clients/1784550594124-ChatGPT_Image_Jul_11__2026__05_26_43_PM.png', (res) => {
    console.log('Status Code:', res.statusCode);
    process.exit(0);
  });
});
