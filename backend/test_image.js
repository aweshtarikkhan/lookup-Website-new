const http = require('http');

http.get('http://localhost:3005/api/uploads/clients/1784550594124-ChatGPT_Image_Jul_11__2026__05_26_43_PM.png', (res) => {
  console.log('Status Code:', res.statusCode);
  res.on('data', () => {});
  res.on('end', () => console.log('Done'));
}).on('error', (err) => {
  console.log('Error:', err.message);
});
