import mongoose from 'mongoose';

const invoiceUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    default: ''
  },
  companyName: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  taxId: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  verificationToken: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'invoice_users' // Dedicated collection for Invoice App users
});

export const InvoiceUser = mongoose.model('InvoiceUser', invoiceUserSchema, 'invoice_users');
export const User = InvoiceUser;
