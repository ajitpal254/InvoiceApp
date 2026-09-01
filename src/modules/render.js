import { state, auth } from './store.js';
import { CURRENCY_SYMBOLS, INDIAN_STATES, STANDARD_UNITS } from './config.js';
import { calculateTotals, getExportNote } from './tax.js';
import { generateBarcodeSvg, generateQrCodeSvg } from './barcodeQr.js';

export function applyTheme() {
  document.documentElement.style.setProperty('--accent', state.themeColor || '#10b981');
  document.documentElement.style.setProperty('--accent-glow', (state.themeColor || '#10b981') + '33');
}

export function formatCurrency(num, curr = state.currency) {
  const symbol = CURRENCY_SYMBOLS[curr] || '';
  if (isNaN(num) || num === 0) return `${symbol}0.00`;
  
  if (curr === 'INR') {
    return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function renderItemsEditor(elements, removeItem, updateItem) {
  if (!elements.itemsEditor) return;
  elements.itemsEditor.innerHTML = '';

  state.items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'glass-card fade-in item-row-card';
    row.style.padding = '12px';
    row.style.marginBottom = '10px';
    
    row.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 700; color: var(--accent);">Item #${index + 1}</span>
          <div style="display: flex; gap: 4px;">
            <button class="btn btn-ghost duplicate-item" data-id="${item.id}" title="Duplicate this item" style="color: var(--text-muted); padding: 2px 6px; font-size: 11px;">
              <i data-lucide="copy" style="width: 13px; height: 13px;"></i> Copy
            </button>
            <button class="btn btn-ghost delete-item" data-id="${item.id}" title="Remove item" style="color: var(--danger); padding: 2px 6px; font-size: 11px;">
              <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
            </button>
          </div>
        </div>
        
        <input type="text" placeholder="Item Name / Description" value="${item.description || ''}" data-id="${item.id}" data-field="description" class="glass-input item-field">
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
          <div>
            <label style="font-size: 9px; margin-bottom: 2px;">HSN/SAC</label>
            <input type="text" placeholder="HSN Code" value="${item.hsnCode || ''}" data-id="${item.id}" data-field="hsnCode" class="glass-input item-field" style="padding: 6px 8px; font-size: 12px;">
          </div>
          <div>
            <label style="font-size: 9px; margin-bottom: 2px;">Qty</label>
            <input type="number" placeholder="Qty" value="${item.qty ?? 1}" data-id="${item.id}" data-field="qty" step="any" class="glass-input item-field" style="padding: 6px 8px; font-size: 12px;">
          </div>
          <div>
            <label style="font-size: 9px; margin-bottom: 2px;">Unit</label>
            <select data-id="${item.id}" data-field="unit" class="glass-input item-field" style="padding: 6px 8px; font-size: 12px;">
              ${STANDARD_UNITS.map(u => `<option value="${u}" ${item.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
          <div>
            <label style="font-size: 9px; margin-bottom: 2px;">Rate (${state.currency || 'INR'})</label>
            <input type="number" placeholder="0.00" value="${item.price || ''}" data-id="${item.id}" data-field="price" step="any" class="glass-input item-field" style="padding: 6px 8px; font-size: 12px;">
          </div>
          <div>
            <label style="font-size: 9px; margin-bottom: 2px;">Disc %</label>
            <input type="number" placeholder="0" value="${item.discRate || ''}" data-id="${item.id}" data-field="discRate" class="glass-input item-field" style="padding: 6px 8px; font-size: 12px;">
          </div>
          <div>
            <label style="font-size: 9px; margin-bottom: 2px;">GST %</label>
            <input type="number" placeholder="18" value="${item.taxRate ?? state.taxRate ?? 18}" data-id="${item.id}" data-field="taxRate" class="glass-input item-field" style="padding: 6px 8px; font-size: 12px;">
          </div>
        </div>
      </div>
    `;
    elements.itemsEditor.appendChild(row);
  });

  if (window.lucide) window.lucide.createIcons();

  elements.itemsEditor.querySelectorAll('.item-field').forEach(input => {
    input.addEventListener('input', (e) => {
      updateItem(e.target.dataset.id, e.target.dataset.field, e.target.value);
    });
    input.addEventListener('change', (e) => {
      updateItem(e.target.dataset.id, e.target.dataset.field, e.target.value);
    });
  });

  elements.itemsEditor.querySelectorAll('.delete-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      removeItem(parseInt(e.currentTarget.dataset.id));
    });
  });

  elements.itemsEditor.querySelectorAll('.duplicate-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sourceId = parseInt(e.currentTarget.dataset.id);
      const source = state.items.find(i => i.id === sourceId);
      if (source) {
        state.items.push({ ...source, id: Date.now() });
        render(elements, removeItem, updateItem);
      }
    });
  });
}

