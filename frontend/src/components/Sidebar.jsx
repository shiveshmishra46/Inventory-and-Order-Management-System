import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard', exact: true },
  { to: '/products', icon: '📦', label: 'Products' },
  { to: '/customers', icon: '👥', label: 'Customers' },
  { to: '/orders', icon: '🛒', label: 'Orders' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="mobile-toggle"
        onClick={() => setOpen(!open)}
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 200 }}
        aria-label="Toggle sidebar"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 99,
          }}
        />
      )}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📋</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">InvenTrack</span>
            <span className="sidebar-logo-subtitle">Admin Dashboard</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-footer-text">v1.0.0 · InvenTrack</p>
        </div>
      </aside>
    </>
  );
}
