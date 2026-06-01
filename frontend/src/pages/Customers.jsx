import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getCustomers, createCustomer, deleteCustomer } from '../services/api';
import Topbar from '../components/Topbar';
import { LoadingSpinner, EmptyState } from '../components/UI';

const EMPTY_FORM = { full_name: '', email: '', phone: '' };

function CustomerModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await createCustomer({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      });
      toast.success('Customer added successfully');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '', required = true) => (
    <div className="form-group">
      <label className="form-label">{label} {required && <span className="required">*</span>}</label>
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
          <span className="modal-title">➕ Add Customer</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {field('full_name', 'Full Name', 'text', 'e.g. Jane Doe')}
            {field('email', 'Email Address', 'email', 'jane@example.com')}
            {field('phone', 'Phone Number', 'tel', '+1 (555) 000-0000', false)}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Saving...' : '➕ Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    getCustomers()
      .then((r) => setCustomers(r.data))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleDelete = async (customer) => {
    if (!window.confirm(`Delete "${customer.full_name}"? This cannot be undone.`)) return;
    try {
      await deleteCustomer(customer.id);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <>
      <Topbar
        title="Customers"
        subtitle="Manage your customer records"
        actions={
          <button className="btn btn-primary" id="add-customer-btn" onClick={() => setShowModal(true)}>
            ➕ Add Customer
          </button>
        }
      />
      <div className="page-container">
        {loading ? (
          <LoadingSpinner />
        ) : customers.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="👥"
              title="No customers yet"
              description="Add your first customer to get started"
              action={<button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Add Customer</button>}
            />
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">All Customers</div>
                <div className="card-subtitle">{customers.length} customer{customers.length !== 1 ? 's' : ''} total</div>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{c.full_name}</td>
                      <td style={{ color: 'var(--color-primary-light)' }}>{c.email}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.phone || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>
                          🗑️ Delete
                        </button>
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
        <CustomerModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchCustomers(); }}
        />
      )}
    </>
  );
}
