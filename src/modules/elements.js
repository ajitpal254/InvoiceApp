export const elements = {
  // Auth & Account
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
  verificationModal: document.getElementById('verification-modal'),
  closeVerifyModal: document.getElementById('close-verify-modal'),
  resendBtn: document.getElementById('resend-btn'),

  // Document Type & Presets
  docTypeSelect: document.getElementById('doc-type-select'),
  presetSelect: document.getElementById('preset-select'),

  // Exporter / Seller details
  companyName: document.getElementById('company-name'),
  dealsIn: document.getElementById('deals-in'),
  senderInfo: document.getElementById('sender-info'),
  senderPhone: document.getElementById('sender-phone'),
  senderEmail: document.getElementById('sender-email'),
  senderGstin: document.getElementById('sender-gstin'),
  senderPan: document.getElementById('sender-pan'),
  senderState: document.getElementById('sender-state'),
  senderStateCode: document.getElementById('sender-state-code'),
  iecNo: document.getElementById('iec-no'),

  // Invoice Meta
  billTitle: document.getElementById('bill-title'),
  billSubtype: document.getElementById('bill-subtype'),
  copyType: document.getElementById('copy-type'),
  invoiceNumber: document.getElementById('invoice-number'),
  invoiceDate: document.getElementById('invoice-date'),
  orderNo: document.getElementById('order-no'),
  orderDate: document.getElementById('order-date'),

  // Recipient / Billed To
  recipientName: document.getElementById('recipient-name'),
  recipientInfo: document.getElementById('recipient-info'),
  recipientGstin: document.getElementById('recipient-gstin'),
  recipientPan: document.getElementById('recipient-pan'),
  recipientState: document.getElementById('recipient-state'),
  recipientStateCode: document.getElementById('recipient-state-code'),

  // Consignee
  consigneeName: document.getElementById('consignee-name'),
  consigneeInfo: document.getElementById('consignee-info'),
  consigneeStateCode: document.getElementById('consignee-state-code'),

  // Logistics & GST Details
  placeOfSupply: document.getElementById('place-of-supply'),
  placeOfDelivery: document.getElementById('place-of-delivery'),
  transporterName: document.getElementById('transporter-name'),
  transporterId: document.getElementById('transporter-id'),
  vehicleNo: document.getElementById('vehicle-no'),
  grNo: document.getElementById('gr-no'),
  grDate: document.getElementById('gr-date'),
  pvtMark: document.getElementById('pvt-mark'),
  ewayNo: document.getElementById('eway-no'),
  reverseCharge: document.getElementById('reverse-charge'),
  shippingBillType: document.getElementById('shipping-bill-type'),
  shippingBillCode: document.getElementById('shipping-bill-code'),
  shippingBillNo: document.getElementById('shipping-bill-no'),
  shippingBillDate: document.getElementById('shipping-bill-date'),
  remarks: document.getElementById('remarks'),

  // e-Way Bill Fields
  ewayBillNo: document.getElementById('eway-bill-no'),
  ewayBillDate: document.getElementById('eway-bill-date'),
  generatedBy: document.getElementById('generated-by'),
  distanceKm: document.getElementById('distance-km'),
  validFrom: document.getElementById('valid-from'),
  validUntil: document.getElementById('valid-until'),
  placeOfDispatch: document.getElementById('place-of-dispatch'),
  documentNo: document.getElementById('document-no'),
  documentDate: document.getElementById('document-date'),
  transactionType: document.getElementById('transaction-type'),
  reasonForTransport: document.getElementById('reason-for-transport'),
  transportMode: document.getElementById('transport-mode'),
  transDocNo: document.getElementById('trans-doc-no'),
  transDocDate: document.getElementById('trans-doc-date'),
  fromLocation: document.getElementById('from-location'),

  // Customs & Shipping Fields
  exportHeaderNote: document.getElementById('export-header-note'),
  buyerOrderNo: document.getElementById('buyer-order-no'),
  countryOfOrigin: document.getElementById('country-of-origin'),
  countryOfDestination: document.getElementById('country-of-destination'),
  termsOfDelivery: document.getElementById('terms-of-delivery'),
  paymentTerms: document.getElementById('payment-terms'),
  deliveryTerms: document.getElementById('delivery-terms'),
  preCarriageBy: document.getElementById('pre-carriage-by'),
  placeOfReceipt: document.getElementById('place-of-receipt'),
  vesselFlightNo: document.getElementById('vessel-flight-no'),
  portOfLoading: document.getElementById('port-of-loading'),
  portOfDischarge: document.getElementById('port-of-discharge'),
  finalDestination: document.getElementById('final-destination'),
  marksAndNos: document.getElementById('marks-and-nos'),
  packagesDesc: document.getElementById('packages-desc'),
  totalPackages: document.getElementById('total-packages'),
  totalGrossWeight: document.getElementById('total-gross-weight'),
  totalNetWeight: document.getElementById('total-net-weight'),
  declaration: document.getElementById('declaration'),

  // Items Editor
  itemsEditor: document.getElementById('items-editor-list'),
  addBtn: document.getElementById('add-item-btn'),

  // Bank & Preferences
  bankName: document.getElementById('bank-name'),
  bankAccountNo: document.getElementById('bank-account-no'),
  bankIfsc: document.getElementById('bank-ifsc'),
  termsAndConditions: document.getElementById('terms-and-conditions'),
  signatoryTitle: document.getElementById('signatory-title'),
  currencySelect: document.getElementById('currency-select'),
  themeColor: document.getElementById('theme-color'),
  colorValue: document.getElementById('color-value'),
  notesInput: document.getElementById('invoice-notes'),
  paymentInput: document.getElementById('payment-info'),

  // Actions
  exportBtn: document.getElementById('export-btn'),
  resetBtn: document.getElementById('reset-btn'),

  // Preview Canvas
  previewCanvas: document.getElementById('invoice-canvas'),
  historySection: document.getElementById('history-section'),
  historyList: document.getElementById('history-list')
};
