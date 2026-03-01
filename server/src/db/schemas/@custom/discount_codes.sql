-- @custom discount_codes table (Brix promotions)
CREATE TABLE IF NOT EXISTS discount_codes (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  code            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' | 'fixed'
  value           NUMERIC(10,2) NOT NULL,
  min_order_cents INTEGER DEFAULT 0,
  max_uses        INTEGER,
  uses_count      INTEGER NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, code)
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_user_id ON discount_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(active);
