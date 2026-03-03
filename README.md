# Car Rental System - Database Design Schemas

This document is generated from the current codebase models/interfaces and mock data.

## 1) Table: users
### Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `full_name VARCHAR(120) NOT NULL`
- `email VARCHAR(255) NOT NULL UNIQUE`
- `phone VARCHAR(30)`
- `status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended'))`
- `total_bookings INT NOT NULL DEFAULT 0`
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
### Indexes
- `UNIQUE(email)`
- `INDEX(status)`
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

## 9) Table:



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


## High-Level Relationship Summary
- `users` 1..* `bookings`
- `cars` 1..* `bookings`
- `locations` 1..* `cars`
- `locations` 1..* `bookings` (pickup and return)
- `bookings` 1..* `payments`
- `users` *..* `roles` via `user_roles`
- `roles` *..* `permissions` via `role_permissions`
- `notification_templates` 1..* `notification_logs`

