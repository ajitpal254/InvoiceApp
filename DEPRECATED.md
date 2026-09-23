# DEPRECATION NOTICE: InvoiceApp Merged into H.A. Overseas Unified Platform

> [!WARNING]
> This standalone application is **DEPRECATED** and its independent cloud deployments (Render, Netlify, Heroku) should be retired.

## Summary of Migration
All invoicing domain logic, models, controllers, PDF rendering engines, tax calculation, and UI components from `InvoiceApp` have been merged directly into the core H.A. Overseas platform:
- **Unified Backend:** `order-creator-BE` ([src/models/Invoice.js](file:///home/ajitp/Projects/Order-Creator/order-creator-BE/src/models/Invoice.js), [src/controllers/invoiceController.js](file:///home/ajitp/Projects/Order-Creator/order-creator-BE/src/controllers/invoiceController.js), [src/routes/invoiceRoutes.js](file:///home/ajitp/Projects/Order-Creator/order-creator-BE/src/routes/invoiceRoutes.js), and commercial invoice PDF generator in [src/utils/pdfGenerator.js](file:///home/ajitp/Projects/Order-Creator/order-creator-BE/src/utils/pdfGenerator.js)).
- **Unified Frontend:** `order-creator-FE` ([src/pages/admin/AdminDashboard.jsx](file:///home/ajitp/Projects/Order-Creator/order-creator-FE/src/pages/admin/AdminDashboard.jsx) with Commercial Invoices tab, and [src/pages/orders/MyOrdersPage.jsx](file:///home/ajitp/Projects/Order-Creator/order-creator-FE/src/pages/orders/MyOrdersPage.jsx) with Buyer Invoices tab).
- **Unified Database:** Single MongoDB database (`order-creator`) containing both `orders` and `invoices` collections with single source of truth for customers and catalog pricing.

## Standalone Deployment Decommissioning
1. **Render:** Remove or spin down the standalone `InvoiceApp` service.
2. **Netlify:** Archive the standalone frontend deployment.
3. **Heroku:** Delete the legacy Procfile application dyno.
4. **Environment:** No separate `INVOICE_SERVICE_URL` or internal shared secret required; all invoice operations run within the unified API and React client.
