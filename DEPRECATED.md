# DEPRECATION NOTICE: InvoiceApp Merged into H.A. Overseas Unified Platform

> [!WARNING]
> This standalone application is **DEPRECATED** and its independent cloud deployments (Render, Netlify, Heroku) should be retired.

## Summary of Migration
All invoicing domain logic, models, controllers, PDF rendering engines, tax calculation, and UI components from `InvoiceApp` have been merged directly into the core H.A. Overseas platform:
- **Unified Backend:** `order-creator-BE` ([Invoice.js](file:///home/ajitp/Projects/Order-Creator/order-creator-BE/src/models/Invoice.js), [invoiceController.js](file:///home/ajitp/Projects/Order-Creator/order-creator-BE/src/controllers/invoiceController.js), [invoiceRoutes.js](file:///home/ajitp/Projects/Order-Creator/order-creator-BE/src/routes/invoiceRoutes.js), and commercial/GST invoice PDF generator in [pdfGenerator.js](file:///home/ajitp/Projects/Order-Creator/order-creator-BE/src/utils/pdfGenerator.js)).
- **Unified Frontend:** `order-creator-FE`
  - Invoices List: [InvoicesPage.jsx](file:///home/ajitp/Projects/Order-Creator/order-creator-FE/src/pages/invoices/InvoicesPage.jsx) (`/invoices`)
  - Invoice Details & Ledger: [InvoiceDetailPage.jsx](file:///home/ajitp/Projects/Order-Creator/order-creator-FE/src/pages/invoices/InvoiceDetailPage.jsx) (`/invoices/:id`)
  - Standalone & Order-linked Creator: [CreateInvoicePage.jsx](file:///home/ajitp/Projects/Order-Creator/order-creator-FE/src/pages/invoices/CreateInvoicePage.jsx) (`/invoices/new`)
  - Admin Hub Invoicing: [AdminDashboard.jsx](file:///home/ajitp/Projects/Order-Creator/order-creator-FE/src/pages/admin/AdminDashboard.jsx)
  - Buyer Portal Invoices: [MyOrdersPage.jsx](file:///home/ajitp/Projects/Order-Creator/order-creator-FE/src/pages/orders/MyOrdersPage.jsx)
- **Unified Database:** Single MongoDB database containing both `orders` and `invoices` collections with single source of truth for customers and catalog pricing.
- **Automated Test Suite:** Vitest test suite in `order-creator-BE` with 120 unit and integration tests verifying tax calculations, ownership checks, payment recording, and voiding.

## Standalone Deployment Decommissioning Steps
1. **Render:** Remove or spin down the standalone `InvoiceApp` service.
2. **Netlify:** Archive the standalone frontend deployment.
3. **Heroku:** Delete the legacy Procfile application dyno.
4. **Environment:** No separate `INVOICE_SERVICE_URL` or internal shared secret required; all invoice operations run within the unified API and React client.
