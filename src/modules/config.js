export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const STORAGE_KEY = 'nova_invoice_data';
export const TOKEN_KEY = 'nova_invoice_token';

export const CURRENCY_SYMBOLS = {
  'USD': '$',
  'CAD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹',
  'JPY': '¥',
  'BDT': '৳',
  'LKR': '₨',
  'MYR': 'RM'
};

export const GLOBAL_TAX_RATES = {
  'Canada': { 'ON': 13, 'QC': 14.975, 'BC': 12, 'AB': 5, 'MB': 12, 'SK': 11, 'NS': 14, 'NB': 15, 'NL': 15, 'PE': 15, 'NT': 5, 'YT': 5, 'NU': 5 },
  'USA': { 'CA': 7.25, 'NY': 4, 'TX': 6.25, 'FL': 6, 'WA': 6.5, 'IL': 6.25 },
  'UK': { 'Standard': 20, 'Reduced': 5, 'Zero': 0 },
  'Europe': { 'Germany': 19, 'France': 20, 'Italy': 22, 'Spain': 21, 'Netherlands': 21 },
  'India': { 'GST-Standard': 18, 'GST-Reduced': 5, 'GST-Luxury': 28 },
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
  'India': ['GST-Standard', 'GST-Reduced', 'GST-Luxury'],
  'Japan': ['Consumption-Tax', 'Reduced'],
  'Bangladesh': ['Standard-VAT', 'Reduced-VAT', 'Export'],
  'Sri Lanka': ['Standard-VAT', 'Reduced-VAT', 'Export'],
  'Malaysia': ['Service-Tax', 'Sales-Tax', 'Export']
};
