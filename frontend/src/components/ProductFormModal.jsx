import { useState, useEffect } from 'react';
import { addProduct, updateProduct } from '../api';

const CATEGORIES = ['Electronics', 'Furniture', 'Sports', 'Kitchen', 'Clothing', 'Office', 'Other'];

const EMPTY = { name: '', category: 'Electronics', sku: '', price: '', quantity: '', description: '' };

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.category) errors.category = 'Category is required';
  if (!form.sku.trim()) errors.sku = 'SKU is required';
  if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0)
    errors.price = 'Valid price required (≥ 0)';
  if (form.quantity === '' || isNaN(Number(form.quantity)) || Number(form.quantity) < 0 || !Number.isInteger(Number(form.quantity)))
    errors.quantity = 'Valid whole number required (≥ 0)';
  return errors;
}

export function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category: product.category,
        sku: product.sku,
        price: String(product.price),
        quantity: String(product.quantity),
        description: product.description || '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
    setServerError('');
  }, [product]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        sku: form.sku.trim(),
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        description: form.description.trim(),
      };
      const saved = isEdit
        ? await updateProduct(product.id, payload)
        : await addProduct(payload);
      onSaved(saved, isEdit);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {serverError && (
              <div className="form-error" style={{ marginBottom: '12px', fontSize: '0.875rem', padding: '10px 12px', background: '#fef2f2', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                {serverError}
              </div>
            )}
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Name <span className="required">*</span></label>
                <input
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Headphones"
                  autoFocus
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <select
                  className={`form-select ${errors.category ? 'error' : ''}`}
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <span className="form-error">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">SKU <span className="required">*</span></label>
                <input
                  className={`form-input ${errors.sku ? 'error' : ''}`}
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. ELEC-005"
                />
                {errors.sku && <span className="form-error">{errors.sku}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Price ($) <span className="required">*</span></label>
                <input
                  className={`form-input ${errors.price ? 'error' : ''}`}
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                />
                {errors.price && <span className="form-error">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Quantity <span className="required">*</span></label>
                <input
                  className={`form-input ${errors.quantity ? 'error' : ''}`}
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="0"
                />
                {errors.quantity && <span className="form-error">{errors.quantity}</span>}
              </div>

              <div className="form-group full-width">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Optional product description..."
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
