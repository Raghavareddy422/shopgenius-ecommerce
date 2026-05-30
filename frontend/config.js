// config.js - ShopGenius Dynamic API Router
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.hostname.startsWith('192.168.');

var API_BASE = isLocalhost 
    ? 'http://localhost:8080/api' 
    : 'https://shopgenius-ecommerce-9.onrender.com/api';

console.log('ShopGenius: Routing API traffic to:', API_BASE);
