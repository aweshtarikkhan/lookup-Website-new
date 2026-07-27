const express = require('express');
const { initDB, getDB } = require('./database-wasm.js');

async function testPUT() {
  await initDB();
  const db = getDB();
  const id = '1778938791666.0'; // Prince Raj
  
  const body = {
    name: 'Prince Raj',
    email: 'prprince46@gmail.com',
    role: 'super_admin'
  };
  
  const keys = Object.keys(body);
  const values = Object.values(body);
  
  try {
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const query = `UPDATE users SET ${setClause} WHERE id = ?`;
    console.log('Query:', query);
    console.log('Values:', [...values, id]);
    
    const res = await db.run(query, [...values, id]);
    console.log('Update Success:', res);
    
    const data = await db.get(`SELECT * FROM users WHERE id = ?`, [id]);
    console.log('Updated user:', data);
  } catch (err) {
    console.error('Update Error:', err.message);
  }
}
testPUT();
