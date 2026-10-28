# Evergreen — Everyday, Elevated

The React/Vite storefront uses the public [DummyJSON Products API](https://dummyjson.com/products) as a sample catalogue. It loads all products available from the API, with search, category filtering, sorting, discount filtering, product details, and paginated display. The cart and wishlist are stored in this browser; demo checkout does not send or save an order.

Product prices, ratings, discounts, reviews, and stock are sample API data, not verified retailer listings, live inventory, or live prices. Product prices are shown in INR using a configurable display-only USD conversion rate: set `VITE_USD_TO_INR` in `frontend\.env` (the default is `83`). This default is illustrative and is not a live exchange-rate quote.

To run the storefront from the project root after installing dependencies:

```cmd
npm install
npm run dev --workspace frontend
```

Authentication and the existing admin tools still use the optional Express/MongoDB backend described below. The public product catalogue, cart, wishlist, and demo checkout do not require that backend.

A responsive store for considered everyday goods. This academic project includes a React/Vite storefront, a sample API catalogue, optional Express authentication and admin tools, and a clearly labeled client-side demo checkout. No payment card details are requested or stored.

## Objectives and features

- Browse the complete DummyJSON sample catalogue; search by name and description, filter categories and discounts, and sort by price or rating.
- View sample product galleries, ratings, discounts and stock; save a browser-persisted cart and wishlist.
- Register and sign in with bcrypt-hashed passwords and signed JWTs.
- Complete a local-only demo checkout. No order is submitted, stored, or charged.
- Existing backend order-history and administrator endpoints remain available for legacy database records; they are not connected to DummyJSON marketplace checkout.
- Administrators can manage the legacy MongoDB product and order records through the existing admin page.
- Responsive layouts, accessible labels, loading/error/empty states, and product placeholders.

## Technology and architecture

- **Frontend:** React 19, Vite, React Router, plain CSS, Fetch API
- **Backend:** Node.js 20+, Express, Mongoose, MongoDB
- **Authentication:** bcryptjs and JWT bearer tokens. Tokens are held in `sessionStorage` for the active browser tab; passwords are never stored by the frontend.
- **Security:** Helmet, restricted CORS, request-size limit, rate limits, server-side validation, owner checks, and admin middleware.

The marketplace catalog loads from DummyJSON using `limit=0`; the shop displays products in batches of 24 and searches the full fetched catalogue. Cart and wishlist data are stored in browser local storage. `VITE_USD_TO_INR` controls the display-only conversion from sample USD prices to INR (default `83`); it is not a live exchange-rate feed. Existing authentication and administrator functions call the optional Express API at `VITE_API_URL`.

## Project structure

```text
commers/
  frontend/
    src/
      components/   shared layout, product cards, route guard
      context/      authentication and shopping bag state
      pages/        storefront, account, checkout, orders, admin
      services/     API client
    .env.example
    package.json
  backend/
    src/
      config/       MongoDB connection
      middleware/   auth, errors
      models/       User, Product, Order
      routes/       auth, products, orders
      scripts/      first-admin setup, optional product seed
      utils/        request validation
    test/            Node built-in test suite
    .env.example
    package.json
  .env.example
  .gitignore
  package.json
```

## Requirements and local setup (Windows Command Prompt)

Install Node.js 20 or newer and npm. The public product catalogue, search, cart, wishlist and demo checkout work without MongoDB. MongoDB configuration is optional and is needed only for the existing registration, sign-in and administrator tools.

If you only need the storefront, skip the optional backend configuration steps 1–3 and go directly to step 4.

1. Create a MongoDB Atlas project and cluster. Create a dedicated database user with access only to the application's database. In **Network Access**, allow the development machine's current IP address; avoid `0.0.0.0/0` for a public production database.
2. In **Database → Connect → Drivers**, copy the connection URI. Replace the username, password, and database name placeholders. URL-encode special characters in the database username/password.
3. From Command Prompt, create the backend environment file:

```cmd
cd /d C:\Users\Admin\OneDrive\Desktop\commers
copy backend\.env.example backend\.env
notepad backend\.env
```

Set `MONGODB_URI` to your real MongoDB Atlas connection URI and ensure `JWT_SECRET` is a securely generated secret of at least 32 characters. Set `CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174` to allow Vite's default port and its fallback when that port is busy. Keep `backend\.env` private and never commit it.

4. Install workspace dependencies from the project root:

```cmd
cd /d C:\Users\Admin\OneDrive\Desktop\commers
npm install
```

5. Start the storefront (no backend required for browsing or demo checkout):

```cmd
cd /d C:\Users\Admin\OneDrive\Desktop\commers
npm run dev --workspace frontend
```

The storefront is at `http://localhost:5173`. To also enable the optional account and legacy admin API features, configure MongoDB and start the backend in a second Command Prompt window:

```cmd
cd /d C:\Users\Admin\OneDrive\Desktop\commers
npm run dev --workspace backend
```

The API health endpoint is `http://localhost:5000/api/health`. Alternatively, `npm run dev` at the root starts both processes using `concurrently`.

For a different INR display conversion, create `frontend\.env` from `frontend\.env.example`, set `VITE_USD_TO_INR` to the rate you want to use, and restart Vite. This remains a manually configured display conversion, not a live FX quote. Set `VITE_API_URL` in that file only when using the optional account/admin backend.

## First administrator and optional catalog seed

There is deliberately no public administrator-registration route. After configuring `backend\.env`, set `ADMIN_NAME`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` of at least 12 characters in that file, then run:

```cmd
cd /d C:\Users\Admin\OneDrive\Desktop\commers
npm run setup-admin
```

The script creates the first admin only and refuses to create another once any administrator exists. Remove the setup password variables from the local env file after setup. Regular registration always creates the `user` role; a submitted role is ignored.

Optionally add a few clearly identified demo products to an empty catalog:

```cmd
npm run seed --workspace backend
```

This inserts the sample catalog entries only when each named product is absent; it does not overwrite existing products. Images are optional and use an in-app illustrated placeholder by default.

### Troubleshooting an empty storefront

If the storefront reports that it cannot reach the store API, start the backend and check `http://localhost:5000/api/health`. The response must report `"database":"connected"`; if the backend exits during startup, configure `MONGODB_URI` in `backend\.env`. If the API is connected but the catalog has no products, run the optional seed command above or add products through the administrator tools.

## REST API

All JSON endpoints are prefixed by `/api`. Protected endpoints accept `Authorization: Bearer <JWT>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | API and MongoDB connection status |
| POST | `/auth/register` | Public | Create customer account (`name`, `email`, `password`) |
| POST | `/auth/login` | Public | Authenticate (`email`, `password`) |
| GET | `/auth/me` | Signed in | Current account |
| GET | `/products?q=&category=&sort=&page=&limit=` | Public | Search/filter/sort and paginated catalog |
| GET | `/products/:id` | Public | Product details |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Replace product fields |
| DELETE | `/products/:id` | Admin | Delete product |
| POST | `/orders` | Signed in | Place demo order with product IDs, quantities, shipping address |
| GET | `/orders/my-orders` | Signed in | Current user's order history |
| GET | `/orders/:id` | Owner or admin | Order details |
| GET | `/orders` | Admin | Latest orders (up to 200) |
| PATCH | `/orders/:id/status` | Admin | Update status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) |

Product listing defaults to 12 items per page and caps page size at 50. Order placement uses current database product prices and stock inside a MongoDB transaction; client-provided prices and totals are never trusted. Transaction support is required for checkout and order cancellation inventory restoration.

## Checks and tests

From the project root:

```cmd
npm test
npm run build
```

Or run both in sequence with `npm run check`. The automated Node test suite checks request validators, health response behavior without a database, and safe unknown-route responses. It does not substitute for testing authenticated database workflows.

### Manual end-to-end checklist

- [ ] Configure Atlas; start backend; verify `/api/health` reports `"database":"connected"`.
- [ ] Create the first admin via the protected setup script.
- [ ] Register a customer; try duplicate registration and invalid login.
- [ ] Add products as admin; try product validation and unauthorized product changes.
- [ ] Browse, search, category-filter, and sort products as a customer.
- [ ] Change bag quantities and remove items.
- [ ] Submit checkout with missing details and verify validation.
- [ ] Place an order; verify its stored total, stock decrement, order history, and order detail.
- [ ] Attempt to view another user's order and verify denial.
- [ ] As admin, view orders, change status, cancel an order, and verify stock restoration.
- [ ] Try an invalid product/order ID, invalid quantity, and an out-of-stock purchase.

Screenshots to capture for submission: landing page, searchable catalog, product detail, cart/checkout, account/order history, and admin dashboard. Capture results from the actual configured application; do not invent screenshots or test outcomes.

## GitHub source control

The repository root excludes `node_modules`, `.env` files, and build outputs. Before publishing, inspect the staged file list and confirm no secrets are included:

```cmd
git init
git add .
git status --short
git diff --cached
git commit -m "Build full-stack e-commerce application"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

If the folder already contains a Git repository, inspect `git status` and `git remote -v` before changing anything. Create an empty repository on GitHub first; do not push `.env` files or production credentials.

## GitHub Pages demo deployment

The static storefront (sample catalog, browser-only cart and wishlist, and demo checkout) can be deployed to GitHub Pages. The workflow in `.github/workflows/deploy.yml` builds the Vite app using the repository path, publishes a `404.html` fallback for React Router routes, and deploys on pushes to `main`. In the repository's **Settings → Pages**, choose **GitHub Actions** as the build and deployment source if it is not already selected.

The static Pages deployment does not include the Express/MongoDB API. Account and administrator links are hidden unless `VITE_API_URL` is configured, and the checkout remains a local demo that does not save orders or collect payment. `VITE_USD_TO_INR` is optional and controls display-only conversion of sample USD prices into INR.

For API-backed accounts, deploy the backend separately to a Node.js host and configure `MONGODB_URI`, a unique `JWT_SECRET`, `NODE_ENV=production`, and `CLIENT_ORIGIN` with the exact deployed site origin. Configure `VITE_API_URL` to the deployed API URL plus `/api` in the Pages workflow environment before building. Keep backend credentials out of GitHub Pages and all `VITE_*` variables.

## Known limitations

- Checkout is a local demo: it does not collect payment, submit an order, or save delivery details.
- DummyJSON prices, discounts, ratings, reviews, and stock are sample data, not live retailer offers or inventory.
- INR conversion uses the configurable display-only `VITE_USD_TO_INR` value, default `83`; it is not a live exchange-rate quote.
- No database URL/admin account is bundled; optional MongoDB-backed account and legacy admin flows need the operator's Atlas configuration.
- Cart data is kept in the current browser; accounts do not synchronize carts between devices.
- The UI supports optional HTTP(S) product image URLs; the local placeholder is used when absent or when an image fails to load.
- This project does not claim a live deployment, GitHub push, or passing database end-to-end test unless those steps have actually been performed.

## Academic project report outline

1. **Abstract** — Summarize the storefront, API, persistence, and demo-checkout scope.
2. **Introduction** — Describe the context and intended users.
3. **Problem statement** — Explain the need for a simple, secure online catalog and order workflow.
4. **Objectives** — List customer, administrator, security, and usability objectives.
5. **System requirements** — Document runtime, tools, Atlas, and browser requirements.
6. **System architecture** — Diagram React client → Express REST API → MongoDB.
7. **Database design** — Describe User, Product, and Order schemas and relationships.
8. **Module descriptions** — Cover authentication, catalog, bag, checkout, order history, and admin.
9. **Testing** — Report actual automated/manual tests and environment limitations.
10. **Results** — Insert verified build/test observations and genuine screenshots.
11. **Future enhancements** — Consider payment-provider integration, email updates, and cross-device carts.
12. **Conclusion** — Summarize delivered scope and remaining deployment/payment work.
