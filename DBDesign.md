
## 1) Table "users" {
  "id" UUID [pk, default: `gen_random_uuid()`]
  "full_name" VARCHAR(120) [not null]
  "email" VARCHAR(255) [unique, not null]
  "phone" VARCHAR(30)
  "status" VARCHAR(20) [not null, check: `status IN ('active', 'inactive', 'suspended')`, default: 'active']
  "total_bookings" INTEGER [not null, default: 0]
  "created_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]
  "updated_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]

  Indexes {
    status [name: "idx_users_status"]
  }
}

## 2) Table "roles" {
  "id" UUID [pk, default: `gen_random_uuid()`]
  "name" VARCHAR(80) [unique, not null]
  "type" VARCHAR(30) [not null, check: `type IN ('super_admin', 'staff', 'agent', 'admin', 'customer')`]
  "user_count" INTEGER [not null, default: 0]
  "created_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]

  Indexes {
    type [name: "idx_roles_type"]
  }
}

## 3) Table "permissions" {
  "id" UUID [pk, default: `gen_random_uuid()`]
  "code" VARCHAR(80) [unique, not null]
  "name" VARCHAR(120) [not null]
  "category" VARCHAR(60) [not null]
}

## 4) Table "user_roles" {
  "user_id" UUID [not null]
  "role_id" UUID [not null]
  "assigned_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]

  Indexes {
    (user_id, role_id) [pk]
  }
}

## 5) Table "role_permissions" {
  "role_id" UUID [not null]
  "permission_id" UUID [not null]

  Indexes {
    (role_id, permission_id) [pk]
  }
}

## 6) Table "locations" {
  "id" UUID [pk, default: `gen_random_uuid()`]
  "name" VARCHAR(120) [not null]
  "address" VARCHAR(255) [not null]
  "city" VARCHAR(100) [not null]
  "state" VARCHAR(100) [not null]
  "zip_code" VARCHAR(20) [not null]
  "phone" VARCHAR(30)
  "email" VARCHAR(255)
  "opening_hours" VARCHAR(255)
  "is_active" BOOLEAN [not null, default: true]
  "created_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]
  "updated_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]

  Indexes {
    (name, city, state) [unique]
    is_active [name: "idx_locations_active"]
    (city, state) [name: "idx_locations_city_state"]
  }
}

## 7) Table "car_categories" {
  "id" UUID [pk, default: `gen_random_uuid()`]
  "name" VARCHAR(60) [unique, not null]
  "description" TEXT
  "vechicles_no" INTEGER [not null, default: 0]
  "is_active" BOOLEAN [not null, default: true]
  "last_updated" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]
}


## 8)Table "cars" {
  "id" UUID [pk, default: `gen_random_uuid()`]
  "name" VARCHAR(120) [not null]
  "category_id" UUID
  "year" SMALLINT [not null]
  "seats" SMALLINT [not null]
  "fuel_type" VARCHAR(40)
  "transmission" VARCHAR(40) [not null]
  "price_per_day" DECIMAL(10,2) [not null]
  "status" VARCHAR(20) [not null, check: `status IN ('available', 'rented', 'maintenance')`, default: 'available']
  "is_available" BOOLEAN [not null, default: true]
  "image_url" TEXT
  "description" TEXT
  "home_location_id" UUID
  "created_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]
  "updated_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]

  Indexes {
    status [name: "idx_cars_status"]
    category_id [name: "idx_cars_category"]
    home_location_id [name: "idx_cars_home_location"]
    price_per_day [name: "idx_cars_price"]
  }
}

## 9)Table "bookings" {
  "id" UUID [pk, default: `gen_random_uuid()`]
  "booking_code" VARCHAR(40) [unique, not null]
  "user_id" UUID [not null]
  "car_id" UUID [not null]
  "pickup_location_id" UUID
  "return_location_id" UUID
  "pickup_at" TIMESTAMP [not null]
  "return_at" TIMESTAMP [not null]
  "status" VARCHAR(20) [not null, check: `status IN ('pending','confirmed','approved','rejected','cancelled','completed')`]
  "total_amount" DECIMAL(10,2) [not null]
  "booked_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]
  "car_name_snapshot" VARCHAR(120)
  "car_type_snapshot" VARCHAR(60)
  "car_year_snapshot" SMALLINT
  "car_image_snapshot" TEXT

  Indexes {
    (user_id, booked_at) [name: "idx_bookings_user_time"]
    (car_id, pickup_at, return_at) [name: "idx_bookings_car_dates"]
    status [name: "idx_bookings_status"]
  }
}

