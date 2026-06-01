-- ═══════════════════════════════════════════════════════════════════════════
-- Inventory & Order Management System — PostgreSQL Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- NOTE: SQLAlchemy auto-creates these tables on startup via Base.metadata.create_all()
--       This file is provided for reference and manual migration purposes.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Products ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(255)        NOT NULL,
    sku               VARCHAR(100)        NOT NULL UNIQUE,
    price             DOUBLE PRECISION    NOT NULL CHECK (price >= 0),
    quantity_in_stock INTEGER             NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
    created_at        TIMESTAMPTZ         DEFAULT NOW(),
    updated_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- ─── Customers ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
    id         SERIAL PRIMARY KEY,
    full_name  VARCHAR(255)  NOT NULL,
    email      VARCHAR(255)  NOT NULL UNIQUE,
    phone      VARCHAR(50),
    created_at TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ─── Orders ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id           SERIAL PRIMARY KEY,
    customer_id  INTEGER          NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    product_id   INTEGER          NOT NULL REFERENCES products(id)  ON DELETE RESTRICT,
    quantity     INTEGER          NOT NULL CHECK (quantity > 0),
    total_amount DOUBLE PRECISION NOT NULL CHECK (total_amount >= 0),
    created_at   TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product  ON orders(product_id);
