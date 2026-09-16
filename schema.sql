-- LET'S TRADE ZM - FRONTEND-READY DATABASE BLUEPRINT
-- PostgreSQL-style SQL. This is a schema/reference only; the frontend prototype
-- currently uses localStorage and does NOT connect to this database.

CREATE TABLE admins (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'admin',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  customer_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE price_list (
  id BIGSERIAL PRIMARY KEY,
  service_name VARCHAR(150) NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  currency CHAR(1) NOT NULL DEFAULT 'K',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  payment_method VARCHAR(50),
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  order_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  admin_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  price_list_id BIGINT REFERENCES price_list(id),
  service_name VARCHAR(150) NOT NULL,
  price NUMERIC(12,2) NOT NULL
);

CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  order_id BIGINT REFERENCES orders(id),
  service_name VARCHAR(150) NOT NULL,
  account_identifier VARCHAR(255),
  account_login TEXT,
  account_password TEXT,
  profile_name VARCHAR(150),
  profile_pin VARCHAR(30),
  start_date DATE,
  end_date DATE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  access_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  read_status BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE special_offers (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  service_name VARCHAR(150),
  offer_price NUMERIC(12,2),
  start_date DATE,
  end_date DATE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Useful indexes
CREATE INDEX idx_customers_number ON customers(customer_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_notifications_customer ON notifications(customer_id);
