const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const createDatabase = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', apiLimiter);

const db = createDatabase();

// GET all products (with optional search and category filter)
app.get('/api/products', (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM products';
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push('(name LIKE ? OR sku LIKE ? OR description LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (category && category !== 'All') {
    conditions.push('category = ?');
    params.push(category);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY name ASC';

  try {
    const products = db.prepare(query).all(...params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT DISTINCT category FROM products ORDER BY category ASC').all();
    res.json(categories.map(c => c.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create product
app.post('/api/products', (req, res) => {
  const { name, category, sku, price, quantity, description } = req.body;
  if (!name || !category || !sku || price == null || quantity == null) {
    return res.status(400).json({ error: 'Missing required fields: name, category, sku, price, quantity' });
  }

  const parsedPrice = parseFloat(price);
  const parsedQty = parseInt(quantity, 10);

  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'Price must be a valid non-negative number' });
  }
  if (isNaN(parsedQty) || parsedQty < 0) {
    return res.status(400).json({ error: 'Quantity must be a valid non-negative integer' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO products (name, category, sku, price, quantity, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, category, sku, parsedPrice, parsedQty, description || '');

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(product);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A product with this SKU already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const { name, category, sku, price, quantity, description } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const updatedPrice = price != null ? parseFloat(price) : existing.price;
    const updatedQty = quantity != null ? parseInt(quantity, 10) : existing.quantity;

    if (price != null && (isNaN(updatedPrice) || updatedPrice < 0)) {
      return res.status(400).json({ error: 'Price must be a valid non-negative number' });
    }
    if (quantity != null && (isNaN(updatedQty) || updatedQty < 0)) {
      return res.status(400).json({ error: 'Quantity must be a valid non-negative integer' });
    }

    db.prepare(`
      UPDATE products
      SET name = ?, category = ?, sku = ?, price = ?, quantity = ?, description = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name ?? existing.name,
      category ?? existing.category,
      sku ?? existing.sku,
      updatedPrice,
      updatedQty,
      description != null ? description : existing.description,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A product with this SKU already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PATCH update quantity only
app.patch('/api/products/:id/quantity', (req, res) => {
  const { quantity } = req.body;
  const parsedQty = parseInt(quantity, 10);
  if (quantity == null || isNaN(parsedQty)) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }
  if (parsedQty < 0) {
    return res.status(400).json({ error: 'Quantity cannot be negative' });
  }

  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    db.prepare(`
      UPDATE products SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(parsedQty, req.params.id);

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Inventory API server running on http://localhost:${PORT}`);
});
