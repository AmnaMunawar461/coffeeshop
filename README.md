# ☕ Brew & Beans - Coffee Shop Website

A full-stack coffee e-commerce website built with React.js, Node.js, Express, and MySQL. Features user authentication, product catalog, shopping cart, order management, reviews, and admin panel.

## 🚀 Features

### Customer Features
- **User Authentication**: Register, login, and profile management
- **Product Catalog**: Browse coffee, pastries, and other items by category
- **Product Customization**: Size, milk type, and extra shots options
- **Shopping Cart**: Add, update, and remove items with real-time pricing
- **Checkout Process**: Mock payment system with card and cash options
- **Order Management**: View order history and reorder functionality
- **Product Reviews**: Rate and review purchased products
- **Favorites**: Save favorite products for quick access
- **Personalized Recommendations**: AI-powered suggestions based on order history

### Admin Features
- **Admin Dashboard**: Overview of sales, orders, and inventory
- **Product Management**: CRUD operations for products and categories
- **Inventory Control**: Stock level management and low stock alerts
- **Order Management**: View and update order statuses
- **Review Moderation**: Approve or reject customer reviews
- **User Management**: View and manage customer accounts

### Technical Features
- **Responsive Design**: Mobile-first, desktop-optimized interface
- **Real-time Updates**: Live cart updates and inventory tracking
- **Security**: JWT authentication, input validation, and SQL injection protection
- **Performance**: Optimized queries, image loading, and caching
- **Docker Support**: Containerized database and easy deployment

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern UI library with hooks
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling and validation
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications
- **CSS3** - Custom styling with CSS variables

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL 8.0** - Relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing

### DevOps
- **Docker & Docker Compose** - Containerization
- **MySQL Docker Image** - Database container
- **Environment Variables** - Configuration management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Docker** and **Docker Compose**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd coffeeshop
```

### 2. Set Up Environment Variables

Create environment files for the backend:

```bash
# Create backend environment file
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=coffeeshop
DB_USER=coffeeuser
DB_PASSWORD=coffeepass
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

### 3. Start the Database

```bash
# Start MySQL database with Docker
docker-compose up mysql -d

# Wait for database to be ready (about 30 seconds)
docker-compose logs mysql
```

### 4. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 5. Start the Application

#### Option A: Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

#### Option B: Manual Start

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm start
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000 (shows available endpoints)

## 👤 Default Users

The application comes with pre-configured users:

### Admin User
- **Username**: `admin`
- **Password**: `password123` (you'll need to hash this in the database)
- **Access**: Full admin panel access

### Demo User
- **Username**: `demo`
- **Password**: `password123`
- **Access**: Regular customer features

## 📁 Project Structure

```
coffeeshop/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication & validation
│   ├── routes/            # API endpoints
│   ├── package.json       # Backend dependencies
│   └── server.js          # Main server file
├── frontend/              # React.js application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React contexts (Auth, Cart)
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── App.js        # Main app component
│   └── package.json      # Frontend dependencies
├── database/             # Database setup
│   └── init.sql         # Database schema and sample data
├── docker-compose.yml   # Docker services configuration
└── README.md           # This file
```

## 🔧 Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Management

```bash
# Access MySQL container
docker-compose exec mysql mysql -u coffeeuser -p coffeeshop

# View logs
docker-compose logs mysql

# Reset database
docker-compose down -v
docker-compose up mysql -d
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/categories` - Get categories
- `GET /api/products/featured/popular` - Get featured products
- `GET /api/products/recommendations/personal` - Get personalized recommendations

#### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item
- `DELETE /api/cart/remove/:itemId` - Remove cart item
- `DELETE /api/cart/clear` - Clear cart

#### Orders
- `POST /api/orders/create` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/reorder` - Reorder items

#### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews/create` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

#### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites/add` - Add to favorites
- `DELETE /api/favorites/remove/:productId` - Remove from favorites

### Admin Endpoints

All admin endpoints require admin authentication:

- `GET /api/orders/admin/all` - Get all orders
- `PUT /api/orders/admin/:id/status` - Update order status
- `GET /api/reviews/admin/pending` - Get pending reviews
- `PUT /api/reviews/admin/:id/approve` - Approve/reject review
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## 🎨 Customization

### Styling
The application uses CSS custom properties (variables) for easy theming. Edit `frontend/src/index.css` to customize colors, fonts, and spacing.

### Database Schema
Modify `database/init.sql` to add new tables or change existing schema. Remember to rebuild the database container after changes.

### Adding Features
1. Create new API endpoints in `backend/routes/`
2. Add corresponding frontend services in `frontend/src/services/`
3. Create UI components in `frontend/src/components/`
4. Add new pages in `frontend/src/pages/`

## 🚀 Deployment

### Production Build

```bash
# Build frontend for production
cd frontend
npm run build

# The build folder contains the production-ready files
```

### Environment Variables for Production

Update the following for production:

```env
NODE_ENV=production
JWT_SECRET=your-very-secure-production-secret
DB_PASSWORD=secure-production-password
```

### Docker Production Deployment

```bash
# Build and run in production mode
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if MySQL container is running
   docker-compose ps
   
   # Check MySQL logs
   docker-compose logs mysql
   
   # Restart MySQL container
   docker-compose restart mysql
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000  # or :5000
   
   # Kill the process or change ports in docker-compose.yml
   ```

3. **Frontend Build Errors**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **CORS Issues**
   - Check that the frontend URL is in the backend CORS configuration
   - Ensure the API URL in frontend matches the backend URL

### Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried columns
2. **Image Optimization**: Use WebP format and lazy loading
3. **Caching**: Implement Redis for session storage and API caching
4. **CDN**: Use a CDN for static assets in production

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Search existing [GitHub issues](issues)
3. Create a new issue with detailed information

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic e-commerce functionality
- ✅ User authentication
- ✅ Product catalog and cart
- ✅ Order management
- ✅ Admin panel foundation

### Phase 2 (Next)
- [ ] Complete checkout process
- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Advanced product filtering
- [ ] Inventory alerts

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Loyalty program

---

**Happy Coding! ☕**
