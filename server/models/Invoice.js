import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  description: String,
  qty: Number,
  price: Number
});

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sender: String,
  recipient: String,
  invoiceNumber: String,
  invoiceDate: String,
  items: [itemSchema],
  country: String,
  province: String,
  currency: String,
  themeColor: String,
  notes: String,
  paymentInfo: String,
  subtotal: Number,
  taxAmount: Number,
  grandTotal: Number
}, { timestamps: true });

// Forced collection name 'invoice' as requested
const Invoice = mongoose.model('Invoice', invoiceSchema, 'invoice');
export default Invoice;
