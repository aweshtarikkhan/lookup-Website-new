const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const servicesData = [
  { name: 'Social Media Management', category: 'social-media', icon: '📱', description: 'Complete social media strategy, content creation, and community management.', active: 1 },
  { name: 'Search Engine Optimization', category: 'seo', icon: '🚀', description: 'Data-driven SEO strategies to improve your search rankings and visibility.', active: 1 },
  { name: 'Performance Marketing', category: 'marketing', icon: '📈', description: 'High-ROI ad campaigns on Google, Facebook, and Instagram.', active: 1 },
  { name: 'Web & App Development', category: 'development', icon: '💻', description: 'Custom, responsive, and high-performance websites and applications.', active: 1 },
  { name: 'Brand Identity Design', category: 'branding', icon: '🎨', description: 'Logos, branding guidelines, and visual assets that tell your story.', active: 1 },
  { name: 'Video Production', category: 'video', icon: '🎥', description: 'Engaging video content, reels, and commercial shoots.', active: 1 }
];

const projectsData = [
  { title: 'E-Commerce Growth', category: 'marketing', image: '/assets/images/portfolio/1.jpg', description: 'Increased ROAS by 3.5x for a fashion retail brand.', active: 1 },
  { title: 'Tech Startup Branding', category: 'branding', image: '/assets/images/portfolio/2.jpg', description: 'Complete brand identity and website for a SaaS company.', active: 1 },
  { title: 'Real Estate App', category: 'development', image: '/assets/images/portfolio/3.jpg', description: 'Custom property listing platform with advanced search.', active: 1 },
  { title: 'Social Media Campaign', category: 'social-media', image: '/assets/images/portfolio/4.jpg', description: 'Viral campaign that generated 50K+ engaged followers.', active: 1 },
  { title: 'Local SEO Dominance', category: 'seo', image: '/assets/images/portfolio/5.jpg', description: 'Ranked #1 for 15+ highly competitive local keywords.', active: 1 },
  { title: 'Corporate Video', category: 'video', image: '/assets/images/portfolio/6.jpg', description: 'Award-winning brand documentary for a manufacturing giant.', active: 1 }
];

const teamData = [
  { name: 'Awesh Tarik Khan', role: 'Founder & CEO', bio: 'Digital strategist with 10+ years of experience.', image: '/assets/images/team/awesh.jpg', active: 1 },
  { name: 'Sarah Miller', role: 'Creative Director', bio: 'Award-winning designer with a passion for brands.', image: '/assets/images/team/2.jpg', active: 1 },
  { name: 'David Chen', role: 'Head of Growth', bio: 'Data-driven marketer specializing in paid acquisition.', image: '/assets/images/team/3.jpg', active: 1 },
  { name: 'Priya Sharma', role: 'Lead Developer', bio: 'Full-stack expert building scalable web solutions.', image: '/assets/images/team/4.jpg', active: 1 }
];

const testimonialsData = [
  { client_name: 'Rahul Desai', company: 'TechNova Solutions', feedback: 'LookUPp completely transformed our digital presence. Our leads increased by 150% in just 3 months!', rating: 5, active: 1 },
  { client_name: 'Anita Kapoor', company: 'FreshBites Cafe', feedback: 'The social media strategy they implemented brought a completely new demographic to our restaurants.', rating: 5, active: 1 },
  { client_name: 'Vikram Singh', company: 'Apex Real Estate', feedback: 'Their web development team is top-notch. They delivered a complex property portal ahead of schedule.', rating: 5, active: 1 },
  { client_name: 'Elena Rodriguez', company: 'StyleIcon Boutique', feedback: 'The ROAS we are seeing from their Facebook ad campaigns is simply unbelievable. Highly recommended!', rating: 5, active: 1 }
];

async function seedData() {
  const db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  for (let s of servicesData) {
    await db.run('INSERT INTO services (name, category, icon, description, active) VALUES (?, ?, ?, ?, ?)', [s.name, s.category, s.icon, s.description, s.active]);
  }
  for (let p of projectsData) {
    await db.run('INSERT INTO projects (title, category, image, description, active) VALUES (?, ?, ?, ?, ?)', [p.title, p.category, p.image, p.description, p.active]);
  }
  for (let t of teamData) {
    await db.run('INSERT INTO team (name, role, bio, image, active) VALUES (?, ?, ?, ?, ?)', [t.name, t.role, t.bio, t.image, t.active]);
  }
  for (let test of testimonialsData) {
    await db.run('INSERT INTO testimonials (client_name, company, feedback, rating, active) VALUES (?, ?, ?, ?, ?)', [test.client_name, test.company, test.feedback, test.rating, test.active]);
  }

  console.log("Database tables seeded successfully!");
}

seedData().catch(console.error);
