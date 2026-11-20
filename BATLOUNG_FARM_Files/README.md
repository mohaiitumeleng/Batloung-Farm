> **Latest fix:** Unique IDs are now visible in Fruits, Suppliers and Vendors; supplier price editor retains and reloads costs. See `docs/IDS_PRICING_FIX_GUIDE.md`.

# Batloung Farm — Purple Orchard Edition

**Start here:** Read `docs/REDESIGN_AND_SUPPLIER_PRICING_GUIDE.md` before running the new project. **Existing database users MUST run only `database/05_supplier_prices_SAFE_MIGRATION.sql` after making a backup**, not the new-database schema or demo seed scripts.

The design uses the supplied fruit photograph and a dark violet/pink palette. Supplier purchase prices are saved by supplier, fruit and packaging size. Stock is grouped visually without denormalizing the original database.

**Pricing & credit update:** See `docs/PURCHASE_PRICING_AND_CREDIT_GUIDE.md` for purchase-cost previews, sales credit options and payment tests.

# Batloung Farm Distribution System

Full-stack university project based on the DIWA2110 assignment: MySQL 8, Node.js, Express, mysql2, React (Vite), with purchase/sale transactions, stock by packaging size, reporting and payment tracking.

## READ FIRST — preserve your existing work

This is a **reconstructed project package** based on the code and screenshots in our conversation, not an export of files from your Windows PC. Your original MySQL database (including your supplier and vendor records, purchases and sales) is NOT contained in this ZIP. **Back it up before changing anything.** Do not replace a working local project without making a copy.

- The `database/01_schema_NEW_DATABASE_ONLY.sql` and `02_demo_seed_NEW_DATABASE_ONLY.sql` files are **for setting up a new, empty database only**. Do not run the seed on your existing database.
- The demo seed uses invented businesses/test phone values; **it is not your existing real-supplier dataset**.
- Your original MySQL Workbench SQL script must be copied/exported separately if you want that precise history.
- No password or `.env` secret is included.
- Backend route code syntax was checked. Full runtime integration with YOUR database and React production build must be tested locally.
- React frontend is included as a working implementation candidate, but is unverified until you run it.

## Folder layout

```
BATLOUNG_FARM_COMPLETE/
  backend/      Express API, MySQL models, controllers, routes
  frontend/     React + Vite user interface
  database/     New install schema, example seed, four reports, ERD image
  docs/         Testing guide, submission checklist, assignment reference
```

## Fastest setup — using your already-created MySQL database

1. Make a backup of the working `BATLOUNG_FARM` folder. Keep your currently working `.env` private.
2. Leave MySQL80 **Running** in Windows Services. Verify your `batloung_farm` database exists.
3. Extract this ZIP to a **different folder**, such as `BATLOUNG_FARM_COMPLETE`.
4. Open the extracted folder in VS Code. Open a terminal inside `backend`.
5. Run `npm install`.
6. Copy `backend/.env.example` to `backend/.env` and enter your local MySQL password **on your PC**. Never upload that file.
7. Run `npm run dev`. Confirm `http://localhost:5000/api/health` reports `"database":"connected"`.
8. Run `npm run setup-admin` in the backend directory to create your administrator username and password. Restart backend if it was already running.
9. In a **second terminal**: `cd frontend`, then `npm install`, then `npm run dev`.
10. Open `http://localhost:5173` to see the React login. Sign in with your new administrator credentials.
11. Follow `docs/LOGIN_AND_MAPS_GUIDE.md` to test login, supplier/vendor CRUD and maps, then `docs/TESTING_GUIDE.md` for other features.

PowerShell commands (when opened in project root):

```powershell
cd backend
Copy-Item .env.example .env
# Edit .env and set your password, then:
npm install
npm run setup-admin
npm run dev
```

Second PowerShell terminal from project root:

```powershell
cd frontend
npm install
npm run dev
```

Optional frontend API URL: copy `frontend/.env.example` to `frontend/.env` if your backend runs on a different host.

## Demo from zero (new installation only)

Use MySQL Workbench to run `database/01_schema_NEW_DATABASE_ONLY.sql`, then `database/02_demo_seed_NEW_DATABASE_ONLY.sql`. **Do not do this on your existing data.** The seed creates 8 fruits, 8 sample suppliers, 8 sample vendors and 24 empty stock rows. Record purchases via the API to add stock.

## API groups

- `/api/suppliers` — supplier CRUD
- `/api/fruits` — fruit CRUD; new fruit creates SMALL/MEDIUM/LARGE zero-stock records
- `/api/stock`, `/api/stock/low`, `/api/stock/:fruitId` — stock views
- `/api/vendors`, `/api/vendors/search?q=fruit` — vendor management
- `/api/purchases` — transactional purchases
- `/api/sales` — transactional sales; rejects insufficient stock
- `/api/reports/top-fruits`, `/api/reports/revenue?start=2026-11-01&end=2026-11-30`, `/api/reports/top-vendor`, `/api/reports/stock`, `/api/reports/balances`
- `/api/payments/outstanding`, `POST /api/payments/:saleId` — update outstanding balance

### Login and Google Maps improvements

- A one-administrator login is now available. Create your credentials with `npm run setup-admin` in `backend/`; all `/api` routes apart from `/api/health` and `/api/auth/login` require a valid signed session.
- Both Suppliers and Vendors support Add, Edit and Delete from React. Linked purchase/sales records prevent deletion. Newly created vendors are selectable from the Sales form.
- Hovering or keyboard-focusing a supplier/vendor row updates its saved-location preview. An official Google Maps search link works without an API key. An embedded Google Map requires a restricted Google Maps Embed API key in `frontend/.env`. Locations are **not live GPS**. See `docs/LOGIN_AND_MAPS_GUIDE.md`.

### Limitations to address before public deployment

- This is a single-admin demo login, not a production-grade role-based authentication system. Security review and HTTPS are required before exposing real data.
- Additional payments are recorded as a new cumulative `amount_paid` on the sales row, **not** as separate auditable payment-history transactions. This respects the assignment's eight-table design but is not a full financial ledger.
- The frontend shows a streamlined demo interface; its forms and all endpoints need local end-to-end testing.
- A live hosted URL, GitHub repository URL and demo video are not provided by this ZIP: create them as final submission steps.

**Assignment integrity:** You should understand and adapt the source yourself, test it, and demonstrate your own work. The assignment document warns against submitting copied work.
