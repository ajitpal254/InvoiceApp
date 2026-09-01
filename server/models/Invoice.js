import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvoiceUser',
    required: true,
    index: true
  },
  docType: {
    type: String,
    enum: ['gst_invoice', 'eway_bill', 'proforma_invoice', 'commercial_invoice', 'standard_invoice'],
    default: 'gst_invoice'
  },
  invoiceNumber: {
    type: String,
    required: true,
    trim: true
  },
  invoiceDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  companyName: String,
  senderInfo: String,
  senderGstin: String,
  recipientName: String,
  recipientInfo: String,
  recipientGstin: String,
  currency: {
    type: String,
    default: 'INR'
  },
  taxRate: {
    type: Number,
    default: 18
  },
  subtotal: Number,
  taxAmount: Number,
  grandTotal: Number,
  items: [mongoose.Schema.Types.Mixed],
  // Store full state snapshot for faithful reload
  rawState: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  collection: 'invoices'
});

export const Invoice = mongoose.model('Invoice', invoiceSchema, 'invoices');
