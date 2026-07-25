const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/email');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Please fill all required fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user._id);

    sendEmail({
      to: email,
      subject: 'Welcome to MarketZone',
      html: `<h2>Welcome, ${name}!</h2><p>Your MarketZone account has been created successfully.</p>`,
    });

    res.status(201).json({ user: user.toSafeObject(), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Your account has been disabled' });

    const token = generateToken(user._id);
    res.json({ user: user.toSafeObject(), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerSeller = async (req, res) => {
  try {
    const { storeName, storeDescription, phone, address, city } = req.body;
    const user = await User.findById(req.user._id);
    user.storeName = storeName;
    user.storeDescription = storeDescription;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.city = city || user.city;
    user.sellerStatus = 'pending';
    await user.save();

    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Seller Registration - MarketZone',
      html: `<h3>New seller application</h3><p><b>${user.name}</b> (${user.email}) wants to open store "<b>${storeName}</b>". Please review in the admin panel.</p>`,
    });

    res.json({ message: 'Seller application submitted. Await admin approval.', user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
