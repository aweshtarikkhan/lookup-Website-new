const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const initialContent = {
  home: {
    hero: {
      badge: "🚀 #1 Digital Marketing Agency",
      title: "Grow Your Business With <br><span style=\"white-space: nowrap;\"><span class=\"text-gradient typed-text\">Digital Marketing Solutions</span><span class=\"typed-cursor\">|</span></span>",
      description: "We help businesses scale with powerful digital marketing strategies, creative branding, and cutting-edge web & app development. Let's build something extraordinary together.",
      typingLines: "Digital Marketing Solutions,Creative Branding Services,Website & App Development,Performance Marketing,Business Growth Partner"
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
    cta: {
      title: "Ready to <span class=\"text-primary\">Grow</span> Your Business?",
      description: "Get a free consultation with our experts and discover how we can help your business reach its full potential."
    }
  },
  about: {
    hero: {
      title: "About <span class=\"text-primary\">Us</span>",
      description: "Founded with a vision to make digital marketing and technology accessible to every business, LookUPp has grown into a trusted agency serving clients across industries. We believe in the power of creativity, data, and technology to transform businesses."
    },
    section1: {
      title: "We Are <span>LookUPp</span>",
      subtitle: "A talented team of professionals dedicated to your success"
    },
    section2: {
      title: "Our <span>Purpose</span>"
    },
    section3: {
      title: "Founder's <span>Message</span>"
    },
    section4: {
      title: "Meet The <span>Experts</span>"
    },
    section5: {
      title: "Agency <span>Timeline</span>"
    },
    section6: {
      title: "Numbers That <span>Speak</span>"
    }
  },
  services: {
    hero: {
      title: "Our <span class=\"text-primary\">Services</span>",
      description: "10 specialized marketing services to grow your business online."
    }
  },
  our_work: {
    hero: {
      title: "Our <span class=\"text-primary\">Work</span>",
      description: "Let's bring your ideas to life. Get a free consultation today."
    }
  },
  contact: {
    hero: {
      title: "Contact <span class=\"text-primary\">Us</span>",
      description: "<a href=\"tel:+919876543210\">+91 98765 43210</a>"
    }
  }
};

open({filename:'database.sqlite', driver:sqlite3.Database}).then(async db => {
  const jsonStr = JSON.stringify(initialContent);
  await db.run(`INSERT INTO key_value_store (id, data) VALUES ('content', ?) ON CONFLICT(id) DO UPDATE SET data = ?`, [jsonStr, jsonStr]);
  console.log('Seeded CMS content');
});
