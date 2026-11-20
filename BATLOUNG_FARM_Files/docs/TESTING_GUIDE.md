# BATLOUNG FARM — STEP-BY-STEP TESTING GUIDE

Use this checklist on your Windows laptop. Tests marked **READ ONLY** do not change your data. Tests marked **WRITES DATA** create or update database records, so first export a backup from MySQL Workbench (**Server → Data Export**) or use `mysqldump`.

## Login and API authorization (new version)

This updated application requires administrator login for all business API endpoints. Set up credentials once inside backend with `npm run setup-admin` and restart the backend. Open React at `http://localhost:5173` and log in; it automatically supplies the token to its own API requests.

For **Postman** tests, first make `POST http://localhost:5000/api/auth/login` with raw JSON:

```json
{"username":"YOUR_ADMIN_USERNAME","password":"YOUR_ADMIN_PASSWORD"}
```

Copy the returned `token`. Set each protected request's **Authorization → Bearer Token** to that value. Do not show the token or password in screenshots. In a plain browser tab, opening `/api/suppliers` without a bearer token should return **401**; that's expected. The `/api/health` endpoint stays public. Do not put your password in the URL.

The optional `npm run smoke` script now accepts a `TEST_BEARER_TOKEN` environment variable; otherwise protected endpoints will return 401. You can skip that script and verify via the logged-in frontend. For new Add/Edit/Delete and Google Maps tests, see `LOGIN_AND_MAPS_GUIDE.md`.

## 0. Before anything: back up your original database

In MySQL Workbench: **Server → Data Export → batloung_farm → Export to Self-Contained File → Start Export**.

Alternative in CMD (not inside the `mysql>` prompt):

```bat
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p --single-transaction --routines --triggers batloung_farm > "%USERPROFILE%\Desktop\batloung_farm_backup.sql"
```

Enter your password when prompted (it does not appear in the command). Keep the backup outside GitHub.

## 1. Start both servers

- In Windows Services make sure `MySQL80` is **Running**.
- VS Code terminal A: `cd backend` then `npm install` (first time only), then `npm run dev`.
- Confirm console reports `Server running on port 5000` and `MySQL database connected successfully!`.
- VS Code terminal B: `cd frontend` then `npm install` (first time only), then `npm run dev`.
- Open `http://localhost:5173` (React). Both terminals must stay open.
- If a terminal says `Cannot find module`, run `npm install` in that folder.
- If the browser returns 503 for `/api/health`, check `.env` settings and the MySQL80 service.

## 2. Quick read-only API checks

Use **Postman with Authorization: Bearer Token** for protected GETs, or use the logged-in React pages:

| Request | Expected |
| --- | --- |
| `GET http://localhost:5000/api/health` | `database: connected` |
| `GET http://localhost:5000/api/suppliers` | Array of suppliers |
| `GET http://localhost:5000/api/suppliers/1` | Supplier #1 or 404 if your IDs differ |
| `GET http://localhost:5000/api/fruits` | Eight existing fruit varieties |
| `GET http://localhost:5000/api/stock` | Your current 24 packaging stock rows |
| `GET http://localhost:5000/api/stock/1` | Three rows for fruit #1 |
| `GET http://localhost:5000/api/stock/low` | Low stock records (<= 10 boxes) |
| `GET http://localhost:5000/api/vendors` | Existing vendors |
| `GET http://localhost:5000/api/vendors/search?q=Fruit` | Matching vendors |
| `GET http://localhost:5000/api/purchases` | Purchase history, including initial M4,400 purchase |
| `GET http://localhost:5000/api/purchases/1` | Purchase with line items |
| `GET http://localhost:5000/api/sales` | Sales history, including initial M580 sale |
| `GET http://localhost:5000/api/sales/1` | Sale with two item lines |

From inside `backend`, you can also run `npm run smoke` with a valid `TEST_BEARER_TOKEN` environment variable to execute read-only GET checks automatically. This does NOT test POST, PUT or DELETE.

## 3. Four required reporting queries — READ ONLY

