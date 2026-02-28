# Car Rental System - Database Design Schemas

This document is generated from the current codebase models/interfaces and mock data.

## 1) Table: users
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `full_name VARCHAR(120) NOT NULL`
- `email VARCHAR(255) NOT NULL UNIQUE`
- `phone VARCHAR(30)`
- `status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended'))`
- `join_date DATE`
- `total_bookings INT NOT NULL DEFAULT 0`
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
### Indexes
- `UNIQUE(email)`
- `INDEX(status)`
- `INDEX(join_date)`
### Relationships
- One-to-many: `users -> bookings`
- Many-to-many: `users <-> roles` via `user_roles`

## 2) Table: roles
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name VARCHAR(80) NOT NULL UNIQUE`
- `type VARCHAR(30) NOT NULL CHECK (type IN ('super_admin','staff','agent','admin','customer'))`
- `user_count INT NOT NULL DEFAULT 0`
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
### Indexes
- `UNIQUE(name)`
- `INDEX(type)`
### Relationships
- Many-to-many: `roles <-> users` via `user_roles`
- Many-to-many: `roles <-> permissions` via `role_permissions`

## 3) Table: permissions
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `code VARCHAR(80) NOT NULL UNIQUE`
- `name VARCHAR(120) NOT NULL`
- `category VARCHAR(60) NOT NULL`
### Indexes
- `UNIQUE(code)`
- `INDEX(category)`
### Relationships
- Many-to-many: `permissions <-> roles` via `role_permissions`

## 4) Table: user_roles
### Columns
- `user_id UUID NOT NULL`
- `role_id UUID NOT NULL`
- `assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `PRIMARY KEY(user_id, role_id)`
- `FOREIGN KEY (user_id) REFERENCES users(id)`
- `FOREIGN KEY (role_id) REFERENCES roles(id)`
### Indexes
- `INDEX(role_id)`
### Relationships
- Join table for `users <-> roles`

## 5) Table: role_permissions
### Columns
- `role_id UUID NOT NULL`
- `permission_id UUID NOT NULL`
- `PRIMARY KEY(role_id, permission_id)`
- `FOREIGN KEY (role_id) REFERENCES roles(id)`
- `FOREIGN KEY (permission_id) REFERENCES permissions(id)`
### Indexes
- `INDEX(permission_id)`
### Relationships
- Join table for `roles <-> permissions`

## 6) Table: locations
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name VARCHAR(120) NOT NULL`
- `address VARCHAR(255) NOT NULL`
- `city VARCHAR(100) NOT NULL`
- `state VARCHAR(100) NOT NULL`
- `zip_code VARCHAR(20) NOT NULL`
- `phone VARCHAR(30)`
- `email VARCHAR(255)`
- `opening_hours VARCHAR(255)`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
### Indexes
- `UNIQUE(name, city, state)`
- `INDEX(is_active)`
- `INDEX(city, state)`
### Relationships
- One-to-many: `locations -> cars`
- One-to-many: `locations -> bookings` (pickup/return)

## 7) Table: car_categories
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name VARCHAR(60) NOT NULL UNIQUE`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
### Indexes
- `UNIQUE(name)`
### Relationships
- One-to-many: `car_categories -> cars`
- One-to-many: `car_categories -> pricing_rules`

## 8) Table: cars
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name VARCHAR(120) NOT NULL`
- `category_id UUID`
- `year SMALLINT NOT NULL`
- `seats SMALLINT NOT NULL`
- `fuel_type VARCHAR(40)`
- `transmission VARCHAR(40) NOT NULL`
- `price_per_day DECIMAL(10,2) NOT NULL`
- `status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available','rented','maintenance'))`
- `is_available BOOLEAN NOT NULL DEFAULT TRUE`
- `image_url TEXT`
- `description TEXT`
- `home_location_id UUID`
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `FOREIGN KEY (category_id) REFERENCES car_categories(id)`
- `FOREIGN KEY (home_location_id) REFERENCES locations(id)`
### Indexes
- `INDEX(status)`
- `INDEX(category_id)`
- `INDEX(home_location_id)`
- `INDEX(price_per_day)`
### Relationships
- Many-to-one: `cars -> car_categories`
- Many-to-one: `cars -> locations`
- One-to-many: `cars -> bookings`

