// Simple development server with CORS proxy
// Run with: node dev-server.js

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;
const API_URL = 'http://localhost:8080'; // Your Rust API URL

// Serve static files from src directory
app.use(express.static(path.join(__dirname, 'src')));

// Proxy API requests to avoid CORS issues
app.use('/api', createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
    logLevel: 'debug'
}));

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Development server running at http://localhost:${PORT}`);
    console.log(`Proxying API requests to ${API_URL}`);
    console.log('');
    console.log('To use:');
    console.log('1. Start your Rust API server on port 8080');
    console.log('2. Run: npm install express http-proxy-middleware');
    console.log('3. Run: node dev-server.js');
    console.log('4. Open: http://localhost:3000');
});
