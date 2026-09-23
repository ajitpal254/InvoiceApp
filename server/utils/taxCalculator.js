/**
 * Server-side financial & tax recalculation utility.
 * Avoids floating-point inaccuracies and client-side total tampering.
 */

export function roundToTwoDecimals(val) {
  return Math.round((Number(val) || 0) * 100) / 100;
}

export function calculateInvoiceTotals(invoiceData) {
  const items = Array.isArray(invoiceData.items) ? invoiceData.items : [];
  const docType = invoiceData.docType || 'gst_invoice';
  const defaultTaxRate = Number(invoiceData.taxRate) >= 0 ? Number(invoiceData.taxRate) : 18;
  const discountType = invoiceData.discountType || 'amount';
  const discountValue = Number(invoiceData.discountValue) > 0 ? Number(invoiceData.discountValue) : 0;

  let rawTaxAmount = 0;
  let subtotal = 0;
  let totalQty = 0;

  items.forEach(item => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const discRate = Number(item.discRate) || 0;
    
    // Net amount for item: qty * price * (1 - discRate/100)
    const itemNet = roundToTwoDecimals((qty * price) * (1 - discRate / 100));
    const itemTaxRate = (item.taxRate !== undefined && item.taxRate !== null && item.taxRate !== '')
      ? (Number(item.taxRate) || 0)
      : defaultTaxRate;

    totalQty += qty;
    subtotal += itemNet;
    rawTaxAmount += roundToTwoDecimals(itemNet * (itemTaxRate / 100));
  });

  subtotal = roundToTwoDecimals(subtotal);
  rawTaxAmount = roundToTwoDecimals(rawTaxAmount);

  let discountAmount = 0;
  if (discountValue > 0) {
    if (discountType === 'percent') {
      discountAmount = roundToTwoDecimals(subtotal * (discountValue / 100));
    } else {
      discountAmount = roundToTwoDecimals(discountValue);
    }
  }

  const taxableAmount = roundToTwoDecimals(Math.max(0, subtotal - discountAmount));
  const discountRatio = subtotal > 0 ? (taxableAmount / subtotal) : 1;
  const totalCalculatedTax = roundToTwoDecimals(rawTaxAmount * discountRatio);

  // GST State Code comparison
  const senderStateCode = invoiceData.senderStateCode || '';
  const recipientStateCode = invoiceData.recipientStateCode || '';
  const isIgst = !(senderStateCode && recipientStateCode && senderStateCode === recipientStateCode);

  let taxAmount = 0;
  let igstAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;

  if (docType === 'gst_invoice') {
    taxAmount = totalCalculatedTax;
    if (isIgst) {
      igstAmount = totalCalculatedTax;
    } else {
      cgstAmount = roundToTwoDecimals(totalCalculatedTax / 2);
      sgstAmount = roundToTwoDecimals(totalCalculatedTax - cgstAmount);
    }
  } else if (docType === 'standard_invoice') {
    taxAmount = totalCalculatedTax;
  } else {
    // Proforma & Commercial invoices
    taxAmount = 0;
  }

  const exactGrandTotal = roundToTwoDecimals(taxableAmount + taxAmount);
  const roundedGrandTotal = Math.round(exactGrandTotal);
  const roundOff = roundToTwoDecimals(roundedGrandTotal - exactGrandTotal);
  const finalGrandTotal = docType === 'gst_invoice' ? roundedGrandTotal : exactGrandTotal;

  return {
    totalQty,
    subtotal,
    taxableAmount,
    discountAmount,
    isIgst,
    igstAmount,
    cgstAmount,
    sgstAmount,
    taxAmount,
    roundOff,
    grandTotal: finalGrandTotal,
    exactGrandTotal
  };
}
