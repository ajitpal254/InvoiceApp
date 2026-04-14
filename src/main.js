import './style.css';
import { state, auth, saveLocalState, loadLocalState, saveRemoteState, resetState } from './modules/store.js';
import { render, renderPreview, updateRegionDropdown, syncAuthUI, renderHistory } from './modules/render.js';
import { login, register, logout, handleUrlVerification, fetchProfile } from './modules/auth.js';
import { fetchHistory, deleteInvoice, loadInvoiceFromData } from './modules/history.js';

// --- Constants ---
const elements = {
  authModal: document.getElementById('auth-modal'),
  loginTrigger: document.getElementById('login-trigger'),
  modalTitle: document.getElementById('modal-title'),
  authBtn: document.getElementById('auth-btn'),
  authToggle: document.getElementById('auth-toggle'),
  authUsername: document.getElementById('auth-username'),
  authEmail: document.getElementById('auth-email'),
  authPassword: document.getElementById('auth-password'),
  authFullname: document.getElementById('auth-fullname'),
  authCompany: document.getElementById('auth-company'),
  authAddress: document.getElementById('auth-address'),
  authTaxId: document.getElementById('auth-taxid'),
  authError: document.getElementById('auth-error'),
  userInfo: document.getElementById('user-info'),
  userName: document.getElementById('user-display-name'),
  userInitial: document.getElementById('user-initial'),
  logoutBtn: document.getElementById('logout-btn'),
  verifyBanner: document.getElementById('verify-banner'),
  
  senderCountry: document.getElementById('sender-country'),
  senderTaxId: document.getElementById('sender-taxid'),
  senderInfo: document.getElementById('sender-info'),
  recipientInfo: document.getElementById('recipient-info'),
  recipientCountry: document.getElementById('country-select'),
  provinceSelect: document.getElementById('province-select'),
  invoiceNumber: document.getElementById('invoice-number'),
  invoiceDate: document.getElementById('invoice-date'),
  itemsEditor: document.getElementById('items-editor-list'),
  addBtn: document.getElementById('add-item-btn'),
  themeColor: document.getElementById('theme-color'),
  currencySelect: document.getElementById('currency-select'),
  notesInput: document.getElementById('invoice-notes'),
  paymentInput: document.getElementById('payment-info'),
  exportBtn: document.getElementById('export-btn'),
  resetBtn: document.getElementById('reset-btn'),

  previewCompanyName: document.getElementById('display-company-name'),
  previewSenderTaxId: document.getElementById('display-sender-taxid'),
  previewSenderInfo: document.getElementById('display-sender-info'),
  previewRecipientInfo: document.getElementById('display-recipient-info'),
  previewInvoiceNumber: document.getElementById('display-invoice-number'),
  previewDate: document.getElementById('display-invoice-date'),
  previewSubtotal: document.getElementById('display-subtotal'),
  previewTaxRate: document.getElementById('display-tax-rate'),
  previewTaxAmount: document.getElementById('display-tax-amount'),
  previewGrandTotal: document.getElementById('display-grand-total'),
  previewNotes: document.getElementById('display-notes'),
  previewPayment: document.getElementById('display-payment'),
  previewItems: document.getElementById('display-items-list'),
  exportNoteContainer: document.getElementById('export-note-container'),
  exportNote: document.getElementById('export-note'),
  colorValue: document.getElementById('color-value'),
  historySection: document.getElementById('history-section'),
  historyList: document.getElementById('history-list'),
  verificationModal: document.getElementById('verification-modal'),
  closeVerifyModal: document.getElementById('close-verify-modal'),
  resendBtn: document.getElementById('resend-btn')
};

// --- Execution ---
async function init() {
  generateInvoiceNumber();
  loadLocalState();
  bindEvents();
  
  const params = new URLSearchParams(window.location.search);
  if (params.has('token')) {
     await handleUrlVerification(params.get('token'));
  }

  if (auth.token) {
    await fetchProfile();
    await reloadHistory();
  }
  
  updateRegionDropdown(elements);
  render(elements, removeItem, updateItem);
  syncAuthUI(elements);
}

async function reloadHistory() {
  const items = await fetchHistory();
  renderHistory(elements, items, (data) => {
    loadInvoiceFromData(data);
    render(elements, removeItem, updateItem);
  }, async (id) => {
    await deleteInvoice(id);
    await reloadHistory();
  });
}

function generateInvoiceNumber() {
  if (!state.invoiceNumber) {
    state.invoiceNumber = 'INV-' + Math.floor(1000 + Math.random() * 9000);
  }
}

