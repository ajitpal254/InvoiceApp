import { state, auth } from './store.js';
import { REGIONS, CURRENCY_SYMBOLS } from './config.js';
import { calculateTotals, getExportNote } from './tax.js';

export function applyTheme() {
  document.documentElement.style.setProperty('--accent', state.themeColor);
  document.documentElement.style.setProperty('--accent-glow', state.themeColor + '33');
}

export function updateRegionDropdown(elements) {
  const regions = REGIONS[state.recipientCountry] || [];
  elements.provinceSelect.innerHTML = '';
  regions.forEach(reg => {
    const opt = document.createElement('option');
    opt.value = reg;
    opt.textContent = reg;
    elements.provinceSelect.appendChild(opt);
  });
}

export function renderItemsEditor(elements, removeItem, updateItem) {
  elements.itemsEditor.innerHTML = '';
  state.items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'glass-card fade-in';
    row.style.padding = '12px';
    row.style.marginBottom = '12px';
    row.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <input type="text" placeholder="Description" value="${item.description}" data-id="${item.id}" data-field="description">
        <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px;">
          <input type="number" placeholder="Qty" value="${item.qty}" data-id="${item.id}" data-field="qty">
          <input type="number" placeholder="Price" value="${item.price}" data-id="${item.id}" data-field="price">
          <button class="btn btn-ghost delete-item" data-id="${item.id}" style="color: var(--danger); padding: 8px;">
            <i data-lucide="trash-2" style="width: 14px;"></i>
          </button>
        </div>
      </div>
    `;
    elements.itemsEditor.appendChild(row);
  });
  if (window.lucide) window.lucide.createIcons();
  
  elements.itemsEditor.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => updateItem(e.target.dataset.id, e.target.dataset.field, e.target.value));
  });
  elements.itemsEditor.querySelectorAll('.delete-item').forEach(btn => {
    btn.addEventListener('click', (e) => removeItem(parseInt(e.currentTarget.dataset.id)));
  });
}

export function renderPreview(elements) {
  const { subtotal, taxAmount, grandTotal, taxRate, isExport } = calculateTotals();
  const exportNote = getExportNote();
  const symbol = CURRENCY_SYMBOLS[state.currency] || '$';
  
  elements.previewCompanyName.textContent = state.companyName;
  elements.previewSenderTaxId.textContent = state.senderTaxId ? `GST/TAX: ${state.senderTaxId}` : '';
  elements.previewSenderInfo.textContent = state.senderInfo;
  elements.previewRecipientInfo.textContent = state.recipientInfo;
  elements.previewInvoiceNumber.textContent = state.invoiceNumber;
  elements.previewDate.textContent = state.invoiceDate;
  elements.previewTaxRate.textContent = isExport ? 'Export' : `${state.province} (${taxRate}%)`;
  elements.previewNotes.textContent = state.notes;
  elements.previewPayment.textContent = state.paymentInfo;

  elements.previewItems.innerHTML = '';
  state.items.forEach(item => {
    const total = item.qty * item.price;
    elements.previewItems.innerHTML += `
      <tr>
        <td>${item.description || 'New Item'}</td>
        <td style="text-align: center;">${item.qty}</td>
        <td style="text-align: right;">${symbol}${item.price.toFixed(2)}</td>
        <td style="text-align: right; font-weight: 600;">${symbol}${total.toFixed(2)}</td>
      </tr>
    `;
  });

  elements.previewSubtotal.textContent = `${symbol}${subtotal.toFixed(2)}`;
  elements.previewTaxAmount.textContent = `${symbol}${taxAmount.toFixed(2)}`;
  elements.previewGrandTotal.textContent = `${symbol}${grandTotal.toFixed(2)}`;

  if (isExport && exportNote) {
    elements.exportNoteContainer.style.display = 'block';
    elements.exportNote.textContent = exportNote;
  } else {
    elements.exportNoteContainer.style.display = 'none';
  }

  document.querySelectorAll('.invoice-canvas h2').forEach(h => h.style.color = state.themeColor);
}

export function render(elements, removeItem, updateItem) {
  elements.senderCountry.value = state.senderCountry;
  elements.senderTaxId.value = state.senderTaxId;
  elements.senderInfo.value = state.senderInfo;
  elements.recipientInfo.value = state.recipientInfo;
  elements.recipientCountry.value = state.recipientCountry;
  elements.invoiceNumber.value = state.invoiceNumber;
  elements.invoiceDate.value = state.invoiceDate;
  elements.themeColor.value = state.themeColor;
  elements.colorValue.textContent = state.themeColor.toUpperCase();
  elements.currencySelect.value = state.currency;
  elements.notesInput.value = state.notes;
  elements.paymentInput.value = state.paymentInfo;

  applyTheme();
  renderItemsEditor(elements, removeItem, updateItem);
  renderPreview(elements);
}

export function syncAuthUI(elements) {
  if (auth.token) {
    elements.loginTrigger.classList.add('hidden');
    elements.userInfo.classList.remove('hidden');
    elements.userName.textContent = auth.username;
    elements.userInitial.textContent = auth.username.charAt(0).toUpperCase();
    elements.verifyBanner.classList.toggle('hidden', auth.isVerified);
    elements.historySection.classList.remove('hidden');
  } else {
    elements.loginTrigger.classList.remove('hidden');
    elements.userInfo.classList.add('hidden');
    elements.verifyBanner.classList.add('hidden');
    elements.historySection.classList.add('hidden');
  }
}

export function renderHistory(elements, historyItems, onLoad, onDelete) {
  elements.historyList.innerHTML = '';
  if (historyItems.length === 0) {
    elements.historyList.innerHTML = '<p style="font-size: 11px; color: #94a3b8; text-align: center; padding: 20px;">No invoices yet.</p>';
    return;
  }

  historyItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'glass-card fade-in';
    card.style.padding = '12px';
    card.style.marginBottom = '12px';
    card.style.cursor = 'pointer';
    card.style.transition = 'transform 0.2s';
    card.style.background = 'rgba(255, 255, 255, 0.03)';
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="font-size: 12px; font-weight: 600; color: white;"># ${item.invoiceNumber}</p>
          <p style="font-size: 10px; color: #94a3b8;">${item.invoiceDate} • ${item.grandTotal.toFixed(2)} ${item.currency}</p>
        </div>
        <button class="delete-history-btn" style="background: none; border: none; color: #ef4444; padding: 4px; cursor: pointer; opacity: 0.6; transition: opacity 0.2s;">
          <i data-lucide="trash-2" style="width: 14px;"></i>
        </button>
      </div>
    `;

    card.addEventListener('mouseenter', () => { card.style.transform = 'translateX(4px)'; card.style.background = 'rgba(255, 255, 255, 0.06)'; });
    card.addEventListener('mouseleave', () => { card.style.transform = 'translateX(0)'; card.style.background = 'rgba(255, 255, 255, 0.03)'; });
    
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-history-btn')) {
        onLoad(item);
      }
    });

    const delBtn = card.querySelector('.delete-history-btn');
    delBtn.addEventListener('mouseenter', () => delBtn.style.opacity = '1');
    delBtn.addEventListener('mouseleave', () => delBtn.style.opacity = '0.6');
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Delete this invoice permanently?')) {
        onDelete(item._id);
      }
    });

    elements.historyList.appendChild(card);
  });
  if (window.lucide) window.lucide.createIcons();
}
