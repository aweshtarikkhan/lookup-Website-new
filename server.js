const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Multer config for memory storage (for Supabase upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const dataFiles = {
  services: path.join(DATA_DIR, 'services.json'),
  projects: path.join(DATA_DIR, 'projects.json'),
  inquiries: path.join(DATA_DIR, 'inquiries.json'),
  team: path.join(DATA_DIR, 'team.json'),
  testimonials: path.join(DATA_DIR, 'testimonials.json'),
  settings: path.join(DATA_DIR, 'settings.json'),
  feedback: path.join(DATA_DIR, 'feedback.json'),
  quotations: path.join(DATA_DIR, 'quotations.json'),
  users: path.join(DATA_DIR, 'users.json'),
  content: path.join(DATA_DIR, 'content.json')
};

// Helper: read/write JSON
function readData(file) {
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return []; }
}

function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize default data if not exists
function initializeData() {
  if (!fs.existsSync(dataFiles.services)) {
    writeData(dataFiles.services, [
      // Digital Marketing
      { id: 1, category: "digital-marketing", name: "Social Media Marketing", icon: "📱", description: "Strategic social media campaigns to boost your brand visibility and engagement across all platforms.", active: true },
      { id: 2, category: "digital-marketing", name: "WhatsApp Marketing", icon: "💬", description: "Targeted WhatsApp campaigns with bulk messaging, automation, and customer engagement strategies.", active: true },
      { id: 3, category: "digital-marketing", name: "Google Ads", icon: "🔍", description: "High-converting Google Ads campaigns with keyword research, ad copy optimization, and ROI tracking.", active: true },
      { id: 4, category: "digital-marketing", name: "Meta Ads", icon: "📊", description: "Facebook & Instagram advertising with precise targeting, creative ads, and performance optimization.", active: true },
      { id: 5, category: "digital-marketing", name: "SEO Optimization", icon: "🚀", description: "Comprehensive SEO strategies including on-page, off-page, technical SEO, and local SEO optimization.", active: true },
      { id: 6, category: "digital-marketing", name: "Email Marketing", icon: "📧", description: "Automated email campaigns with segmentation, A/B testing, and conversion-focused templates.", active: true },
      { id: 7, category: "digital-marketing", name: "Influencer Marketing", icon: "⭐", description: "Connect with the right influencers to amplify your brand reach and drive authentic engagement.", active: true },
      { id: 8, category: "digital-marketing", name: "Content Creation", icon: "✍️", description: "Engaging content strategy with blog posts, articles, social media content, and copywriting.", active: true },
      { id: 9, category: "digital-marketing", name: "Performance Marketing", icon: "📈", description: "Data-driven marketing campaigns focused on measurable results, conversions, and ROI maximization.", active: true },
      { id: 10, category: "digital-marketing", name: "Social Media Management", icon: "🎯", description: "End-to-end social media management including content planning, scheduling, and community management.", active: true },
      // Creative & Branding
      { id: 11, category: "creative-branding", name: "Video Shoot", icon: "🎬", description: "Professional video production with scripting, filming, and direction for promotional content.", active: true },
      { id: 12, category: "creative-branding", name: "Video Editing", icon: "🎞️", description: "High-quality video editing with motion graphics, color grading, and sound design.", active: true },
      { id: 13, category: "creative-branding", name: "Podcast Shoot", icon: "🎙️", description: "Professional podcast recording setup with multi-camera angles and studio-quality audio.", active: true },
      { id: 14, category: "creative-branding", name: "Podcast Editing", icon: "🎧", description: "Expert podcast editing with noise removal, mixing, mastering, and intro/outro production.", active: true },
      { id: 15, category: "creative-branding", name: "Post Creation", icon: "🎨", description: "Eye-catching social media posts, stories, and reels designed to maximize engagement.", active: true },
      { id: 16, category: "creative-branding", name: "Logo Design", icon: "✏️", description: "Unique, memorable logo designs that capture your brand identity and values.", active: true },
      { id: 17, category: "creative-branding", name: "Packaging Design", icon: "📦", description: "Attractive product packaging designs that stand out on shelves and online marketplaces.", active: true },
      { id: 18, category: "creative-branding", name: "Brochure Design", icon: "📄", description: "Professional brochure and catalog designs for print and digital distribution.", active: true },
      { id: 19, category: "creative-branding", name: "E-Invitation Videos", icon: "🎉", description: "Beautiful animated invitation videos for weddings, events, and corporate functions.", active: true },
      { id: 20, category: "creative-branding", name: "E-Invitation Cards", icon: "💌", description: "Elegant digital invitation cards with custom designs and interactive elements.", active: true },
      // Development
      { id: 21, category: "development", name: "Website Development", icon: "🌐", description: "Custom responsive websites built with modern technologies for optimal performance.", active: true },
      { id: 22, category: "development", name: "Web Application Development", icon: "⚙️", description: "Scalable web applications with robust backends, APIs, and modern frameworks.", active: true },
      { id: 23, category: "development", name: "Mobile App Development", icon: "📲", description: "Native and cross-platform mobile apps for iOS and Android with intuitive UX.", active: true },
      { id: 24, category: "development", name: "Ecommerce Development", icon: "🛒", description: "Feature-rich ecommerce stores with payment integration, inventory, and order management.", active: true },
      { id: 25, category: "development", name: "WhatsApp API Integration", icon: "🔗", description: "WhatsApp Business API integration for automated messaging, chatbots, and CRM.", active: true },
      { id: 26, category: "development", name: "Hosting & Security", icon: "🛡️", description: "Secure hosting solutions with SSL, CDN, backups, and 24/7 monitoring.", active: true },
      { id: 27, category: "development", name: "Landing Page Development", icon: "📋", description: "High-converting landing pages optimized for lead generation and campaign performance.", active: true },
      { id: 28, category: "development", name: "Admin Panel Development", icon: "🖥️", description: "Custom admin dashboards for managing your business operations efficiently.", active: true }
    ]);
  }

  if (!fs.existsSync(dataFiles.projects)) {
    writeData(dataFiles.projects, [
      { id: 1, title: "E-Commerce Platform", category: "website", description: "Full-stack e-commerce solution with payment gateway integration", image: "", client: "RetailMax", active: true },
      { id: 2, title: "Restaurant Brand Identity", category: "branding", description: "Complete brand identity design including logo, menu, and packaging", image: "", client: "Flavor House", active: true },
      { id: 3, title: "Social Media Campaign", category: "social-media", description: "360° social media campaign that increased engagement by 300%", image: "", client: "TechStart", active: true },
      { id: 4, title: "Mobile Banking App", category: "app", description: "Secure mobile banking application with biometric authentication", image: "", client: "FinanceGo", active: true },
      { id: 5, title: "Product Launch Video", category: "video", description: "Cinematic product launch video with 1M+ views", image: "", client: "GadgetPro", active: true },
      { id: 6, title: "SEO & Google Ads Campaign", category: "marketing", description: "Comprehensive digital marketing campaign with 5x ROI", image: "", client: "EduLearn", active: true }
    ]);
  }

  if (!fs.existsSync(dataFiles.inquiries)) {
    writeData(dataFiles.inquiries, []);
  }

  if (!fs.existsSync(dataFiles.quotations)) {
    writeData(dataFiles.quotations, []);
  }

  if (!fs.existsSync(dataFiles.users)) {
    writeData(dataFiles.users, [{
      id: Date.now(),
      name: "Awesh Tarik Khan",
      email: "aweshtarikkhan@gmail.com",
      password: "Mariyam@2026", // Default password
      role: "hidden_admin",
      token: "secret-token-123"
    }]);
  }

  if (!fs.existsSync(dataFiles.team)) {
    writeData(dataFiles.team, [
      { id: 1, name: "Founder", role: "CEO & Founder", bio: "Visionary leader with 10+ years of experience in digital marketing and technology.", image: "", active: true },
      { id: 2, name: "Creative Head", role: "Creative Director", bio: "Award-winning creative professional specializing in brand strategy and visual design.", image: "", active: true },
      { id: 3, name: "Tech Lead", role: "CTO", bio: "Full-stack developer with expertise in modern web and mobile technologies.", image: "", active: true },
      { id: 4, name: "Marketing Head", role: "Marketing Director", bio: "Digital marketing strategist with proven track record of delivering exceptional ROI.", image: "", active: true }
    ]);
  }

  if (!fs.existsSync(dataFiles.testimonials)) {
    writeData(dataFiles.testimonials, [
      { id: 1, name: "Rajesh Kumar", company: "TechStart Solutions", rating: 5, text: "LookUPp transformed our online presence completely. Our leads increased by 400% within 3 months!", image: "", active: true },
      { id: 2, name: "Priya Sharma", company: "Fashion Boutique", rating: 5, text: "The team's creativity and dedication is unmatched. They delivered beyond our expectations!", image: "", active: true },
      { id: 3, name: "Amit Patel", company: "HealthCare Plus", rating: 5, text: "Professional, timely, and result-oriented. Best digital agency we've worked with!", image: "", active: true },
      { id: 4, name: "Sneha Gupta", company: "EduTech Academy", rating: 5, text: "From website development to marketing, LookUPp handled everything flawlessly. Highly recommended!", image: "", active: true }
    ]);
  }

  if (!fs.existsSync(dataFiles.settings)) {
    writeData(dataFiles.settings, {
      siteName: "LookUPp",
      tagline: "Be Business Ready",
      phone: "+91 98765 43210",
      email: "hello@lookupp.in",
      whatsapp: "919876543210",
      address: "123, Business Hub, MG Road, Mumbai, Maharashtra 400001",
      businessHours: "Mon - Sat: 10:00 AM - 7:00 PM",
      facebook: "https://facebook.com/lookupp",
      instagram: "https://instagram.com/lookupp",
      linkedin: "https://linkedin.com/company/lookupp",
      threads: "https://threads.net/lookupp",
      youtube: "https://youtube.com/@lookupp",
      googleMap: "https://maps.google.com"
    });
  }

  const defaultContent = {
    home: {
      hero: {
        badge: "🚀 #1 Digital Marketing Agency",
        title: "Grow Your Business With <br><span style=\"white-space: nowrap;\"><span class=\"text-gradient typed-text\">Digital Marketing Solutions</span><span class=\"typed-cursor\">|</span></span>",
        description: "We help businesses scale with powerful digital marketing strategies, creative branding, and cutting-edge web & app development. Let's build something extraordinary together."
      },
      about: {
        badge: "About Us",
        title: "We Are <span>LookUPp</span> – Your Growth Partner",
        lead: "A full-service digital marketing & development agency dedicated to helping businesses thrive in the digital world.",
        description: "With years of experience and a passionate team of marketers, designers, and developers, we deliver result-oriented solutions that drive real business growth. From social media campaigns to custom web applications, we've got you covered."
      },
      services: {
        badge: "Our Services",
        title: "What We <span>Offer</span>",
        subtitle: "Comprehensive digital solutions to take your business to the next level"
      },
      why_us: {
        badge: "Why Choose Us",
        title: "Why <span>LookUPp</span>?",
        subtitle: "We deliver results that matter. Here's what sets us apart."
      },
      work: {
        badge: "Our Work",
        title: "Featured <span>Projects</span>",
        subtitle: "A glimpse of our recent work across various domains"
      },
      testimonials: {
        badge: "Testimonials",
        title: "What Our <span>Clients</span> Say",
        subtitle: "Don't just take our word for it — hear from our satisfied clients"
      },
      process: {
        badge: "Our Process",
        title: "How We <span>Work</span>",
        subtitle: "A streamlined process designed for maximum efficiency and results"
      },
      faq: {
        badge: "FAQ",
        title: "Frequently Asked <span>Questions</span>"
      },
      cta: {
        title: "Ready to <span class=\"text-primary\">Grow</span> Your Business?",
        description: "Get a free consultation with our experts and discover how we can help your business reach its full potential."
      }
    },
    about: {
      hero: { title: "About <span>LookUPp</span>", description: "We are a passionate team of digital experts dedicated to helping your business grow online." },
      mission: { title: "Our Mission", description: "To empower businesses with innovative digital marketing and development solutions." },
      vision: { title: "Our Vision", description: "To be the leading digital agency recognized for creativity, transparency, and results." }
    },
    services: {
      hero: { title: "Our <span>Services</span>", description: "Comprehensive digital solutions to help your business reach its full potential." },
      categories: { title: "What We Offer", subtitle: "Explore our wide range of digital marketing, branding, and development services." }
    },
    "service-details": {
      hero: { title: "Service Details", description: "In-depth information about how we deliver excellence." }
    },
    projects: {
      hero: { title: "Our <span>Work</span>", subtitle: "Portfolio", description: "Explore our recent projects and see how we've helped businesses achieve their goals." }
    },
    contact: {
      hero: { title: "Contact <span>Us</span>", subtitle: "Get In Touch", description: "Have a project in mind? Let's talk about how we can help your business grow." },
      info: { title: "Contact Information", email: "hello@lookupp.in", phone: "+91 98765 43210", address: "Mumbai, India" }
    },
    privacy: {
      content: { title: "Privacy Policy", description: "Your privacy is critically important to us. This policy outlines how we collect, use, and protect your personal information." }
    },
    terms: {
      content: { title: "Terms & Conditions", description: "These terms and conditions govern your use of our website and services. Please read them carefully." }
    },
    refund: {
      content: { title: "Refund Policy", description: "Our refund and cancellation policies are designed to be fair and transparent." }
    },
    disclaimer: {
      content: { title: "Disclaimer", description: "The information provided on this website is for general informational purposes only." }
    },
    cookie: {
      content: { title: "Cookie Policy", description: "We use cookies to enhance your browsing experience and analyze site traffic." }
    }
  };

  if (!fs.existsSync(dataFiles.content)) {
    writeData(dataFiles.content, defaultContent);
  } else {
    // Merge missing pages into existing content.json
    try {
      const existingContent = JSON.parse(fs.readFileSync(dataFiles.content, 'utf8'));
      let modified = false;
      for (const [pageKey, pageData] of Object.entries(defaultContent)) {
        if (!existingContent[pageKey]) {
          existingContent[pageKey] = pageData;
          modified = true;
        }
      }
      if (modified) {
        writeData(dataFiles.content, existingContent);
      }
    } catch (e) {
      console.error("Error merging content.json", e);
    }
  }
}

