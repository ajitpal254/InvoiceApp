import express from 'express';
import { Invoice } from '../models/Invoice.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all invoices for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(invoices);
  } catch (err) {
    console.error('Fetch invoices error:', err);
    return res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

// Save or create new invoice
router.post('/', authMiddleware, async (req, res) => {
  try {
    const invoiceData = req.body;
    
    // Check if updating existing by invoiceNumber or creating new
    const invoice = new Invoice({
      userId: req.user.id,
      docType: invoiceData.docType || 'gst_invoice',
      invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now()}`,
      invoiceDate: invoiceData.invoiceDate,
      companyName: invoiceData.companyName,
      senderInfo: invoiceData.senderInfo,
      senderGstin: invoiceData.senderGstin,
      recipientName: invoiceData.recipientName,
      recipientInfo: invoiceData.recipientInfo,
      recipientGstin: invoiceData.recipientGstin,
      currency: invoiceData.currency || 'INR',
      taxRate: invoiceData.taxRate || 18,
      subtotal: invoiceData.subtotal || 0,
      taxAmount: invoiceData.taxAmount || 0,
      grandTotal: invoiceData.grandTotal || 0,
      items: invoiceData.items || [],
      rawState: invoiceData
    });

    await invoice.save();
    return res.status(201).json(invoice);
  } catch (err) {
    console.error('Save invoice error:', err);
    return res.status(500).json({ message: 'Failed to save invoice' });
  }
});

// Delete invoice by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) {
      return res.status(404).json({ message: 'Invoice not found or unauthorized' });
    }
    return res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    console.error('Delete invoice error:', err);
    return res.status(500).json({ message: 'Failed to delete invoice' });
  }
});

export default router;
