-- users table is mostly synced from Supabase for local profile info
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  phone TEXT,
  brand_domain TEXT,
  primary_goal TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  icon TEXT,
  category TEXT,
  description TEXT,
  tags TEXT,
  features TEXT,
  process TEXT,
  cta_text TEXT,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  category TEXT,
  description TEXT,
  image TEXT,
  link TEXT,
  client TEXT,
  duration TEXT,
  results TEXT,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS team (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  role TEXT,
  bio TEXT,
  image TEXT,
  social_links TEXT,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_name TEXT,
  company TEXT,
  feedback TEXT,
  rating INTEGER,
  date TEXT,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  phone TEXT,
  service TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qtNo TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  service TEXT,
  details TEXT,
  budget TEXT,
  status TEXT DEFAULT 'pending',
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  totalAmount INTEGER,
  items TEXT,
  invoiceUrl TEXT,
  customMessage TEXT
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  rating INTEGER,
  read INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new',
  date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  logo_url TEXT
);

CREATE TABLE IF NOT EXISTS key_value_store (
  id TEXT PRIMARY KEY,
  data TEXT
);
