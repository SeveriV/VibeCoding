import { useState } from 'react';
import { updateQuantity } from '../api';

function getCategoryClass(category) {
  const map = {
    'Electronics': 'cat-electronics',
    'Furniture': 'cat-furniture',
    'Sports': 'cat-sports',
    'Kitchen': 'cat-kitchen',
    'Clothing': 'cat-clothing',
    'Office': 'cat-office',
  };
  return map[category] || 'cat-default';
}

function getQtyClass(qty) {
  if (qty === 0) return 'out-of-stock';
  if (qty <= 10) return 'low-stock';
  return 'in-stock';
}

function QtyControl({ product, onUpdated, onError }) {
  const [value, setValue] = useState(String(product.quantity));
  const [saving, setSaving] = useState(false);

  async function commit(newVal) {
    const num = parseInt(newVal, 10);
    if (isNaN(num) || num < 0) {
      setValue(String(product.quantity));
      return;
    }
    if (num === product.quantity) return;
    setSaving(true);
    try {
      const updated = await updateQuantity(product.id, num);
      onUpdated(updated);
    } catch (err) {
      onError(err.message);
      setValue(String(product.quantity));
    } finally {
      setSaving(false);
    }
  }

  function handleBlur() { commit(value); }
  function handleKeyDown(e) { if (e.key === 'Enter') { e.target.blur(); } }

  async function step(delta) {
    const newQty = Math.max(0, product.quantity + delta);
    setValue(String(newQty));
    setSaving(true);
    try {
      const updated = await updateQuantity(product.id, newQty);
      onUpdated(updated);
    } catch (err) {
      onError(err.message);
      setValue(String(product.quantity));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="qty-control">
      <button className="qty-btn" onClick={() => step(-1)} disabled={saving || product.quantity <= 0} title="Decrease">−</button>
      <input
        className="qty-input"
        type="number"
        min="0"
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={saving}
      />
      <button className="qty-btn" onClick={() => step(1)} disabled={saving} title="Increase">+</button>
    </div>
  );
}

export function ProductTable({ products, onEdit, onDelete, onQuantityUpdated, onError }) {
  return (
    <div className="table-container">
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="product-name">{p.name}</div>
                  {p.description && <div className="product-description">{p.description}</div>}
                </td>
                <td><span className="sku-badge">{p.sku}</span></td>
                <td>
                  <span className={`category-badge ${getCategoryClass(p.category)}`}>
                    {p.category}
                  </span>
                </td>
                <td><span className="price">${p.price.toFixed(2)}</span></td>
                <td>
                  <QtyControl product={p} onUpdated={onQuantityUpdated} onError={onError} />
                </td>
                <td>
                  <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn-icon" title="Edit product" onClick={() => onEdit(p)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className="btn-icon danger" title="Delete product" onClick={() => onDelete(p)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProductGrid({ products, onEdit, onDelete, onQuantityUpdated, onError }) {
  return (
    <div className="product-grid">
      {products.map(p => (
        <div key={p.id} className="product-card">
          <div className="product-card-header">
            <div className="product-card-title">{p.name}</div>
            <span className={`category-badge ${getCategoryClass(p.category)}`}>{p.category}</span>
          </div>
          <div className="product-card-desc">{p.description || <em style={{ color: 'var(--text-muted)' }}>No description</em>}</div>
          <div className="product-card-meta">
            <span className="product-card-price">${p.price.toFixed(2)}</span>
            <span className="sku-badge">{p.sku}</span>
          </div>
          <div className="product-card-footer">
            <QtyControl product={p} onUpdated={onQuantityUpdated} onError={onError} />
            <div className="product-card-actions">
              <button className="btn-icon" title="Edit product" onClick={() => onEdit(p)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button className="btn-icon danger" title="Delete product" onClick={() => onDelete(p)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
