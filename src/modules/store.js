import { STORAGE_KEY, TOKEN_KEY, API_URL } from './config.js';
import { calculateTotals } from './tax.js';
import { PRESETS } from './presets.js';

export let state = {
  // Document Type
  docType: 'gst_invoice', // 'gst_invoice' | 'eway_bill' | 'proforma_invoice' | 'commercial_invoice' | 'standard_invoice'
  
  // Exporter / Company Info
  companyName: '',
  dealsIn: '',
  senderCountry: 'India',
  senderState: '',
  senderStateCode: '',
  senderGstin: '',
  senderPan: '',
  senderPhone: '',
  senderEmail: '',
  senderInfo: '',
  iecNo: '',
  
  // Document Header
  billTitle: 'TAX INVOICE',
  billSubtype: 'CREDIT BILL',
  copyType: 'Original for Recipient',
  invoiceNumber: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  orderNo: '',
  orderDate: '',
  
  // Billed To / Recipient
  recipientName: '',
  recipientCountry: '',
  recipientState: '',
  recipientStateCode: '',
  recipientGstin: '',
  recipientPan: '',
  recipientInfo: '',
  
  // Consignee (if different)
  consigneeName: '',
  consigneeInfo: '',
  consigneeStateCode: '',
  
  // Logistics & Supply
  placeOfSupply: '',
  placeOfDelivery: '',
  ewayNo: '',
  transporterName: '',
  transporterId: '',
  vehicleNo: '',
  grNo: '',
  grDate: '',
  pvtMark: '',
  reverseCharge: 'N',
  
  // e-Way Bill specifics
  ewayBillNo: '',
  ewayBillDate: '',
  generatedBy: '',
  distanceKm: '',
  validFrom: '',
  validUntil: '',
  placeOfDispatch: '',
  documentNo: '',
  documentDate: '',
  transactionType: 'Regular',
  mainHsnCode: '',
  reasonForTransport: 'Outward - Supply',
  transporterInfo: '',
  transportMode: 'Road',
  transDocNo: '',
  transDocDate: '',
  fromLocation: '',
  enteredDate: '',
  enteredBy: '',
  cewbNo: '0',
  multiVehInfo: '',
  
  // International / Customs Export specifics
  exportHeaderNote: '',
  buyerOrderNo: '',
  buyerOtherInfo: '',
  countryOfOrigin: '',
  countryOfDestination: '',
  termsOfDelivery: '',
  paymentTerms: '',
  deliveryTerms: '',
  preCarriageBy: '',
  placeOfReceipt: '',
  vesselFlightNo: '',
  portOfLoading: '',
  portOfDischarge: '',
  finalDestination: '',
  marksAndNos: '',
  packagesDesc: '',
  totalPackages: '',
  totalGrossWeight: '',
  totalNetWeight: '',
  declaration: '',
  priceTerms: '',

  // GST & Shipping Bill
  shippingBillType: 'W PAY',
  shippingBillCode: '',
  shippingBillNo: '',
  shippingBillDate: '',
  remarks: '',
  
  // Items
  items: [
    { id: 1, description: '', hsnCode: '', qty: 1, unit: 'PCS', price: 0, discRate: 0, taxRate: 18 }
  ],
  
  // General Pricing & Tax
  currency: 'INR',
  taxRate: 18,
  unitType: 'PCS',
  discountDesc: '',
  discountType: 'amount',
  discountValue: 0,
  themeColor: '#10b981',
  
  // Banking & Terms
  bankName: '',
  bankAccountNo: '',
  bankIfsc: '',
  bankBranch: '',
  termsAndConditions: '1. Goods once sold will not be taken back.',
  notes: '',
  paymentInfo: '',
  signatoryTitle: 'Authorised Signatory'
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

export function loadLocalState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(state, parsed);
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
  }
}

export function loadPreset(presetKey) {
  if (PRESETS[presetKey]) {
    Object.assign(state, JSON.parse(JSON.stringify(PRESETS[presetKey])));
    saveLocalState();
  }
}

export function resetState() {
  state.companyName = '';
  state.dealsIn = '';
  state.senderState = '';
  state.senderStateCode = '';
  state.senderGstin = '';
  state.senderPan = '';
  state.senderPhone = '';
  state.senderEmail = '';
  state.senderInfo = '';
  state.iecNo = '';
  state.recipientName = '';
  state.recipientCountry = '';
  state.recipientState = '';
  state.recipientStateCode = '';
  state.recipientGstin = '';
  state.recipientPan = '';
  state.recipientInfo = '';
  state.consigneeName = '';
  state.consigneeInfo = '';
  state.consigneeStateCode = '';
  state.invoiceNumber = 'INV-' + Math.floor(1000 + Math.random() * 9000);
  state.invoiceDate = new Date().toISOString().split('T')[0];
  state.items = [{ id: Date.now(), description: '', hsnCode: '', qty: 1, unit: 'PCS', price: 0, discRate: 0, taxRate: 18 }];
  state.bankName = '';
  state.bankAccountNo = '';
  state.bankIfsc = '';
  state.termsAndConditions = '1. Goods once sold will not be taken back.';
  state.signatoryTitle = 'Authorised Signatory';
  state.notes = '';
  state.paymentInfo = '';
  saveLocalState();
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
