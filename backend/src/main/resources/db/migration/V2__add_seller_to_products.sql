-- V2__add_seller_to_products.sql
ALTER TABLE products ADD COLUMN seller_id UUID REFERENCES users(id) ON DELETE SET NULL;
