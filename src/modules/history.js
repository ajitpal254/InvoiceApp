import { API_URL } from './config.js';
import { auth, state, saveLocalState } from './store.js';

export async function fetchHistory() {
  if (!auth.token) return [];
  try {
    const res = await fetch(API_URL + '/invoices', {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('History fetch failed');
  }
  return [];
}

export async function deleteInvoice(id) {
  if (!auth.token) return;
  try {
    const res = await fetch(`${API_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${auth.token}` }
    });
    return res.ok;
  } catch (err) {
    console.warn('Delete failed');
    return false;
  }
}

export function loadInvoiceFromData(data) {
  // Transfer all fields from the historical record back into current state
  Object.keys(state).forEach(key => {
    if (data[key] !== undefined) {
      state[key] = data[key];
    }
  });
  saveLocalState();
}
