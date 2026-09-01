/**
 * Generic Sample Presets for Testing & Demonstration (Zero Real User Data)
 */

export const PRESETS = {
  gst_invoice: {
    docType: 'gst_invoice',
    companyName: 'GLOBAL EXPORT CORP',
    dealsIn: 'MANUFACTURERS & EXPORTERS OF INDUSTRIAL GOODS',
    senderInfo: 'PLOT NO. 100, PHASE-1, INDUSTRIAL AREA\nLUDHIANA-141003, PUNJAB (INDIA)',
    senderPhone: '+91 98765 43210',
    senderEmail: 'contact@example.com',
    senderGstin: '03AAAAA0000A1Z5',
    senderPan: 'AAAAA0000A',
    senderState: 'Punjab',
    senderStateCode: '03',
    
    billTitle: 'EXPORT INVOICE',
    billSubtype: 'CREDIT BILL',
    copyType: 'Original for Recipient',
    
    invoiceNumber: 'INV-101',
    invoiceDate: new Date().toISOString().split('T')[0],
    orderNo: 'ORD-902',
    orderDate: new Date().toISOString().split('T')[0],
    
    recipientName: 'INTERNATIONAL BUYERS LLC',
    recipientInfo: 'INTERNATIONAL BUYERS LLC\nP.O. BOX 12345\nJEDDAH, SAUDI ARABIA',
    recipientPan: 'P',
    recipientGstin: 'URP',
    recipientState: 'OTHER TERRITORY',
    recipientStateCode: '97',
    
    consigneeInfo: '',
    consigneeStateCode: '',
    
    placeOfSupply: 'Outside India',
    placeOfDelivery: '',
    ewayNo: '',
    
    transporterName: 'GLOBAL TRANS LOGISTICS',
    transporterId: '03AAAAA1111A1Z1',
    vehicleNo: 'PB10AB1234',
    grNo: '5001',
    grDate: new Date().toISOString().split('T')[0],
    pvtMark: '',
    
    reverseCharge: 'N',
    taxType: 'IGST',
    taxRate: 18,
    currency: 'INR',
    unitType: 'KGS',
    
    shippingBillType: 'W PAY',
    shippingBillCode: '',
    shippingBillNo: '',
    shippingBillDate: '',
    remarks: 'CONTAINER NO: CONT-001234',
    
    bankName: 'HDFC BANK',
    bankAccountNo: '50200012345678',
    bankIfsc: 'HDFC0001234',
    
    termsAndConditions: '1. Payment due within 30 days of invoice date.\n2. Subject to local jurisdiction.\n3. Goods once sold will not be taken back.',
    signatoryTitle: 'Authorised Signatory',
    
    items: [
      { id: 1, description: 'STEEL FLANGE PLATES', hsnCode: '73084000', qty: 1000, unit: 'KGS', price: 250.00, discRate: 0, taxRate: 18 },
      { id: 2, description: 'HIGH TENSILE FASTENER NUTS', hsnCode: '73181600', qty: 500, unit: 'KGS', price: 180.00, discRate: 0, taxRate: 18 }
    ]
  },

  eway_bill: {
    docType: 'eway_bill',
    ewayBillNo: '361000000001',
    ewayBillDate: '24/09/2025 03:30:00 PM',
    generatedBy: '03AAAAA0000A1Z5 - GLOBAL EXPORT CORP',
    distanceKm: '1500',
    validFrom: '24/09/2025 03:30:00 PM',
    validUntil: '30/09/2025 11:59:00 PM',
    
    // Part A
    senderGstin: '03AAAAA0000A1Z5, GLOBAL EXPORT CORP',
    placeOfDispatch: 'LUDHIANA, PUNJAB - 141003',
    recipientGstin: 'URP , OVERSEAS TRADING LLC',
    placeOfDelivery: 'OTHER TERRITORY, OTHER TERRITORY-999999',
    documentNo: 'DOC-101',
    documentDate: '2025-09-24',
    valueOfGoods: 500000,
    transactionType: 'Regular',
    mainHsnCode: '73084000 - STEEL HARDWARE',
    reasonForTransport: 'Outward - Supply',
    transporterInfo: '03AAAAA1111A1Z1 GLOBAL TRANS LOGISTICS',
    
    // Part B
    transportMode: 'Road',
    vehicleNo: 'PB10AB1234',
    transDocNo: '1001',
    transDocDate: '24/09/2025',
    fromLocation: 'LUDHIANA',
    enteredDate: '24/09/2025 03:30:00 PM',
    enteredBy: '03AAAAA0000A1Z5',
    cewbNo: '0',
    multiVehInfo: '',
    
    items: [
      { id: 1, description: 'STEEL HARDWARE ITEMS', hsnCode: '73084000', qty: 100, unit: 'PCS', price: 5000, discRate: 0, taxRate: 18 }
    ]
  },

  proforma_invoice: {
    docType: 'proforma_invoice',
    companyName: 'APEX TOOLS & ENGINEERING CO.',
    dealsIn: 'Manufacturers & Exporters of Precision Hand Tools',
    senderInfo: 'INDUSTRIAL PARK, SECTOR 5\nPUNJAB (INDIA)',
    senderEmail: 'export@example.com',
    senderPhone: '+91 98765 43210',
    senderGstin: '03AAAAA0000A1Z5',
    senderPan: 'AAAAA0000A',
    iecNo: '0300000000',
    
    invoiceNumber: 'PI-2025-01',
    invoiceDate: '2025-05-10',
    paymentTerms: 'DP AT SIGHT / QUANTITY 10% MORE AND LESS ACCEPTABLE',
    deliveryTerms: '45 TO 60 DAYS',
    
    recipientName: 'OVERSEAS IMPORTERS LTD',
    recipientInfo: 'OVERSEAS IMPORTERS LTD\nCOMMERCIAL HARBOUR ROAD\nCOLOMBO, SRI LANKA',
    
    currency: 'USD',
    priceTerms: 'C.I.F',
    signatoryTitle: 'PROPRIETOR',
    
    items: [
      { id: 1, description: 'PRECISION MAGNETIC PULLER', qty: 200, unit: 'PCS', price: 2.50, highlighted: false },
      { id: 2, description: 'RATCHET DIE SET (1/2"- 1")', qty: 50, unit: 'SET', price: 12.00, highlighted: true },
      { id: 3, description: 'PROFESSIONAL HAND TAPS 10X1.25MM', qty: 100, unit: 'SET', price: 1.20, highlighted: true },
      { id: 4, description: 'HEAVY DUTY BEARING PULLER', qty: 150, unit: 'PCS', price: 4.50, highlighted: false }
    ]
  },

  commercial_invoice: {
    docType: 'commercial_invoice',
    companyName: 'INTERNATIONAL EXPORTS PVT LTD',
    dealsIn: '(Manufacturers & Exporters of Industrial Hardware)',
    senderInfo: 'EXPORT PROMOTION ZONE, PHASE-2\nPUNJAB-141003 (INDIA)',
    senderEmail: 'shipping@example.com',
    senderPhone: '+91 161 5000000',
    senderGstin: '03AAAAA0000A1Z5',
    senderPan: 'AAAAA0000A',
    iecNo: '0300000000',
    
    exportHeaderNote: 'SUPPLY MEANT FOR EXPORT ON PAYMENT OF IGST',
    
    invoiceNumber: 'EXP-2025-08',
    invoiceDate: '2025-06-20',
    buyerOrderNo: 'PO-8821 DATED 10.05.2025',
    buyerOtherInfo: '',
    
    recipientName: 'PACIFIC TRADING CO.',
    recipientInfo: 'PACIFIC TRADING CO.\nNO. 12 HARBOUR ROAD\nCOLOMBO, SRI LANKA',
    
    countryOfOrigin: 'INDIAN',
    countryOfDestination: 'COLOMBO, SRI LANKA',
    termsOfDelivery: 'CIF, COLOMBO SRI LANKA USD, DP AT SIGHT',
    
    preCarriageBy: 'BY ROAD/RAIL',
    placeOfReceipt: 'LUDHIANA',
    vesselFlightNo: '',
    portOfLoading: 'ANY PORT INDIA',
    portOfDischarge: 'COLOMBO, SRI LANKA',
    finalDestination: 'COLOMBO, SRI LANKA',
    marksAndNos: 'PKG 1-250',
    packagesDesc: '250 CARTONS',
    
    totalPackages: '250 PKGS.',
    totalGrossWeight: '1500.000 KGS.',
    totalNetWeight: '1350.000 KGS.',
    
    declaration: '1. We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
    signatoryTitle: 'AUTHORISED SIGNATORY',
    currency: 'USD',
    
    items: [
      { id: 1, hsnCode: '8205.59', description: 'INDUSTRIAL MAGNETIC PULLER', qty: 250, unit: 'PCS', price: 2.10 },
      { id: 2, hsnCode: '8207.40', description: 'PIPE THREADER RATCHET SET', qty: 80, unit: 'SET', price: 11.50 },
      { id: 3, hsnCode: '8205.59', description: 'PROFESSIONAL TAP HANDLE 1/2"', qty: 100, unit: 'PCS', price: 1.85 }
    ]
  },

  standard_invoice: {
    docType: 'standard_invoice',
    companyName: 'Lumina Digital Solutions',
    dealsIn: 'Cloud Architecture & IT Consulting',
    senderInfo: 'Suite 400, Innovation Tower\nToronto, ON M5X 1A9, Canada',
    senderPhone: '+1 (416) 555-0199',
    senderEmail: 'billing@example.com',
    senderGstin: 'BN 000000000 RT0001',
    senderState: 'Ontario',
    senderStateCode: 'ON',
    
    invoiceNumber: 'INV-2026-001',
    invoiceDate: new Date().toISOString().split('T')[0],
    
    recipientName: 'Acme Global Corp',
    recipientInfo: 'Acme Global Corp\n100 Enterprise Way\nNew York, NY 10001, USA',
    
    currency: 'USD',
    unitType: 'Hrs',
    themeColor: '#10b981',
    
    notes: 'Payment is due within 30 days of invoice date.',
    paymentInfo: 'Bank: Standard Bank\nRouting: 000000000\nAccount: 000012345678',
    
    items: [
      { id: 1, description: 'Cloud Infrastructure Consulting', qty: 20, unit: 'Hrs', price: 150.00 },
      { id: 2, description: 'System Architecture Design', qty: 10, unit: 'Hrs', price: 175.00 }
    ]
  }
};
