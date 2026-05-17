# Backend Developer Coding Test

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Express Validator
- **Module System**: ES Modules (`import`/`export`)

---

## Project Structure

```
product-inventory-api/
├── src/
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Login logic + JWT signing
│   │   └── productController.js # CRUD operations
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── authorize.js       # Role-based access control
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   └── product.js         # Mongoose schema + indexes
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   └── products.js        # Product routes
│   └── validators/
│       └── productValidator.js # Express Validator rules
├── app.js                     # Express app setup
├── server.js                  # Entry point
├── .env                       # Environment variables
├── .env.example               # Environment variables template
├── .gitignore
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally or a MongoDB Atlas connection string

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ziadgafar/junior-backend-test
cd product-inventory-api

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 4. Start the server
npm run dev
```

### Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/product-inventory
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=1h
```

---

## API Reference

### Base URL

```
http://localhost:5000
```

### Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

### Auth Endpoints

#### POST /auth/login

Login and receive a JWT token.

**Body:**

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful.",
  "token": "<jwt_token>",
  "user": {
    "id": "1",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Test Credentials:**

| Role  | Email             | Password |
| ----- | ----------------- | -------- |
| Admin | admin@example.com | admin123 |
| User  | user@example.com  | user123  |

---

### Product Endpoints

#### GET /products

Get all products with pagination. Public route.

**Query Params:**
| Param | Type | Default | Description |
|-------|--------|---------|-------------------|
| page | number | 1 | Page number |

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalProducts": 25,
      "productsPerPage": 10
    }
  }
}
```

---

#### GET /products/:id

Get a single product by ID. Public route.

**Response:**

```json
{
  "success": true,
  "product": {
    "_id": "...",
    "name": "Laptop",
    "category": "Electronics",
    "price": 999.99,
    "quantity": 50,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

#### POST /products

Create a new product. **Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "name": "Laptop",
  "category": "Electronics",
  "price": 999.99,
  "quantity": 50
}
```

**Validation Rules:**

- `name` — required, 3–100 characters
- `category` — optional, string, max 50 characters
- `price` — required, positive number
- `quantity` — required, non-negative integer

---

#### PUT /products/:id

Update a product. **Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Body:** (all fields optional)

```json
{
  "price": 899.99,
  "quantity": 45
}
```

---

#### DELETE /products/:id

Delete a product. **Admin only.**

**Headers:** `Authorization: Bearer <token>`

---

## Authorization

| Route                | Public | User | Admin |
| -------------------- | ------ | ---- | ----- |
| POST /auth/login     | ✅     | ✅   | ✅    |
| GET /products        | ✅     | ✅   | ✅    |
| GET /products/:id    | ✅     | ✅   | ✅    |
| POST /products       | ❌     | ❌   | ✅    |
| PUT /products/:id    | ❌     | ❌   | ✅    |
| DELETE /products/:id | ❌     | ❌   | ✅    |

---

## Challenge 2: Query Optimization

### SQL Query (PostgreSQL)

Fetch products priced between $50–$200, ordered by price ascending, paginated:

```sql
SELECT * FROM products
WHERE price BETWEEN 50 AND 200
ORDER BY price ASC
LIMIT 10 OFFSET 0; -- OFFSET = (page - 1) * 10
```

**Index:**

```sql
CREATE INDEX idx_products_price ON products(price);
```

---

### NoSQL Query (MongoDB)

Retrieve Electronics products, sorted by price descending, 5 per page:

```javascript
db.products
  .find({ category: "Electronics" })
  .sort({ price: -1 })
  .skip(0) // (page - 1) * 5
  .limit(5);
```

**Index (already defined in product.js):**

```javascript
productSchema.index({ category: 1, price: -1 });
```

---

### Optimization Strategies

| Strategy          | Impact | Description                                               |
| ----------------- | ------ | --------------------------------------------------------- |
| Indexing          | High   | Single and compound indexes on filtered/sorted fields     |
| `.lean()`         | Medium | Returns plain JS objects, skips Mongoose hydration        |
| `Promise.all()`   | Medium | Runs find + countDocuments in parallel                    |
| Redis caching     | High   | Cache repeated read queries, invalidate on writes         |
| Cursor pagination | High   | Use `_id > lastSeenId` instead of skip for large datasets |
