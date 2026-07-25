const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  storeName: { type: String, default: '' },
  storeDescription: { type: String, default: '' },
  sellerStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