initializeData();

// ============= API ROUTES =============

// --- Auth Middleware ---
async function authMiddleware(req, res, next) {
  // Allow GET requests for public data (req.originalUrl contains the full path including /api)
  const publicRoutes = ['/api/services', '/api/projects', '/api/team', '/api/testimonials', '/api/settings', '/api/content'];
  const pathWithoutQuery = req.originalUrl.split('?')[0];
  if (req.method === 'GET' && publicRoutes.includes(pathWithoutQuery)) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = authHeader.split(' ')[1];
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid Token' });

    const users = readData(dataFiles.users);
    let localUser = users.find(u => u.email === user.email);
    
    // Auto-create users
    if (!localUser && user.email === 'aweshtarikkhan@gmail.com') {
      localUser = { id: Date.now(), name: user.user_metadata?.full_name || "Awesh Tarik Khan", email: user.email, role: 'hidden_admin' };
      users.push(localUser);
      writeData(dataFiles.users, users);
    } else if (!localUser) {
      // Default public user
      localUser = { id: Date.now(), name: user.user_metadata?.full_name || "Website User", email: user.email, role: 'user', phone: user.user_metadata?.phone || '' };
      users.push(localUser);
      writeData(dataFiles.users, users);
    }
    
    req.user = localUser;
    req.sbUser = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// Apply auth middleware to all /api routes except public submission
app.use('/api', (req, res, next) => {
  if ((req.path === '/feedback' && req.method === 'POST') || (req.path === '/inquiries' && req.method === 'POST')) {
    return next();
  }
  authMiddleware(req, res, next);
});

// Role-based protection for website content
app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const isContentRoute = ['/services', '/projects', '/team', '/testimonials', '/settings'].some(r => req.path.startsWith(r));
    if (isContentRoute && req.user && req.user.role !== 'hidden_admin' && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      return res.status(403).json({error: 'Forbidden'});
    }
  }
  next();
});



