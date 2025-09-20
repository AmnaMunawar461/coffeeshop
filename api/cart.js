// Vercel serverless function for cart operations
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Mock cart data - in production, use a database
  const mockCart = {
    items: [
      {
        id: 1,
        product_id: 1,
        name: "Espresso",
        base_price: 2.50,
        quantity: 2,
        unit_price: 2.50,
        total_price: 5.00,
        image_url: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a",
        category_name: "Hot Coffee",
        customizations: null
      }
    ],
    summary: {
      subtotal: 5.00,
      tax: 0.40,
      total: 5.40,
      itemCount: 2
    }
  };

  if (req.method === 'GET') {
    res.status(200).json(mockCart);
  } else if (req.method === 'POST') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    if (pathname.includes('/add') || pathname.endsWith('/add')) {
      res.status(200).json({ message: 'Item added to cart successfully' });
    } else {
      res.status(404).json({ error: 'Endpoint not found' });
    }
  } else if (req.method === 'PUT') {
    res.status(200).json({ message: 'Cart item updated successfully' });
  } else if (req.method === 'DELETE') {
    res.status(200).json({ message: 'Item removed from cart successfully' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
