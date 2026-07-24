const express = require('express');
const compression = require('compression');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ quiet: true });

// Polyfill WebSocket for Node.js < 22 (needed for @supabase/realtime-js)
if (typeof WebSocket === 'undefined') {
  global.WebSocket = require('ws');
}

const { initDB, getDB } = require('./database-wasm');

const app = express();
const PORT = process.env.PORT || 3005;

// Initialize Supabase (ONLY for Auth now)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(['/uploads', '/api/uploads'], express.static(path.join(__dirname, '../frontend/uploads')));

// Setup uploads directory
const uploadsDir = path.join(__dirname, '../frontend/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer config for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = req.body.folder || 'general';
    if (req.originalUrl.includes('projects')) folder = 'projects';
    if (req.originalUrl.includes('team')) folder = 'team';
    if (req.originalUrl.includes('clients')) folder = 'clients';

    const dir = path.join(uploadsDir, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${Date.now()}-${basename}${ext}`);
  }
});
const upload = multer({ storage });

const JWT_SECRET = 'your-secret-key-123'; // In production, move to .env

// --- Auth Middleware ---
async function authMiddleware(req, res, next) {
  const publicRoutes = ['/api/services', '/api/projects', '/api/team', '/api/testimonials', '/api/settings', '/api/content', '/api/clients'];
  const pathWithoutQuery = req.originalUrl.split('?')[0];
  if (req.method === 'GET' && publicRoutes.includes(pathWithoutQuery)) return next();
  if (req.method === 'POST' && (pathWithoutQuery === '/api/inquiries' || pathWithoutQuery === '/api/quotations' || pathWithoutQuery === '/api/feedback')) return next();

  const token = req.headers['authorization']?.split(' ')[1] || req.headers['x-auth-token'];
  if (!token) {
    if (pathWithoutQuery.startsWith('/api/admin')) return res.status(401).json({ error: 'Unauthorized' });
    return res.status(401).json({ error: 'No token provided' });
  }

  const db = getDB();

  // Try Supabase token first
  try {
    const { data: { user: supaUser }, error: supaError } = await supabase.auth.getUser(token);
    if (!supaError && supaUser) {
      let dbUser = await db.get(`SELECT * FROM users WHERE email = ?`, [supaUser.email]);
      
      if (!dbUser) {
        const name = supaUser.user_metadata?.full_name || supaUser.email.split('@')[0];
        const newId = Date.now().toString() + '.' + Math.floor(Math.random() * 1000000);
        await db.run(`INSERT INTO users (id, name, email, role, password) VALUES (?, ?, ?, 'user', '')`, [newId, name, supaUser.email]);
        dbUser = await db.get(`SELECT * FROM users WHERE id = ?`, [newId]);
      }
      
      req.user = dbUser;
      return next();
    }
  } catch (e) {}

  // Fallback to custom JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.get(`SELECT * FROM users WHERE id = ?`, [decoded.id]);
    if (!user) return res.status(401).json({ error: 'Invalid User' });
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Token' });
  }
}

app.use('/api', authMiddleware);

// --- Admin Login ---
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const db = getDB();
  const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, token, user: userWithoutPassword });
});

// --- Generic CRUD Handlers ---
const createCrudEndpoints = (app, route, table) => {
  // GET all
  app.get(route, async (req, res) => {
    try {
      const db = getDB();
      const data = await db.all(`SELECT * FROM ${table} ORDER BY id DESC`);
      res.json(data || []);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  app.post(route, async (req, res) => {
    try {
      const db = getDB();
      const payload = { ...req.body };
      
      // Explicitly generate ID for users table
      if (table === 'users' && !payload.id) {
        payload.id = Date.now().toString() + '.' + Math.floor(Math.random() * 1000000);
      }
      
      const keys = Object.keys(payload);
      const values = Object.values(payload);
      const placeholders = keys.map(() => '?').join(',');
      const result = await db.run(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`, values);
      
      const insertedId = payload.id ? payload.id : result.lastID;
      const data = await db.get(`SELECT * FROM ${table} WHERE id = ?`, [insertedId]);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update
  app.put(`${route}/:id`, async (req, res) => {
    try {
      const db = getDB();
      const id = req.params.id;
      const keys = Object.keys(req.body);
      const values = Object.values(req.body);
      
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      await db.run(`UPDATE ${table} SET ${setClause} WHERE id = ?`, [...values, id]);
      
      const data = await db.get(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  app.delete(`${route}/:id`, async (req, res) => {
    try {
      const db = getDB();
      await db.run(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

createCrudEndpoints(app, '/api/services', 'services');
createCrudEndpoints(app, '/api/inquiries', 'inquiries');
createCrudEndpoints(app, '/api/quotations', 'quotations');
createCrudEndpoints(app, '/api/testimonials', 'testimonials');
createCrudEndpoints(app, '/api/feedback', 'feedback');
createCrudEndpoints(app, '/api/users', 'users');

// --- Custom Upload Endpoints ---
const handleUpload = (req) => {
  if (!req.file) return null;
  const folder = req.originalUrl.includes('projects') ? 'projects' : req.originalUrl.includes('team') ? 'team' : 'clients';
  return `/uploads/${folder}/${req.file.filename}`;
};

// Projects
app.get('/api/projects', async (req, res) => {
  try {
    const db = getDB();
    const data = await db.all(`SELECT * FROM projects ORDER BY id DESC`);
    res.json(data || []);
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.post('/api/projects', upload.single('image'), async (req, res) => {
  try {
    const db = getDB();
    const newItem = { ...req.body };
    if (newItem.active === 'true') newItem.active = 1;
    if (newItem.active === 'false') newItem.active = 0;
    const imageUrl = handleUpload(req);
    if (imageUrl) newItem.image = imageUrl;
    
    const keys = Object.keys(newItem);
    const values = Object.values(newItem);
    const placeholders = keys.map(() => '?').join(',');
    
    const result = await db.run(`INSERT INTO projects (${keys.join(',')}) VALUES (${placeholders})`, values);
    const data = await db.get(`SELECT * FROM projects WHERE id = ?`, [result.lastID]);
    res.json({ success: true, data });
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    const updateItem = { ...req.body };
    if (updateItem.active === 'true') updateItem.active = 1;
    if (updateItem.active === 'false') updateItem.active = 0;
    const imageUrl = handleUpload(req);
    if (imageUrl) updateItem.image = imageUrl;

    const keys = Object.keys(updateItem);
    const values = Object.values(updateItem);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    
    await db.run(`UPDATE projects SET ${setClause} WHERE id = ?`, [...values, id]);
    const data = await db.get(`SELECT * FROM projects WHERE id = ?`, [id]);
    res.json({ success: true, data });
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const db = getDB();
    await db.run(`DELETE FROM projects WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({error:e.message}); }
});

// Team
app.get('/api/team', async (req, res) => {
  try {
    const db = getDB();
    const data = await db.all(`SELECT * FROM team ORDER BY id ASC`);
    res.json(data || []);
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.post('/api/team', upload.single('image'), async (req, res) => {
  try {
    const db = getDB();
    const newItem = { ...req.body };
    if (newItem.active === 'true') newItem.active = 1;
    if (newItem.active === 'false') newItem.active = 0;
    const imageUrl = handleUpload(req);
    if (imageUrl) newItem.image = imageUrl;
    
    const keys = Object.keys(newItem);
    const values = Object.values(newItem);
    const placeholders = keys.map(() => '?').join(',');
    
    const result = await db.run(`INSERT INTO team (${keys.join(',')}) VALUES (${placeholders})`, values);
    const data = await db.get(`SELECT * FROM team WHERE id = ?`, [result.lastID]);
    res.json({ success: true, data });
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.put('/api/team/:id', upload.single('image'), async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    const updateItem = { ...req.body };
    if (updateItem.active === 'true') updateItem.active = 1;
    if (updateItem.active === 'false') updateItem.active = 0;
    const imageUrl = handleUpload(req);
    if (imageUrl) updateItem.image = imageUrl;

    const keys = Object.keys(updateItem);
    const values = Object.values(updateItem);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    
    await db.run(`UPDATE team SET ${setClause} WHERE id = ?`, [...values, id]);
    const data = await db.get(`SELECT * FROM team WHERE id = ?`, [id]);
    res.json({ success: true, data });
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.delete('/api/team/:id', async (req, res) => {
  try {
    const db = getDB();
    await db.run(`DELETE FROM team WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({error:e.message}); }
});

// Clients
app.get('/api/clients', async (req, res) => {
  try {
    const db = getDB();
    const data = await db.all(`SELECT * FROM clients ORDER BY id DESC`);
    res.json(data || []);
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.post('/api/clients', upload.single('image'), async (req, res) => {
  try {
    const db = getDB();
    const newItem = { name: req.body.name };
    const imageUrl = handleUpload(req);
    if (imageUrl) newItem.logo_url = imageUrl;
    
    const keys = Object.keys(newItem);
    const values = Object.values(newItem);
    const placeholders = keys.map(() => '?').join(',');
    
    const result = await db.run(`INSERT INTO clients (${keys.join(',')}) VALUES (${placeholders})`, values);
    const data = await db.get(`SELECT * FROM clients WHERE id = ?`, [result.lastID]);
    res.json({ success: true, data });
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.put('/api/clients/:id', upload.single('image'), async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    const updateItem = { name: req.body.name };
    const imageUrl = handleUpload(req);
    if (imageUrl) updateItem.logo_url = imageUrl;

    const keys = Object.keys(updateItem);
    const values = Object.values(updateItem);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    
    await db.run(`UPDATE clients SET ${setClause} WHERE id = ?`, [...values, id]);
    const data = await db.get(`SELECT * FROM clients WHERE id = ?`, [id]);
    res.json({ success: true, data });
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const db = getDB();
    await db.run(`DELETE FROM clients WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({error:e.message}); }
});


// --- Settings & Content ---
app.get('/api/settings', async (req, res) => {
  try {
    const db = getDB();
    const row = await db.get(`SELECT data FROM key_value_store WHERE id = 'settings'`);
    res.json(row && row.data ? JSON.parse(row.data) : {});
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.put('/api/settings', async (req, res) => {
  try {
    const db = getDB();
    const jsonData = JSON.stringify(req.body);
    await db.run(`INSERT INTO key_value_store (id, data) VALUES ('settings', ?) ON CONFLICT(id) DO UPDATE SET data = ?`, [jsonData, jsonData]);
    res.json({ success: true, data: req.body });
  } catch(e) { res.status(500).json({error:e.message}); }
});

app.get('/api/content', async (req, res) => {
  try {
    const db = getDB();
    const row = await db.get(`SELECT data FROM key_value_store WHERE id = 'content'`);
    res.json(row && row.data ? JSON.parse(row.data) : {});
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.put('/api/content', async (req, res) => {
  try {
    const db = getDB();
    const jsonData = JSON.stringify(req.body);
    await db.run(`INSERT INTO key_value_store (id, data) VALUES ('content', ?) ON CONFLICT(id) DO UPDATE SET data = ?`, [jsonData, jsonData]);
    res.json({ success: true, data: req.body });
  } catch(e) { res.status(500).json({error:e.message}); }
});
// --- Content Image Upload ---
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  // Since we save it in frontend/uploads, we return /uploads/images/...
  // To keep it simple, we can just use the 'general' folder if it wasn't specified.
  // Wait, the multer config already puts it in 'general' if not matched.
  return res.json({ url: `/uploads/general/${req.file.filename}` });
});

// --- Stats ---
app.get('/api/stats', async (req, res) => {
  try {
    const db = getDB();
    const { count: inquiries } = await db.get(`SELECT COUNT(*) as count FROM inquiries`);
    const { count: quotations } = await db.get(`SELECT COUNT(*) as count FROM quotations`);
    const { count: projects } = await db.get(`SELECT COUNT(*) as count FROM projects`);
    const { count: services } = await db.get(`SELECT COUNT(*) as count FROM services`);
    const { count: newInquiries } = await db.get(`SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'`);
    const { count: team } = await db.get(`SELECT COUNT(*) as count FROM team`);
    const { count: testimonials } = await db.get(`SELECT COUNT(*) as count FROM testimonials`);
    
    const revData = await db.all(`SELECT budget FROM quotations WHERE status = 'Completed'`);
    let totalRevenue = 0;
    if (revData) {
      revData.forEach(q => {
        const amount = parseInt((q.budget || '').replace(/[^0-9]/g, ''));
        if (!isNaN(amount)) totalRevenue += amount;
      });
    }

    res.json({
      totalServices: services || 0,
      totalProjects: projects || 0,
      totalInquiries: inquiries || 0,
      newInquiries: newInquiries || 0,
      totalTeam: team || 0,
      totalTestimonials: testimonials || 0,
      totalRevenue: totalRevenue || 0
    });
  } catch (err) {
    res.json({ totalServices: 0, totalProjects: 0, totalInquiries: 0, newInquiries: 0, totalTeam: 0, totalTestimonials: 0, totalRevenue: 0 });
  }
});

// --- Client Portal User Endpoints ---
app.get('/api/users/me', async (req, res) => {
  try {
    const db = getDB();
    const email = req.user.email;
    const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
    res.json(user || req.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/me', async (req, res) => {
  try {
    const db = getDB();
    const email = req.user.email;
    const { name, phone } = req.body;
    await db.run(`UPDATE users SET name = ?, phone = ? WHERE email = ?`, [name, phone, email]);
    const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/me/inquiries', async (req, res) => {
  try {
    const db = getDB();
    const email = req.user.email;
    const data = await db.all(`SELECT * FROM inquiries WHERE email = ? ORDER BY id DESC`, [email]);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/me/quotations', async (req, res) => {
  try {
    const db = getDB();
    const email = req.user.email;
    const data = await db.all(`SELECT * FROM quotations WHERE email = ? ORDER BY id DESC`, [email]);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}).catch(console.error);
