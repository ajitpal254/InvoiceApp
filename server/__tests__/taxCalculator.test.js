import { describe, it, expect } from 'vitest';
import { calculateInvoiceTotals, roundToTwoDecimals } from '../utils/taxCalculator.js';

describe('Tax & Financial Calculator', () => {
  it('should round numbers to two decimal places cleanly', () => {
    expect(roundToTwoDecimals(10.126)).toBe(10.13);
    expect(roundToTwoDecimals(10.124)).toBe(10.12);
    expect(roundToTwoDecimals(0.1 + 0.2)).toBe(0.3);
  });

  it('should calculate GST invoice totals with IGST correctly', () => {
    const invoiceData = {
      docType: 'gst_invoice',
      senderStateCode: '07', // Delhi
      recipientStateCode: '27', // Maharashtra (Inter-state -> IGST)
      items: [
        { qty: 2, price: 500, discRate: 10, taxRate: 18 }
      ],
      discountType: 'amount',
      discountValue: 0
    };

    // Item 1: 2 * 500 * (1 - 0.1) = 900
    // Subtotal = 900
    // Tax (18% IGST) = 162
    // Grand Total = 1062
    const result = calculateInvoiceTotals(invoiceData);

    expect(result.subtotal).toBe(900);
    expect(result.taxableAmount).toBe(900);
    expect(result.isIgst).toBe(true);
    expect(result.igstAmount).toBe(162);
    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);
    expect(result.taxAmount).toBe(162);
    expect(result.grandTotal).toBe(1062);
  });

  it('should split tax into CGST and SGST for intra-state GST invoice', () => {
    const invoiceData = {
      docType: 'gst_invoice',
      senderStateCode: '07',
      recipientStateCode: '07', // Intra-state -> CGST + SGST
      items: [
        { qty: 1, price: 1000, discRate: 0, taxRate: 18 }
      ]
    };

    const result = calculateInvoiceTotals(invoiceData);

    expect(result.subtotal).toBe(1000);
    expect(result.isIgst).toBe(false);
    expect(result.cgstAmount).toBe(90);
    expect(result.sgstAmount).toBe(90);
    expect(result.taxAmount).toBe(180);
    expect(result.grandTotal).toBe(1180);
  });

  it('should apply overall percentage and amount discounts accurately', () => {
    const invoiceData = {
      docType: 'standard_invoice',
      items: [
        { qty: 10, price: 100, discRate: 0, taxRate: 10 }
      ],
      discountType: 'percent',
      discountValue: 20 // 20% discount on 1000 subtotal = 200 discount -> 800 taxable
    };

    const result = calculateInvoiceTotals(invoiceData);

    expect(result.subtotal).toBe(1000);
    expect(result.discountAmount).toBe(200);
    expect(result.taxableAmount).toBe(800);
    expect(result.taxAmount).toBe(80); // 10% of 800
    expect(result.grandTotal).toBe(880);
  });

  it('should handle empty or invalid items gracefully', () => {
    const result = calculateInvoiceTotals({ docType: 'gst_invoice', items: [] });
    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.grandTotal).toBe(0);
  });
});
