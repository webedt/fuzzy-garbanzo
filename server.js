import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Dokploy API configuration
const DOKPLOY_URL = process.env.VITE_DOKPLOY_URL || 'https://app.dokploy.com';
const DOKPLOY_API_KEY = process.env.VITE_DOKPLOY_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// Proxy endpoint for Dokploy API
app.all('/api/dokploy/*', async (req, res) => {
  try {
    // Get the Dokploy endpoint path
    const dokployPath = req.params[0];
    const dokployEndpoint = `${DOKPLOY_URL}/api/${dokployPath}`;

    console.log(`Proxying request: ${req.method} ${dokployEndpoint}`);

    // Get API key from request header or environment variable
    const apiKey = req.headers['x-api-key'] || DOKPLOY_API_KEY;

    if (!apiKey) {
      return res.status(401).json({
        error: 'No API key provided. Set VITE_DOKPLOY_API_KEY environment variable or include x-api-key header.',
      });
    }

    // Prepare fetch options
    const fetchOptions = {
      method: req.method,
      headers: {
        'accept': 'application/json',
        'x-api-key': apiKey,
      },
    };

    // Add body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      fetchOptions.headers['content-type'] = 'application/json';
      fetchOptions.body = JSON.stringify(req.body);
    }

    // Forward the request to Dokploy
    const response = await fetch(dokployEndpoint, fetchOptions);

    // Get response body
    const data = await response.json();

    // Forward the response status and data
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Failed to proxy request to Dokploy',
      message: error.message,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    dokployUrl: DOKPLOY_URL,
    hasApiKey: !!DOKPLOY_API_KEY,
  });
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Proxying Dokploy API: ${DOKPLOY_URL}`);
  console.log(`🔑 API Key configured: ${!!DOKPLOY_API_KEY}`);
});
