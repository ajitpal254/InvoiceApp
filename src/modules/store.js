import { STORAGE_KEY, TOKEN_KEY, API_URL } from './config.js';
import { calculateTotals } from './tax.js';

export let state = {
  senderCountry: 'India',
  senderTaxId: '',
  senderInfo: '',
  recipientInfo: '',
  recipientCountry: 'Canada',
  province: 'ON',
  invoiceNumber: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  items: [{ id: Date.now(), description: '', qty: 1, price: 0 }],
  unitType: 'Qty',
  themeColor: '#10b981',
  currency: 'CAD',
  notes: '',
  paymentInfo: '',
  companyName: 'Lumina Solutions',
  discountDesc: '',
  discountType: 'amount',
  discountValue: 0
};

export let auth = {
  token: localStorage.getItem(TOKEN_KEY),
  username: localStorage.getItem('nova_user_name'),
  isSignup: false,
  isVerified: false
};

export function saveLocalState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function saveRemoteState() {
  if (!auth.token || !auth.isVerified) return;
  try {
    const totals = calculateTotals();
    await fetch(API_URL + '/invoices', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify({ ...state, ...totals })
    });
  } catch (err) {
    console.warn('Cloud sync failed');
  }
}

export function loadLocalState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(state, parsed);
  }
}

export function resetState() {
  state.senderCountry = 'India';
  state.senderTaxId = '';
  state.senderInfo = '';
  state.recipientInfo = '';
  state.recipientCountry = 'Canada';
  state.province = 'ON';
  state.invoiceNumber = 'INV-' + Math.floor(1000 + Math.random() * 9000);
  state.invoiceDate = new Date().toISOString().split('T')[0];
  state.items = [{ id: Date.now(), description: '', qty: 1, price: 0 }];
  state.unitType = 'Qty';
  state.themeColor = '#10b981';
  state.currency = 'CAD';
  state.notes = '';
  state.paymentInfo = '';
  state.companyName = 'Lumina Solutions';
  state.discountDesc = '';
  state.discountType = 'amount';
  state.discountValue = 0;
  saveLocalState();
}
