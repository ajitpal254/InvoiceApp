import './style.css';
import { state, auth, saveLocalState, loadLocalState, saveRemoteState, resetState } from './modules/store.js';
import { render, renderPreview, updateRegionDropdown, syncAuthUI, renderHistory } from './modules/render.js';
import { login, register, logout, handleUrlVerification, fetchProfile } from './modules/auth.js';
import { fetchHistory, deleteInvoice, loadInvoiceFromData } from './modules/history.js';
import { elements } from './modules/elements.js';

// --- Constants ---
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
    const btnText = elements.authBtn.textContent;
    elements.authBtn.disabled = true;
    elements.authBtn.textContent = auth.isSignup ? 'Creating Account...' : 'Signing In...';
    elements.authError.classList.add('hidden');

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
    } finally {
      elements.authBtn.disabled = false;
      elements.authBtn.textContent = btnText;
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
  
  elements.discountDesc.addEventListener('input', e => sync('discountDesc', e.target.value));
  elements.discountType.addEventListener('change', e => sync('discountType', e.target.value));
  elements.discountValue.addEventListener('input', e => sync('discountValue', parseFloat(e.target.value) || 0));

  elements.themeColor.addEventListener('input', e => { 
    state.themeColor = e.target.value; 
    elements.colorValue.textContent = e.target.value.toUpperCase();
    renderPreview(elements);
    saveLocalState(); 
  });
  elements.currencySelect.addEventListener('change', (e) => sync('currency', e.target.value));
  if (elements.unitType) elements.unitType.addEventListener('change', (e) => sync('unitType', e.target.value));
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