## 9) Table: bookings
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `booking_code VARCHAR(40) NOT NULL UNIQUE`
- `user_id UUID NOT NULL`
- `car_id UUID NOT NULL`
- `pickup_location_id UUID`
- `return_location_id UUID`
- `pickup_at TIMESTAMP NOT NULL`
- `return_at TIMESTAMP NOT NULL`
- `status VARCHAR(20) NOT NULL CHECK (status IN ('pending','confirmed','approved','rejected','cancelled','completed'))`
- `total_amount DECIMAL(10,2) NOT NULL`
- `booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `car_name_snapshot VARCHAR(120)`
- `car_type_snapshot VARCHAR(60)`
- `car_year_snapshot SMALLINT`
- `car_image_snapshot TEXT`
- `FOREIGN KEY (user_id) REFERENCES users(id)`
- `FOREIGN KEY (car_id) REFERENCES cars(id)`
- `FOREIGN KEY (pickup_location_id) REFERENCES locations(id)`
- `FOREIGN KEY (return_location_id) REFERENCES locations(id)`
### Indexes
- `UNIQUE(booking_code)`
- `INDEX(user_id, booked_at DESC)`
- `INDEX(car_id, pickup_at, return_at)`
- `INDEX(status)`
- `INDEX(pickup_location_id)`
- `INDEX(return_location_id)`
### Relationships
- Many-to-one: `bookings -> users`
- Many-to-one: `bookings -> cars`
- Many-to-one: `bookings -> locations` (pickup/return)
- One-to-many: `bookings -> payments`

## 10) Table: payments
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `booking_id UUID NOT NULL`
- `invoice_number VARCHAR(40) NOT NULL UNIQUE`
- `transaction_id VARCHAR(80) UNIQUE`
- `amount DECIMAL(10,2) NOT NULL`
- `tax DECIMAL(10,2) NOT NULL DEFAULT 0`
- `fees DECIMAL(10,2) NOT NULL DEFAULT 0`
- `method VARCHAR(30) NOT NULL CHECK (method IN ('credit_card','mobile_money','cash'))`
- `status VARCHAR(20) NOT NULL CHECK (status IN ('pending','completed','refunded','failed'))`
- `paid_at TIMESTAMP`
- `refund_reason TEXT`
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `FOREIGN KEY (booking_id) REFERENCES bookings(id)`
### Indexes
- `UNIQUE(invoice_number)`
- `UNIQUE(transaction_id)`
- `INDEX(booking_id)`
- `INDEX(status)`
- `INDEX(paid_at DESC)`
- `INDEX(method)`
### Relationships
- Many-to-one: `payments -> bookings`

## 11) Table: pricing_rules
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name VARCHAR(120) NOT NULL`
- `type VARCHAR(20) NOT NULL CHECK (type IN ('base','seasonal','discount'))`
- `category_id UUID`
- `value DECIMAL(10,2) NOT NULL`
- `is_percentage BOOLEAN NOT NULL DEFAULT FALSE`
- `start_date DATE`
- `end_date DATE`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `FOREIGN KEY (category_id) REFERENCES car_categories(id)`
### Indexes
- `INDEX(type, is_active)`
- `INDEX(category_id)`
- `INDEX(start_date, end_date)`
### Relationships
- Many-to-one: `pricing_rules -> car_categories`

