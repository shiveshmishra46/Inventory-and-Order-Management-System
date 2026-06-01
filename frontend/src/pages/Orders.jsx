import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts, getOrder } from '../services/api';
import Topbar from '../components/Topbar';
import { LoadingSpinner, EmptyState } from '../components/UI';

const EMPTY_FORM = { customer_id: '', product_id: '', quantity: '' };

function CreateOrderModal({ customers, products, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductChange = (e) => {
    const id = e.target.value;
    setForm({ ...form, product_id: id });
    setErrors({ ...errors, product_id: undefined });
    setSelectedProduct(products.find((p) => String(p.id) === id) || null);
  };

  const validate = () => {
    const errs = {};
    if (!form.customer_id) errs.customer_id = 'Customer is required';
    if (!form.product_id) errs.product_id = 'Product is required';
    if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'Quantity must be at least 1';
    if (selectedProduct && Number(form.quantity) > selectedProduct.quantity_in_stock)
      errs.quantity = `Only ${selectedProduct.quantity_in_stock} units in stock`;
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await createOrder({
        customer_id: Number(form.customer_id),
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
      });
      toast.success('Order created successfully! Stock updated.');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  const estimatedTotal = selectedProduct && form.quantity
    ? (Number(selectedProduct.price) * Number(form.quantity)).toFixed(2)
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">🛒 Create New Order</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Customer select */}
            <div className="form-group">
              <label className="form-label">Customer <span className="required">*</span></label>
              <select
                className={`form-select${errors.customer_id ? ' error' : ''}`}
                value={form.customer_id}
                onChange={(e) => { setForm({ ...form, customer_id: e.target.value }); setErrors({ ...errors, customer_id: undefined }); }}
              >
                <option value="">— Select customer —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
              {errors.customer_id && <span className="form-error">{errors.customer_id}</span>}
            </div>

            {/* Product select */}
            <div className="form-group">
              <label className="form-label">Product <span className="required">*</span></label>
              <select
                className={`form-select${errors.product_id ? ' error' : ''}`}
                value={form.product_id}
                onChange={handleProductChange}
              >
                <option value="">— Select product —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                    {p.name} — ${Number(p.price).toFixed(2)} ({p.quantity_in_stock} in stock)
                    {p.quantity_in_stock === 0 ? ' [OUT OF STOCK]' : ''}
                  </option>
                ))}
              </select>
              {errors.product_id && <span className="form-error">{errors.product_id}</span>}
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">Quantity <span className="required">*</span></label>
              <input
                className={`form-input${errors.quantity ? ' error' : ''}`}
                type="number"
                min="1"
                max={selectedProduct?.quantity_in_stock || undefined}
                placeholder="Enter quantity"
                value={form.quantity}
                onChange={(e) => { setForm({ ...form, quantity: e.target.value }); setErrors({ ...errors, quantity: undefined }); }}
              />
              {errors.quantity && <span className="form-error">{errors.quantity}</span>}
            </div>

            {/* Estimated total */}
            {estimatedTotal && (
              <div style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Estimated Total</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '1.25rem' }}>
                  ${estimatedTotal}
                </span>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Processing...' : '🛒 Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(orderId)
      .then((r) => setOrder(r.data))
      .catch(() => toast.error('Failed to load order details'))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📋 Order #{orderId} Details</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <LoadingSpinner />
          ) : order ? (
            <>
              <div className="order-detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Order ID</span>
                  <span className="detail-value">#{order.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">
                    {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Customer</span>
                  <span className="detail-value">{order.customer?.full_name || `#${order.customer_id}`}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Customer Email</span>
                  <span className="detail-value">{order.customer?.email || '—'}</span>
                </div>
              </div>
              <div className="divider" />
              <div className="order-detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Product</span>
                  <span className="detail-value">{order.product?.name || `#${order.product_id}`}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">SKU</span>
                  <span className="detail-value">
                    <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>
                      {order.product?.sku || '—'}
                    </code>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Unit Price</span>
                  <span className="detail-value">${order.product ? Number(order.product.price).toFixed(2) : '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Quantity</span>
                  <span className="detail-value">{order.quantity}</span>
                </div>
              </div>
              <div className="divider" />
              <div className="detail-item" style={{ textAlign: 'center', padding: '1rem' }}>
                <span className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Total Amount</span>
                <span className="detail-value large">${Number(order.total_amount).toFixed(2)}</span>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Order not found.</p>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [o, c, p] = await Promise.all([getOrders(), getCustomers(), getProducts()]);
      setOrders(o.data);
      setCustomers(c.data);
      setProducts(p.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (order) => {
    if (!window.confirm(`Delete Order #${order.id}? Stock will be restored.`)) return;
    try {
      await deleteOrder(order.id);
      toast.success('Order deleted. Stock restored.');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <>
      <Topbar
        title="Orders"
        subtitle="Create and manage customer orders"
        actions={
          <button className="btn btn-primary" id="create-order-btn" onClick={() => setShowCreate(true)}>
            🛒 Create Order
          </button>
        }
      />
      <div className="page-container">
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="🛒"
              title="No orders yet"
              description="Create your first order to get started"
              action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}>🛒 Create Order</button>}
            />
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">All Orders</div>
                <div className="card-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''} total</div>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>#{o.id}</td>
                      <td style={{ fontWeight: 600 }}>{o.customer?.full_name || `#${o.customer_id}`}</td>
                      <td>{o.product?.name || `#${o.product_id}`}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{o.quantity}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>${Number(o.total_amount).toFixed(2)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => setDetailId(o.id)}>
                            👁️ View
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o)}>
                            🗑️ Delete
                          </button>
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

      {showCreate && (
        <CreateOrderModal
          customers={customers}
          products={products}
          onClose={() => setShowCreate(false)}
          onSave={() => { setShowCreate(false); fetchAll(); }}
        />
      )}

      {detailId && (
        <OrderDetailModal
          orderId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </>
  );
}
