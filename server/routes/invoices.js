import express from 'express';
import { Invoice } from '../models/Invoice.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { invoiceCreateSchema } from '../validation/schemas.js';
import { calculateInvoiceTotals } from '../utils/taxCalculator.js';

const router = express.Router();

// Get all invoices for current user (with pagination support)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      Invoice.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments({ userId: req.user.id })
    ]);

    // If client requested unpaginated array (for backward compatibility), return array directly or formatted object
    if (req.query.page || req.query.limit) {
      return res.json({
        data: invoices,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    return res.json(invoices);
  } catch (err) {
    next(err);
  }
});

// Get single invoice by ID (ownership strictly enforced)
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found or unauthorized' });
    }
    return res.json(invoice);
  } catch (err) {
    next(err);
  }
});

// Save or create new invoice (Recalculate all financial totals server-side)
router.post('/', authMiddleware, validate(invoiceCreateSchema), async (req, res, next) => {
  try {
    const invoiceData = req.body;
    
    // Server-side recalculation of subtotal, tax amount, and grand total
    const computedTotals = calculateInvoiceTotals(invoiceData);

    const invoice = new Invoice({
      userId: req.user.id,
      docType: invoiceData.docType || 'gst_invoice',
      invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now()}`,
      invoiceDate: invoiceData.invoiceDate || new Date().toISOString().split('T')[0],
      companyName: invoiceData.companyName || '',
      senderInfo: invoiceData.senderInfo || '',
      senderGstin: invoiceData.senderGstin || '',
      recipientName: invoiceData.recipientName || '',
      recipientInfo: invoiceData.recipientInfo || '',
      recipientGstin: invoiceData.recipientGstin || '',
      currency: invoiceData.currency || 'INR',
      taxRate: invoiceData.taxRate !== undefined ? invoiceData.taxRate : 18,
      subtotal: computedTotals.subtotal,
      taxableAmount: computedTotals.taxableAmount,
      taxAmount: computedTotals.taxAmount,
      igstAmount: computedTotals.igstAmount,
      cgstAmount: computedTotals.cgstAmount,
      sgstAmount: computedTotals.sgstAmount,
      isIgst: computedTotals.isIgst,
      roundOff: computedTotals.roundOff,
      grandTotal: computedTotals.grandTotal,
      items: invoiceData.items || [],
      rawState: {
        ...invoiceData,
        ...computedTotals
      }
    });

    await invoice.save();
    return res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
});

// Delete invoice by ID (ownership strictly enforced)
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const result = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) {
      return res.status(404).json({ message: 'Invoice not found or unauthorized' });
    }
    return res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
