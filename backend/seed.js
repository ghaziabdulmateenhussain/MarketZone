require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const slugify = require('./utils/slugify');

const categoriesData = [
  { name: 'Electronics', image: 'https://loremflickr.com/400/300/electronics' },
  { name: 'Fashion', image: 'https://loremflickr.com/400/300/fashion' },
  { name: 'Home & Living', image: 'https://loremflickr.com/400/300/homedecor' },
  { name: 'Beauty & Health', image: 'https://loremflickr.com/400/300/cosmetics' },
  { name: 'Sports & Outdoors', image: 'https://loremflickr.com/400/300/sports' },
  { name: 'Books & Stationery', image: 'https://loremflickr.com/400/300/books' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  const adminEmail = process.env.ADMIN_EMAIL || 'ghaziabdulmateen786@gmail.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'MarketZone Admin', email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'iloveAllah', role: 'admin',
    });
    console.log('Admin created:', adminEmail);
  }

  let seller = await User.findOne({ email: 'seller@marketzone.com' });
  if (!seller) {
    seller = await User.create({
      name: 'Demo Seller', email: 'seller@marketzone.com', password: 'seller123',
      role: 'seller', sellerStatus: 'approved', storeName: 'Demo Store', phone: '03001234567', city: 'Lahore',
    });
    console.log('Demo seller created: seller@marketzone.com / seller123');
  }

  let customer = await User.findOne({ email: 'customer@marketzone.com' });
  if (!customer) {
    customer = await User.create({
      name: 'Demo Customer', email: 'customer@marketzone.com', password: 'customer123', role: 'customer',
    });
    console.log('Demo customer created: customer@marketzone.com / customer123');
  }

  const catDocs = [];
  for (const c of categoriesData) {
    let cat = await Category.findOne({ name: c.name });
    if (!cat) cat = await Category.create({ ...c, slug: slugify(c.name) });
    catDocs.push(cat);
  }
  console.log('Categories ready:', catDocs.length);

  const existingProducts = await Product.countDocuments();
  if (existingProducts === 0) {
    const sampleProducts = [
      { name: 'Wireless Bluetooth Headphones', price: 4999, discountPrice: 3499, category: catDocs[0]._id, stock: 50, isFeatured: true, images: ['https://loremflickr.com/500/500/headphones'] },
      { name: 'Smart Fitness Watch', price: 8999, discountPrice: 6999, category: catDocs[0]._id, stock: 30, isFeatured: true, images: ['https://loremflickr.com/500/500/smartwatch'] },
      { name: "Men's Casual Denim Jacket", price: 3499, category: catDocs[1]._id, stock: 40, isFeatured: true, images: ['https://loremflickr.com/500/500/denimjacket'] },
      { name: "Women's Summer Floral Dress", price: 2799, discountPrice: 1999, category: catDocs[1]._id, stock: 25, isFeatured: true, images: ['https://loremflickr.com/500/500/summerdress'] },
      { name: 'Non-Stick Cookware Set (5pc)', price: 5499, category: catDocs[2]._id, stock: 20, images: ['https://loremflickr.com/500/500/cookware'] },
      { name: 'LED Table Lamp', price: 1299, category: catDocs[2]._id, stock: 60, images: ['https://loremflickr.com/500/500/tablelamp'] },
      { name: 'Organic Face Serum', price: 1899, discountPrice: 1499, category: catDocs[3]._id, stock: 45, isFeatured: true, images: ['https://loremflickr.com/500/500/faceserum'] },
      { name: 'Herbal Shampoo & Conditioner Set', price: 1599, category: catDocs[3]._id, stock: 35, images: ['https://loremflickr.com/500/500/shampoo'] },
      { name: 'Yoga Mat with Carry Strap', price: 1999, category: catDocs[4]._id, stock: 40, images: ['https://loremflickr.com/500/500/yogamat'] },
      { name: 'Adjustable Dumbbell Set', price: 6999, category: catDocs[4]._id, stock: 15, images: ['https://loremflickr.com/500/500/dumbbell'] },
      { name: 'Bestselling Novel Collection (3 Books)', price: 2199, category: catDocs[5]._id, stock: 50, images: ['https://loremflickr.com/500/500/novelbooks'] },
      { name: 'Premium Leather Notebook', price: 899, discountPrice: 699, category: catDocs[5]._id, stock: 70, images: ['https://loremflickr.com/500/500/notebook'] },
    ];
    for (const p of sampleProducts) {
      await Product.create({
        ...p, seller: seller._id, slug: slugify(p.name),
        description: `${p.name} - premium quality, fast shipping, and trusted by thousands of MarketZone customers. Brand new with full warranty where applicable.`,
        status: 'approved', brand: 'MarketZone Basics', rating: 4 + Math.random(), numReviews: Math.floor(Math.random() * 50),
      });
    }
    console.log('Sample products created:', sampleProducts.length);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