function bindEvents() {
  const sync = (field, val) => { 
    state[field] = val; 
    renderPreview(elements); 
    saveLocalState(); 
  };

  elements.loginTrigger.addEventListener('click', () => {
    elements.authModal.classList.remove('hidden');
    elements.authUsername.focus();
  });

  elements.authToggle.addEventListener('click', (e) => {
    e.preventDefault();
    auth.isSignup = !auth.isSignup;
    elements.modalTitle.textContent = auth.isSignup ? 'Create Professional Account' : 'Welcome Back';
    elements.authBtn.textContent = auth.isSignup ? 'Sign Up' : 'Login';
    elements.authToggle.textContent = auth.isSignup ? 'Login' : 'Sign Up';
    document.querySelectorAll('.signup-only').forEach(el => el.classList.toggle('hidden', !auth.isSignup));
  });

  elements.authBtn.addEventListener('click', async () => {
    try {
      if (auth.isSignup) {
        const payload = {
          username: elements.authUsername.value,
          email: elements.authEmail.value,
          password: elements.authPassword.value,
          fullName: elements.authFullname.value,
          companyName: elements.authCompany.value,
          address: elements.authAddress.value,
          taxId: elements.authTaxId.value
        };
        await register(payload);
        alert('Registration successful! Please login.');
        auth.isSignup = false;
        elements.modalTitle.textContent = 'Welcome Back';
        elements.authBtn.textContent = 'Login';
        elements.authToggle.textContent = 'Sign Up';
        document.querySelectorAll('.signup-only').forEach(el => el.classList.add('hidden'));
      } else {
        await login(elements.authUsername.value, elements.authPassword.value);
        elements.authModal.classList.add('hidden');
        await reloadHistory();
        render(elements, removeItem, updateItem);
        syncAuthUI(elements);
      }
    } catch (err) {
      elements.authError.textContent = err.message;
      elements.authError.classList.remove('hidden');
    }
  });

  elements.logoutBtn.addEventListener('click', logout);

  elements.senderCountry.addEventListener('change', e => { 
    state.senderCountry = e.target.value; 
    renderPreview(elements); 
    saveLocalState(); 
  });
  
  elements.senderTaxId.addEventListener('input', e => sync('senderTaxId', e.target.value));
  elements.senderInfo.addEventListener('input', e => sync('senderInfo', e.target.value));
  elements.recipientInfo.addEventListener('input', e => sync('recipientInfo', e.target.value));
  
  elements.recipientCountry.addEventListener('change', e => {
    state.recipientCountry = e.target.value;
    updateRegionDropdown(elements);
    state.province = elements.provinceSelect.value;
    
    // Smart USD Default: Only trigger on country change to allow overrides
    if (state.senderCountry !== state.recipientCountry) {
       state.currency = 'USD';
       elements.currencySelect.value = 'USD';
    }

    renderPreview(elements);
    saveLocalState();
  });
  
  elements.provinceSelect.addEventListener('change', e => sync('province', e.target.value));
  elements.invoiceNumber.addEventListener('input', e => sync('invoiceNumber', e.target.value));
  elements.invoiceDate.addEventListener('input', e => sync('invoiceDate', e.target.value));
  elements.themeColor.addEventListener('input', e => { 
    state.themeColor = e.target.value; 
    elements.colorValue.textContent = e.target.value.toUpperCase();
    renderPreview(elements);
    saveLocalState(); 
  });
  elements.currencySelect.addEventListener('change', (e) => sync('currency', e.target.value));
  elements.notesInput.addEventListener('input', e => sync('notes', e.target.value));
  elements.paymentInput.addEventListener('input', e => sync('paymentInfo', e.target.value));
  elements.addBtn.addEventListener('click', () => {
    state.items.push({ id: Date.now(), description: '', qty: 1, price: 0 });
    render(elements, removeItem, updateItem);
    saveLocalState();
  });
  
  elements.exportBtn.addEventListener('click', async () => {
     if (!auth.token) {
       alert('Please login to export invoices.');
       elements.authModal.classList.remove('hidden');
       return;
     }

     if (!auth.isVerified) {
       elements.verificationModal.classList.remove('hidden');
       return;
     }

     window.print();
     await saveRemoteState();
     await reloadHistory();
  });
  
  elements.resetBtn.addEventListener('click', () => {
    if (confirm('Reset all fields?')) {
      resetState();
      location.reload();
    }
  });

  elements.authModal.addEventListener('click', (e) => {
    if (e.target === elements.authModal) elements.authModal.classList.add('hidden');
  });

  elements.verificationModal.addEventListener('click', (e) => {
    if (e.target === elements.verificationModal) elements.verificationModal.classList.add('hidden');
  });

  elements.closeVerifyModal.addEventListener('click', () => {
    elements.verificationModal.classList.add('hidden');
  });

  elements.resendBtn.addEventListener('click', () => {
    alert('Verification link resent to your email!');
    elements.verificationModal.classList.add('hidden');
  });
}

function removeItem(id) {
  state.items = state.items.filter(item => item.id !== id);
  render(elements, removeItem, updateItem);
  saveLocalState();
}

function updateItem(id, field, value) {
  const numericId = parseInt(id);
  const item = state.items.find(i => i.id === numericId);
  if (item) {
    item[field] = field === 'description' ? value : (parseFloat(value) || 0);
    renderPreview(elements);
    saveLocalState();
  }
}

init();
