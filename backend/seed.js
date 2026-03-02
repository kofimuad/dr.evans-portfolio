require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Page = require('./models/Page');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  // Create admin user
  const existingUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existingUser) {
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    console.log('✅ Admin user created');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Seed default pages
  const pages = [
    {
      slug: 'about',
      title: 'About',
      content: {
        heading: 'About Me',
        bio: 'I am a researcher focused on wood science and forestry.',
        education: [],
        interests: [],
      },
    },
    {
      slug: 'home',
      title: 'Home',
      content: {
        heroHeading: 'Exploring the World Through Wood',
        heroSubheading: 'Research at the intersection of forestry, construction, and industrialization.',
      },
    },
  ];

  for (const page of pages) {
    const exists = await Page.findOne({ slug: page.slug });
    if (!exists) {
      await Page.create(page);
      console.log(`✅ Page "${page.slug}" created`);
    } else {
      console.log(`ℹ️  Page "${page.slug}" already exists`);
    }
  }

  console.log('\n🌲 Seed complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