## 12) Table: notification_templates
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name VARCHAR(120) NOT NULL`
- `type VARCHAR(10) NOT NULL CHECK (type IN ('email','sms'))`
- `trigger_event VARCHAR(80) NOT NULL`
- `subject VARCHAR(255)`
- `content TEXT NOT NULL`
- `enabled BOOLEAN NOT NULL DEFAULT TRUE`
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
### Indexes
- `INDEX(trigger_event, enabled)`
- `INDEX(type)`
### Relationships
- One-to-many: `notification_templates -> notification_logs`

## 13) Table: notification_logs
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `template_id UUID`
- `user_id UUID`
- `booking_id UUID`
- `type VARCHAR(10) NOT NULL CHECK (type IN ('email','sms'))`
- `recipient VARCHAR(255) NOT NULL`
- `subject VARCHAR(255)`
- `status VARCHAR(20) NOT NULL CHECK (status IN ('sent','failed','pending'))`
- `sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `error_message TEXT`
- `FOREIGN KEY (template_id) REFERENCES notification_templates(id)`
- `FOREIGN KEY (user_id) REFERENCES users(id)`
- `FOREIGN KEY (booking_id) REFERENCES bookings(id)`
### Indexes
- `INDEX(status)`
- `INDEX(type)`
- `INDEX(sent_at DESC)`
- `INDEX(recipient)`
### Relationships
- Many-to-one: `notification_logs -> notification_templates`
- Many-to-one: `notification_logs -> users`
- Many-to-one: `notification_logs -> bookings`

## 14) Table: notification_channel_settings
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `channel VARCHAR(10) NOT NULL CHECK (channel IN ('email','sms'))`
- `provider VARCHAR(80) NOT NULL`
- `config_json JSONB NOT NULL DEFAULT '{}'`
- `from_name VARCHAR(120)`
- `from_email VARCHAR(255)`
- `from_number VARCHAR(30)`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
### Indexes
- `UNIQUE(channel)`
- `INDEX(provider)`
- `INDEX(is_active)`
### Relationships
- Standalone settings table

## 15) Table: integrations
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `provider_key VARCHAR(80) NOT NULL UNIQUE`
- `name VARCHAR(120) NOT NULL`
- `category VARCHAR(20) NOT NULL CHECK (category IN ('payment','sms','accounting'))`
- `description TEXT`
- `enabled BOOLEAN NOT NULL DEFAULT FALSE`
- `config_json JSONB NOT NULL DEFAULT '{}'`
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
### Indexes
- `UNIQUE(provider_key)`
- `INDEX(category, enabled)`
### Relationships
- Can be referenced by operational logs/settings

## 16) Table: webhook_settings
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `target_url TEXT NOT NULL`
- `secret_hash VARCHAR(255) NOT NULL`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
### Indexes
- `INDEX(is_active)`
### Relationships
- One-to-many: `webhook_settings -> webhook_event_subscriptions`
- One-to-many: `webhook_settings -> webhook_deliveries`

## 17) Table: webhook_event_subscriptions
### Columns
- `webhook_setting_id UUID NOT NULL`
- `event_name VARCHAR(80) NOT NULL`
- `enabled BOOLEAN NOT NULL DEFAULT TRUE`
- `PRIMARY KEY(webhook_setting_id, event_name)`
- `FOREIGN KEY (webhook_setting_id) REFERENCES webhook_settings(id)`
### Indexes
- `INDEX(event_name, enabled)`
### Relationships
- Child table of `webhook_settings`

## 18) Table: webhook_deliveries
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `webhook_setting_id UUID NOT NULL`
- `event_name VARCHAR(80) NOT NULL`
- `payload JSONB NOT NULL`
- `status VARCHAR(20) NOT NULL CHECK (status IN ('success','failed','pending'))`
- `http_status INT`
- `attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `response_body TEXT`
- `FOREIGN KEY (webhook_setting_id) REFERENCES webhook_settings(id)`
### Indexes
- `INDEX(webhook_setting_id, attempted_at DESC)`
- `INDEX(event_name, attempted_at DESC)`
- `INDEX(status)`
### Relationships
- Many-to-one: `webhook_deliveries -> webhook_settings`

## 19) Table: api_permissions
### Columns
- `code VARCHAR(80) PRIMARY KEY`
- `description VARCHAR(255)`
### Indexes
- Primary key index on `code`
### Relationships
- Many-to-many: `api_permissions <-> api_keys` via `api_key_permissions`

## 20) Table: api_keys
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name VARCHAR(120) NOT NULL UNIQUE`
- `key_hash VARCHAR(255) NOT NULL`
- `key_prefix VARCHAR(20) NOT NULL`
- `status VARCHAR(20) NOT NULL CHECK (status IN ('active','inactive'))`
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `last_used_at TIMESTAMP`
### Indexes
- `UNIQUE(name)`
- `INDEX(status)`
- `INDEX(last_used_at DESC)`
### Relationships
- Many-to-many: `api_keys <-> api_permissions` via `api_key_permissions`
- One-to-many: `api_keys -> api_request_logs`

