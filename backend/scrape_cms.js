const fs = require('fs');
const glob = require('glob'); // wait, I'll just use fs.readdirSync
const path = require('path');

const dir = 'c:/Users/awesh/Desktop/new web/frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const contentMap = {};
// I'll manually seed based on the grep results earlier, it's safer and easier.

