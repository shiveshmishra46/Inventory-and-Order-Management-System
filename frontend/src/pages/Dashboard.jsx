import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api';
import Topbar from '../components/Topbar';
import { LoadingSpinner, StockBadge } from '../components/UI';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data))
      .catch((err) => setError('Failed to load dashboard data. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Overview of your inventory and order activity"
      />
      <div className="page-container">
        {loading && <LoadingSpinner />}
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {stats && (
          <>
            {/* Stat cards */}
            <div className="stats-grid">
              <div className="stat-card indigo">
                <div className="stat-icon indigo">📦</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.total_products}</span>
                  <span className="stat-label">Total Products</span>
                </div>
              </div>

              <div className="stat-card green">
                <div className="stat-icon green">👥</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.total_customers}</span>
                  <span className="stat-label">Total Customers</span>
                </div>
              </div>

              <div className="stat-card blue">
                <div className="stat-icon blue">🛒</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.total_orders}</span>
                  <span className="stat-label">Total Orders</span>
                </div>
              </div>

              <div className="stat-card amber">
                <div className="stat-icon amber">⚠️</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.low_stock_products.length}</span>
                  <span className="stat-label">Low Stock Items</span>
                </div>
              </div>
            </div>

            {/* Low stock table */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">⚠️ Low Stock Products</div>
                  <div className="card-subtitle">Products with 10 or fewer units remaining</div>
                </div>
                <Link to="/products" className="btn btn-secondary btn-sm">
                  View All Products →
                </Link>
              </div>

              {stats.low_stock_products.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <div className="empty-state-icon">✅</div>
                  <div className="empty-state-title">All products are well stocked!</div>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Stock Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.low_stock_products.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td>
                            <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, fontSize: '0.75rem' }}>
                              {p.sku}
                            </code>
                          </td>
                          <td>${Number(p.price).toFixed(2)}</td>
                          <td><StockBadge quantity={p.quantity_in_stock} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick action links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              {[
                { to: '/products', icon: '📦', label: 'Manage Products', desc: 'Add, edit, delete products' },
                { to: '/customers', icon: '👥', label: 'Manage Customers', desc: 'View and manage customers' },
                { to: '/orders', icon: '🛒', label: 'Manage Orders', desc: 'Create and track orders' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.label}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{item.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
