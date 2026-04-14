import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String,
  companyName: String,
  address: String,
  taxId: String,
  country: { type: String, default: 'India' },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  googleId: String
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Explicit collection name 'user' as requested
const User = mongoose.model('User', userSchema, 'user');
export default User;