## 10) Table "payments" {
  "id" UUID [pk, default: `gen_random_uuid()`]
  "booking_id" UUID [not null]
  "invoice_number" VARCHAR(40) [unique, not null]
  "transaction_id" VARCHAR(80) [unique]
  "amount" DECIMAL(10,2) [not null]
  "tax" DECIMAL(10,2) [not null, default: 0]
  "fees" DECIMAL(10,2) [not null, default: 0]
  "method" VARCHAR(30) [not null, check: `method IN ('credit_card', 'mobile_money', 'cash')`]
  "status" VARCHAR(20) [not null, check: `status IN ('pending','completed','refunded','failed')`]
  "paid_at" TIMESTAMP
  "refund_reason" TEXT
  "created_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]

  Indexes {
    booking_id [name: "idx_payments_booking"]
    status [name: "idx_payments_status"]
    paid_at [name: "idx_payments_paid_at"]
  }
}



## 11) Table "notification_templates" {
  "id" UUID [pk, default: `gen_random_uuid()`]
  "name" VARCHAR(120) [not null]
  "type" VARCHAR(10) [not null, check: `type IN ('email','sms')`]
  "trigger_event" VARCHAR(80) [not null]
  "subject" VARCHAR(255)
  "content" TEXT [not null]
  "enabled" BOOLEAN [not null, default: true]
  "created_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]
  "updated_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]
}

## 12) Table "notification_logs" {
  "id" UUID [pk, default: `gen_random_uuid()`]
  "template_id" UUID
  "user_id" UUID
  "booking_id" UUID
  "type" VARCHAR(10) [not null, check: `type IN ('email','sms')`]
  "recipient" VARCHAR(255) [not null]
  "subject" VARCHAR(255)
  "status" VARCHAR(20) [not null, check: `status IN ('sent','failed','pending')`]
  "sent_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]
  "error_message" TEXT

  Indexes {
    status [name: "idx_notif_logs_status"]
    sent_at [name: "idx_notif_logs_sent_at"]
  }
}

## 13) Table "notification_channel_settings" {
  "id" UUID [pk, default: `gen_random_uuid()`]
  "channel" VARCHAR(10) [not null, check: `channel IN ('email','sms')`]
  "provider" VARCHAR(80) [not null]
  "config_json" JSONB [not null, default: '{}']
  "from_name" VARCHAR(120)
  "from_email" VARCHAR(255)
  "from_number" VARCHAR(30)
  "is_active" BOOLEAN [not null, default: true]
  "updated_at" TIMESTAMP [not null, default: `CURRENT_TIMESTAMP`]

  Indexes {
    channel [unique]
  }
}










Ref:"users"."id" < "user_roles"."user_id" [delete: cascade]

Ref:"roles"."id" < "user_roles"."role_id" [delete: cascade]

Ref:"roles"."id" < "role_permissions"."role_id" [delete: cascade]

Ref:"permissions"."id" < "role_permissions"."permission_id" [delete: cascade]

Ref:"car_categories"."id" < "cars"."category_id"

Ref:"locations"."id" < "cars"."home_location_id"

Ref:"users"."id" < "bookings"."user_id"

Ref:"cars"."id" < "bookings"."car_id"

Ref:"locations"."id" < "bookings"."pickup_location_id"

Ref:"locations"."id" < "bookings"."return_location_id"

Ref:"bookings"."id" < "payments"."booking_id" [delete: cascade]


Ref:"notification_templates"."id" < "notification_logs"."template_id"

Ref:"users"."id" < "notification_logs"."user_id"

Ref:"bookings"."id" < "notification_logs"."booking_id"

