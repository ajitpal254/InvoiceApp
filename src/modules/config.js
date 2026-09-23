export const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:5000/api' : '/api');
export const STORAGE_KEY = 'nova_invoice_data_v3';
export const TOKEN_KEY = 'nova_invoice_token';

export const CURRENCY_SYMBOLS = {
  'INR': '₹',
  'USD': '$',
  'CAD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'BDT': '৳',
  'LKR': '₨',
  'MYR': 'RM',
  'SAR': '﷼',
  'AED': 'د.إ'
};

export const INDIAN_STATES = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '19', name: 'West Bengal' },
  { code: '24', name: 'Gujarat' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '97', name: 'Other Territory / Export' }
];

export const STANDARD_UNITS = [
  'KGS',
  'PCS',
  'SET',
  'SETS',
  'MTR',
  'PKGS',
  'TON',
  'BOX',
  'NOS',
  'Qty',
  'Hrs'
];

export const GLOBAL_TAX_RATES = {
  'Canada': { 'ON': 13, 'QC': 14.975, 'BC': 12, 'AB': 5, 'MB': 12, 'SK': 11, 'NS': 14, 'NB': 15, 'NL': 15, 'PE': 15, 'NT': 5, 'YT': 5, 'NU': 5 },
  'USA': { 'CA': 7.25, 'NY': 4, 'TX': 6.25, 'FL': 6, 'WA': 6.5, 'IL': 6.25 },
  'UK': { 'Standard': 20, 'Reduced': 5, 'Zero': 0 },
  'Europe': { 'Germany': 19, 'France': 20, 'Italy': 22, 'Spain': 21, 'Netherlands': 21 },
  'India': { '03': 18, '24': 18, '27': 18, '07': 18, '97': 18, 'GST-Standard': 18, 'GST-Reduced': 5, 'GST-Luxury': 28 },
  'Japan': { 'Consumption-Tax': 10, 'Reduced': 8 },
  'Bangladesh': { 'Standard-VAT': 15, 'Reduced-VAT': 5, 'Export': 0 },
  'Sri Lanka': { 'Standard-VAT': 18, 'Reduced-VAT': 8, 'Export': 0 },
  'Malaysia': { 'Service-Tax': 6, 'Sales-Tax': 10, 'Export': 0 }
};

export const REGIONS = {
  'Canada': ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'],
  'USA': ['CA', 'NY', 'TX', 'FL', 'WA', 'IL'],
  'UK': ['Standard', 'Reduced', 'Zero'],
  'Europe': ['Germany', 'France', 'Italy', 'Spain', 'Netherlands'],
  'India': ['03 ( Punjab )', '24 ( Gujarat )', '27 ( Maharashtra )', '07 ( Delhi )', '06 ( Haryana )', '08 ( Rajasthan )', '97 ( Other Territory )'],
  'Japan': ['Consumption-Tax', 'Reduced'],
  'Bangladesh': ['Standard-VAT', 'Reduced-VAT', 'Export'],
  'Sri Lanka': ['Standard-VAT', 'Reduced-VAT', 'Export'],
  'Malaysia': ['Service-Tax', 'Sales-Tax', 'Export']
};
