-- @custom pricing_plans table
-- Stores product pricing plans (DB-driven, not hardcoded)
CREATE TABLE IF NOT EXISTS pricing_plans (
  id                      SERIAL PRIMARY KEY,
  name                    VARCHAR(100) NOT NULL,
  slug                    VARCHAR(100) NOT NULL UNIQUE,
  description             TEXT,
  price_monthly           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price_yearly            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency                VARCHAR(3) NOT NULL DEFAULT 'usd',
  features                JSONB NOT NULL DEFAULT '[]',   -- array of feature strings
  limits                  JSONB NOT NULL DEFAULT '{}',   -- e.g. {"pages": 5, "templates": 3}
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly  TEXT,
  is_active               BOOLEAN NOT NULL DEFAULT true,
  is_popular              BOOLEAN NOT NULL DEFAULT false,
  sort_order              INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pricing_plans_slug     ON pricing_plans(slug);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active   ON pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_sort     ON pricing_plans(sort_order);

-- Seed default plans
INSERT INTO pricing_plans (name, slug, description, price_monthly, price_yearly, currency, features, limits, is_active, is_popular, sort_order)
VALUES
  (
    'Free',
    'free',
    'Get started at no cost. Perfect for trying out Brix.',
    0, 0, 'usd',
    '["5 published pages","Basic templates","Brix subdomain","Community support"]'::jsonb,
    '{"pages": 5, "templates": 3, "custom_domains": 0}'::jsonb,
    true, false, 0
  ),
  (
    'Starter',
    'starter',
    'For creators and early-stage stores ready to grow.',
    19, 190, 'usd',
    '["25 published pages","All templates","1 custom domain","Email support","Analytics dashboard"]'::jsonb,
    '{"pages": 25, "templates": -1, "custom_domains": 1}'::jsonb,
    true, false, 1
  ),
  (
    'Pro',
    'pro',
    'For growing brands that need power and speed.',
    49, 490, 'usd',
    '["Unlimited pages","All templates","5 custom domains","Priority support","Analytics + A/B testing","Team access (up to 3 seats)"]'::jsonb,
    '{"pages": -1, "templates": -1, "custom_domains": 5, "team_seats": 3}'::jsonb,
    true, true, 2
  ),
  (
    'Agency',
    'agency',
    'For agencies managing multiple brands at scale.',
    149, 1490, 'usd',
    '["Unlimited pages","Unlimited custom domains","White-label option","Dedicated support","Unlimited team seats","Client management portal"]'::jsonb,
    '{"pages": -1, "templates": -1, "custom_domains": -1, "team_seats": -1}'::jsonb,
    true, false, 3
  )
ON CONFLICT (slug) DO NOTHING;