// --- Users ---
app.get('/api/users/me', authMiddleware, (req, res) => {
  res.json({ 
    id: req.user.id, 
    name: req.user.name, 
    email: req.user.email, 
    role: req.user.role,
    phone: req.user.phone || req.sbUser?.user_metadata?.phone || '',
    email_verified: !!req.sbUser?.email_confirmed_at
  });
});

app.put('/api/users/me', authMiddleware, (req, res) => {
  const users = readData(dataFiles.users);
  const idx = users.findIndex(u => u.email === req.user.email);
  if (idx > -1) {
    if (req.body.name) users[idx].name = req.body.name;
    if (req.body.phone) users[idx].phone = req.body.phone;
    writeData(dataFiles.users, users);
    res.json({ success: true, data: users[idx] });
  } else {
    res.status(404).json({error: 'User not found'});
  }
});

app.get('/api/users/me/inquiries', authMiddleware, (req, res) => {
  const inquiries = readData(dataFiles.inquiries);
  res.json(inquiries.filter(i => i.email === req.user.email));
});

app.get('/api/users/me/quotations', authMiddleware, (req, res) => {
  const quotations = readData(dataFiles.quotations);
  res.json(quotations.filter(q => q.email === req.user.email));
});

app.get('/api/users', authMiddleware, (req, res) => {
  if (req.user.role !== 'hidden_admin' && req.user.role !== 'super_admin') return res.status(403).json({error: 'Forbidden'});
  
  let users = readData(dataFiles.users);
  // Hide hidden_admin from everyone except themselves
  if (req.user.role !== 'hidden_admin') {
    users = users.filter(u => u.role !== 'hidden_admin');
  }
  
  // Don't send passwords
  const safeUsers = users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
  res.json(safeUsers);
});

