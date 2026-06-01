import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import Topbar from '../components/Topbar';
import { LoadingSpinner, EmptyState, StockBadge } from '../components/UI';

const EMPTY_FORM = { name: '', sku: '', price: '', quantity_in_stock: '' };

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(
    product ? { ...product, price: String(product.price), quantity_in_stock: String(product.quantity_in_stock) } : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0)
      errs.price = 'Price must be a non-negative number';
    if (form.quantity_in_stock === '' || isNaN(Number(form.quantity_in_stock)) || Number(form.quantity_in_stock) < 0)
      errs.quantity_in_stock = 'Quantity must be a non-negative integer';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        quantity_in_stock: parseInt(form.quantity_in_stock, 10),
      };
      if (product) {
        await updateProduct(product.id, payload);
        toast.success('Product updated successfully');
      } else {
        await createProduct(payload);
        toast.success('Product created successfully');
      }
      onSave();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Operation failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label} <span className="required">*</span></label>
      <input
        className={`form-input${errors[name] ? ' error' : ''}`}
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => { setForm({ ...form, [name]: e.target.value }); setErrors({ ...errors, [name]: undefined }); }}
      />
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{product ? '✏️ Edit Product' : '➕ Add Product'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {field('name', 'Product Name', 'text', 'e.g. Wireless Mouse')}
            {field('sku', 'SKU', 'text', 'e.g. WM-001')}
            <div className="form-row">
              {field('price', 'Price ($)', 'number', '0.00')}
              {field('quantity_in_stock', 'Quantity in Stock', 'number', '0')}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Saving...' : (product ? '💾 Update' : '➕ Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    getProducts()
      .then((r) => setProducts(r.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(product.id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  const openCreate = () => { setEditProduct(null); setShowModal(true); };
  const openEdit = (p) => { setEditProduct(p); setShowModal(true); };
  const closeModal = () => setShowModal(false);
  const onSave = () => { closeModal(); fetchProducts(); };

  return (
    <>
      <Topbar
        title="Products"
        subtitle="Manage your product catalog"
        actions={
          <button className="btn btn-primary" id="add-product-btn" onClick={openCreate}>
            ➕ Add Product
          </button>
        }
      />
      <div className="page-container">
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="📦"
              title="No products yet"
              description="Start by adding your first product"
              action={<button className="btn btn-primary" onClick={openCreate}>➕ Add Product</button>}
            />
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">All Products</div>
                <div className="card-subtitle">{products.length} product{products.length !== 1 ? 's' : ''} total</div>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>
                        <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem' }}>
                          {p.sku}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>${Number(p.price).toFixed(2)}</td>
                      <td><StockBadge quantity={p.quantity_in_stock} /></td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={closeModal}
          onSave={onSave}
        />
      )}
    </>
  );
}
