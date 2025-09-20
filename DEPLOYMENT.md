# ☕ Coffee Shop - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- GitHub account
- Vercel account (free)
- Git installed on your machine

### 2. Prepare Your Repository

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Coffee Shop website ready for deployment"

# Create GitHub repository and push
# (Replace with your GitHub repository URL)
git remote add origin https://github.com/yourusername/coffeeshop.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: coffeeshop (or your preferred name)
# - Directory: ./ (current directory)
# - Override settings? N
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/build`
6. Click "Deploy"

### 4. Environment Variables (Optional)

In Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add any needed variables:
   - `NODE_ENV`: `production`
   - `REACT_APP_API_URL`: (leave empty to use default)

## 🔧 Configuration Files

### vercel.json
- Configures Vercel deployment
- Routes API calls to serverless functions
- Serves React build files

### API Functions
- `/api/products.js` - Product catalog and categories
- `/api/auth.js` - Authentication (mock)
- `/api/cart.js` - Shopping cart operations (mock)

## 🌐 Live Demo Features

Your deployed website will include:

✅ **Frontend Features:**
- Beautiful homepage with hero section
- Product catalog with categories
- User authentication (mock)
- Shopping cart functionality
- Responsive design
- Instagram-style product cards

✅ **Backend Features (Mock):**
- Product API with sample data
- Authentication endpoints
- Cart operations
- CORS enabled for all origins

## 📱 Testing Your Deployment

After deployment, test these features:

1. **Homepage**: Loads with hero section and featured products
2. **Products Page**: Shows product catalog with filtering
3. **Authentication**: Register/login functionality (mock)
4. **Cart**: Add products to cart
5. **Responsive**: Test on mobile devices

## 🔄 Updating Your Deployment

```bash
# Make changes to your code
git add .
git commit -m "Update: description of changes"
git push

# Vercel will automatically redeploy
```

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `frontend/package.json`
2. **API Not Working**: Verify `vercel.json` routes configuration
3. **Images Not Loading**: Ensure image URLs are accessible
4. **CORS Errors**: Check API functions have CORS headers

### Debug Commands:

```bash
# Check Vercel logs
vercel logs

# Test build locally
cd frontend && npm run build

# Test serverless functions locally
vercel dev
```

## 🎯 Production Considerations

For a production deployment, consider:

1. **Database**: Replace mock data with real database (Vercel KV, PlanetScale, etc.)
2. **Authentication**: Implement proper JWT with secure storage
3. **Payment**: Integrate Stripe or PayPal
4. **Images**: Use Vercel Image Optimization or CDN
5. **Analytics**: Add Vercel Analytics
6. **Monitoring**: Set up error tracking

## 📊 Performance Optimization

- ✅ Static site generation for fast loading
- ✅ Serverless functions for API
- ✅ Automatic HTTPS
- ✅ Global CDN distribution
- ✅ Automatic compression

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

**Your coffee shop website is now live on Vercel! ☕🎉**
