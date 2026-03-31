import { useState, useEffect, useDeferredValue } from 'react';
import { useProducts, deleteProduct, fetchCategories } from './api';
import { useToast } from './hooks/useToast';
import { ProductTable, ProductGrid } from './components/ProductList';
import { ProductFormModal } from './components/ProductFormModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Toast } from './components/Toast';

export default function App() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState('table');
  const [editProduct, setEditProduct] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const deferredSearch = useDeferredValue(search);
  const { products, loading, error, refetch } = useProducts(deferredSearch, category);
  const { toasts, addToast } = useToast();

  useEffect(() => {
    fetchCategories().then(cats => setCategories(['All', ...cats])).catch(() => {});
  }, []);

  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 10).length;
  const outOfStock = products.filter(p => p.quantity === 0).length;

  function handleProductSaved(product, isEdit) {
    setShowAdd(false);
    setEditProduct(null);
    addToast(isEdit ? `"${product.name}" updated successfully` : `"${product.name}" added to inventory`);
    refetch();
  }

  function handleQuantityUpdated(updated) {
    refetch();
    addToast(`Quantity updated to ${updated.quantity}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      addToast(`"${deleteTarget.name}" removed from inventory`);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          StockWise
        </div>
        <button className="btn btn-primary" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAdd(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </button>
      </header>

      <main className="main">
        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-label">Total Products</div>
            <div className="stat-value primary">{products.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Inventory Value</div>
            <div className="stat-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Low Stock</div>
            <div className={`stat-value ${lowStock > 0 ? 'warning' : 'success'}`}>{lowStock}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Out of Stock</div>
            <div className={`stat-value ${outOfStock > 0 ? 'warning' : 'success'}`}>{outOfStock}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          <div className="search-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-input"
              placeholder="Search by name, SKU or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="view-toggle">
            <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')} title="Table view">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
            <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} title="Grid view">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
          </button>
        </div>

        {/* Content */}
        {error && (
          <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '16px', fontSize: '0.875rem' }}>
            ⚠️ {error} — Make sure the backend server is running on port 3001.
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="table-container">
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <h3>No products found</h3>
              <p>{search || category !== 'All' ? 'Try adjusting your search or filter.' : 'Add your first product to get started.'}</p>
            </div>
          </div>
        ) : view === 'table' ? (
          <ProductTable
            products={products}
            onEdit={p => setEditProduct(p)}
            onDelete={p => setDeleteTarget(p)}
            onQuantityUpdated={handleQuantityUpdated}
            onError={msg => addToast(msg, 'error')}
          />
        ) : (
          <ProductGrid
            products={products}
            onEdit={p => setEditProduct(p)}
            onDelete={p => setDeleteTarget(p)}
            onQuantityUpdated={handleQuantityUpdated}
            onError={msg => addToast(msg, 'error')}
          />
        )}
      </main>

      {/* Modals */}
      {(showAdd || editProduct) && (
        <ProductFormModal
          product={editProduct}
          onClose={() => { setShowAdd(false); setEditProduct(null); }}
          onSaved={handleProductSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product"
          productName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
