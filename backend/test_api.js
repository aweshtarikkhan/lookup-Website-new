require('@dotenvx/dotenvx').config();
const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lookupp_super_secret_2024';
const token = jwt.sign({ id: '1778938791666.0', role: 'hidden_admin' }, JWT_SECRET, { expiresIn: '24h' });

const data = JSON.stringify({ name: 'Prince Raj', email: 'prprince46@gmail.com', password: '', role: 'super_admin' });
const options = {
  hostname: 'localhost', port: 3005, path: '/api/users/1778938791666.0', method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length, 'Authorization': `Bearer ${token}` }
};
const req = http.request(options, res => {
  console.log('statusCode:', res.statusCode);
  console.log('content-type:', res.headers['content-type']);
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => { console.log(body); });
});
req.on('error', error => { console.error(error); });
req.write(data);
req.end();
