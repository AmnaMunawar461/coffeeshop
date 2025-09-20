# Coffee Shop Website - Project Specification

## Overview
A full-stack coffee e-commerce website with React.js frontend, Node.js backend, MySQL database, and comprehensive features including user authentication, product management, shopping cart, and payment processing.

## Technical Architecture

### Tech Stack
- **Frontend**: React.js with modern hooks, React Router
- **Backend**: Node.js with Express.js
- **Database**: MySQL (Dockerized)
- **Authentication**: JWT-based with username/password
- **Payment**: Mock payment system
- **Styling**: CSS3/SCSS with responsive design (desktop-first)
- **State Management**: React Context API or Redux Toolkit

### Project Structure
```
coffeeshop/
├── frontend/          # React.js application
├── backend/           # Node.js API server
├── database/          # MySQL Docker setup
├── docker-compose.yml # Container orchestration
└── README.md         # Setup instructions
```

## Core Features Specification

### 1. User Authentication System
**Features:**
- User registration with username/password
- User login/logout
- JWT token-based session management
- Protected routes for authenticated users

**UI Mock - Login Page:**
```
┌─────────────────────────────────────┐
│  ☕ BREW & BEANS                    │
│                                     │
│  Welcome Back!                      │
│                                     │
│  Username: [________________]       │
│  Password: [________________]       │
│                                     │
│  [    Login    ] [  Sign Up   ]     │
│                                     │
│  Forgot Password?                   │
└─────────────────────────────────────┘
```

### 2. Product Catalog System
**Categories:**
- Hot Coffee
- Iced Coffee  
- Matcha
- Mini Cakes
- Donuts

**Product Variants:**
- **Coffee Sizes**: Small (+$0), Medium (+$1), Large (+$2)
- **Milk Types**: Regular, Oat (+$0.50), Almond (+$0.50), Soy (+$0.50)
- **Extra Shots**: +1 shot (+$1), +2 shots (+$2)

**UI Mock - Product Card:**
```
┌─────────────────────────────┐
│  [    Coffee Image    ]     │
│                             │
│  Caramel Macchiato         │
│  ⭐⭐⭐⭐⭐ (4.5) 23 reviews │
│  $4.99                      │
│                             │
│  Size: ○S ●M ○L            │
│  Milk: [Oat Milk ▼]        │
│  Extra: [+1 Shot ▼]        │
│                             │
│  [   Add to Cart   ]        │
└─────────────────────────────┘
```

### 3. Shopping Cart & Checkout
**Features:**
- Add/remove items from cart
- Quantity adjustment
- Real-time price calculation
- Persistent cart (localStorage)
- Checkout process with order summary

**UI Mock - Cart:**
```
┌─────────────────────────────────────┐
│  Shopping Cart (3 items)            │
│                                     │
│  ┌─────┬─────────────────┬─────┐   │
│  │[img]│ Caramel Macchiato│ $6.49│   │
│  │     │ Medium, Oat, +1  │     │   │
│  │     │ Qty: [-] 2 [+]   │     │   │
│  └─────┴─────────────────┴─────┘   │
│                                     │
│  Subtotal: $15.47                   │
│  Tax: $1.24                         │
│  Total: $16.71                      │
│                                     │
│  [    Checkout    ]                 │
└─────────────────────────────────────┘
```

### 4. Payment System (Mock)
**Features:**
- Mock credit card processing
- Cash payment option
- Order confirmation
- Receipt generation

**UI Mock - Payment:**
```
┌─────────────────────────────────────┐
│  Payment Method                     │
│                                     │
│  ○ Credit Card                      │
│    Card: [1234 5678 9012 3456]     │
│    Exp: [12/25] CVV: [123]         │
│                                     │
│  ○ Cash (Pay on pickup)             │
│                                     │
│  [   Complete Order   ]             │
└─────────────────────────────────────┘
```

### 5. User Profile & Order History
**Features:**
- View/edit profile information
- Order history with details
- Favorite products
- Reorder functionality

**UI Mock - Profile:**
```
┌─────────────────────────────────────┐
│  My Profile                         │
│                                     │
│  Username: johndoe                  │
│  Email: john@example.com            │
│  [Edit Profile]                     │
│                                     │
│  ─── Order History ───              │
│  Order #1234 - $16.71 (Completed)  │
│  Order #1235 - $8.99 (Processing)  │
│                                     │
│  ─── Favorites ───                  │
│  ♥ Caramel Macchiato               │
│  ♥ Vanilla Latte                   │
└─────────────────────────────────────┘
```

### 6. Admin Panel
**Features:**
- Product management (CRUD)
- Inventory management
- Order management
- User management
- Analytics dashboard

**UI Mock - Admin Dashboard:**
```
┌─────────────────────────────────────┐
│  Admin Dashboard                    │
│                                     │
│  [Products] [Orders] [Users] [Stats]│
│                                     │
│  ─── Quick Stats ───                │
│  Today's Sales: $234.56            │
│  Orders: 23                         │
│  Low Stock: 3 items                 │
│                                     │
│  ─── Recent Orders ───              │
│  #1234 - John D. - $16.71         │
│  #1235 - Jane S. - $8.99          │
└─────────────────────────────────────┘
```

### 7. Product Reviews & Ratings
**Features:**
- 5-star rating system
- Written reviews
- Review moderation
- Average rating display

