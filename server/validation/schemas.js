import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters long').max(50),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().optional().default(''),
  companyName: z.string().optional().default(''),
  address: z.string().optional().default(''),
  taxId: z.string().optional().default(''),
  country: z.string().optional().default('')
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required')
});

const invoiceItemSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  description: z.string().optional().default(''),
  hsnCode: z.string().optional().default(''),
  qty: z.number().nonnegative().optional().default(1),
  unit: z.string().optional().default('PCS'),
  price: z.number().nonnegative().optional().default(0),
  discRate: z.number().min(0).max(100).optional().default(0),
  taxRate: z.number().min(0).max(100).optional().default(18)
}).passthrough();

export const invoiceCreateSchema = z.object({
  docType: z.enum(['gst_invoice', 'eway_bill', 'proforma_invoice', 'commercial_invoice', 'standard_invoice']).default('gst_invoice'),
  invoiceNumber: z.string().trim().optional(),
  invoiceDate: z.string().optional(),
  companyName: z.string().optional().default(''),
  senderInfo: z.string().optional().default(''),
  senderGstin: z.string().optional().default(''),
  senderStateCode: z.string().optional().default(''),
  recipientName: z.string().optional().default(''),
  recipientInfo: z.string().optional().default(''),
  recipientGstin: z.string().optional().default(''),
  recipientStateCode: z.string().optional().default(''),
  currency: z.string().optional().default('INR'),
  taxRate: z.number().min(0).max(100).optional().default(18),
  discountType: z.enum(['percent', 'amount']).optional().default('amount'),
  discountValue: z.number().nonnegative().optional().default(0),
  items: z.array(invoiceItemSchema).optional().default([])
}).passthrough();
