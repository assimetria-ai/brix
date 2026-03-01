-- @custom products table (Brix headless commerce catalog)
CREATE TABLE IF NOT EXISTS products (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'draft', -- 'active' | 'draft' | 'archived'
  price_cents     INTEGER NOT NULL DEFAULT 0,
  compare_price_cents INTEGER,
  sku             TEXT,
  barcode         TEXT,
  weight_grams    INTEGER,
  track_inventory BOOLEAN NOT NULL DEFAULT true,
  inventory_qty   INTEGER NOT NULL DEFAULT 0,
  low_stock_alert INTEGER DEFAULT 5,
  images          JSONB DEFAULT '[]',
  tags            JSONB DEFAULT '[]',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Product variants (e.g. size/color)
CREATE TABLE IF NOT EXISTS product_variants (
  id              SERIAL PRIMARY KEY,
  product_id      INTEGER REFERENCES products(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  sku             TEXT,
  price_cents     INTEGER,
  inventory_qty   INTEGER NOT NULL DEFAULT 0,
  options         JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
