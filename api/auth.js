// Vercel serverless function for authentication
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    
    if (pathname.includes('/login')) {
      const { username, password } = req.body;
      
      // Mock authentication - in production, use proper authentication
      if (username && password) {
        const mockUser = {
          id: 1,
          username: username,
          email: `${username}@example.com`,
          firstName: 'Demo',
          lastName: 'User',
          isAdmin: username === 'admin'
        };
        
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        res.status(200).json({
          message: 'Login successful',
          token: mockToken,
          user: mockUser
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else if (pathname.includes('/register')) {
      const { username, email, password, firstName, lastName } = req.body;
      
      if (username && email && password) {
        const mockUser = {
          id: Date.now(),
          username,
          email,
          firstName: firstName || 'New',
          lastName: lastName || 'User',
          isAdmin: false
        };
        
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        res.status(201).json({
          message: 'User registered successfully',
          token: mockToken,
          user: mockUser
        });
      } else {
        res.status(400).json({ error: 'Missing required fields' });
      }
    } else {
      res.status(404).json({ error: 'Endpoint not found' });
    }
  } else if (req.method === 'GET') {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    
    if (pathname.includes('/profile')) {
      // Mock profile data
      const mockUser = {
        id: 1,
        username: 'demo',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        isAdmin: false
      };
      
      res.status(200).json(mockUser);
    } else {
      res.status(404).json({ error: 'Endpoint not found' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