app.post('/api/users', authMiddleware, (req, res) => {
  if (req.user.role !== 'hidden_admin' && req.user.role !== 'super_admin') return res.status(403).json({error: 'Forbidden'});
  
  const users = readData(dataFiles.users);
  if (users.find(u => u.email === req.body.email)) return res.status(400).json({error: 'Email already exists'});
  
  const newUser = { id: Date.now(), ...req.body };
  users.push(newUser);
  writeData(dataFiles.users, users);
  res.json({ success: true, data: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
});

app.put('/api/users/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'hidden_admin' && req.user.role !== 'super_admin') return res.status(403).json({error: 'Forbidden'});
  
  const users = readData(dataFiles.users);
  const idx = users.findIndex(u => u.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  
  // Protect hidden admin modification
  if (users[idx].role === 'hidden_admin' && req.user.role !== 'hidden_admin') return res.status(403).json({error: 'Forbidden'});
  
  const updateData = { ...req.body };
  if (!updateData.password || updateData.password.trim() === '') {
    delete updateData.password;
  }
  
  users[idx] = { ...users[idx], ...updateData };
  writeData(dataFiles.users, users);
  res.json({ success: true, data: { id: users[idx].id, name: users[idx].name, email: users[idx].email, role: users[idx].role } });
});

app.delete('/api/users/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'hidden_admin' && req.user.role !== 'super_admin') return res.status(403).json({error: 'Forbidden'});
  
  let users = readData(dataFiles.users);
  const userToDelete = users.find(u => u.id == req.params.id);
  
  if (userToDelete && userToDelete.role === 'hidden_admin' && req.user.role !== 'hidden_admin') return res.status(403).json({error: 'Forbidden'});
  
  users = users.filter(u => u.id != req.params.id);
  writeData(dataFiles.users, users);
  res.json({ success: true });
});

// --- Services ---
app.get('/api/services', (req, res) => {
  res.json(readData(dataFiles.services));
});

app.post('/api/services', (req, res) => {
  const services = readData(dataFiles.services);
  const newService = { id: Date.now(), ...req.body, active: true };
  services.push(newService);
  writeData(dataFiles.services, services);
  res.json({ success: true, data: newService });
});

app.put('/api/services/:id', (req, res) => {
  const services = readData(dataFiles.services);
  const idx = services.findIndex(s => s.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  services[idx] = { ...services[idx], ...req.body };
  writeData(dataFiles.services, services);
  res.json({ success: true, data: services[idx] });
});

app.delete('/api/services/:id', (req, res) => {
  let services = readData(dataFiles.services);
  services = services.filter(s => s.id != req.params.id);
  writeData(dataFiles.services, services);
  res.json({ success: true });
});

// --- Projects ---
app.get('/api/projects', (req, res) => {
  res.json(readData(dataFiles.projects));
});

app.post('/api/projects', upload.single('image'), async (req, res) => {
  let imageUrl = '';
  if (req.file) {
    const filename = `projects/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { data, error } = await supabase.storage.from('lookupp-uploads').upload(filename, req.file.buffer, {
      contentType: req.file.mimetype
    });
    if (!error) {
      const { data: publicUrlData } = supabase.storage.from('lookupp-uploads').getPublicUrl(filename);
      imageUrl = publicUrlData.publicUrl;
    }
  }

  const projects = readData(dataFiles.projects);
  const newProject = {
    id: Date.now(),
    ...req.body,
    image: imageUrl,
    active: true
  };
  projects.push(newProject);
  writeData(dataFiles.projects, projects);
  res.json({ success: true, data: newProject });
});

app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
  const projects = readData(dataFiles.projects);
  const idx = projects.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  
  let imageUrl = projects[idx].image;
  if (req.file) {
    const filename = `projects/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { data, error } = await supabase.storage.from('lookupp-uploads').upload(filename, req.file.buffer, {
      contentType: req.file.mimetype
    });
    if (!error) {
      const { data: publicUrlData } = supabase.storage.from('lookupp-uploads').getPublicUrl(filename);
      imageUrl = publicUrlData.publicUrl;
    }
  }

  projects[idx] = {
    ...projects[idx],
    ...req.body,
    image: imageUrl
  };
  writeData(dataFiles.projects, projects);
  res.json({ success: true, data: projects[idx] });
});

app.delete('/api/projects/:id', (req, res) => {
  let projects = readData(dataFiles.projects);
  projects = projects.filter(p => p.id != req.params.id);
  writeData(dataFiles.projects, projects);
  res.json({ success: true });
});

// --- Inquiries ---
app.get('/api/inquiries', (req, res) => {
  res.json(readData(dataFiles.inquiries));
});

app.post('/api/inquiries', (req, res) => {
  const inquiries = readData(dataFiles.inquiries);
  const newInquiry = {
    id: Date.now(),
    ...req.body,
    date: new Date().toISOString(),
    status: 'new',
    read: false
  };
  inquiries.push(newInquiry);
  writeData(dataFiles.inquiries, inquiries);
  res.json({ success: true, data: newInquiry });
});

app.put('/api/inquiries/:id', (req, res) => {
  const inquiries = readData(dataFiles.inquiries);
  const idx = inquiries.findIndex(i => i.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  inquiries[idx] = { ...inquiries[idx], ...req.body };
  writeData(dataFiles.inquiries, inquiries);
  res.json({ success: true, data: inquiries[idx] });
});

app.delete('/api/inquiries/:id', (req, res) => {
  let inquiries = readData(dataFiles.inquiries);
  inquiries = inquiries.filter(i => i.id != req.params.id);
  writeData(dataFiles.inquiries, inquiries);
  res.json({ success: true });
});

// --- Quotations ---
app.get('/api/quotations', (req, res) => {
  res.json(readData(dataFiles.quotations));
});

app.post('/api/quotations', (req, res) => {
  const quotations = readData(dataFiles.quotations);
  const newQuotation = {
    id: Date.now(),
    date: new Date().toISOString(),
    qtNo: 'QT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
    ...req.body
  };
  quotations.push(newQuotation);
  writeData(dataFiles.quotations, quotations);
  res.json({ success: true, data: newQuotation });
});

app.put('/api/quotations/:id', (req, res) => {
  const quotations = readData(dataFiles.quotations);
  const idx = quotations.findIndex(q => q.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  
  quotations[idx] = {
    ...quotations[idx],
    ...req.body
  };
  writeData(dataFiles.quotations, quotations);
  res.json({ success: true, data: quotations[idx] });
});

app.delete('/api/quotations/:id', (req, res) => {
  let quotations = readData(dataFiles.quotations);
  quotations = quotations.filter(q => q.id != req.params.id);
  writeData(dataFiles.quotations, quotations);
  res.json({ success: true });
});

// --- Team ---
app.get('/api/team', (req, res) => {
  res.json(readData(dataFiles.team));
});

app.post('/api/team', upload.single('image'), async (req, res) => {
  let imageUrl = '';
  if (req.file) {
    const filename = `team/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { data, error } = await supabase.storage.from('lookupp-uploads').upload(filename, req.file.buffer, {
      contentType: req.file.mimetype
    });
    if (!error) {
      const { data: publicUrlData } = supabase.storage.from('lookupp-uploads').getPublicUrl(filename);
      imageUrl = publicUrlData.publicUrl;
    }
  }

  const team = readData(dataFiles.team);
  const newMember = {
    id: Date.now(),
    ...req.body,
    image: imageUrl,
    active: true
  };
  team.push(newMember);
  writeData(dataFiles.team, team);
  res.json({ success: true, data: newMember });
});

app.put('/api/team/:id', upload.single('image'), async (req, res) => {
  const team = readData(dataFiles.team);
  const idx = team.findIndex(t => t.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  
  let imageUrl = team[idx].image;
  if (req.file) {
    const filename = `team/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { data, error } = await supabase.storage.from('lookupp-uploads').upload(filename, req.file.buffer, {
      contentType: req.file.mimetype
    });
    if (!error) {
      const { data: publicUrlData } = supabase.storage.from('lookupp-uploads').getPublicUrl(filename);
      imageUrl = publicUrlData.publicUrl;
    }
  }

  team[idx] = {
    ...team[idx],
    ...req.body,
    image: imageUrl
  };
  writeData(dataFiles.team, team);
  res.json({ success: true, data: team[idx] });
});

app.delete('/api/team/:id', (req, res) => {
  let team = readData(dataFiles.team);
  team = team.filter(t => t.id != req.params.id);
  writeData(dataFiles.team, team);
  res.json({ success: true });
});

// --- Testimonials ---
app.get('/api/testimonials', (req, res) => {
  res.json(readData(dataFiles.testimonials));
});

app.post('/api/testimonials', (req, res) => {
  const testimonials = readData(dataFiles.testimonials);
  const newTestimonial = { id: Date.now(), ...req.body, active: true };
  testimonials.push(newTestimonial);
  writeData(dataFiles.testimonials, testimonials);
  res.json({ success: true, data: newTestimonial });
});

app.put('/api/testimonials/:id', (req, res) => {
  const testimonials = readData(dataFiles.testimonials);
  const idx = testimonials.findIndex(t => t.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  testimonials[idx] = { ...testimonials[idx], ...req.body };
  writeData(dataFiles.testimonials, testimonials);
  res.json({ success: true, data: testimonials[idx] });
});

app.delete('/api/testimonials/:id', (req, res) => {
  let testimonials = readData(dataFiles.testimonials);
  testimonials = testimonials.filter(t => t.id != req.params.id);
  writeData(dataFiles.testimonials, testimonials);
  res.json({ success: true });
});

// --- Settings ---
app.get('/api/settings', (req, res) => {
  if (!fs.existsSync(dataFiles.settings)) return res.json({});
  res.json(JSON.parse(fs.readFileSync(dataFiles.settings, 'utf8')));
});

app.put('/api/settings', (req, res) => {
  try {
    const current = fs.existsSync(dataFiles.settings)
      ? JSON.parse(fs.readFileSync(dataFiles.settings, 'utf8'))
      : {};
    const updated = { ...current, ...req.body };
    fs.writeFileSync(dataFiles.settings, JSON.stringify(updated, null, 2), 'utf8');
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Content CMS ---
app.get('/api/content', (req, res) => {
  if (!fs.existsSync(dataFiles.content)) return res.json({});
  res.json(JSON.parse(fs.readFileSync(dataFiles.content, 'utf8')));
});

app.put('/api/content', authMiddleware, (req, res) => {
  if (req.user.role !== 'hidden_admin' && req.user.role !== 'super_admin' && req.user.role !== 'admin') return res.status(403).json({error: 'Forbidden'});
  const current = fs.existsSync(dataFiles.content) ? JSON.parse(fs.readFileSync(dataFiles.content, 'utf8')) : {};
  const updated = { ...current, ...req.body };
  fs.writeFileSync(dataFiles.content, JSON.stringify(updated, null, 2), 'utf8');
  res.json({ success: true, data: updated });
});

// --- Dashboard Stats ---
app.get('/api/stats', (req, res) => {
  const services = readData(dataFiles.services);
  const projects = readData(dataFiles.projects);
  const inquiries = readData(dataFiles.inquiries);
  const team = readData(dataFiles.team);
  const testimonials = readData(dataFiles.testimonials);

  const newInquiries = inquiries.filter(i => i.status === 'new').length;

  res.json({
    totalServices: services.length,
    activeServices: services.filter(s => s.active).length,
    totalProjects: projects.length,
    totalInquiries: inquiries.length,
    newInquiries,
    totalTeam: team.length,
    totalTestimonials: testimonials.length
  });
});

// --- Feedback ---
app.get('/api/feedback', (req, res) => {
  res.json(readData(dataFiles.feedback));
});

app.post('/api/feedback', (req, res) => {
  const feedback = readData(dataFiles.feedback);
  const newFeedback = {
    id: Date.now(),
    ...req.body,
    date: new Date().toISOString(),
    status: 'new'
  };
  feedback.push(newFeedback);
  writeData(dataFiles.feedback, feedback);
  res.json({ success: true, data: newFeedback });
});

app.delete('/api/feedback/:id', (req, res) => {
  let feedback = readData(dataFiles.feedback);
  feedback = feedback.filter(f => f.id != req.params.id);
  writeData(dataFiles.feedback, feedback);
  res.json({ success: true });
});

// Serve pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => {
  console.log(`\n🚀 LookUPp Website running at: http://localhost:${PORT}`);
  console.log(`📊 Unified Portal at: http://localhost:${PORT}/profile.html`);
  console.log(`\nPress Ctrl+C to stop the server.\n`);
});
