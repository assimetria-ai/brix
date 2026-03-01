-- @custom orders table (Brix order management)
CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  order_number    TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'pending', -- 'pending'|'paid'|'fulfilled'|'cancelled'|'refunded'
  customer_email  TEXT NOT NULL,
  customer_name   TEXT,
  shipping_address JSONB DEFAULT '{}',
  line_items      JSONB NOT NULL DEFAULT '[]',
  subtotal_cents  INTEGER NOT NULL DEFAULT 0,
  discount_cents  INTEGER NOT NULL DEFAULT 0,
  tax_cents       INTEGER NOT NULL DEFAULT 0,
  shipping_cents  INTEGER NOT NULL DEFAULT 0,
  total_cents     INTEGER NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'usd',
  payment_intent_id TEXT,
  discount_code   TEXT,
  notes           TEXT,
  fulfilled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