Run the SQL statements in `database/03_four_reports.sql` in MySQL Workbench, or use the reporting endpoints:

| Report | API | Expected |
| --- | --- | --- |
| Five top-selling fruits | `GET /api/reports/top-fruits` | Red Apples 5 boxes, Green Apples 3 boxes in original data |
| Revenue for period | `GET /api/reports/revenue?start=2026-11-01&end=2026-11-30` | M580 for original November sale (if no later sales) |
| Highest-volume vendor | `GET /api/reports/top-vendor` | Fruit & Veggies if original sale is the only sale |
| Stock by package | `GET /api/reports/stock` | All fruits with SMALL/MEDIUM/LARGE quantities |

`GET /api/reports/balances` is an additional vendor credit report.

## 4. Test supplier CRUD — WRITES DATA

In Postman select method, URL and `Body → raw → JSON`.

**POST `http://localhost:5000/api/suppliers`**

```json
{"business_name":"API Demo Supplier","contact_person":"Demo Person","phone":"TEST-SUP-101","province":"Gauteng","address":"Demo location, South Africa"}
```

Expect `201 Created`. Copy the returned `supplier_id` (may NOT be 9).

**PUT `/api/suppliers/RETURNED_ID`** using the body below:

```json
{"business_name":"API Updated Supplier","contact_person":"Updated Person","phone":"TEST-SUP-102","province":"Free State","address":"Updated demo location, South Africa"}
```

Expect `200 OK`. GET the same ID to verify it changed. Then **DELETE `/api/suppliers/RETURNED_ID`**. Expect `200 OK`; GET should subsequently return `404 Not Found`.

## 5. Fruit CRUD — WRITES DATA

**POST `/api/fruits`**:

```json
{"fruit_name":"Demo Pears","description":"Temporary test fruit","status":"AVAILABLE","price_small":42,"price_medium":84,"price_large":126}
```

Expect `201 Created`. Save the returned fruit ID. GET `/api/stock/FRUIT_ID` and verify exactly **three** new zero-quantity stock rows.

**PUT `/api/fruits/FRUIT_ID`** using changed values:

```json
{"fruit_name":"Demo Pears Updated","description":"Updated sample","status":"UNAVAILABLE","price_small":45,"price_medium":90,"price_large":135}
```

Expect `200 OK`. If you have not purchased/sold this demo fruit, **DELETE `/api/fruits/FRUIT_ID`** should remove it and its three zero-stock records. A fruit with stock or purchase/sale history must not be deleted; expect `409 Conflict`.

## 6. Vendor registration and search — WRITES DATA

**POST `/api/vendors`**:

```json
{"vendor_name":"API Demo Vendor","phone_number":"TEST-VEN-001","location":"Maseru, Lesotho"}
```

Expect `201 Created` and a vendor ID. Search using `/api/vendors/search?q=Demo`, then PUT `/api/vendors/RETURNED_ID` with updated name, phone, location. The updated application also supports vendor DELETE for unreferenced vendors. To test, delete only the temporary vendor you just created. A vendor referenced by sales correctly returns HTTP 409 and remains in the database.

## 7. Purchase transaction — WRITES DATA

Before recording a purchase, GET `/api/stock/1` and write down the SMALL quantity for fruit ID 1.

**POST `/api/purchases`**:

```json
{
  "supplier_id": 1,
  "items": [
    {"fruit_id":1,"packaging_size":"SMALL","quantity":3,"unit_cost":"32.00"},
    {"fruit_id":2,"packaging_size":"MEDIUM","quantity":2,"unit_cost":"62.00"}
  ]
}
```

Expect `201 Created`; expected total = **M220.00** (3×32 + 2×62). Inspect the new purchase details and ensure SMALL Red Apples stock increased by 3, MEDIUM Green Apples by 2. Do **not** click Send twice.

**Rollback validation check — WRITES NOTHING IF CORRECT:** POST with valid first item and an invalid second fruit ID `999999`, using a unique combination in each item. Expect `409 Conflict` or `404` and **no purchase header or stock change**. Compare purchases count and stock before/after. A rejected request must leave the database unchanged.

