require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const slugify = require('./utils/slugify');

const categoriesData = [
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop' },
  { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop' },
  { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop' },
  { name: 'Beauty & Health', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=300&fit=crop' },
  { name: 'Sports & Outdoors', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop' },
  { name: 'Books & Stationery', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop' },
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
      { name: 'Wireless Bluetooth Headphones', price: 4999, discountPrice: 3499, category: catDocs[0]._id, stock: 50, isFeatured: true, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'] },
      { name: 'Smart Fitness Watch', price: 8999, discountPrice: 6999, category: catDocs[0]._id, stock: 30, isFeatured: true, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'] },
      { name: "Men's Casual Denim Jacket", price: 3499, category: catDocs[1]._id, stock: 40, isFeatured: true, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop'] },
      { name: "Women's Summer Floral Dress", price: 2799, discountPrice: 1999, category: catDocs[1]._id, stock: 25, isFeatured: true, images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop'] },
      { name: 'Non-Stick Cookware Set (5pc)', price: 5499, category: catDocs[2]._id, stock: 20, images: ['https://images.unsplash.com/photo-1584990347449-a5d9f800a783?w=500&h=500&fit=crop'] },
      { name: 'LED Table Lamp', price: 1299, category: catDocs[2]._id, stock: 60, images: ['https://images.unsplash.com/photo-1543198126-42aab476651f?w=500&h=500&fit=crop'] },
      { name: 'Organic Face Serum', price: 1899, discountPrice: 1499, category: catDocs[3]._id, stock: 45, isFeatured: true, images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop'] },
      { name: 'Herbal Shampoo & Conditioner Set', price: 1599, category: catDocs[3]._id, stock: 35, images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop'] },
      { name: 'Yoga Mat with Carry Strap', price: 1999, category: catDocs[4]._id, stock: 40, images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop'] },
      { name: 'Adjustable Dumbbell Set', price: 6999, category: catDocs[4]._id, stock: 15, images: ['https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=500&h=500&fit=crop'] },
      { name: 'Bestselling Novel Collection (3 Books)', price: 2199, category: catDocs[5]._id, stock: 50, images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop'] },
      { name: 'Premium Leather Notebook', price: 899, discountPrice: 699, category: catDocs[5]._id, stock: 70, images: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&h=500&fit=crop'] },
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
