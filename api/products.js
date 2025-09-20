// Vercel serverless function for products
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Mock data for demo purposes
  const mockProducts = [
    {
      id: 1,
      name: "Espresso",
      description: "Rich and bold espresso shot",
      base_price: "2.50",
      category_id: 1,
      image_url: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a",
      stock_quantity: 100,
      category_name: "Hot Coffee",
      average_rating: 4.5,
      review_count: 23
    },
    {
      id: 2,
      name: "Latte",
      description: "Espresso with steamed milk",
      base_price: "4.99",
      category_id: 1,
      image_url: "https://images.unsplash.com/photo-1561047029-3000c68339ca",
      stock_quantity: 100,
      category_name: "Hot Coffee",
      average_rating: 4.8,
      review_count: 45
    },
    {
      id: 3,
      name: "Cappuccino",
      description: "Espresso with steamed milk and foam",
      base_price: "4.50",
      category_id: 1,
      image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d",
      stock_quantity: 100,
      category_name: "Hot Coffee",
      average_rating: 4.6,
      review_count: 32
    },
    {
      id: 4,
      name: "Iced Latte",
      description: "Espresso with cold milk over ice",
      base_price: "5.49",
      category_id: 2,
      image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96",
      stock_quantity: 100,
      category_name: "Iced Coffee",
      average_rating: 4.7,
      review_count: 28
    },
    {
      id: 5,
      name: "Matcha Latte",
      description: "Premium matcha with steamed milk",
      base_price: "5.99",
      category_id: 3,
      image_url: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7",
      stock_quantity: 50,
      category_name: "Matcha",
      average_rating: 4.4,
      review_count: 19
    },
    {
      id: 6,
      name: "Chocolate Mini Cake",
      description: "Rich chocolate mini cake",
      base_price: "3.99",
      category_id: 4,
      image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
      stock_quantity: 30,
      category_name: "Mini Cakes",
      average_rating: 4.9,
      review_count: 67
    }
  ];

  const mockCategories = [
    { id: 1, name: "Hot Coffee", description: "Freshly brewed hot coffee drinks" },
    { id: 2, name: "Iced Coffee", description: "Refreshing cold coffee beverages" },
    { id: 3, name: "Matcha", description: "Premium matcha green tea drinks" },
    { id: 4, name: "Mini Cakes", description: "Delicious bite-sized cakes" },
    { id: 5, name: "Donuts", description: "Fresh baked donuts and pastries" }
  ];

  if (req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    // Handle different endpoints
    if (pathname.endsWith('/categories') || pathname.includes('/categories')) {
      res.status(200).json(mockCategories);
    } else if (pathname.includes('/featured/popular')) {
      res.status(200).json(mockProducts.slice(0, 4));
    } else {
      // Return all products or filtered products
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');
      let filteredProducts = mockProducts;
      
      if (category) {
        filteredProducts = filteredProducts.filter(p => p.category_id === parseInt(category));
      }
      
      if (search) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      res.status(200).json(filteredProducts);
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