## Homepage Design Specification

### Hero Section
```
┌─────────────────────────────────────────────────────────┐
│  [Logo] BREW & BEANS    [Home][Menu][About][Cart][Login]│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │                                                     ││
│  │     [Large Coffee Hero Image]                       ││
│  │                                                     ││
│  │     "Crafted with Love, Served with Passion"       ││
│  │     [  Explore Our Menu  ]                          ││
│  │                                                     ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Featured Products Section
```
┌─────────────────────────────────────────────────────────┐
│  Featured Today                                         │
│                                                         │
│  [Coffee 1]  [Coffee 2]  [Coffee 3]  [Coffee 4]       │
│  [Image   ]  [Image   ]  [Image   ]  [Image   ]       │
│  Name       Name       Name       Name               │
│  $4.99      $5.49      $3.99      $6.99             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Mini ADRs (Architectural Decision Records)

### ADR-001: User Attention Strategies

**Problem**: How to grab and maintain user attention on the coffee website?

**Options Considered**:
1. **Hero Section with High-Quality Images**: Large, Instagram-style coffee photos
2. **Interactive Product Showcase**: Rotating featured products
3. **Personalized Landing**: Show recommendations based on browsing history
4. **Special Offers Banner**: Prominent deals and promotions

**Decision**: Implement Hero Section + Interactive Showcase + Personalized recommendations

**Rationale**:
- Hero section creates immediate visual impact
- Interactive elements encourage exploration
- Personalization increases relevance
- Instagram-style photos align with modern coffee culture

**Implementation**:
- Large hero image with call-to-action
- Rotating "Featured Today" section
- "Just for You" recommendations for returning users
- High-quality product photography throughout

---

### ADR-002: Sales Increase Strategies

**Problem**: How to maximize sales conversion and average order value?

**Options Considered**:
1. **Recommendation Engine**: "Popular", "Just for You", "Frequently Bought Together"
2. **Bundle Deals**: Coffee + pastry combinations
3. **Loyalty Program**: Points-based rewards system
4. **Upselling**: Size upgrades, premium add-ons
5. **Social Proof**: Reviews, ratings, "X people bought this"

**Decision**: Implement Recommendations + Bundle Deals + Upselling + Social Proof

**Rationale**:
- Recommendations leverage user data for personalization
- Bundles increase average order value
- Upselling is natural for coffee customizations
- Social proof builds trust and urgency
- Loyalty program adds complexity for MVP

**Implementation**:
- "Popular This Week" section on homepage
- "Just for You" based on order history
- "Perfect Pairs" bundle suggestions
- Size upgrade prompts during customization
- Prominent review displays on product pages
- "X customers bought this today" indicators

---

### ADR-003: Application Architecture

**Problem**: Single-page application (SPA) vs Multi-page application (MPA)?

**Options Considered**:
1. **SPA with React Router**: Fast navigation, modern UX
2. **MPA with server-side routing**: Better SEO, simpler architecture
3. **Hybrid approach**: SPA for main app, separate pages for marketing

**Decision**: Single-Page Application (SPA) with React Router

**Rationale**:
- Better user experience with instant navigation
- Easier state management across components
- Modern development practices
- Desktop-first approach suits SPA well
- Can implement SEO optimizations later

**Implementation**:
- React Router for client-side routing
- Protected routes for authenticated areas
- Lazy loading for performance optimization
- Context API for global state management

## Database Schema

### Core Tables
```sql
Users (id, username, email, password_hash, created_at, updated_at)
Categories (id, name, description, image_url)
Products (id, name, description, base_price, category_id, image_url, stock_quantity)
Product_Variants (id, product_id, type, name, price_modifier)
Orders (id, user_id, total_amount, status, created_at)
Order_Items (id, order_id, product_id, quantity, unit_price, customizations)
Reviews (id, product_id, user_id, rating, comment, created_at)
Cart_Items (id, user_id, product_id, quantity, customizations)
```

## Development Timeline

### Phase 1: Foundation (Week 1)
- [ ] Project setup and Docker configuration
- [ ] Database schema and models
- [ ] Basic authentication system
- [ ] Product catalog structure

### Phase 2: Core Features (Week 2)
- [ ] Product display and filtering
- [ ] Shopping cart functionality
- [ ] User registration/login
- [ ] Basic admin panel

### Phase 3: Advanced Features (Week 3)
- [ ] Payment processing (mock)
- [ ] Order management
- [ ] Product reviews and ratings
- [ ] User profiles and order history

### Phase 4: Enhancement (Week 4)
- [ ] Recommendation system
- [ ] Bundle deals
- [ ] Admin analytics
- [ ] Performance optimization

## Success Metrics
- User registration rate > 15%
- Cart abandonment rate < 70%
- Average order value > $12
- User return rate > 25%
- Page load time < 3 seconds

## Technical Requirements
- Node.js 18+
- React 18+
- MySQL 8.0
- Docker & Docker Compose
- Modern browser support (Chrome, Firefox, Safari, Edge)

---

**Next Steps**: Upon approval of this specification, I will:
1. Set up the project structure
2. Configure Docker environment
3. Implement the backend API
4. Build the React frontend
5. Integrate all components
6. Provide deployment instructions

**Estimated Development Time**: 3-4 weeks for full implementation

Do you approve this specification? Any changes or additions you'd like me to make before proceeding with implementation?
