const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'inventory.db');

function createDatabase() {
  const db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (count.count === 0) {
    const insert = db.prepare(`
      INSERT INTO products (name, category, sku, price, quantity, description)
      VALUES (@name, @category, @sku, @price, @quantity, @description)
    `);

    const products = [
      { name: 'Wireless Bluetooth Headphones', category: 'Electronics', sku: 'ELEC-001', price: 79.99, quantity: 42, description: 'Over-ear noise-cancelling wireless headphones' },
      { name: 'USB-C Charging Cable', category: 'Electronics', sku: 'ELEC-002', price: 12.99, quantity: 150, description: '6ft braided USB-C to USB-C charging cable' },
      { name: 'Mechanical Keyboard', category: 'Electronics', sku: 'ELEC-003', price: 129.99, quantity: 25, description: 'TKL mechanical keyboard with RGB backlight' },
      { name: 'Ergonomic Office Chair', category: 'Furniture', sku: 'FURN-001', price: 349.99, quantity: 8, description: 'Adjustable lumbar support office chair' },
      { name: 'Standing Desk', category: 'Furniture', sku: 'FURN-002', price: 499.99, quantity: 5, description: 'Electric height-adjustable standing desk' },
      { name: 'Desk Lamp', category: 'Furniture', sku: 'FURN-003', price: 39.99, quantity: 30, description: 'LED desk lamp with adjustable brightness and color temperature' },
      { name: 'Yoga Mat', category: 'Sports', sku: 'SPRT-001', price: 29.99, quantity: 60, description: 'Non-slip premium yoga mat, 6mm thick' },
      { name: 'Resistance Bands Set', category: 'Sports', sku: 'SPRT-002', price: 19.99, quantity: 75, description: 'Set of 5 resistance bands with varying tension levels' },
      { name: 'Water Bottle', category: 'Sports', sku: 'SPRT-003', price: 24.99, quantity: 90, description: 'Insulated stainless steel water bottle, 32oz' },
      { name: 'Coffee Maker', category: 'Kitchen', sku: 'KTCH-001', price: 89.99, quantity: 20, description: '12-cup programmable coffee maker with thermal carafe' },
      { name: 'Blender', category: 'Kitchen', sku: 'KTCH-002', price: 59.99, quantity: 18, description: '1200W high-speed personal blender' },
      { name: 'Non-stick Frying Pan', category: 'Kitchen', sku: 'KTCH-003', price: 34.99, quantity: 35, description: '10-inch ceramic non-stick frying pan' },
      { name: 'Cotton T-Shirt (M)', category: 'Clothing', sku: 'CLTH-001', price: 19.99, quantity: 120, description: '100% organic cotton t-shirt, medium' },
      { name: 'Denim Jeans (32x32)', category: 'Clothing', sku: 'CLTH-002', price: 49.99, quantity: 45, description: 'Classic fit denim jeans, 32x32' },
      { name: 'Running Shoes (Size 10)', category: 'Clothing', sku: 'CLTH-003', price: 89.99, quantity: 22, description: 'Lightweight breathable running shoes, size 10' },
      { name: 'Notebook Set', category: 'Office', sku: 'OFFC-001', price: 14.99, quantity: 200, description: 'Set of 3 ruled notebooks, A5 size' },
      { name: 'Ballpoint Pens (12-pack)', category: 'Office', sku: 'OFFC-002', price: 8.99, quantity: 300, description: 'Smooth-writing ballpoint pens, blue ink' },
      { name: 'Whiteboard', category: 'Office', sku: 'OFFC-003', price: 74.99, quantity: 12, description: '36x24 inch magnetic dry-erase whiteboard' },
      { name: 'Wireless Mouse', category: 'Electronics', sku: 'ELEC-004', price: 34.99, quantity: 55, description: 'Ergonomic wireless mouse with silent click' },
      { name: 'Monitor Stand', category: 'Furniture', sku: 'FURN-004', price: 44.99, quantity: 28, description: 'Adjustable monitor riser with storage drawer' },
    ];

    const insertMany = db.transaction((products) => {
      for (const product of products) {
        insert.run(product);
      }
    });

    insertMany(products);
    console.log('Database seeded with 20 sample products.');
  }

  return db;
}

module.exports = createDatabase;
