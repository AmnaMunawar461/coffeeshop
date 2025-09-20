-- Coffee Shop Database Schema
CREATE DATABASE IF NOT EXISTS coffeeshop;
USE coffeeshop;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    category_id INT,
    image_url VARCHAR(255),
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Product variants (sizes, milk types, extras)
CREATE TABLE product_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT,
    variant_type ENUM('size', 'milk', 'extra') NOT NULL,
    name VARCHAR(50) NOT NULL,
    price_modifier DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    total_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('card', 'cash') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    customizations JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT,
    user_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Cart items table
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    product_id INT,
    quantity INT NOT NULL,
    customizations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Favorites table
CREATE TABLE favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    product_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, product_id)
);

-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Hot Coffee', 'Freshly brewed hot coffee drinks', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'),
('Iced Coffee', 'Refreshing cold coffee beverages', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735'),
('Matcha', 'Premium matcha green tea drinks', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7'),
('Mini Cakes', 'Delicious bite-sized cakes', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587'),
('Donuts', 'Fresh baked donuts and pastries', 'https://images.unsplash.com/photo-1551024506-0bccd828d307');

-- Insert sample products
INSERT INTO products (name, description, base_price, category_id, image_url, stock_quantity) VALUES
-- Hot Coffee
('Espresso', 'Rich and bold espresso shot', 2.50, 1, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a', 100),
('Americano', 'Espresso with hot water', 3.00, 1, 'https://images.unsplash.com/photo-1459755486867-b55449bb39ff', 100),
('Cappuccino', 'Espresso with steamed milk and foam', 4.50, 1, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d', 100),
('Latte', 'Espresso with steamed milk', 4.99, 1, 'https://images.unsplash.com/photo-1561047029-3000c68339ca', 100),
('Caramel Macchiato', 'Vanilla syrup, steamed milk, espresso, caramel drizzle', 5.49, 1, 'https://images.unsplash.com/photo-1447933601403-0c6688de566e', 100),

-- Iced Coffee
('Iced Americano', 'Espresso with cold water over ice', 3.50, 2, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c', 100),
('Iced Latte', 'Espresso with cold milk over ice', 5.49, 2, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96', 100),
('Cold Brew', 'Smooth cold-brewed coffee', 4.99, 2, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735', 100),
('Frappuccino', 'Blended ice coffee drink', 6.49, 2, 'https://images.unsplash.com/photo-1570197788417-0e82375c9371', 100),

-- Matcha
('Matcha Latte', 'Premium matcha with steamed milk', 5.99, 3, 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7', 50),
('Iced Matcha Latte', 'Premium matcha with cold milk over ice', 6.49, 3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', 50),
('Matcha Frappuccino', 'Blended matcha ice drink', 6.99, 3, 'https://images.unsplash.com/photo-1564890273409-9d5d5d80e4c4', 50),

-- Mini Cakes
('Chocolate Mini Cake', 'Rich chocolate mini cake', 3.99, 4, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', 30),
('Vanilla Mini Cake', 'Classic vanilla mini cake', 3.49, 4, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', 30),
('Red Velvet Mini Cake', 'Decadent red velvet mini cake', 4.49, 4, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c', 30),

-- Donuts
('Glazed Donut', 'Classic glazed donut', 2.99, 5, 'https://images.unsplash.com/photo-1551024506-0bccd828d307', 40),
('Chocolate Donut', 'Chocolate glazed donut', 3.49, 5, 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac', 40),
('Boston Cream Donut', 'Cream-filled donut with chocolate glaze', 3.99, 5, 'https://images.unsplash.com/photo-1514517604298-cf80e0fb7f1e', 40);

-- Insert product variants for coffee products
INSERT INTO product_variants (product_id, variant_type, name, price_modifier) VALUES
-- Size variants for all coffee products (1-12)
(1, 'size', 'Small', 0.00), (1, 'size', 'Medium', 1.00), (1, 'size', 'Large', 2.00),
(2, 'size', 'Small', 0.00), (2, 'size', 'Medium', 1.00), (2, 'size', 'Large', 2.00),
(3, 'size', 'Small', 0.00), (3, 'size', 'Medium', 1.00), (3, 'size', 'Large', 2.00),
(4, 'size', 'Small', 0.00), (4, 'size', 'Medium', 1.00), (4, 'size', 'Large', 2.00),
(5, 'size', 'Small', 0.00), (5, 'size', 'Medium', 1.00), (5, 'size', 'Large', 2.00),
(6, 'size', 'Small', 0.00), (6, 'size', 'Medium', 1.00), (6, 'size', 'Large', 2.00),
(7, 'size', 'Small', 0.00), (7, 'size', 'Medium', 1.00), (7, 'size', 'Large', 2.00),
(8, 'size', 'Small', 0.00), (8, 'size', 'Medium', 1.00), (8, 'size', 'Large', 2.00),
(9, 'size', 'Small', 0.00), (9, 'size', 'Medium', 1.00), (9, 'size', 'Large', 2.00),
(10, 'size', 'Small', 0.00), (10, 'size', 'Medium', 1.00), (10, 'size', 'Large', 2.00),
(11, 'size', 'Small', 0.00), (11, 'size', 'Medium', 1.00), (11, 'size', 'Large', 2.00),
(12, 'size', 'Small', 0.00), (12, 'size', 'Medium', 1.00), (12, 'size', 'Large', 2.00),

-- Milk variants for milk-based drinks (3-12)
(3, 'milk', 'Regular Milk', 0.00), (3, 'milk', 'Oat Milk', 0.50), (3, 'milk', 'Almond Milk', 0.50), (3, 'milk', 'Soy Milk', 0.50),
(4, 'milk', 'Regular Milk', 0.00), (4, 'milk', 'Oat Milk', 0.50), (4, 'milk', 'Almond Milk', 0.50), (4, 'milk', 'Soy Milk', 0.50),
(5, 'milk', 'Regular Milk', 0.00), (5, 'milk', 'Oat Milk', 0.50), (5, 'milk', 'Almond Milk', 0.50), (5, 'milk', 'Soy Milk', 0.50),
(7, 'milk', 'Regular Milk', 0.00), (7, 'milk', 'Oat Milk', 0.50), (7, 'milk', 'Almond Milk', 0.50), (7, 'milk', 'Soy Milk', 0.50),
(9, 'milk', 'Regular Milk', 0.00), (9, 'milk', 'Oat Milk', 0.50), (9, 'milk', 'Almond Milk', 0.50), (9, 'milk', 'Soy Milk', 0.50),
(10, 'milk', 'Regular Milk', 0.00), (10, 'milk', 'Oat Milk', 0.50), (10, 'milk', 'Almond Milk', 0.50), (10, 'milk', 'Soy Milk', 0.50),
(11, 'milk', 'Regular Milk', 0.00), (11, 'milk', 'Oat Milk', 0.50), (11, 'milk', 'Almond Milk', 0.50), (11, 'milk', 'Soy Milk', 0.50),
(12, 'milk', 'Regular Milk', 0.00), (12, 'milk', 'Oat Milk', 0.50), (12, 'milk', 'Almond Milk', 0.50), (12, 'milk', 'Soy Milk', 0.50),

-- Extra shots for all coffee products (1-12)
(1, 'extra', 'No Extra', 0.00), (1, 'extra', '+1 Shot', 1.00), (1, 'extra', '+2 Shots', 2.00),
(2, 'extra', 'No Extra', 0.00), (2, 'extra', '+1 Shot', 1.00), (2, 'extra', '+2 Shots', 2.00),
(3, 'extra', 'No Extra', 0.00), (3, 'extra', '+1 Shot', 1.00), (3, 'extra', '+2 Shots', 2.00),
(4, 'extra', 'No Extra', 0.00), (4, 'extra', '+1 Shot', 1.00), (4, 'extra', '+2 Shots', 2.00),
(5, 'extra', 'No Extra', 0.00), (5, 'extra', '+1 Shot', 1.00), (5, 'extra', '+2 Shots', 2.00),
(6, 'extra', 'No Extra', 0.00), (6, 'extra', '+1 Shot', 1.00), (6, 'extra', '+2 Shots', 2.00),
(7, 'extra', 'No Extra', 0.00), (7, 'extra', '+1 Shot', 1.00), (7, 'extra', '+2 Shots', 2.00),
(8, 'extra', 'No Extra', 0.00), (8, 'extra', '+1 Shot', 1.00), (8, 'extra', '+2 Shots', 2.00),
(9, 'extra', 'No Extra', 0.00), (9, 'extra', '+1 Shot', 1.00), (9, 'extra', '+2 Shots', 2.00),
(10, 'extra', 'No Extra', 0.00), (10, 'extra', '+1 Shot', 1.00), (10, 'extra', '+2 Shots', 2.00),
(11, 'extra', 'No Extra', 0.00), (11, 'extra', '+1 Shot', 1.00), (11, 'extra', '+2 Shots', 2.00),
(12, 'extra', 'No Extra', 0.00), (12, 'extra', '+1 Shot', 1.00), (12, 'extra', '+2 Shots', 2.00);

-- Create admin user
INSERT INTO users (username, email, password_hash, first_name, last_name, is_admin) VALUES
('admin', 'admin@coffeeshop.com', '$2b$10$rQZ8kZKvGqYf8h8VqYf8h8VqYf8h8VqYf8h8VqYf8h8VqYf8h8Vq', 'Admin', 'User', TRUE);

-- Insert sample reviews
INSERT INTO reviews (product_id, user_id, rating, comment, is_approved) VALUES
(4, 1, 5, 'Amazing latte! Perfect balance of espresso and milk.', TRUE),
(5, 1, 4, 'Love the caramel flavor, but could use more espresso.', TRUE),
(7, 1, 5, 'Best iced latte in town!', TRUE);
