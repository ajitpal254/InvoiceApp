import { API_URL, TOKEN_KEY } from './config.js';
import { state, auth, saveLocalState } from './store.js';

// Hash password client-side before sending — raw password never leaves the browser
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function fetchProfile() {
  if (!auth.token) return;
  try {
    const res = await fetch(API_URL + '/auth/profile', {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    });
    const user = await res.json();
    if (res.ok) {
      auth.isVerified = user.isVerified;
      state.companyName = user.companyName || state.companyName;
      state.senderInfo = user.companyName + '\n' + user.address;
      state.senderTaxId = user.taxId || '';
      state.senderCountry = user.country || 'India';
      return user;
    }
  } catch (err) {
    console.warn('Profile fetch failed');
  }
}

export async function login(username, password) {
  const hashedPassword = await hashPassword(password);
  const res = await fetch(API_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: hashedPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  
  auth.token = data.token;
  auth.username = data.username;
  auth.isVerified = data.isVerified;
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem('nova_user_name', data.username);
  
  await fetchProfile();
  return data;
}

export async function register(payload) {
  const hashedPassword = await hashPassword(payload.password);
  const res = await fetch(API_URL + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, password: hashedPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('nova_user_name');
  location.reload();
}

export async function handleUrlVerification(token) {
  try {
    const res = await fetch(`${API_URL}/auth/verify?token=${token}`);
    const data = await res.json();
    alert(data.message);
    window.history.replaceState({}, document.title, "/");
    await fetchProfile();
    return data;
  } catch (err) {
    alert('Verification failed');
  }
}