## 21) Table: api_key_permissions
### Columns
- `api_key_id UUID NOT NULL`
- `permission_code VARCHAR(80) NOT NULL`
- `PRIMARY KEY(api_key_id, permission_code)`
- `FOREIGN KEY (api_key_id) REFERENCES api_keys(id)`
- `FOREIGN KEY (permission_code) REFERENCES api_permissions(code)`
### Indexes
- `INDEX(permission_code)`
### Relationships
- Join table for `api_keys <-> api_permissions`

## 22) Table: api_endpoints
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `method VARCHAR(10) NOT NULL CHECK (method IN ('GET','POST','PUT','DELETE'))`
- `path VARCHAR(255) NOT NULL`
- `description TEXT`
- `parameters_example TEXT`
### Indexes
- `UNIQUE(method, path)`
### Relationships
- Optional parent for `api_request_logs`

## 23) Table: api_request_logs
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `api_key_id UUID`
- `endpoint_id UUID`
- `endpoint_path VARCHAR(255) NOT NULL`
- `method VARCHAR(10) NOT NULL`
- `status_code INT NOT NULL`
- `response_time_ms INT NOT NULL`
- `requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `FOREIGN KEY (api_key_id) REFERENCES api_keys(id)`
- `FOREIGN KEY (endpoint_id) REFERENCES api_endpoints(id)`
### Indexes
- `INDEX(requested_at DESC)`
- `INDEX(api_key_id, requested_at DESC)`
- `INDEX(method, endpoint_path)`
- `INDEX(status_code)`
### Relationships
- Many-to-one: `api_request_logs -> api_keys`
- Optional many-to-one: `api_request_logs -> api_endpoints`

## 24) Table: analytics_period_metrics
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `period_type VARCHAR(10) NOT NULL CHECK (period_type IN ('daily','monthly'))`
- `period_start DATE NOT NULL`
- `period_label VARCHAR(20) NOT NULL`
- `revenue DECIMAL(12,2) NOT NULL DEFAULT 0`
- `bookings_count INT NOT NULL DEFAULT 0`
- `cars_rented_count INT NOT NULL DEFAULT 0`
### Indexes
- `UNIQUE(period_type, period_start)`
- `INDEX(period_type, period_start DESC)`
### Relationships
- Derived analytics facts from bookings/payments

## 25) Table: analytics_category_metrics
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `period_type VARCHAR(12) NOT NULL DEFAULT 'all_time' CHECK (period_type IN ('daily','monthly','all_time'))`
- `period_start DATE`
- `category_id UUID NOT NULL`
- `revenue DECIMAL(12,2) NOT NULL DEFAULT 0`
- `bookings_count INT NOT NULL DEFAULT 0`
- `FOREIGN KEY (category_id) REFERENCES car_categories(id)`
### Indexes
- `UNIQUE(period_type, period_start, category_id)`
- `INDEX(category_id)`
### Relationships
- Many-to-one: `analytics_category_metrics -> car_categories`

---

## High-Level Relationship Summary
- `users` 1..* `bookings`
- `cars` 1..* `bookings`
- `locations` 1..* `cars`
- `locations` 1..* `bookings` (pickup and return)
- `bookings` 1..* `payments`
- `users` *..* `roles` via `user_roles`
- `roles` *..* `permissions` via `role_permissions`
- `api_keys` *..* `api_permissions` via `api_key_permissions`
- `notification_templates` 1..* `notification_logs`
- `webhook_settings` 1..* `webhook_event_subscriptions`
- `webhook_settings` 1..* `webhook_deliveries`
