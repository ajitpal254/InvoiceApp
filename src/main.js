import './style.css';
import { state, auth, saveLocalState, loadLocalState, loadPreset, saveRemoteState, resetState } from './modules/store.js';
import { render, renderPreview, syncAuthUI, renderHistory, syncFormInputs } from './modules/render.js';
import { login, register, logout, handleUrlVerification, fetchProfile } from './modules/auth.js';
import { fetchHistory, deleteInvoice, loadInvoiceFromData } from './modules/history.js';
import { elements } from './modules/elements.js';

// --- Initialization ---
async function init() {
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

function bindEvents() {
  const sync = (field, val) => { 
    state[field] = val; 
    if (field === 'currency' || field === 'unitType') {
      render(elements, removeItem, updateItem);
    } else {
      renderPreview(elements); 
    }
    saveLocalState(); 
  };

  // Document Type Switching Pills
  document.querySelectorAll('.doc-type-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const selectedDocType = pill.dataset.doctype;
      state.docType = selectedDocType;
      syncFormInputs(elements);
      render(elements, removeItem, updateItem);
      saveLocalState();
    });
  });

  // Preset selector
  if (elements.presetSelect) {
    elements.presetSelect.addEventListener('change', (e) => {
      const presetKey = e.target.value;
      if (presetKey) {
        loadPreset(presetKey);
        render(elements, removeItem, updateItem);
      }
    });
  }

  // Auth Modal Triggers
  if (elements.loginTrigger) {
    elements.loginTrigger.addEventListener('click', () => {
      elements.authModal.classList.remove('hidden');
      elements.authError.classList.add('hidden');
    });
  }

  if (elements.closeAuthModal) {
    elements.closeAuthModal.addEventListener('click', () => {
      elements.authModal.classList.add('hidden');
    });
  }

  if (elements.authToggle) {
    elements.authToggle.addEventListener('click', (e) => {
      e.preventDefault();
      auth.isSignup = !auth.isSignup;
      elements.modalTitle.textContent = auth.isSignup ? 'Create Account' : 'Welcome Back';
      elements.authBtn.textContent = auth.isSignup ? 'Sign Up' : 'Login';
      elements.authToggle.textContent = auth.isSignup ? 'Login' : 'Sign Up';
      document.querySelectorAll('.signup-only').forEach(el => {
        el.classList.toggle('hidden', !auth.isSignup);
      });
      elements.authError.classList.add('hidden');
    });
  }

  if (elements.authForm) {
    elements.authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      elements.authError.classList.add('hidden');
      elements.authBtn.disabled = true;
      const btnText = elements.authBtn.textContent;
      elements.authBtn.textContent = 'Processing...';

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
  }

  if (elements.logoutBtn) elements.logoutBtn.addEventListener('click', logout);

  // Field Synchronizations
  const bindInput = (el, field) => {
    if (el) {
      el.addEventListener('input', e => sync(field, e.target.value));
      el.addEventListener('change', e => sync(field, e.target.value));
    }
  };

  bindInput(elements.companyName, 'companyName');
  bindInput(elements.dealsIn, 'dealsIn');
  bindInput(elements.senderInfo, 'senderInfo');
  bindInput(elements.senderPhone, 'senderPhone');
  bindInput(elements.senderEmail, 'senderEmail');
  bindInput(elements.senderGstin, 'senderGstin');
  bindInput(elements.senderPan, 'senderPan');
  bindInput(elements.senderState, 'senderState');
  bindInput(elements.senderStateCode, 'senderStateCode');
  bindInput(elements.iecNo, 'iecNo');

  bindInput(elements.billTitle, 'billTitle');
  bindInput(elements.billSubtype, 'billSubtype');
  bindInput(elements.copyType, 'copyType');
  bindInput(elements.invoiceNumber, 'invoiceNumber');
  bindInput(elements.invoiceDate, 'invoiceDate');
  bindInput(elements.orderNo, 'orderNo');
  bindInput(elements.orderDate, 'orderDate');

  bindInput(elements.recipientName, 'recipientName');
  bindInput(elements.recipientInfo, 'recipientInfo');
  bindInput(elements.recipientGstin, 'recipientGstin');
  bindInput(elements.recipientPan, 'recipientPan');
  bindInput(elements.recipientState, 'recipientState');
  bindInput(elements.recipientStateCode, 'recipientStateCode');

  bindInput(elements.consigneeName, 'consigneeName');
  bindInput(elements.consigneeInfo, 'consigneeInfo');
  bindInput(elements.consigneeStateCode, 'consigneeStateCode');

  // Logistics & GST
  bindInput(elements.placeOfSupply, 'placeOfSupply');
  bindInput(elements.placeOfDelivery, 'placeOfDelivery');
  bindInput(elements.transporterName, 'transporterName');
  bindInput(elements.transporterId, 'transporterId');
  bindInput(elements.vehicleNo, 'vehicleNo');
  bindInput(elements.grNo, 'grNo');
  bindInput(elements.grDate, 'grDate');
  bindInput(elements.pvtMark, 'pvtMark');
  bindInput(elements.ewayNo, 'ewayNo');
  bindInput(elements.reverseCharge, 'reverseCharge');
  bindInput(elements.shippingBillType, 'shippingBillType');
  bindInput(elements.shippingBillCode, 'shippingBillCode');
  bindInput(elements.shippingBillNo, 'shippingBillNo');
  bindInput(elements.shippingBillDate, 'shippingBillDate');
  bindInput(elements.remarks, 'remarks');

  // e-Way Bill
  bindInput(elements.ewayBillNo, 'ewayBillNo');
  bindInput(elements.ewayBillDate, 'ewayBillDate');
  bindInput(elements.distanceKm, 'distanceKm');
  bindInput(elements.validFrom, 'validFrom');
  bindInput(elements.validUntil, 'validUntil');
  bindInput(elements.placeOfDispatch, 'placeOfDispatch');
  bindInput(elements.transactionType, 'transactionType');
  bindInput(elements.reasonForTransport, 'reasonForTransport');
  bindInput(elements.transportMode, 'transportMode');
  bindInput(elements.transDocNo, 'transDocNo');
  bindInput(elements.fromLocation, 'fromLocation');

  // Customs inputs
  bindInput(elements.exportHeaderNote, 'exportHeaderNote');
  bindInput(elements.countryOfOrigin, 'countryOfOrigin');
  bindInput(elements.countryOfDestination, 'countryOfDestination');
  bindInput(elements.termsOfDelivery, 'termsOfDelivery');
  bindInput(elements.deliveryTerms, 'deliveryTerms');
  bindInput(elements.preCarriageBy, 'preCarriageBy');
  bindInput(elements.placeOfReceipt, 'placeOfReceipt');
  bindInput(elements.portOfLoading, 'portOfLoading');
  bindInput(elements.portOfDischarge, 'portOfDischarge');
  bindInput(elements.marksAndNos, 'marksAndNos');
  bindInput(elements.packagesDesc, 'packagesDesc');
  bindInput(elements.totalPackages, 'totalPackages');
  bindInput(elements.totalGrossWeight, 'totalGrossWeight');
  bindInput(elements.totalNetWeight, 'totalNetWeight');
  bindInput(elements.declaration, 'declaration');

  // Bank & Preferences
  bindInput(elements.currencySelect, 'currency');
  bindInput(elements.bankName, 'bankName');
  bindInput(elements.bankAccountNo, 'bankAccountNo');
  bindInput(elements.bankIfsc, 'bankIfsc');
  bindInput(elements.termsAndConditions, 'termsAndConditions');
  bindInput(elements.signatoryTitle, 'signatoryTitle');
  bindInput(elements.notesInput, 'notes');
  bindInput(elements.paymentInput, 'paymentInfo');

  if (elements.themeColor) {
    elements.themeColor.addEventListener('input', e => { 
      state.themeColor = e.target.value; 
      if (elements.colorValue) elements.colorValue.textContent = e.target.value.toUpperCase();
      renderPreview(elements); 
      saveLocalState(); 
    });
  }

  // Add Item
  if (elements.addBtn) {
    elements.addBtn.addEventListener('click', () => {
      const defaultTax = state.items.length > 0 ? (state.items[0].taxRate ?? state.taxRate ?? 18) : (state.taxRate ?? 18);
      state.items.push({
        id: Date.now(),
        description: '',
        hsnCode: '',
        qty: 1,
        unit: state.unitType || 'PCS',
        price: 0,
        discRate: 0,
        taxRate: defaultTax
      });
      render(elements, removeItem, updateItem);
      saveLocalState();
    });
  }

  // Print / PDF Export
  if (elements.exportBtn) {
    elements.exportBtn.addEventListener('click', async () => {
      window.print();
      if (auth.token && auth.isVerified) {
        await saveRemoteState();
        await reloadHistory();
      }
    });
  }

  // Reset
  if (elements.resetBtn) {
    elements.resetBtn.addEventListener('click', () => {
      if (confirm('Reset to blank template?')) {
        resetState();
        render(elements, removeItem, updateItem);
      }
    });
  }

  // Modal Closures
  if (elements.authModal) {
    elements.authModal.addEventListener('click', (e) => {
      if (e.target === elements.authModal) elements.authModal.classList.add('hidden');
    });
  }

  if (elements.verificationModal) {
    elements.verificationModal.addEventListener('click', (e) => {
      if (e.target === elements.verificationModal) elements.verificationModal.classList.add('hidden');
    });
  }

  if (elements.closeVerifyModal) {
    elements.closeVerifyModal.addEventListener('click', () => {
      elements.verificationModal.classList.add('hidden');
    });
  }

  if (elements.resendBtn) {
    elements.resendBtn.addEventListener('click', () => {
      alert('Verification email resent!');
      elements.verificationModal.classList.add('hidden');
    });
  }
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
    if (field === 'description' || field === 'hsnCode' || field === 'unit') {
      item[field] = value;
    } else {
      item[field] = parseFloat(value) || 0;
      if (field === 'taxRate') {
        state.taxRate = item[field];
      }
    }
    renderPreview(elements);
    saveLocalState();
  }
}

init();