// ----------------------------------------------------
// 1. RENDER GST EXPORT / TAX INVOICE
// ----------------------------------------------------
function renderGstInvoice(totals) {
  const symbol = CURRENCY_SYMBOLS[state.currency] || '₹';
  const hasBankDetails = Boolean(state.bankName || state.bankAccountNo || state.bankIfsc);
  
  return `
    <div class="print-doc gst-tax-invoice">
      <!-- Top header line with state code and title -->
      <div class="gst-top-meta">
        <div class="gst-state-badge">${state.senderStateCode ? `STATE CODE : ${state.senderStateCode}` : ''} ${state.senderState ? `( ${state.senderState} )` : ''}</div>
        <div class="gst-title-main">${state.billTitle || 'TAX INVOICE'}</div>
        <div class="gst-copy-type">${state.copyType ? `( ${state.copyType} )` : ''}</div>
      </div>

      <!-- Seller Top Info Line -->
      <div class="gst-seller-meta-row">
        <div>
          ${state.senderGstin ? `<div><strong>GSTIN &nbsp;:</strong> ${state.senderGstin}</div>` : ''}
          ${state.senderPan ? `<div><strong>PAN NO &nbsp;:</strong> ${state.senderPan}</div>` : ''}
        </div>
        <div style="text-align: right;">
          ${state.senderPhone ? `<div><strong>(M) :</strong> ${state.senderPhone}</div>` : ''}
        </div>
      </div>

      <!-- Company Main Header -->
      <div class="gst-company-center">
        <h1 class="gst-company-name">${state.companyName || ''}</h1>
        ${state.dealsIn ? `<div class="gst-deals-in">DEALS IN : ${state.dealsIn}</div>` : ''}
        ${state.senderInfo ? `<div class="gst-company-address">${(state.senderInfo || '').replace(/\n/g, '<br>')}</div>` : ''}
        ${state.senderEmail ? `<div class="gst-company-email">E-mail ID : ${state.senderEmail}</div>` : ''}
      </div>

      <!-- Tag / Subtype line -->
      ${state.billSubtype ? `<div class="gst-subtype-banner">*** ${state.billSubtype} ***</div>` : '<div style="margin-bottom: 4px;"></div>'}

      <!-- 3-Column Info Box: Receiver, Consignee, Invoice/Transport Details -->
      <div class="gst-parties-grid">
        <!-- Billed To -->
        <div class="gst-box gst-billed-to">
          <div class="gst-box-header">Details of Receiver &nbsp; Billed to</div>
          <div class="gst-box-body">
            <div style="font-weight: 700;">${state.recipientName || ''}</div>
            <div>${(state.recipientInfo || '').replace(/\n/g, '<br>')}</div>
            ${state.recipientPan ? `<div style="margin-top: 4px;"><strong>PAN :</strong> ${state.recipientPan}</div>` : ''}
            ${state.recipientGstin ? `<div><strong>GSTIN :</strong> ${state.recipientGstin}</div>` : ''}
            <div style="display: flex; justify-content: space-between; margin-top: auto; border-top: 1px solid #000; padding-top: 2px;">
              <span>${state.recipientState ? `STATE : ${state.recipientState}` : ''}</span>
              <span>STATE CODE <span class="gst-code-box">${state.recipientStateCode || ''}</span></span>
            </div>
          </div>
        </div>

        <!-- Consignee -->
        <div class="gst-box gst-consignee">
          <div class="gst-box-header">Details of Consignee &nbsp; Supplied</div>
          <div class="gst-box-body">
            <div style="font-weight: 700;">${state.consigneeName || state.recipientName || ''}</div>
            <div>${(state.consigneeInfo || state.recipientInfo || '').replace(/\n/g, '<br>')}</div>
            <div style="margin-top: auto; display: flex; justify-content: space-between; border-top: 1px solid #000; padding-top: 2px;">
              <span>STATE CODE</span>
              <span class="gst-code-box">${state.consigneeStateCode || state.recipientStateCode || ''}</span>
            </div>
          </div>
        </div>

        <!-- Invoice & Transport details -->
        <div class="gst-box gst-logistics">
          <table class="gst-meta-table">
            <tr>
              <td><strong>Invoice No.</strong></td>
              <td class="bold-highlight">${state.invoiceNumber || ''}</td>
            </tr>
            <tr>
              <td><strong>Dated</strong></td>
              <td>${state.invoiceDate || ''}</td>
            </tr>
            ${state.orderNo ? `<tr><td><strong>Order No :</strong></td><td>${state.orderNo}</td></tr>` : ''}
            ${state.orderDate ? `<tr><td><strong>Order Dt :</strong></td><td>${state.orderDate}</td></tr>` : ''}
            ${state.transporterName ? `<tr><td><strong>Transport :</strong></td><td>${state.transporterName}</td></tr>` : ''}
            ${state.transporterId ? `<tr><td><strong>TPT :</strong></td><td>${state.transporterId}</td></tr>` : ''}
            ${state.vehicleNo ? `<tr><td><strong>Vehicle No :</strong></td><td>${state.vehicleNo}</td></tr>` : ''}
            ${state.grNo ? `<tr><td><strong>Gr No :</strong></td><td>${state.grNo}</td></tr>` : ''}
            ${state.grDate ? `<tr><td><strong>Gr Date :</strong></td><td>${state.grDate}</td></tr>` : ''}
            ${state.pvtMark ? `<tr><td><strong>Pvt. Mark :</strong></td><td>${state.pvtMark}</td></tr>` : ''}
          </table>
        </div>
      </div>

      <!-- Supply bar -->
      <div class="gst-supply-bar">
        <div>${state.placeOfSupply ? `<strong>Place of Supply :</strong> ${state.placeOfSupply}` : ''}</div>
        <div>${state.placeOfDelivery ? `<strong>Place of Delivery :</strong> ${state.placeOfDelivery}` : ''}</div>
        <div>${state.ewayNo ? `<strong>EWay No.:</strong> ${state.ewayNo}` : ''}</div>
      </div>

      <!-- Items Table -->
      <table class="gst-items-table">
        <thead>
          <tr>
            <th style="width: 32px;">Sr. No.</th>
            <th>Name of Products & Services</th>
            <th style="width: 75px;">HSN/SAC</th>
            <th style="width: 70px; text-align: right;">Quantity</th>
            <th style="width: 45px; text-align: center;">Unit</th>
            <th style="width: 65px; text-align: right;">Rate</th>
            <th style="width: 45px; text-align: right;">Disc. Rate</th>
            <th style="width: 55px; text-align: right;">GST Tax</th>
            <th style="width: 90px; text-align: right;">Net Amount</th>
          </tr>
        </thead>
        <tbody>
          ${state.items.map((item, idx) => {
            const itemQty = parseFloat(item.qty) || 0;
            const itemPrice = parseFloat(item.price) || 0;
            const itemDisc = parseFloat(item.discRate) || 0;
            const itemTax = item.taxRate ?? state.taxRate ?? 18;
            const netAmount = (itemQty * itemPrice) * (1 - itemDisc / 100);

            return `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td class="item-name">${item.description || ''}</td>
                <td style="text-align: center;">${item.hsnCode || ''}</td>
                <td style="text-align: right;">${itemQty > 0 ? itemQty.toFixed(3) : ''}</td>
                <td style="text-align: center;">${item.unit || ''}</td>
                <td style="text-align: right;">${itemPrice > 0 ? itemPrice.toFixed(2) : ''}</td>
                <td style="text-align: right;">${itemDisc > 0 ? itemDisc + '%' : ''}</td>
                <td style="text-align: right;">${itemTax > 0 ? itemTax.toFixed(2) + '%' : ''}</td>
                <td style="text-align: right; font-weight: 600;">${netAmount > 0 ? netAmount.toFixed(2) : ''}</td>
              </tr>
            `;
          }).join('')}
          ${Array(Math.max(0, 3 - state.items.length)).fill(0).map(() => `
            <tr class="filler-row">
              <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr class="gst-total-row">
            <td colspan="3">
              <div style="display: flex; justify-content: space-between;">
                <span>${state.reverseCharge ? `<strong>Reverse Charge : ${state.reverseCharge}</strong>` : ''}</span>
                <span style="font-size: 11px;">${state.placeOfSupply || ''}</span>
                <span><strong>Total</strong></span>
              </div>
            </td>
            <td style="text-align: right; font-weight: 700;">${totals.totalQty > 0 ? totals.totalQty.toFixed(3) : ''}</td>
            <td></td>
            <td colspan="3" style="text-align: right;"><strong>Total</strong></td>
            <td style="text-align: right; font-weight: 700;">${totals.taxableAmount > 0 ? totals.taxableAmount.toFixed(2) : ''}</td>
          </tr>
        </tfoot>
      </table>

      <!-- GST Breakdown & Shipping Bill details -->
      <div class="gst-calc-grid">
        <div class="gst-calc-left">
          ${state.remarks ? `<div><strong>Remarks :</strong> ${state.remarks}</div>` : ''}
          <div style="margin-top: 6px; font-size: 11px;">
            ${state.shippingBillType ? `<div><strong>${state.shippingBillType}</strong></div>` : ''}
            ${state.shippingBillCode ? `<div>SHIPPING BILL CODE : ${state.shippingBillCode}</div>` : ''}
            ${state.shippingBillNo ? `<div>SHIPPING BILL NO : ${state.shippingBillNo} ${state.shippingBillDate ? `&nbsp; DATED : ${state.shippingBillDate}` : ''}</div>` : ''}
          </div>
        </div>
        <div class="gst-calc-right">
          <table class="gst-subtotal-table">
            <tr>
              <td>Total GST : ${totals.taxAmount > 0 ? totals.taxAmount.toFixed(2) : '0.00'}</td>
              <td>IGST @${totals.taxRate.toFixed(2)} %</td>
              <td style="text-align: right;">${totals.taxAmount > 0 ? totals.taxAmount.toFixed(2) : '0.00'}</td>
            </tr>
            <tr>
              <td colspan="2">R/OFF.</td>
              <td style="text-align: right;">${totals.roundOff !== 0 ? (totals.roundOff >= 0 ? '+' : '') + totals.roundOff.toFixed(2) : '0.00'}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Grand Total & Words Bar -->
      <div class="gst-grand-total-bar">
        <div class="gst-words-text">${totals.grandTotal > 0 ? totals.totalInWordsIndian : ''}</div>
        <div class="gst-grand-amount">
          <span>Grand Total</span>
          <span class="gst-grand-num">${formatCurrency(totals.grandTotal, 'INR')}</span>
        </div>
      </div>

      <!-- Bank Details -->
      ${hasBankDetails ? `
        <div class="gst-bank-bar">
          <div class="gst-bank-title">Bank Detail</div>
          <div class="gst-bank-details">
            <strong>${state.bankName || ''}</strong> &nbsp;&nbsp;
            ${state.bankAccountNo ? `A/C NO. ${state.bankAccountNo}` : ''} &nbsp;&nbsp;
            ${state.bankIfsc ? `IFS CODE : ${state.bankIfsc}` : ''}
          </div>
        </div>
      ` : ''}

      <!-- Terms & Signature footer -->
      <div class="gst-footer-grid">
        <div class="gst-terms-box">
          <strong>Terms & Conditions :</strong>
          <div>${(state.termsAndConditions || '').replace(/\n/g, '<br>')}</div>
          <div class="gst-cust-sign">Customer's Sign.</div>
        </div>
        <div class="gst-sign-box">
          <div class="gst-sign-for">${state.companyName ? `FOR ${state.companyName}` : ''}</div>
          <div class="gst-auth-sign">${state.signatoryTitle || 'Authorised Signatory'}</div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. RENDER E-WAY BILL
// ----------------------------------------------------
function renderEwayBill(totals) {
  const qrSvg = generateQrCodeSvg(`EWAY:${state.ewayBillNo || '000000000000'}|${state.senderGstin || ''}|${totals.taxableAmount}`, 105);
  const bottomBarcodeSvg = generateBarcodeSvg(state.ewayBillNo || '000000000000', 240, 40);

  return `
    <div class="print-doc eway-bill-doc">
      <!-- Top header line -->
      <div class="eway-header-top">
        <div class="eway-print-date">${state.invoiceDate || ''}</div>
        <div class="eway-badge-logo">
          <div style="font-size: 14px; font-weight: 800; color: #b91c1c; line-height: 1.1;">e-Way Bill System</div>
        </div>
      </div>

      <div class="eway-title-block">
        <h2 class="eway-main-title">e-Way Bill</h2>
        <div class="eway-qr-container">${qrSvg}</div>
      </div>

      <!-- Header Meta Block -->
      <div class="eway-meta-grid">
        <div class="eway-meta-row">
          <span class="eway-meta-label">E-Way Bill No:</span>
          <span class="eway-meta-val bold-text">${state.ewayBillNo || ''}</span>
        </div>
        <div class="eway-meta-row">
          <span class="eway-meta-label">E-Way Bill Date:</span>
          <span class="eway-meta-val">${state.ewayBillDate || ''}</span>
        </div>
        <div class="eway-meta-row">
          <span class="eway-meta-label">Generated By:</span>
          <span class="eway-meta-val">${state.generatedBy || (state.senderGstin ? `${state.senderGstin} - ${state.companyName}` : '')}</span>
        </div>
        <div class="eway-meta-row">
          <span class="eway-meta-label">Valid From:</span>
          <span class="eway-meta-val">${state.validFrom || ''} ${state.distanceKm ? `[${state.distanceKm} Kms]` : ''}</span>
        </div>
        <div class="eway-meta-row">
          <span class="eway-meta-label">Valid Until:</span>
          <span class="eway-meta-val">${state.validUntil || ''}</span>
        </div>
      </div>

      <!-- PART - A Header -->
      <div class="eway-section-banner">PART – A</div>
      <table class="eway-parta-table">
        <tr>
          <td class="eway-label-col">GSTIN of Supplier</td>
          <td>${state.senderGstin || ''} ${state.companyName ? `, ${state.companyName}` : ''}</td>
        </tr>
        <tr>
          <td class="eway-label-col">Place of Dispatch</td>
          <td>${state.placeOfDispatch || ''}</td>
        </tr>
        <tr>
          <td class="eway-label-col">GSTIN of Recipient</td>
          <td>${state.recipientGstin || ''} ${state.recipientName ? `, ${state.recipientName}` : ''}</td>
        </tr>
        <tr>
          <td class="eway-label-col">Place of Delivery</td>
          <td>${state.placeOfDelivery || ''}</td>
        </tr>
        <tr>
          <td class="eway-label-col">Document No.</td>
          <td>${state.documentNo || state.invoiceNumber || ''}</td>
        </tr>
        <tr>
          <td class="eway-label-col">Document Date</td>
          <td>${state.documentDate || state.invoiceDate || ''}</td>
        </tr>
        <tr>
          <td class="eway-label-col">Value of Goods</td>
          <td class="bold-text">₹ ${totals.grandTotal > 0 ? totals.grandTotal : (state.valueOfGoods || '0.00')}</td>
        </tr>
        <tr>
          <td class="eway-label-col">Transaction Type</td>
          <td>${state.transactionType || 'Regular'}</td>
        </tr>
        <tr>
          <td class="eway-label-col">HSN Code</td>
          <td>${state.mainHsnCode || (state.items[0] && state.items[0].hsnCode ? `${state.items[0].hsnCode} - ${state.items[0].description}` : '')}</td>
        </tr>
        <tr>
          <td class="eway-label-col">Reason for Transportation</td>
          <td>${state.reasonForTransport || 'Outward - Supply'}</td>
        </tr>
        <tr>
          <td class="eway-label-col">Transporter</td>
          <td>${state.transporterInfo || (state.transporterId ? `${state.transporterId} ${state.transporterName}` : '')}</td>
        </tr>
      </table>

      <!-- PART - B Header -->
      <div class="eway-section-banner" style="margin-top: 24px;">PART – B</div>
      <table class="eway-partb-table">
        <thead>
          <tr>
            <th>Mode</th>
            <th>Vehicle / Trans Doc No & Dt</th>
            <th>From</th>
            <th>Entered Date</th>
            <th>Entered By</th>
            <th>CEWB No. (if any)</th>
            <th>Multi Veh.Info (If any)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${state.transportMode || 'Road'}</td>
            <td><strong>${state.vehicleNo || ''}</strong><br>${state.transDocNo || ''} ${state.transDocDate || ''}</td>
            <td>${state.fromLocation || ''}</td>
            <td>${state.enteredDate || ''}</td>
            <td>${state.enteredBy || state.senderGstin || ''}</td>
            <td>${state.cewbNo || '0'}</td>
            <td>${state.multiVehInfo || ''}</td>
          </tr>
        </tbody>
      </table>

      <!-- Bottom Barcode & Footer -->
      <div class="eway-bottom-barcode">
        ${bottomBarcodeSvg}
      </div>
      <div class="eway-footer-line">
        Official e-Way Bill Format
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. RENDER PROFORMA INVOICE
// ----------------------------------------------------
function renderProformaInvoice(totals) {
  const symbol = CURRENCY_SYMBOLS[state.currency] || '$';

  return `
    <div class="print-doc proforma-doc">
      <!-- Header Banner -->
      <div class="proforma-top-bar">PROFORMA INVOICE</div>

      <!-- Top Two Columns Header -->
      <div class="proforma-header-grid">
        <div class="proforma-exporter-box">
          <div class="proforma-label">Exporter :</div>
          <div class="proforma-exp-name">${state.companyName || ''}</div>
          <div class="proforma-exp-address">${(state.senderInfo || '').replace(/\n/g, '<br>')}</div>
        </div>

        <div class="proforma-order-meta">
          <table class="proforma-meta-table">
            <tr>
              <td class="proforma-meta-label">PROFORMA INVOICE NO :</td>
              <td class="proforma-meta-val bold-text">${state.invoiceNumber || ''}</td>
            </tr>
            <tr>
              <td class="proforma-meta-label">DATED :</td>
              <td class="proforma-meta-val">${state.invoiceDate || ''}</td>
            </tr>
            ${state.paymentTerms ? `<tr><td class="proforma-meta-label">PAYMENT TERMS :</td><td class="proforma-meta-val">${state.paymentTerms}</td></tr>` : ''}
            ${state.deliveryTerms ? `<tr><td class="proforma-meta-label">DELIVERY DATE :</td><td class="proforma-meta-val">${state.deliveryTerms}</td></tr>` : ''}
          </table>
        </div>
      </div>

      <!-- Consignee Box -->
      <div class="proforma-consignee-box">
        <div class="proforma-label">Consignee :</div>
        <div class="proforma-consignee-name">${state.recipientName || ''}</div>
        <div>${(state.recipientInfo || '').replace(/\n/g, '<br>')}</div>
      </div>

      <!-- Items Table -->
      <table class="proforma-items-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">Sr. No.</th>
            <th>Description of Goods</th>
            <th style="width: 70px; text-align: right;">Quantity</th>
            <th style="width: 60px; text-align: center;">Unit</th>
            <th style="width: 90px; text-align: right;">Rate (${state.currency || 'USD'})</th>
            <th style="width: 110px; text-align: right;">Amount (${state.currency || 'USD'} ${state.priceTerms || 'C.I.F'})</th>
          </tr>
        </thead>
        <tbody>
          ${state.items.map((item, idx) => {
            const qty = parseFloat(item.qty) || 0;
            const price = parseFloat(item.price) || 0;
            const amount = qty * price;
            const isHighlighted = item.highlighted ? 'class="row-highlighted"' : '';

            return `
              <tr ${isHighlighted}>
                <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
                <td class="item-desc-cell">${item.description || ''}</td>
                <td style="text-align: right;">${qty > 0 ? qty.toLocaleString() : ''}</td>
                <td style="text-align: center;">${item.unit || 'PCS'}</td>
                <td style="text-align: right;">${price > 0 ? price.toFixed(3) : ''}</td>
                <td style="text-align: right; font-weight: 700;">${amount > 0 ? amount.toFixed(2) : ''}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Totals Bar -->
      <div class="proforma-total-bar">
        <div class="proforma-words">${totals.grandTotal > 0 ? totals.totalInWordsInternational : ''}</div>
        <div class="proforma-cif-sum">
          <span>${state.priceTerms || 'C.I.F'}</span>
          <span class="proforma-total-amount">${formatCurrency(totals.taxableAmount, state.currency || 'USD')}</span>
        </div>
      </div>

      <!-- Signature Footer -->
      <div class="proforma-footer">
        <div class="proforma-sign-box">
          <div>${state.companyName ? `FOR ${state.companyName}` : ''}</div>
          <div class="proforma-sign-title">${state.signatoryTitle || 'PROP.'}</div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. RENDER CUSTOMS COMMERCIAL EXPORT INVOICE
// ----------------------------------------------------
function renderCommercialInvoice(totals) {
  return `
    <div class="print-doc commercial-doc">
      <!-- Document Header -->
      <div class="comm-header-title">EXPORT INVOICE</div>
      <div class="comm-export-note">${state.exportHeaderNote || 'SUPPLY MEANT FOR EXPORT ON PAYMENT OF IGST'}</div>

      <!-- Top Details Grid -->
      <div class="comm-top-grid">
        <!-- Exporter Box -->
        <div class="comm-box comm-exporter">
          <div class="comm-box-label">Exporter:</div>
          <div class="comm-firm-name">${state.companyName || ''}</div>
          <div class="comm-deals">${state.dealsIn || ''}</div>
          <div class="comm-address">${(state.senderInfo || '').replace(/\n/g, '<br>')}</div>
          <div class="comm-contact">
            <div>${state.senderEmail ? `E-Mail : ${state.senderEmail}` : ''}</div>
            <div>${state.senderPhone ? `Tel/Fax No. : ${state.senderPhone}` : ''}</div>
            <div>${state.iecNo ? `<strong>IEC :</strong> ${state.iecNo}` : ''} &nbsp;&nbsp; ${state.senderPan ? `<strong>PAN :</strong> ${state.senderPan}` : ''}</div>
            <div>${state.senderGstin ? `<strong>GSTIN/UID :</strong> ${state.senderGstin}` : ''}</div>
          </div>
        </div>

        <!-- Right Side: Order & Invoice details -->
        <div class="comm-right-col">
          <div class="comm-box comm-inv-meta">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <strong>Invoice No. & Date :</strong> ${state.invoiceNumber || ''}<br>
                <strong>DATED :</strong> ${state.invoiceDate || ''}
              </div>
              <div>
                ${state.buyerOrderNo ? `<strong>Buyer's Order No.& Date :</strong><br>${state.buyerOrderNo}` : ''}
              </div>
            </div>
            ${state.buyerOtherInfo ? `
              <div style="margin-top: 6px; border-top: 1px solid #000; padding-top: 4px;">
                <strong>Buyer (if other than consignee) :</strong> ${state.buyerOtherInfo}
              </div>
            ` : ''}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr;">
            <div class="comm-box comm-country-orig">
              <strong>Country of Origin of Goods</strong><br>
              ${state.countryOfOrigin || 'INDIAN'}
            </div>
            <div class="comm-box comm-country-dest">
              <strong>Country of Final Destination</strong><br>
              ${state.countryOfDestination || ''}
            </div>
          </div>

          <div class="comm-box comm-delivery-terms">
            <strong>Terms of Delivery & Payment :</strong> ${state.termsOfDelivery || ''}
          </div>
        </div>
      </div>

      <!-- Consignee & Shipping Grid -->
      <div class="comm-mid-grid">
        <div class="comm-box comm-consignee">
          <div class="comm-box-label">Consignee :</div>
          <div class="comm-consignee-name">${state.recipientName || ''}</div>
          <div>${(state.recipientInfo || '').replace(/\n/g, '<br>')}</div>
        </div>

        <div class="comm-box comm-shipping-meta">
          <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #000;">
            <div style="padding: 4px; border-right: 1px solid #000;">
              <strong>Pre-Carriage by :</strong><br>${state.preCarriageBy || ''}
            </div>
            <div style="padding: 4px;">
              <strong>Place of Receipt by Pre-Carrier :</strong><br>${state.placeOfReceipt || ''}
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr;">
            <div style="padding: 4px; border-right: 1px solid #000;">
              <strong>Vessel/Flight No. :</strong><br>${state.vesselFlightNo || ''}
            </div>
            <div style="padding: 4px;">
              <strong>Port of Loading :</strong><br>${state.portOfLoading || ''}
            </div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; border-left: 2px solid #000; border-right: 2px solid #000; border-bottom: 2px solid #000; font-size: 11px;">
        <div style="padding: 4px; border-right: 1px solid #000;">
          <strong>Port of Discharge :</strong><br>${state.portOfDischarge || ''}
        </div>
        <div style="padding: 4px; border-right: 1px solid #000;">
          <strong>Final Destination :</strong><br>${state.finalDestination || ''}
        </div>
        <div style="padding: 4px; border-right: 1px solid #000;">
          <strong>Marks & Nos. :</strong><br>${state.marksAndNos || ''}
        </div>
        <div style="padding: 4px;">
          <strong>No. & Kind of Pkgs :</strong><br>${state.packagesDesc || ''}
        </div>
      </div>

      <!-- Items Table -->
      <table class="comm-items-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">Sr</th>
            <th style="width: 80px; text-align: center;">HSN CODE</th>
            <th>DESCRIPTION OF GOODS</th>
            <th style="width: 100px; text-align: right;">QNTY. IN PCS/SET</th>
            <th style="width: 90px; text-align: right;">Rate US$</th>
            <th style="width: 110px; text-align: right;">Amount US$</th>
          </tr>
        </thead>
        <tbody>
          ${state.items.map((item, idx) => {
            const qty = parseFloat(item.qty) || 0;
            const price = parseFloat(item.price) || 0;
            const amount = qty * price;

            return `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td style="text-align: center;">${item.hsnCode || ''}</td>
                <td class="comm-desc-cell">${item.description || ''}</td>
                <td style="text-align: right;">${qty > 0 ? qty.toLocaleString() : ''} ${item.unit || 'PCS'}</td>
                <td style="text-align: right;">${price > 0 ? price.toFixed(3) : ''}</td>
                <td style="text-align: right; font-weight: 700;">${amount > 0 ? amount.toFixed(2) : ''}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="comm-weight-summary">
              <div>${state.totalPackages ? `<strong>TOTAL PKGS &nbsp;: &nbsp;</strong> ${state.totalPackages}` : ''}</div>
              <div>${state.totalGrossWeight ? `<strong>TOTAL GRS.WT. : &nbsp;</strong> ${state.totalGrossWeight}` : ''}</div>
              <div>${state.totalNetWeight ? `<strong>TOTAL NET.WT. : &nbsp;</strong> ${state.totalNetWeight}` : ''}</div>
            </td>
            <td colspan="2" style="text-align: right; font-weight: 700; vertical-align: middle;">TOTAL:</td>
            <td style="text-align: right; font-weight: 700; vertical-align: middle; font-size: 14px;">${formatCurrency(totals.taxableAmount, 'USD')}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Words Bar -->
      <div class="comm-words-bar">
        <strong>TOTAL IN WORDS :</strong> ${totals.grandTotal > 0 ? totals.totalInWordsInternational : ''}
      </div>

      <!-- Legal Declaration & Signature -->
      <div class="comm-footer-grid">
        <div class="comm-declaration-box">
          <strong>DECLARATION :</strong>
          <div>${state.declaration || ''}</div>
        </div>
        <div class="comm-sign-box">
          <div style="font-weight: 700;">${state.companyName ? `FOR ${state.companyName}` : ''}</div>
          <div class="comm-prop-label">${state.signatoryTitle || 'PROP.'}</div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. RENDER STANDARD MODERN INVOICE
// ----------------------------------------------------
function renderStandardInvoice(totals) {
  const symbol = CURRENCY_SYMBOLS[state.currency] || '$';

  return `
    <div class="print-doc standard-invoice-canvas">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
        <div>
          <h2 style="font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">${state.companyName || ''}</h2>
          <p style="font-size: 13px; color: #64748b; font-weight: 600;">${state.senderGstin ? `TAX ID: ${state.senderGstin}` : ''}</p>
        </div>
        <div style="text-align: right;">
          <h1 style="font-size: 36px; font-weight: 800; color: ${state.themeColor || '#10b981'}; margin: 0;">INVOICE</h1>
          <p style="color: #64748b; font-weight: 600; margin-top: 4px;"># <span>${state.invoiceNumber || ''}</span></p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
        <div>
          <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">From</p>
          <div style="font-size: 14px; white-space: pre-line; line-height: 1.6;">${state.senderInfo || ''}</div>
        </div>
        <div>
          <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Bill To</p>
          <div style="font-size: 14px; white-space: pre-line; line-height: 1.6;">${state.recipientInfo || ''}</div>
        </div>
      </div>

      <div style="margin-bottom: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">
        <p style="color: #64748b; font-size: 12px; font-weight: 700;">Issue Date: <span style="color: #1e293b; margin-left: 8px;">${state.invoiceDate || ''}</span></p>
      </div>

      <table class="items-table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 10px; text-align: left;">Description</th>
            <th style="padding: 10px; text-align: center;">${state.unitType || 'Qty'}</th>
            <th style="padding: 10px; text-align: right;">Price</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${state.items.map(item => {
            const total = (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0);
            return `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 10px;">${item.description || ''}</td>
                <td style="padding: 12px 10px; text-align: center;">${item.qty}</td>
                <td style="padding: 12px 10px; text-align: right;">${formatCurrency(item.price, state.currency)}</td>
                <td style="padding: 12px 10px; text-align: right; font-weight: 600;">${formatCurrency(total, state.currency)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-top: 30px;">
        <div style="min-width: 260px;">
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span style="color: #64748b;">Subtotal</span>
            <span>${formatCurrency(totals.subtotal, state.currency)}</span>
          </div>
          ${totals.discountAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 6px 0; color: ${state.themeColor || '#10b981'};">
              <span>${state.discountDesc || 'Discount'}</span>
              <span>-${formatCurrency(totals.discountAmount, state.currency)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #64748b;">Tax (${totals.taxRate}%)</span>
            <span>${formatCurrency(totals.taxAmount, state.currency)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0;">
            <span style="font-weight: 700; font-size: 16px;">Total</span>
            <span style="font-size: 22px; font-weight: 800; color: ${state.themeColor || '#10b981'};">${formatCurrency(totals.grandTotal, state.currency)}</span>
          </div>
        </div>
      </div>

      ${(state.notes || state.paymentInfo) ? `
        <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <div>
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Notes</p>
            <p style="font-size: 13px; color: #334155; white-space: pre-line;">${state.notes || ''}</p>
          </div>
          <div>
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Payment Instructions</p>
            <p style="font-size: 13px; color: #334155; white-space: pre-line;">${state.paymentInfo || ''}</p>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// ----------------------------------------------------
// MAIN PREVIEW RENDER DISPATCHER
// ----------------------------------------------------
export function renderPreview(elements) {
  if (!elements.previewCanvas) return;
  const totals = calculateTotals();

  let renderedHtml = '';
  switch (state.docType) {
    case 'gst_invoice':
      renderedHtml = renderGstInvoice(totals);
      break;
    case 'eway_bill':
      renderedHtml = renderEwayBill(totals);
      break;
    case 'proforma_invoice':
      renderedHtml = renderProformaInvoice(totals);
      break;
    case 'commercial_invoice':
      renderedHtml = renderCommercialInvoice(totals);
      break;
    case 'standard_invoice':
    default:
      renderedHtml = renderStandardInvoice(totals);
      break;
  }

  elements.previewCanvas.innerHTML = renderedHtml;
  if (window.lucide) window.lucide.createIcons();
}

// ----------------------------------------------------
// FORM SYNCHRONIZATION
// ----------------------------------------------------
export function syncFormInputs(elements) {
  if (elements.docTypeSelect) elements.docTypeSelect.value = state.docType || 'gst_invoice';
  
  // Highlight active doc tab
  document.querySelectorAll('.doc-type-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.doctype === state.docType);
  });

  // Toggle form sections visibility depending on doc type
  document.querySelectorAll('.doc-section').forEach(sec => {
    const supportedTypes = (sec.dataset.doctype || '').split(',').map(s => s.trim());
    if (supportedTypes.includes('all') || supportedTypes.includes(state.docType)) {
      sec.classList.remove('hidden');
    } else {
      sec.classList.add('hidden');
    }
  });

  if (elements.companyName) elements.companyName.value = state.companyName || '';
  if (elements.dealsIn) elements.dealsIn.value = state.dealsIn || '';
  if (elements.senderInfo) elements.senderInfo.value = state.senderInfo || '';
  if (elements.senderPhone) elements.senderPhone.value = state.senderPhone || '';
  if (elements.senderEmail) elements.senderEmail.value = state.senderEmail || '';
  if (elements.senderGstin) elements.senderGstin.value = state.senderGstin || '';
  if (elements.senderPan) elements.senderPan.value = state.senderPan || '';
  if (elements.senderState) elements.senderState.value = state.senderState || '';
  if (elements.senderStateCode) elements.senderStateCode.value = state.senderStateCode || '';
  if (elements.iecNo) elements.iecNo.value = state.iecNo || '';

  if (elements.invoiceNumber) elements.invoiceNumber.value = state.invoiceNumber || '';
  if (elements.invoiceDate) elements.invoiceDate.value = state.invoiceDate || '';
  if (elements.orderNo) elements.orderNo.value = state.orderNo || '';
  if (elements.orderDate) elements.orderDate.value = state.orderDate || '';

  if (elements.recipientName) elements.recipientName.value = state.recipientName || '';
  if (elements.recipientInfo) elements.recipientInfo.value = state.recipientInfo || '';
  if (elements.recipientGstin) elements.recipientGstin.value = state.recipientGstin || '';
  if (elements.recipientPan) elements.recipientPan.value = state.recipientPan || '';
  if (elements.recipientState) elements.recipientState.value = state.recipientState || '';
  if (elements.recipientStateCode) elements.recipientStateCode.value = state.recipientStateCode || '';

  if (elements.consigneeName) elements.consigneeName.value = state.consigneeName || '';
  if (elements.consigneeInfo) elements.consigneeInfo.value = state.consigneeInfo || '';
  if (elements.consigneeStateCode) elements.consigneeStateCode.value = state.consigneeStateCode || '';

  // Logistics & GST
  if (elements.placeOfSupply) elements.placeOfSupply.value = state.placeOfSupply || '';
  if (elements.placeOfDelivery) elements.placeOfDelivery.value = state.placeOfDelivery || '';
  if (elements.transporterName) elements.transporterName.value = state.transporterName || '';
  if (elements.transporterId) elements.transporterId.value = state.transporterId || '';
  if (elements.vehicleNo) elements.vehicleNo.value = state.vehicleNo || '';
  if (elements.grNo) elements.grNo.value = state.grNo || '';
  if (elements.grDate) elements.grDate.value = state.grDate || '';
  if (elements.pvtMark) elements.pvtMark.value = state.pvtMark || '';
  if (elements.ewayNo) elements.ewayNo.value = state.ewayNo || '';
  if (elements.reverseCharge) elements.reverseCharge.value = state.reverseCharge || 'N';
  if (elements.shippingBillType) elements.shippingBillType.value = state.shippingBillType || 'W PAY';
  if (elements.shippingBillCode) elements.shippingBillCode.value = state.shippingBillCode || '';
  if (elements.shippingBillNo) elements.shippingBillNo.value = state.shippingBillNo || '';
  if (elements.shippingBillDate) elements.shippingBillDate.value = state.shippingBillDate || '';
  if (elements.remarks) elements.remarks.value = state.remarks || '';

  // e-Way Bill
  if (elements.ewayBillNo) elements.ewayBillNo.value = state.ewayBillNo || '';
  if (elements.ewayBillDate) elements.ewayBillDate.value = state.ewayBillDate || '';
  if (elements.generatedBy) elements.generatedBy.value = state.generatedBy || '';
  if (elements.distanceKm) elements.distanceKm.value = state.distanceKm || '';
  if (elements.validFrom) elements.validFrom.value = state.validFrom || '';
  if (elements.validUntil) elements.validUntil.value = state.validUntil || '';
  if (elements.placeOfDispatch) elements.placeOfDispatch.value = state.placeOfDispatch || '';
  if (elements.documentNo) elements.documentNo.value = state.documentNo || '';
  if (elements.documentDate) elements.documentDate.value = state.documentDate || '';
  if (elements.transactionType) elements.transactionType.value = state.transactionType || 'Regular';
  if (elements.reasonForTransport) elements.reasonForTransport.value = state.reasonForTransport || 'Outward - Supply';
  if (elements.transportMode) elements.transportMode.value = state.transportMode || 'Road';
  if (elements.transDocNo) elements.transDocNo.value = state.transDocNo || '';
  if (elements.transDocDate) elements.transDocDate.value = state.transDocDate || '';
  if (elements.fromLocation) elements.fromLocation.value = state.fromLocation || '';

  // International & Customs
  if (elements.exportHeaderNote) elements.exportHeaderNote.value = state.exportHeaderNote || '';
  if (elements.buyerOrderNo) elements.buyerOrderNo.value = state.buyerOrderNo || '';
  if (elements.countryOfOrigin) elements.countryOfOrigin.value = state.countryOfOrigin || '';
  if (elements.countryOfDestination) elements.countryOfDestination.value = state.countryOfDestination || '';
  if (elements.termsOfDelivery) elements.termsOfDelivery.value = state.termsOfDelivery || '';
  if (elements.paymentTerms) elements.paymentTerms.value = state.paymentTerms || '';
  if (elements.deliveryTerms) elements.deliveryTerms.value = state.deliveryTerms || '';
  if (elements.preCarriageBy) elements.preCarriageBy.value = state.preCarriageBy || '';
  if (elements.placeOfReceipt) elements.placeOfReceipt.value = state.placeOfReceipt || '';
  if (elements.vesselFlightNo) elements.vesselFlightNo.value = state.vesselFlightNo || '';
  if (elements.portOfLoading) elements.portOfLoading.value = state.portOfLoading || '';
  if (elements.portOfDischarge) elements.portOfDischarge.value = state.portOfDischarge || '';
  if (elements.finalDestination) elements.finalDestination.value = state.finalDestination || '';
  if (elements.marksAndNos) elements.marksAndNos.value = state.marksAndNos || '';
  if (elements.packagesDesc) elements.packagesDesc.value = state.packagesDesc || '';
  if (elements.totalPackages) elements.totalPackages.value = state.totalPackages || '';
  if (elements.totalGrossWeight) elements.totalGrossWeight.value = state.totalGrossWeight || '';
  if (elements.totalNetWeight) elements.totalNetWeight.value = state.totalNetWeight || '';
  if (elements.declaration) elements.declaration.value = state.declaration || '';

  // Bank & General
  if (elements.currencySelect) elements.currencySelect.value = state.currency || 'INR';
  if (elements.bankName) elements.bankName.value = state.bankName || '';
  if (elements.bankAccountNo) elements.bankAccountNo.value = state.bankAccountNo || '';
  if (elements.bankIfsc) elements.bankIfsc.value = state.bankIfsc || '';
  if (elements.termsAndConditions) elements.termsAndConditions.value = state.termsAndConditions || '';
  if (elements.signatoryTitle) elements.signatoryTitle.value = state.signatoryTitle || 'Authorised Signatory';
  if (elements.notesInput) elements.notesInput.value = state.notes || '';
  if (elements.paymentInput) elements.paymentInput.value = state.paymentInfo || '';
  if (elements.themeColor) {
    elements.themeColor.value = state.themeColor || '#10b981';
    if (elements.colorValue) elements.colorValue.textContent = (state.themeColor || '#10b981').toUpperCase();
  }
}

export function render(elements, removeItem, updateItem) {
  applyTheme();
  syncFormInputs(elements);
  renderItemsEditor(elements, removeItem, updateItem);
  renderPreview(elements);
}

export function syncAuthUI(elements) {
  if (!elements.userInfo) return;
  if (auth.token) {
    elements.loginTrigger.classList.add('hidden');
    elements.userInfo.classList.remove('hidden');
    if (elements.userName) elements.userName.textContent = auth.username;
    if (elements.userInitial) elements.userInitial.textContent = (auth.username || 'U').charAt(0).toUpperCase();
    if (elements.verifyBanner) elements.verifyBanner.classList.toggle('hidden', auth.isVerified);
    if (elements.historySection) elements.historySection.classList.remove('hidden');
  } else {
    elements.loginTrigger.classList.remove('hidden');
    elements.userInfo.classList.add('hidden');
    if (elements.verifyBanner) elements.verifyBanner.classList.add('hidden');
    if (elements.historySection) elements.historySection.classList.add('hidden');
  }
}

export function renderHistory(elements, items, onSelect, onDelete) {
  if (!elements.historyList) return;
  elements.historyList.innerHTML = '';
  if (!items || items.length === 0) {
    elements.historyList.innerHTML = '<p style="color: var(--text-muted); font-size: 12px;">No saved invoices.</p>';
    return;
  }

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'history-item';
    el.innerHTML = `
      <div class="history-item-info">
        <p>${item.invoiceNumber || 'Invoice'}</p>
        <span>${item.invoiceDate || ''} • ${formatCurrency(item.grandTotal || item.subtotal || 0, item.currency || 'INR')}</span>
      </div>
      <button class="btn btn-ghost history-delete-btn" data-id="${item._id || item.id}">
        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
      </button>
    `;

    el.querySelector('.history-item-info').addEventListener('click', () => onSelect(item));
    el.querySelector('.history-delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      onDelete(item._id || item.id);
    });

    elements.historyList.appendChild(el);
  });
  if (window.lucide) window.lucide.createIcons();
}

export function updateRegionDropdown() {}