## 8. Sales and insufficient-stock rejection — WRITES DATA

Get stock quantities before testing. Record one successful low-quantity sale using quantities you know exist.

**POST `/api/sales`**:

```json
{
  "vendor_id": 1,
  "payment_method": "CREDIT",
  "amount_paid": "0.00",
  "items": [
    {"fruit_id":1,"packaging_size":"SMALL","quantity":1},
    {"fruit_id":2,"packaging_size":"MEDIUM","quantity":1}
  ]
}
```

Expect `201 Created` if the selected stock has at least one box of each. With original selling prices, total = **M160**. Outstanding = **M160**, payment status = `UNPAID`. Verify stock decreases by 1 for each item.

**Insufficient-stock rollback — WRITES NOTHING IF CORRECT:** POST another sale with two items: one with available stock and another with `quantity: 1000000` for a package that has fewer than 1,000,000. Expect **409 Conflict**. Check number of sales and quantities *before and after*: both must stay identical. This is important evidence for Part D. The failed transaction should not insert the sale or reduce stock.

## 9. Additional payment — WRITES DATA

From the successful CREDIT sale above, copy the sale ID.

**POST `/api/payments/SALE_ID`**:

```json
{"amount":"50.00","payment_method":"CASH"}
```

Expect `200 OK`; `amount_paid` increases by M50, the status becomes `PARTIALLY_PAID` and the outstanding balance decreases by M50. Paying the exact remainder should make the status `PAID`. Paying more than the outstanding balance should return **400 Bad Request** without changing anything.

**Design note:** This eight-table version stores cumulative payment amounts/status in `sales`; it does not provide an itemized payment receipt/history table.

## 10. React frontend end-to-end checks

In `http://localhost:5173`:

1. Dashboard — verify fruit count, stock total, vendor count and outstanding balance.
2. Fruits — verify eight fruit types, add a temporary fruit and edit it. Confirm 3 initial stock records are created.
3. Stock — verify rows for each package size, prices, low-stock warnings.
4. Suppliers — display, add and edit a test supplier.
5. Vendors — display, filter, add and edit a test vendor.
6. Purchases — select supplier, add two items, submit once; stock increases.
7. Sales — select vendor, two fruit items, payment method and amount; stock decreases. Try an excessive quantity; reject the sale.
8. Payments — make a payment to an outstanding sale; balance decreases.
9. Reports — generate all four required reports.
10. Refresh the page to confirm data is persisted in MySQL.

## 11. Troubleshooting

- `MySQL connection failed`: start **MySQL80** in Services; verify `backend/.env` credentials and port 3306.
- `Cannot find module`: run `npm install` inside the relevant folder. Confirm files are named exactly as listed.
- `EADDRINUSE 5000`: an older server may still be running. Stop it with Ctrl+C rather than launching duplicates.
- `404 /api/...`: check URL spelling, route import, and that Nodemon restarted.
- `400`: check required fields, JSON syntax, package sizes and price formats.
- `409`: possible duplicate, insufficient stock, deletion with references, or concurrent transaction conflict.
- CORS errors: set `CLIENT_ORIGIN=http://localhost:5173` and restart backend.
- React blank page: check terminal and browser developer console; ensure dependencies installed in `frontend` and `npm run dev` started there.

## 12. Submission checklist

- [ ] Part A database, ERD, keys, constraints and sample data verified
- [ ] Part B .env protection, working connection, async/await and errors
- [ ] Part C supplier, fruit, stock, vendor, purchase, sales endpoints verified
- [ ] Part D sales totals, negative-stock prevention, rollback, four SQL queries, payment balances
- [ ] React pages demonstrated and tested
- [ ] GitHub project pushed WITHOUT `.env`, real credentials or `node_modules`
- [ ] Hosted frontend and backend are reachable; hosted MySQL configured
- [ ] Demo video shows all primary features and a rejected sale
- [ ] Submit live website link, GitHub repository link and demonstration video link

**Important:** The supplied assignment says copied work may receive zero. Understand, adapt, and personally verify the code before submission.
