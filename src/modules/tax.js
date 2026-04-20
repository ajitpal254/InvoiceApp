import { GLOBAL_TAX_RATES } from './config.js';
import { state, saveLocalState } from './store.js';

export function calculateTotals() {
  const isExport = state.senderCountry !== state.recipientCountry;
  let taxRate = 0;
  
  // Exports are typically zero-rated
  if (isExport) {
    taxRate = 0;
  } else {
    taxRate = (GLOBAL_TAX_RATES[state.recipientCountry] && GLOBAL_TAX_RATES[state.recipientCountry][state.province]) || 0;
  }
  
  const subtotal = state.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  
  let discountAmount = 0;
  if (state.discountValue > 0) {
    if (state.discountType === 'percent') {
      discountAmount = subtotal * (state.discountValue / 100);
    } else {
      discountAmount = parseFloat(state.discountValue) || 0;
    }
  }

  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = discountedSubtotal * (taxRate / 100);
  const grandTotal = discountedSubtotal + taxAmount;

  return { subtotal, discountAmount, taxAmount, grandTotal, taxRate, isExport };
}

export function getExportNote() {
  const { isExport } = calculateTotals();
  if (!isExport) return null;
  
  if (state.senderCountry === 'India') {
    return 'Zero Rated Export under LUT';
  }
  return 'Service Export - 0% Tax Apply';
}
