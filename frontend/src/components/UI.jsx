import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner" />
    </div>
  );
}

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      {description && <div className="empty-state-desc">{description}</div>}
      {action}
    </div>
  );
}

export function Badge({ variant = 'default', children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function StockBadge({ quantity }) {
  if (quantity === 0) return <Badge variant="danger">Out of Stock</Badge>;
  if (quantity <= 10) return <Badge variant="warning">Low Stock ({quantity})</Badge>;
  return <Badge variant="success">In Stock ({quantity})</Badge>;
}
