import { GLOBAL_TAX_RATES } from './config.js';
import { state } from './store.js';
import { numberToWordsIndian, numberToWordsInternational } from './numberToWords.js';

export function calculateTotals() {
  const isExport = state.senderCountry !== state.recipientCountry || state.docType === 'gst_invoice' || state.docType === 'commercial_invoice' || state.docType === 'proforma_invoice';
  
  // Total Quantity across items
  const totalQty = state.items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);
  
  // Taxable subtotal & item-level taxes
  let rawTaxAmount = 0;
  let primaryTaxRate = null;

  const subtotal = state.items.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    const itemDisc = parseFloat(item.discRate) || 0;
    const itemNet = (qty * price) * (1 - itemDisc / 100);

    const itemRate = (item.taxRate !== undefined && item.taxRate !== null && item.taxRate !== '')
      ? (parseFloat(item.taxRate) || 0)
      : (parseFloat(state.taxRate) || 0);

    if (primaryTaxRate === null) {
      primaryTaxRate = itemRate;
    }

    rawTaxAmount += itemNet * (itemRate / 100);
    return sum + itemNet;
  }, 0);
  
  let discountAmount = 0;
  if (state.discountValue > 0) {
    if (state.discountType === 'percent') {
      discountAmount = subtotal * (state.discountValue / 100);
    } else {
      discountAmount = parseFloat(state.discountValue) || 0;
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const discountRatio = subtotal > 0 ? (taxableAmount / subtotal) : 1;
  const totalCalculatedTax = rawTaxAmount * discountRatio;

  const displayTaxRate = primaryTaxRate !== null ? primaryTaxRate : (parseFloat(state.taxRate) || 0);

  // Check GST type
  let isIgst = true;
  if (state.senderStateCode && state.recipientStateCode && state.senderStateCode === state.recipientStateCode) {
    isIgst = false;
  }
  
  let igstAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let taxAmount = 0;

  if (state.docType === 'gst_invoice') {
    taxAmount = totalCalculatedTax;
    if (isIgst) {
      igstAmount = totalCalculatedTax;
    } else {
      cgstAmount = totalCalculatedTax / 2;
      sgstAmount = totalCalculatedTax / 2;
    }
  } else if (state.docType === 'standard_invoice') {
    taxAmount = totalCalculatedTax;
  } else {
    // Proforma and Commercial invoices
    taxAmount = 0;
  }

  const exactGrandTotal = taxableAmount + taxAmount;
  const roundedGrandTotal = Math.round(exactGrandTotal);
  const roundOff = (roundedGrandTotal - exactGrandTotal);

  const finalGrandTotal = state.docType === 'gst_invoice' ? roundedGrandTotal : exactGrandTotal;

  // Words formatting
  const totalInWordsIndian = numberToWordsIndian(finalGrandTotal);
  const currencyPrefix = state.currency === 'USD' ? 'TOTAL US$: ' : `TOTAL ${state.currency}: `;
  const totalInWordsInternational = numberToWordsInternational(finalGrandTotal, currencyPrefix);

  return {
    totalQty,
    subtotal,
    taxableAmount,
    discountAmount,
    taxRate: displayTaxRate,
    isIgst,
    igstAmount,
    cgstAmount,
    sgstAmount,
    taxAmount,
    roundOff,
    grandTotal: finalGrandTotal,
    exactGrandTotal,
    totalInWordsIndian,
    totalInWordsInternational,
    isExport
  };
}

export function getExportNote() {
  if (state.docType === 'commercial_invoice') {
    return state.exportHeaderNote || 'SUPPLY MEANT FOR EXPORT ON PAYMENT OF IGST';
  }
  if (state.docType === 'gst_invoice') {
    return state.shippingBillType === 'WO PAY' ? 'SUPPLY MEANT FOR EXPORT UNDER BOND OR LETTER OF UNDERTAKING WITHOUT PAYMENT OF INTEGRATED TAX' : 'SUPPLY MEANT FOR EXPORT ON PAYMENT OF INTEGRATED TAX';
  }
  return 'Zero Rated Export under LUT';
}
