# Challenge 2: Database Query Optimization

---

## SQL Query (PostgreSQL)

Fetch products with a price between $50 and $200, ordered by price ascending, with pagination (10 per page).

```sql
-- Page 1
SELECT *
FROM products
WHERE price BETWEEN 50 AND 200
ORDER BY price ASC
LIMIT 10 OFFSET 0;

-- Page 2
SELECT *
FROM products
WHERE price BETWEEN 50 AND 200
ORDER BY price ASC
LIMIT 10 OFFSET 10;

-- Dynamic pagination formula:
-- OFFSET = (page - 1) * 10
```

### Index for this query:

```sql
CREATE INDEX idx_products_price ON products(price);
```

---

## NoSQL Query (MongoDB)

Retrieve products by category "Electronics", sorted by price descending, 5 per page.

```javascript
// Page 1
db.products
  .find({ category: "Electronics" })
  .sort({ price: -1 })
  .skip(0)
  .limit(5);

// Page 2
db.products
  .find({ category: "Electronics" })
  .sort({ price: -1 })
  .skip(5)
  .limit(5);

// Dynamic pagination formula:
// skip = (page - 1) * 5
```

### Using Mongoose (as implemented in this project):

```javascript
const products = await Product.find({ category: "Electronics" })
  .sort({ price: -1 })
  .skip((page - 1) * 5)
  .limit(5)
  .lean();
```

### Index for this query (already defined in Product.js):

```javascript
productSchema.index({ category: 1, price: -1 });
```

A compound index on `{ category, price }` means MongoDB resolves both
the filter AND the sort in a single index scan. No in-memory sort needed.

---

## Optimization Strategies for High Traffic

### 1. Indexing

- **Single field indexes** on frequently filtered fields (`price`, `category`)
- **Compound indexes** for queries that filter + sort (`{ category, price }`)
- No need to over-indexing, as they slow down the writes.

### 2. `.lean()` in Mongoose

- Skips Mongoose document hydration for read-only queries
- Returns plain JS objects instead of full Mongoose documents
- Up to 2x faster and uses less memory

### 3. `Promise.all()` for parallel queries

- Run `find()` and `countDocuments()` at the same time instead of sequentially
- Cuts response time for paginated endpoints roughly in half

```javascript
const [products, total] = await Promise.all([
  Product.find().skip(skip).limit(limit).lean(),
  Product.countDocuments(),
]);
```

### 4. Caching with Redis

- Cache results of frequent, repeated queries by users (e.g. "Electronics page 1")
- Set a short TTL (e.g. 60 seconds) so data doesn't go stale
- Invalidate cache on write operations (POST, PUT, DELETE)

```javascript
// Pseudocode
const cacheKey = `products:Electronics:page:1`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const products = await Product.find({ category: 'Electronics' })...
await redis.setex(cacheKey, 60, JSON.stringify(products));
```

### 5. Avoid large OFFSET values

- `SKIP/OFFSET` gets slower the deeper you paginate because MongoDB/PostgreSQL
  still scans all skipped documents
- For very large datasets use cursor-based pagination instead:

```javascript
// Instead of skip, use the last seen _id as a cursor
Product.find({ _id: { $gt: lastSeenId } })
  .limit(10)
  .lean();
```
