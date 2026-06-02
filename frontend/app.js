// app.js - E-commerce SPA Core Router & View Manager (Amazon/Flipkart Style)

if (typeof API_BASE === 'undefined') {
    var API_BASE = 'http://localhost:8080/api';
}

// Global Application State
const state = {
    user: null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    cart: null,
    activeRoute: 'products',
    products: [],
    categories: [],
    selectedCategory: null,
    searchQuery: '',
    filterEcoScore: null,
    filterOnlyInStock: false,
    filterSizes: [],
    negotiationLog: [], // Active chatbot dialogue
    negotiatingProduct: null,
    negotiatedFinalPrice: null
};

// Toast Alerts
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let title = 'Notification';
    let icon = '';
    if (type === 'success') {
        title = 'Success';
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="color: var(--success); margin-right: 6px; vertical-align: middle;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
        title = 'Error';
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="color: var(--danger); margin-right: 6px; vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else if (type === 'warning') {
        title = 'Warning';
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="color: var(--warning); margin-right: 6px; vertical-align: middle;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="color: var(--primary); margin-right: 6px; vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
        <div style="font-weight:700; font-size:12px; margin-bottom:2px; text-transform:uppercase; letter-spacing:0.05em; display: flex; align-items: center; font-family: var(--font-head);">
            ${icon} ${title}
        </div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-left: 22px;">${message}</div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// REST API Client
async function apiCall(endpoint, options = {}) {
    options.headers = options.headers || {};
    if (state.token) {
        options.headers['Authorization'] = `Bearer ${state.token}`;
    }
    if (options.body && typeof options.body === 'object') {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }
    
    try {
        let res = await fetch(`${API_BASE}${endpoint}`, options);
        
        // Silent token refresh
        if (res.status === 401 && state.refreshToken) {
            console.log("Session expired. Refreshing authorization...");
            const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: state.refreshToken })
            });

            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                state.token = refreshData.data.token;
                localStorage.setItem('token', state.token);
                options.headers['Authorization'] = `Bearer ${state.token}`;
                res = await fetch(`${API_BASE}${endpoint}`, options);
            } else {
                logout();
                throw new Error("Session expired. Please sign in again.");
            }
        }

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    } catch (err) {
        showToast(err.message, 'error');
        throw err;
    }
}

// User state check on startup
async function initAuth() {
    if (state.token) {
        try {
            const data = await apiCall('/users/profile');
            state.user = data.data;
            updateHeaderNav();
        } catch (err) {
            logout();
        }
    } else {
        updateHeaderNav();
    }
}

function logout() {
    state.user = null;
    state.token = null;
    state.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    state.cart = null;
    updateHeaderNav();
    showToast("Signed out successfully.", "info");
    navigate('products');
}

// Navigation Router
function navigate(route) {
    state.activeRoute = route;
    window.location.hash = route;
    renderView();
}

window.addEventListener('hashchange', () => {
    const route = window.location.hash.substring(1) || 'products';
    state.activeRoute = route;
    renderView();
});

// Update Navbar elements dynamically
function updateHeaderNav() {
    const profileSublink = document.getElementById('nav-profile-sublink');
    const authNavContainer = document.getElementById('auth-nav-container');

    if (state.user) {
        if (profileSublink) profileSublink.style.display = 'inline-block';
        if (authNavContainer) {
            authNavContainer.innerHTML = `
                <div style="display:flex; align-items: center; gap: 0.5rem; cursor:pointer;" onclick="navigate('profile')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="color: var(--secondary);">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <div style="display:flex; flex-direction:column;">
                        <span class="top-text">Hello, ${state.user.firstName}</span>
                        <span class="bottom-text" style="display:flex; align-items:center; gap:0.25rem;">
                            Account
                            <span style="font-size:9.5px; color: var(--danger); font-weight:normal; margin-left:4px;" onclick="event.stopPropagation(); logout();">(Sign Out)</span>
                        </span>
                    </div>
                </div>
            `;
        }
        fetchCart();
        fetchNotifications();
    } else {
        if (profileSublink) profileSublink.style.display = 'none';
        if (authNavContainer) {
            authNavContainer.innerHTML = `
                <a href="#auth" class="action-link" style="display: flex; align-items: center; gap: 0.5rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="color: var(--text-muted);">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <div style="display: flex; flex-direction: column;">
                        <span class="top-text">Hello, Sign in</span>
                        <span class="bottom-text">Account & Lists</span>
                    </div>
                </a>
            `;
        }
        updateCartBadge();
        updateNotifBadge();
    }
}

// Cart Updates
async function fetchCart(couponCode = null) {
    if (!state.user) return;
    try {
        const data = await apiCall(`/cart${couponCode ? '?couponCode=' + couponCode : ''}`);
        state.cart = data.data;
        updateCartBadge();
    } catch (err) {
        console.error(err);
    }
}

function updateCartBadge() {
    const badgeContainer = document.getElementById('cart-badge-container');
    if (!badgeContainer) return;

    if (state.user && state.cart && state.cart.items.length > 0) {
        const totalQty = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
        badgeContainer.innerHTML = `<span class="cart-count">${totalQty}</span>`;
    } else {
        badgeContainer.innerHTML = '';
    }
}

// Render dynamic workspace views
async function renderView() {
    const container = document.getElementById('app-view');
    if (!container) return;

    container.innerHTML = `<div style="text-align:center; padding: 4rem;"><span style="font-size:1.25rem; color:var(--text-secondary);">Loading ShopGenius Marketplace...</span></div>`;

    if (state.activeRoute === 'auth') {
        renderAuthView(container);
    } else if (state.activeRoute === 'products') {
        await renderProductsView(container);
    } else if (state.activeRoute === 'cart') {
        await renderCartView(container);
    } else if (state.activeRoute === 'checkout') {
        await renderCheckoutView(container);
    } else if (state.activeRoute === 'orders') {
        await renderOrdersView(container);
    } else if (state.activeRoute === 'profile') {
        await renderProfileView(container);
    } else if (state.activeRoute === 'sell') {
        await renderSellView(container);
    }
}

/* ========================================================
   VIEW: AUTH
   ======================================================== */
function renderAuthView(container) {
    if (state.user) {
        navigate('products');
        return;
    }

    container.innerHTML = `
        <div style="max-width:380px; margin: 3rem auto;" class="content-box">
            <h2 style="font-family:var(--font-head); font-weight:600; font-size:1.75rem; text-align:center; margin-bottom:1.5rem;">Sign-In</h2>
            
            <div style="display:flex; border-bottom:1px solid var(--border-color); margin-bottom:1.5rem; justify-content:center;">
                <div style="flex:1; text-align:center; padding:0.5rem; cursor:pointer; font-weight:700;" id="tab-login" onclick="switchAuthTab('login')">Sign In</div>
                <div style="flex:1; text-align:center; padding:0.5rem; cursor:pointer; color:var(--text-secondary);" id="tab-register" onclick="switchAuthTab('register')">Create Account</div>
            </div>

            <!-- Login Form -->
            <form id="form-login" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label class="form-label" style="font-weight:700;">Email (phone for mobile accounts)</label>
                    <input type="email" id="login-email" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-weight:700;">Password</label>
                    <input type="password" id="login-password" class="form-input" required>
                </div>
                <button type="submit" class="btn btn-primary" style="margin-top:1.5rem; width:100%; border-radius:4px;">Sign-In</button>
            </form>

            <!-- Register Form -->
            <form id="form-register" onsubmit="handleRegister(event)" style="display:none;">
                <div class="form-group">
                    <label class="form-label" style="font-weight:700;">First Name</label>
                    <input type="text" id="reg-firstname" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-weight:700;">Last Name</label>
                    <input type="text" id="reg-lastname" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-weight:700;">Email Address</label>
                    <input type="email" id="reg-email" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-weight:700;">Mobile Number</label>
                    <input type="tel" id="reg-phone" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-weight:700;">Password</label>
                    <input type="password" id="reg-password" class="form-input" required placeholder="At least 6 characters">
                </div>
                <button type="submit" class="btn btn-primary" style="margin-top:1.5rem; width:100%; border-radius:4px;">Create your ShopGenius account</button>
            </form>
        </div>
    `;
}

function switchAuthTab(type) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (type === 'login') {
        tabLogin.style.borderBottom = '3px solid var(--btn-secondary)';
        tabLogin.style.color = 'var(--text-primary)';
        tabRegister.style.borderBottom = 'none';
        tabRegister.style.color = 'var(--text-secondary)';
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
    } else {
        tabLogin.style.borderBottom = 'none';
        tabLogin.style.color = 'var(--text-secondary)';
        tabRegister.style.borderBottom = '3px solid var(--btn-secondary)';
        tabRegister.style.color = 'var(--text-primary)';
        formLogin.style.display = 'none';
        formRegister.style.display = 'block';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        state.token = data.data.token;
        state.refreshToken = data.data.refreshToken;
        localStorage.setItem('token', state.token);
        localStorage.setItem('refreshToken', state.refreshToken);
        showToast("Welcome back!", "success");
        await initAuth();
        navigate('products');
    } catch (err) {}
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const firstName = document.getElementById('reg-firstname').value;
    const lastName = document.getElementById('reg-lastname').value;
    const phoneNumber = document.getElementById('reg-phone').value;
    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: { email, password, firstName, lastName, phoneNumber }
        });
        state.token = data.data.token;
        state.refreshToken = data.data.refreshToken;
        localStorage.setItem('token', state.token);
        localStorage.setItem('refreshToken', state.refreshToken);
        showToast("Account created!", "success");
        await initAuth();
        navigate('products');
    } catch (err) {}
}

/* ========================================================
   VIEW: PRODUCTS CATALOG (Amazon Style Grid & Sidebar)
   ======================================================== */
async function renderProductsView(container) {
    try {
        if (state.products.length === 0) {
            const prodData = await apiCall('/products?size=50');
            state.products = prodData.data.content || [];
        }
        if (state.categories.length === 0) {
            const catData = await apiCall('/categories?size=50');
            state.categories = catData.data.content || [];
        }

        container.innerHTML = `
            <!-- Hero Banner -->
            <div class="hero-banner">
                <h2>AI-Driven Price Negotiation Days</h2>
                <p>Welcome to a smarter shopping experience. Browse our premium catalogue, and chat live with our AI system to bargain on prices.</p>
                <div style="font-weight:700; color:var(--btn-primary); font-size:12px; text-transform:uppercase;">⚡ Limited Time Negotiation Incentives</div>
            </div>

            <!-- Two Column Layout -->
            <div class="catalog-layout">
                <!-- Left Sidebar Filters -->
                <div class="sidebar-filter">
                    <div class="filter-section">
                        <div class="filter-title">Show Results For</div>
                        <ul class="filter-list">
                            <li class="filter-item ${state.selectedCategory === null ? 'active' : ''}" onclick="filterByCategory(null)">All Categories</li>
                            ${state.categories.map(cat => `
                                <li class="filter-item ${state.selectedCategory === cat.id ? 'active' : ''}" onclick="filterByCategory('${cat.id}')">
                                    ${cat.name}
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="filter-section">
                        <div class="filter-title">Filter by Size</div>
                        <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:13px;">
                            ${['S', 'M', 'L', 'XL'].map(size => `
                                <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                                    <input type="checkbox" value="${size}" ${state.filterSizes.includes(size) ? 'checked' : ''} onchange="toggleSizeFilter('${size}')">
                                    Size ${size}
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="filter-section">
                        <div class="filter-title">Sustainability Score</div>
                        <ul class="filter-list">
                            <li class="filter-item ${state.filterEcoScore === null ? 'active' : ''}" onclick="filterByEco(null)">All Eco Ratings</li>
                            <li class="filter-item ${state.filterEcoScore === 90 ? 'active' : ''}" onclick="filterByEco(90)">🌱 Exceptional (Eco 90+)</li>
                            <li class="filter-item ${state.filterEcoScore === 80 ? 'active' : ''}" onclick="filterByEco(80)">🌱 Very Good (Eco 80+)</li>
                        </ul>
                    </div>

                    <div class="filter-section">
                        <div class="filter-title">Availability</div>
                        <label style="display:flex; align-items:center; gap:0.5rem; font-size:13px; cursor:pointer;">
                            <input type="checkbox" id="stock-avail-checkbox" ${state.filterOnlyInStock ? 'checked' : ''} onchange="toggleInStockFilter()">
                            Include Out of Stock
                        </label>
                    </div>
                </div>

                <!-- Right Product Listing Grid -->
                <div>
                    <div style="background:white; border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.75rem 1rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center; font-size:13px;">
                        <div>
                            Showing <strong id="results-count">0</strong> results for "${state.searchQuery || 'All Catalog'}"
                        </div>
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            Sort By:
                            <select style="padding:0.25rem; font-size:12.5px; border-radius:4px; outline:none;" id="sort-select" onchange="sortProducts()">
                                <option value="featured">Featured</option>
                                <option value="best-sellers">Best Sellers</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="eco">Eco Rating</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="product-grid" id="catalog-products-grid">
                        <!-- Filled dynamically -->
                    </div>
                </div>
            </div>
        `;

        renderFilteredProducts();

    } catch (err) {
        container.innerHTML = `<div style="text-align:center; padding: 4rem; color:var(--danger)">Error loading marketplace catalog. Please refresh.</div>`;
    }
}

function filterByEco(score) {
    state.filterEcoScore = score;
    renderView();
}

function toggleInStockFilter() {
    state.filterOnlyInStock = document.getElementById('stock-avail-checkbox').checked;
    renderFilteredProducts();
}

function sortProducts() {
    renderFilteredProducts();
}

function renderFilteredProducts() {
    const grid = document.getElementById('catalog-products-grid');
    if (!grid) return;

    let list = [...state.products];

    // Filter by category
    if (state.selectedCategory) {
        list = list.filter(p => p.categoryId === state.selectedCategory);
    }

    // Filter by Search Query
    if (state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    // Filter by Eco Score
    if (state.filterEcoScore) {
        list = list.filter(p => p.ecoScore && p.ecoScore >= state.filterEcoScore);
    }

    // Filter by Stock Availability
    if (!state.filterOnlyInStock) {
        list = list.filter(p => p.stockQuantity > 0);
    }

    // Filter by Sizes
    if (state.filterSizes && state.filterSizes.length > 0) {
        list = list.filter(p => {
            if (!p.sizes) return false;
            const pSizes = p.sizes.split(',').map(s => s.trim());
            return state.filterSizes.some(size => pSizes.includes(size));
        });
    }

    // Sorting
    const sortVal = document.getElementById('sort-select')?.value || 'featured';
    if (sortVal === 'price-asc') {
        list.sort((a,b) => a.price - b.price);
    } else if (sortVal === 'price-desc') {
        list.sort((a,b) => b.price - a.price);
    } else if (sortVal === 'eco') {
        list.sort((a,b) => (b.ecoScore || 0) - (a.ecoScore || 0));
    } else if (sortVal === 'best-sellers') {
        list.sort((a,b) => {
            const ratingA = 4.0 + (a.name.length % 11) * 0.1;
            const ratingB = 4.0 + (b.name.length % 11) * 0.1;
            return ratingB - ratingA;
        });
    }

    document.getElementById('results-count').innerText = list.length;

    if (list.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:4rem; background:white; border:1px solid var(--border-color); color:var(--text-secondary);">No products match your filters.</div>`;
        return;
    }

    grid.innerHTML = list.map(prod => {
        // Mocking ratings and review counts for professional look
        const mockRating = (4.0 + (prod.name.length % 11) * 0.1).toFixed(1);
        const mockReviews = 45 + (prod.name.length % 5) * 62;

        return `
            <div class="product-card">
                <div class="product-img-box" onclick="openProductDetails('${prod.id}')" style="cursor:pointer;">
                    <img src="${prod.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'}" alt="${prod.name}" class="product-img">
                </div>
                
                <h3 class="product-title" onclick="openProductDetails('${prod.id}')" style="cursor:pointer;">${prod.name}</h3>
                
                <div class="rating-container">
                    <span class="stars">${'★'.repeat(Math.round(mockRating))}${'☆'.repeat(5 - Math.round(mockRating))}</span>
                    <span class="rating-count">${mockReviews} reviews</span>
                </div>

                ${prod.ecoScore ? `<span class="eco-label"><span style="font-size:12px;">🌱</span> Eco Score: ${prod.ecoScore}</span>` : ''}

                <!-- Available Sizes Badge -->
                ${prod.sizes ? `<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 6px; font-weight:500;">Sizes: <strong style="color:var(--text-primary);">${prod.sizes}</strong></div>` : ''}

                <div class="price-box">
                    <div class="price-row">
                        <span class="price-main"><span>₹</span>${Math.floor(prod.price)}<span>${(prod.price % 1).toFixed(2).substring(2)}</span></span>
                        <span class="price-strike">₹${(prod.price * 1.25).toFixed(2)}</span>
                    </div>
                    <span class="price-savings">Save 25%</span>
                    <span class="delivery-text">FREE Delivery by <strong>Tomorrow</strong></span>
                </div>

                <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:auto;">
                    <button class="btn btn-primary" onclick="openProductDetails('${prod.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="margin-right: 4px;">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Bargain with AI
                    </button>
                    <button class="btn btn-outline" onclick="addToCart('${prod.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="margin-right: 4px;">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function triggerSearch() {
    state.searchQuery = document.getElementById('search-input').value;
    // Redirect to products if not there
    if (state.activeRoute !== 'products') {
        navigate('products');
    } else {
        renderFilteredProducts();
    }
}

function filterByCategory(categoryId) {
    state.selectedCategory = categoryId;
    state.filterSizes = [];
    state.filterEcoScore = null;
    state.searchQuery = '';
    renderView();
}

function filterByNegotiationZone() {
    state.selectedCategory = null;
    state.filterEcoScore = null;
    state.filterSizes = [];
    state.searchQuery = '';
    navigate('products');
    showToast("Welcome to the AI Negotiation Zone! Bargaining is active on all items.", "success");
}

function filterByBestSellers() {
    state.selectedCategory = null;
    state.filterEcoScore = null;
    state.filterSizes = [];
    state.searchQuery = '';
    navigate('products');
    setTimeout(() => {
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.value = 'best-sellers';
            renderFilteredProducts();
        }
    }, 50);
}

function filterBySustainability() {
    state.selectedCategory = null;
    state.filterEcoScore = 80;
    state.filterSizes = [];
    state.searchQuery = '';
    navigate('products');
}

function toggleSizeFilter(size) {
    const idx = state.filterSizes.indexOf(size);
    if (idx >= 0) {
        state.filterSizes.splice(idx, 1);
    } else {
        state.filterSizes.push(size);
    }
    renderFilteredProducts();
}

// Expose to window for inline onclick attributes
window.filterByCategory = filterByCategory;
window.filterByNegotiationZone = filterByNegotiationZone;
window.filterByBestSellers = filterByBestSellers;
window.filterBySustainability = filterBySustainability;
window.toggleSizeFilter = toggleSizeFilter;

/* ========================================================
   VIEW: PRODUCT DETAILS & INTERACTIVE AI NEGOTIATOR MODAL
   ======================================================== */
async function openProductDetails(productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    // Initialize negotiation state
    state.negotiatingProduct = prod;
    state.negotiatedFinalPrice = null;
    state.negotiationStatus = null;
    state.negotiationLog = [
        { sender: 'bot', message: `Hi there! I am the automated ShopGenius pricing manager. I can negotiate on this **${prod.name}** (retail price: ₹${prod.price.toFixed(2)}). What is your target price?` }
    ];

    const overlay = document.getElementById('product-details-modal');
    const content = document.getElementById('product-details-content');
    
    // Renders 3 column professional product details screen
    renderDetailsModalContent(content, prod);
    overlay.classList.add('active');
}

function renderDetailsModalContent(target, prod) {
    const mockRating = (4.0 + (prod.name.length % 11) * 0.1).toFixed(1);
    const mockReviews = 45 + (prod.name.length % 5) * 62;

    let negoBannerHtml = '';
    let buyContainerStyle = 'none';
    let inputContainerStyle = 'flex';
    let meterStyle = 'none';
    let savingsPct = 0;

    if (state.negotiatedFinalPrice && state.negotiatedFinalPrice < prod.price) {
        savingsPct = Math.round(((prod.price - state.negotiatedFinalPrice) / prod.price) * 100);
        meterStyle = 'block';
    }

    if (state.negotiationStatus === 'ACCEPTED') {
        negoBannerHtml = `<div id="nego-result-banner" style="padding:0.6rem 1rem; text-align:center; font-weight:700; font-size:12.5px; background: #ecfdf5; color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 6px; margin-bottom: 0.5rem;">APPROVED: ₹${state.negotiatedFinalPrice.toFixed(2)}</div>`;
        buyContainerStyle = 'block';
        inputContainerStyle = 'none';
    } else if (state.negotiationStatus === 'COUNTER_OFFERED') {
        negoBannerHtml = `<div id="nego-result-banner" style="padding:0.6rem 1rem; text-align:center; font-weight:700; font-size:12.5px; background: #fffbeb; color: #d97706; border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 6px; margin-bottom: 0.5rem;">COUNTER OFFER: ₹${state.negotiatedFinalPrice.toFixed(2)}</div>`;
        buyContainerStyle = 'block';
        inputContainerStyle = 'flex';
    } else if (state.negotiationStatus === 'REJECTED') {
        negoBannerHtml = `<div id="nego-result-banner" style="padding:0.6rem 1rem; text-align:center; font-weight:700; font-size:12.5px; background: #fef2f2; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 6px; margin-bottom: 0.5rem;">REJECTED (Offer too low)</div>`;
        buyContainerStyle = 'none';
        inputContainerStyle = 'flex';
    }

    target.innerHTML = `
        <button class="close-btn" onclick="closeDetailsModal()">✕</button>
        <div class="product-details-container">
            <!-- Left Column: Image -->
            <div class="details-image-box">
                <img src="${prod.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'}" alt="${prod.name}">
            </div>

            <!-- Middle Column: Product Details -->
            <div class="details-info-box">
                <h2>${prod.name}</h2>
                <div class="rating-container" style="margin-bottom:1rem;">
                    <span class="stars" style="font-size:16px;">${'★'.repeat(Math.round(mockRating))}${'☆'.repeat(5 - Math.round(mockRating))}</span>
                    <span class="rating-count" style="font-size:13px;">${mockReviews} customer ratings</span>
                </div>
                
                <div style="border-top: 1px solid var(--border-color); padding-top:1rem; margin-bottom:1.5rem;">
                    <h4 style="margin-bottom:0.5rem;">Product Description</h4>
                    <p style="color:var(--text-secondary); font-size:13.5px; line-height:1.5;">
                        ${prod.description || 'This premium consumer product is manufactured to meet rigorous industry standards. Packed with powerful components, it combines functional engineering with long-lasting styling.'}
                    </p>
                </div>

                ${prod.sizes ? `
                    <div style="margin-bottom: 1.25rem;">
                        <h4 style="margin-bottom:0.5rem; font-size:13px; font-weight:700;">Select Size</h4>
                        <div style="display:flex; gap:0.5rem;" id="modal-size-selector">
                            ${prod.sizes.split(',').map((size, idx) => `
                                <span style="display:inline-flex; width:34px; height:34px; align-items:center; justify-content:center; border:1px solid ${idx===0 ? 'var(--primary)' : 'var(--border-color)'}; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; background:${idx===0 ? '#eff6ff' : 'white'}; color:var(--text-primary); transition:var(--transition);" onclick="this.parentNode.querySelectorAll('span').forEach(s => {s.style.borderColor='var(--border-color)'; s.style.background='white';}); this.style.borderColor='var(--primary)'; this.style.background='#eff6ff';">${size.trim()}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                    ${prod.ecoScore ? `
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            <span class="eco-label" style="margin-bottom:0;">🌱 Eco Score: ${prod.ecoScore}</span>
                            <span style="font-size:12px; color:var(--text-secondary);">Recycled packaging & low-emission shipping footprint.</span>
                        </div>
                    ` : ''}
                    <div style="font-size:12px; color:var(--text-secondary);">
                        SKU Number: <strong style="color:#111;">${prod.sku}</strong>
                    </div>
                </div>
            </div>

            <!-- Right Column: Buy Box & Embedded AI Assistant -->
            <div>
                <div class="details-price-card">
                    <div class="price-box" style="margin-bottom:1rem;">
                        <span style="font-size:12px; color:var(--text-secondary);">Regular Price</span>
                        <div class="price-row">
                            <span class="price-main" style="font-size:1.8rem;"><span>₹</span>${Math.floor(prod.price)}<span>${(prod.price % 1).toFixed(2).substring(2)}</span></span>
                        </div>
                    </div>

                    <div style="font-size:13px; margin-bottom:1rem;">
                        Status: <strong style="color:${prod.stockQuantity > 0 ? 'var(--success)' : 'var(--danger)'};">
                            ${prod.stockQuantity > 0 ? 'In Stock (' + prod.stockQuantity + ')' : 'Temporarily Out of Stock'}
                        </strong>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:0.5rem;">
                        <button class="btn btn-outline" onclick="addToCart('${prod.id}')">Add to Cart</button>
                    </div>

                    <div style="border-top:1px solid var(--border-color); padding-top:1rem; margin-top:1rem;">
                        <span style="font-weight:700; font-size:12.5px; font-family:var(--font-head); display:block; margin-bottom:0.5rem;">Create Price Drop Watch</span>
                        <div style="display:flex; gap:0.5rem;">
                            <input type="number" id="price-alert-target" class="search-input" style="border:1px solid var(--border-color); height:32px; border-radius:4px; font-size:12.5px; padding:0 8px; color:var(--text-primary);" placeholder="Target Price (₹)" step="1">
                            <button class="btn btn-outline" onclick="subscribePriceAlert('${prod.id}')" style="height:32px; width:65px; border-radius:4px; font-size:11.5px; padding:0; line-height:1;">Watch</button>
                        </div>
                    </div>
                </div>

                <!-- Live AI Negotiation Card -->
                <div class="ai-negotiator-card">
                    <div class="ai-header">
                        <div class="header-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5 2a3 3 0 1 1 6 0v1h.5A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3H5V2zm6 2H5v3h6V4zm0 4H5v3h6V8z"/>
                            </svg>
                            <span>AI Price Bargainer</span>
                        </div>
                        <div class="status-pulse"></div>
                    </div>

                    <!-- Savings/Discount Progress Meter -->
                    <div class="savings-meter-container" id="nego-savings-meter-container" style="display: ${meterStyle};">
                        <div style="display:flex; justify-content:space-between; font-size:11.5px; font-weight:600; color:var(--text-secondary);">
                            <span>Discount Secured:</span>
                            <span id="nego-savings-pct">${savingsPct}% off retail</span>
                        </div>
                        <div class="savings-meter-bar">
                            <div class="savings-meter-fill" id="nego-savings-fill" style="width: ${savingsPct}%;"></div>
                        </div>
                    </div>

                    <div class="ai-messages" id="details-ai-messages">
                        ${state.negotiationLog.map(msg => `
                            <div class="bubble ${msg.sender}">${msg.message}</div>
                        `).join('')}
                    </div>
                    
                    <div style="padding: 0 1.25rem;">
                        ${negoBannerHtml}
                    </div>

                    <div class="ai-input-row" id="nego-input-container" style="display: ${inputContainerStyle};">
                        <input type="number" id="nego-user-input" class="ai-input" placeholder="Offer price (₹)" step="1">
                        <button class="ai-btn" onclick="submitDetailOffer()">Submit</button>
                    </div>
                    <div id="nego-buy-container" style="display: ${buyContainerStyle}; padding: 0.75rem; background: #ecfdf5; border-top: 1px solid rgba(16, 185, 129, 0.15);">
                        <button class="btn btn-primary" onclick="acceptNegotiationPrice()" style="width:100%; border-radius:6px;">Accept Price & Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Scroll chat to bottom
    const box = document.getElementById('details-ai-messages');
    if (box) box.scrollTop = box.scrollHeight;
}

async function submitDetailOffer() {
    const input = document.getElementById('nego-user-input');
    const offeredPrice = parseFloat(input.value);

    if (isNaN(offeredPrice) || offeredPrice <= 0) {
        showToast("Please enter a valid price offer.", "warning");
        return;
    }

    if (!state.user) {
        showToast("Please login to bargain.", "info");
        closeDetailsModal();
        navigate('auth');
        return;
    }

    const prod = state.negotiatingProduct;

    // Add user bubble
    state.negotiationLog.push({ sender: 'user', message: `I would like to pay ₹${offeredPrice.toFixed(2)}` });
    renderDetailsModalContent(document.getElementById('product-details-content'), prod);
    
    // Typing indicator
    const box = document.getElementById('details-ai-messages');
    const typing = document.createElement('div');
    typing.className = 'bubble bot';
    typing.id = 'nego-typing-indicator';
    typing.innerHTML = `
        <div class="typing-dots">
            <span></span><span></span><span></span>
        </div>
    `;
    box.appendChild(typing);
    box.scrollTop = box.scrollHeight;

    try {
        const response = await apiCall('/negotiate', {
            method: 'POST',
            body: {
                productId: prod.id,
                offeredPrice: offeredPrice
            }
        });

        // Remove indicator
        const typingIndicator = document.getElementById('nego-typing-indicator');
        if (typingIndicator) typingIndicator.remove();

        const data = response.data;
        state.negotiationLog.push({ sender: 'bot', message: data.message });
        state.negotiationStatus = data.status;

        if (data.status === 'ACCEPTED') {
            state.negotiatedFinalPrice = data.offeredPrice;
        } else if (data.status === 'COUNTER_OFFERED') {
            state.negotiatedFinalPrice = data.counterPrice;
        }

        renderDetailsModalContent(document.getElementById('product-details-content'), prod);
    } catch (err) {
        const typingIndicator = document.getElementById('nego-typing-indicator');
        if (typingIndicator) typingIndicator.remove();
    }
}

async function addToCart(productId, quantity = 1, showSuccessToast = true) {
    if (!state.user) {
        showToast("Please sign in to add items to your cart.", "info");
        closeDetailsModal();
        navigate('auth');
        return;
    }
    try {
        const data = await apiCall('/cart/items', {
            method: 'POST',
            body: { productId, quantity }
        });
        state.cart = data.data;
        updateCartBadge();
        if (showSuccessToast) {
            showToast("Item added to cart!", "success");
        }
    } catch (err) {
        console.error(err);
    }
}

async function acceptNegotiationPrice() {
    const prod = state.negotiatingProduct;
    const finalPrice = state.negotiatedFinalPrice;
    
    try {
        // Save accepted negotiation price on backend
        await apiCall('/negotiate/accept', {
            method: 'POST',
            body: { productId: prod.id, offeredPrice: finalPrice }
        });

        // Add item to cart
        await addToCart(prod.id, 1, false);
        
        closeDetailsModal();
        showToast(`Bargained price of ₹${finalPrice.toFixed(2)} accepted! Added to cart.`, "success");
        navigate('cart');
    } catch (err) {
        console.error(err);
    }
}

function closeDetailsModal() {
    document.getElementById('product-details-modal').classList.remove('active');
    state.negotiatingProduct = null;
}

/* ========================================================
   VIEW: CART
   ======================================================== */
async function renderCartView(container) {
    if (!state.user) {
        navigate('auth');
        return;
    }

    await fetchCart();

    if (!state.cart || state.cart.items.length === 0) {
        container.innerHTML = `
            <div class="content-box" style="text-align:center; padding: 4rem;">
                <h2 style="font-family:var(--font-head); font-size:2rem; margin-bottom:1rem;">Your Shopping Cart is Empty</h2>
                <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Browse featured deals on electronics and wearables.</p>
                <a href="#products" class="btn btn-primary" style="display:inline-flex; width:200px; border-radius:4px;">Shop Now</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="cart-layout">
            <!-- Left: Cart Items List -->
            <div class="content-box" style="padding-top:1rem;">
                <h2 style="font-family:var(--font-head); border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:0.5rem; font-size:1.8rem; font-weight:500;">Shopping Cart</h2>
                
                <div>
                    ${state.cart.items.map(item => `
                        <div class="cart-item-row" id="cart-item-${item.id}">
                            <div style="display:flex; gap:1.25rem; flex:1; align-items:center;">
                                <img src="${item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'}" style="width:70px; height:70px; object-fit:contain;">
                                <div>
                                    <h4 style="font-size:15px; font-weight:600;">${item.productName}</h4>
                                    <span style="font-size:12.5px; color:var(--text-secondary);">In stock</span>
                                    
                                    <div style="display:flex; align-items:center; gap:1rem; margin-top:0.5rem;">
                                        <div style="display:flex; align-items:center; border:1px solid var(--border-color); border-radius:4px; padding:2px; height:26px;">
                                            <button onclick="updateCartQty('${item.id}', ${item.quantity - 1})" style="border:none; background:transparent; width:22px; cursor:pointer;">-</button>
                                            <span style="font-weight:700; width:22px; text-align:center; font-size:12px;">${item.quantity}</span>
                                            <button onclick="updateCartQty('${item.id}', ${item.quantity + 1})" style="border:none; background:transparent; width:22px; cursor:pointer;">+</button>
                                        </div>
                                        <span style="font-size:12px; color:var(--text-link); cursor:pointer;" onclick="removeCartItem('${item.id}')">Delete</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="text-align:right;">
                                <strong style="font-family:var(--font-head); font-size:1.2rem; color:#111;">₹${item.subTotal.toFixed(2)}</strong>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="display:flex; justify-content:space-between; margin-top:1.5rem; border-top:1px solid var(--border-color); padding-top:1.5rem;">
                    <button class="btn btn-outline" onclick="clearFullCart()" style="width:140px; border-radius:4px;">Clear Cart</button>
                    <h3>Subtotal (${state.cart.items.reduce((s,i) => s + i.quantity, 0)} items): <strong style="font-family:var(--font-head);">₹${state.cart.finalAmount.toFixed(2)}</strong></h3>
                </div>
            </div>

            <!-- Right: Summary Box -->
            <div>
                <div class="content-box" style="margin-bottom:1rem;">
                    <div style="font-size:15px; margin-bottom:1rem;">
                        Subtotal: <strong style="font-size:1.3rem; font-family:var(--font-head);">₹${state.cart.totalAmount.toFixed(2)}</strong>
                    </div>
                    
                    ${state.cart.discountAmount > 0 ? `
                        <div style="display:flex; justify-content:space-between; font-size:12.5px; color:var(--success); margin-bottom:0.75rem; background:#f0fdf4; padding:0.4rem; border-radius:4px;">
                            <span>Promo Applied:</span>
                            <strong>-₹${state.cart.discountAmount.toFixed(2)}</strong>
                        </div>
                    ` : ''}

                    <div style="font-size:12px; color:var(--success); margin-bottom:1rem; display:flex; align-items:center; gap:0.25rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                        </svg>
                        Your order qualifies for FREE Shipping
                    </div>

                    <a href="#checkout" class="btn btn-primary" style="width:100%; border-radius:4px; font-weight:700;">Proceed to Checkout</a>
                </div>

                <div class="content-box">
                    <h4 style="margin-bottom:0.5rem; font-size:13px;">Apply Promotion Code</h4>
                    <div style="display:flex; gap:0.5rem;">
                        <input type="text" id="coupon-input" class="search-input" style="border:1px solid var(--border-color); height:32px; border-radius:4px;" placeholder="Code" value="${state.cart.couponCode || ''}">
                        <button class="btn btn-outline" onclick="applyPromoCode()" style="height:32px; width:70px; border-radius:4px;">Apply</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function updateCartQty(itemId, newQty) {
    try {
        const data = await apiCall(`/cart/items/${itemId}?quantity=${newQty}`, { method: 'PUT' });
        state.cart = data.data;
        updateCartBadge();
        renderView();
    } catch (err) {}
}

async function removeCartItem(itemId) {
    try {
        const data = await apiCall(`/cart/items/${itemId}`, { method: 'DELETE' });
        state.cart = data.data;
        updateCartBadge();
        renderView();
        showToast("Removed item from cart.", "info");
    } catch (err) {}
}

async function clearFullCart() {
    try {
        await apiCall('/cart', { method: 'DELETE' });
        state.cart = null;
        updateCartBadge();
        renderView();
        showToast("Cart cleared.", "info");
    } catch (err) {}
}

async function applyPromoCode() {
    const code = document.getElementById('coupon-input').value.trim();
    if (!code) return;
    try {
        await fetchCart(code);
        renderView();
        showToast("Coupon applied successfully!", "success");
    } catch (err) {}
}

/* ========================================================
   VIEW: SECURE CHECKOUT
   ======================================================== */
async function renderCheckoutView(container) {
    if (!state.user) {
        navigate('auth');
        return;
    }

    if (!state.cart || state.cart.items.length === 0) {
        navigate('cart');
        return;
    }

    let addresses = [];
    try {
        const addrRes = await apiCall('/users/addresses');
        addresses = addrRes.data || [];
    } catch (err) {
        console.error(err);
    }

    container.innerHTML = `
        <!-- Step Indicators -->
        <div class="step-indicator" style="max-width: 600px; margin: 0 auto 2.5rem auto;">
            <div class="step complete">
                <div class="step-number">✓</div>
                <div class="step-label">Cart</div>
            </div>
            <div class="step active">
                <div class="step-number">2</div>
                <div class="step-label">Delivery</div>
            </div>
            <div class="step">
                <div class="step-number">3</div>
                <div class="step-label">Payment</div>
            </div>
        </div>

        <div class="cart-layout">
            <!-- Left: Checkout steps -->
            <div class="content-box" style="display:flex; flex-direction:column; gap:2rem;">
                <h2 style="font-family:var(--font-head); font-size:1.8rem; font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom: 0.5rem;">Secure Checkout</h2>
                
                <div>
                    <h3 style="font-family:var(--font-head); font-size:16px; font-weight:700; margin-bottom:1.25rem; display:flex; align-items:center; gap:0.5rem;">
                        <span style="background:var(--primary); color:white; width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">1</span>
                        Select Shipping Address
                    </h3>
                    
                    <div class="address-grid">
                        ${addresses.map(addr => `
                            <div class="address-option ${addr.isDefault ? 'selected' : ''}" onclick="selectCheckoutAddress('${addr.id}', this)">
                                <input type="radio" name="checkout-addr" value="${addr.id}" ${addr.isDefault ? 'checked' : ''} style="display:none;">
                                <div>
                                    <strong style="font-size:14px; font-family: var(--font-head);">${addr.street}</strong>
                                    <div style="font-size:12.5px; color:var(--text-secondary); margin-top:4px;">${addr.city}, ${addr.state} - ${addr.postalCode}, ${addr.country}</div>
                                </div>
                                ${addr.isDefault ? `<span style="position: absolute; top: 12px; right: 12px; font-size: 9px; background: var(--success-bg); color: var(--success); font-weight: 700; padding: 2px 6px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.15);">Default</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    ${addresses.length === 0 ? `<p style="font-size:13px; color:var(--text-secondary); margin-bottom:1rem;">No shipping addresses found. Please add an address to continue.</p>` : ''}
                    
                    <button class="btn btn-outline" onclick="openAddressModal()" style="width:180px; height:36px; border-radius:6px; font-size:12.5px;">+ Add New Address</button>
                </div>

                <div style="border-top:1px solid var(--border-color); padding-top:1.5rem;">
                    <h3 style="font-family:var(--font-head); font-size:16px; font-weight:700; margin-bottom:1.25rem; display:flex; align-items:center; gap:0.5rem;">
                        <span style="background:var(--primary); color:white; width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">2</span>
                        Choose Payment Method
                    </h3>
                    <div style="display:flex; gap:1.5rem; margin-bottom:1.25rem;">
                        <label style="display:flex; align-items:center; gap:0.5rem; font-size:13.5px; cursor:pointer; font-weight:500;">
                            <input type="radio" name="checkout-payment" value="CREDIT_CARD" checked style="accent-color:var(--primary);">
                            Credit/Debit Card
                        </label>
                        <label style="display:flex; align-items:center; gap:0.5rem; font-size:13.5px; cursor:pointer; font-weight:500;">
                            <input type="radio" name="checkout-payment" value="PAYPAL" style="accent-color:var(--primary);">
                            PayPal Checkout
                        </label>
                    </div>

                    <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:8px; padding:1.5rem; max-width:480px;">
                        <div class="form-group">
                            <label class="form-label">Card Number</label>
                            <input type="text" class="form-input" placeholder="4111 2222 3333 4444">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                            <div class="form-group">
                                <label class="form-label">Expiry Date</label>
                                <input type="text" class="form-input" placeholder="MM/YY">
                            </div>
                            <div class="form-group">
                                <label class="form-label">CVV</label>
                                <input type="text" class="form-input" placeholder="123">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Final Summary -->
            <div class="content-box" style="height:fit-content; position: sticky; top: calc(var(--header-height) + 1.5rem);">
                <h3 style="font-family:var(--font-head); font-size:16px; margin-bottom:1.25rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem; font-weight:700;">Order Summary</h3>
                
                <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; font-size:13.5px; color:var(--text-secondary);">
                    <span>Items Subtotal:</span>
                    <strong style="color:var(--text-primary);">₹${state.cart.totalAmount.toFixed(2)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; font-size:13.5px; color:var(--success);">
                    <span>Bargained Discount:</span>
                    <strong>-${state.cart.discountAmount > 0 ? '₹' + state.cart.discountAmount.toFixed(2) : '₹0.00'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:1.25rem; font-size:13.5px; color:var(--text-secondary);">
                    <span>Shipping Fee:</span>
                    <strong style="color:var(--success);">FREE</strong>
                </div>
                
                <div style="display:flex; justify-content:space-between; font-size:1.4rem; font-weight:800; border-top:1px solid var(--border-color); padding-top:1rem; margin-bottom:1.5rem; font-family:var(--font-head);">
                    <span>Total Cost:</span>
                    <span style="color:var(--danger);">₹${state.cart.finalAmount.toFixed(2)}</span>
                </div>

                <button class="btn btn-secondary" onclick="processCheckout()" style="width:100%; border-radius:6px; font-weight:700; font-size:14px; height:44px; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Place Secure Order
                </button>
                
                <div style="text-align:center; font-size:11.5px; color:var(--text-muted); margin-top:1rem; display:flex; align-items:center; justify-content:center; gap:0.25rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color:var(--success);">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    SSL Encryption Protocol Enabled
                </div>
            </div>
        </div>
    `;
}

function openAddressModal() {
    const modal = document.getElementById('address-modal');
    const content = document.getElementById('address-modal-content');

    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem;">
            <h3 style="font-family:var(--font-head); font-size:16px;">Add a new address</h3>
            <button class="btn btn-text" onclick="closeAddressModal()" style="width:24px; padding:0; font-size:1.25rem;">✕</button>
        </div>
        <form onsubmit="saveCheckoutAddress(event)">
            <div class="form-group">
                <label class="form-label" style="font-weight:700;">Street address</label>
                <input type="text" id="addr-street" class="form-input" required placeholder="123 Main Street" style="height:32px; border-radius:4px;">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                <div class="form-group">
                    <label class="form-label" style="font-weight:700;">City</label>
                    <input type="text" id="addr-city" class="form-input" required placeholder="New York" style="height:32px; border-radius:4px;">
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-weight:700;">State / Province / Region</label>
                    <input type="text" id="addr-state" class="form-input" required placeholder="NY" style="height:32px; border-radius:4px;">
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                <div class="form-group">
                    <label class="form-label" style="font-weight:700;">ZIP / Postal Code</label>
                    <input type="text" id="addr-postal" class="form-input" required placeholder="10001" style="height:32px; border-radius:4px;">
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-weight:700;">Country</label>
                    <input type="text" id="addr-country" class="form-input" required placeholder="United States" style="height:32px; border-radius:4px;">
                </div>
            </div>
            <div class="form-group" style="display:flex; align-items:center; gap:0.5rem; margin-top:0.5rem;">
                <input type="checkbox" id="addr-default" style="cursor:pointer;">
                <label for="addr-default" style="font-size:12.5px; cursor:pointer;">Use as my default address</label>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1.5rem;">
                <button type="button" class="btn btn-outline" onclick="closeAddressModal()" style="width:100px; height:32px; border-radius:4px;">Cancel</button>
                <button type="submit" class="btn btn-primary" style="width:120px; height:32px; border-radius:4px;">Add Address</button>
            </div>
        </form>
    `;
    modal.classList.add('active');
}

function closeAddressModal() {
    document.getElementById('address-modal').classList.remove('active');
}

async function saveCheckoutAddress(e) {
    e.preventDefault();
    const street = document.getElementById('addr-street').value;
    const city = document.getElementById('addr-city').value;
    const stateVal = document.getElementById('addr-state').value;
    const postalCode = document.getElementById('addr-postal').value;
    const country = document.getElementById('addr-country').value;
    const isDefault = document.getElementById('addr-default').checked;

    try {
        await apiCall('/users/addresses', {
            method: 'POST',
            body: { street, city, state: stateVal, postalCode, country, isDefault }
        });
        showToast("Address added successfully!", "success");
        closeAddressModal();
        renderView();
    } catch (err) {}
}

async function processCheckout() {
    const selectedAddressInput = document.querySelector('input[name="checkout-addr"]:checked');
    if (!selectedAddressInput) {
        showToast("Please select or add a shipping address.", "warning");
        return;
    }
    const shippingAddressId = selectedAddressInput.value;

    const paymentMethodInput = document.querySelector('input[name="checkout-payment"]:checked');
    const paymentMethod = paymentMethodInput.value;

    const couponCode = state.cart.couponCode;

    try {
        // Place Order
        const orderResponse = await apiCall('/orders', {
            method: 'POST',
            body: { shippingAddressId, couponCode, paymentMethod }
        });

        const order = orderResponse.data;
        showToast("Processing mock transaction...", "info");

        // Process Mock Payment
        const paymentResponse = await apiCall('/payments/process', {
            method: 'POST',
            body: { orderId: order.id, paymentMethod }
        });

        if (paymentResponse.data.status === 'SUCCESS') {
            showToast("Payment Successful! Order placed.", "success");
            state.cart = null;
            updateCartBadge();
            navigate('orders');
        } else {
            showToast("Payment process failed.", "error");
            navigate('orders');
        }
    } catch (err) {}
}

function selectCheckoutAddress(addrId, element) {
    document.querySelectorAll('.address-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    const radio = element.querySelector('input[name="checkout-addr"]');
    if (radio) {
        radio.checked = true;
    }
}

/* ========================================================
   VIEW: ORDER HISTORY
   ======================================================== */
async function renderOrdersView(container) {
    if (!state.user) {
        navigate('auth');
        return;
    }

    let orders = [];
    try {
        const data = await apiCall('/orders?size=50');
        orders = data.data.content || [];
    } catch (err) {
        container.innerHTML = `<div style="text-align:center; padding: 4rem; color:var(--danger)">Error loading order history.</div>`;
        return;
    }

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="content-box" style="text-align:center; padding:4rem;">
                <h2 style="font-family:var(--font-head); font-size:1.8rem; margin-bottom:1rem; font-weight:700;">Your Orders</h2>
                <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Looks like you haven't placed any orders yet.</p>
                <a href="#products" class="btn btn-primary" style="display:inline-flex; width:200px; border-radius:6px;">Browse Catalog</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="content-box" style="padding-top:1.5rem;">
            <h2 style="font-family:var(--font-head); border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1.5rem; font-size:1.8rem; font-weight:700;">Your Orders</h2>
            
            <div style="display:flex; flex-direction:column; gap:1.5rem;">
                ${orders.map(order => {
                    const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });
                    
                    let statusBg = 'var(--border-color)';
                    let statusColor = 'var(--text-secondary)';
                    let statusBorder = 'rgba(0,0,0,0.05)';
                    if (order.status === 'PAID') {
                        statusBg = 'var(--success-bg)';
                        statusColor = 'var(--success)';
                        statusBorder = 'rgba(16, 185, 129, 0.15)';
                    } else if (order.status === 'PENDING') {
                        statusBg = 'var(--warning-bg)';
                        statusColor = 'var(--warning)';
                        statusBorder = 'rgba(245, 158, 11, 0.15)';
                    } else if (order.status === 'FAILED') {
                        statusBg = 'var(--danger-bg)';
                        statusColor = 'var(--danger)';
                        statusBorder = 'rgba(239, 68, 68, 0.15)';
                    }

                    return `
                        <div style="border:1px solid var(--border-color); border-radius:8px; overflow:hidden; box-shadow: var(--shadow-sm); transition: var(--transition);" class="hover-lift">
                            <!-- Order Header -->
                            <div style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding:1rem 1.5rem; display:flex; justify-content:space-between; flex-wrap:wrap; font-size:13px; gap:1.5rem; align-items:center;">
                                <div style="display:flex; gap:2.5rem;">
                                    <div>
                                        <div style="color:var(--text-muted); text-transform:uppercase; font-size:10.5px; font-weight:700; margin-bottom:2px; font-family:var(--font-head);">Order Placed</div>
                                        <strong style="color:var(--text-primary); font-weight:600;">${date}</strong>
                                    </div>
                                    <div>
                                        <div style="color:var(--text-muted); text-transform:uppercase; font-size:10.5px; font-weight:700; margin-bottom:2px; font-family:var(--font-head);">Total Cost</div>
                                        <strong style="color:var(--text-primary); font-weight:700;">₹${order.totalAmount.toFixed(2)}</strong>
                                    </div>
                                    <div>
                                        <div style="color:var(--text-muted); text-transform:uppercase; font-size:10.5px; font-weight:700; margin-bottom:2px; font-family:var(--font-head);">Ship To</div>
                                        <strong style="color:var(--text-primary); font-weight:600;">${state.user.firstName} ${state.user.lastName}</strong>
                                    </div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="color:var(--text-muted); font-size:11px; margin-bottom:4px;">ID: #${order.id.substring(0,8)}...</div>
                                    <span style="font-weight:700; font-size:11.5px; border-radius:12px; padding:3px 12px; background:${statusBg}; color:${statusColor}; border:1px solid ${statusBorder}; text-transform:uppercase;">${order.status}</span>
                                </div>
                            </div>
 
                            <!-- Order Items -->
                            <div style="padding:1.25rem 1.5rem; display:flex; flex-direction:column; gap:1rem; background:white;">
                                ${order.items.map(item => `
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <div style="display:flex; align-items:center; gap:0.5rem;">
                                            <span style="font-size:14px; font-weight:600; color:var(--primary); cursor:pointer;" onclick="navigate('products')">${item.productName}</span>
                                            <span style="font-size:12px; color:var(--text-secondary); background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:500;">Qty: ${item.quantity}</span>
                                        </div>
                                        <strong style="font-size:14px; color:var(--text-primary);">₹${item.price.toFixed(2)}</strong>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

/* ========================================================
   VIEW: USER PROFILE
   ======================================================== */
async function renderProfileView(container) {
    if (!state.user) {
        navigate('auth');
        return;
    }

    let addresses = [];
    let priceWatches = [];
    try {
        const addrRes = await apiCall('/users/addresses');
        addresses = addrRes.data || [];
    } catch (err) {
        console.error(err);
    }
    try {
        const pwRes = await apiCall('/price-watch');
        priceWatches = pwRes.data || [];
    } catch (err) {
        console.error(err);
    }

    container.innerHTML = `
        <div class="cart-layout">
            <div class="content-box">
                <h2 style="font-family:var(--font-head); font-size:1.8rem; font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1.5rem;">Login & Security</h2>
                
                <!-- Loyalty Points Info Box (Premium card) -->
                <div style="background: linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%); border-radius: 12px; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; color: white; box-shadow: var(--shadow-md);">
                    <div>
                        <strong style="font-size:16px; font-family:var(--font-head); letter-spacing:-0.01em;">ShopGenius Loyalty Rewards</strong>
                        <div style="font-size:12.5px; color:rgba(255,255,255,0.85); margin-top:4px;">Earn points to unlock automated bargaining discounts!</div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end;">
                        <span style="font-size:2rem; font-weight:800; line-height: 1; font-family:var(--font-head); color: var(--secondary); text-shadow: 0 2px 4px rgba(0,0,0,0.15);">${state.user.loyaltyPoints || 0}</span>
                        <span style="font-size: 10px; font-weight:700; text-transform: uppercase; color: rgba(255,255,255,0.6); letter-spacing: 0.05em; margin-top:2px;">Points Available</span>
                    </div>
                </div>

                <form onsubmit="saveUserProfile(event)">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                        <div class="form-group">
                            <label class="form-label">First Name</label>
                            <input type="text" id="prof-firstname" class="form-input" required value="${state.user.firstName}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Last Name</label>
                            <input type="text" id="prof-lastname" class="form-input" required value="${state.user.lastName}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address (Uneditable)</label>
                        <input type="email" class="form-input" disabled value="${state.user.email}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone Number</label>
                        <input type="tel" id="prof-phone" class="form-input" value="${state.user.phoneNumber || ''}">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:160px; font-weight:700; margin-top:0.5rem; height: 42px;">Save Profile</button>
                </form>
            </div>

            <!-- Address Listing on Sidebar -->
            <div class="content-box" style="height:fit-content;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem; margin-bottom:1.25rem;">
                    <h3 style="font-family:var(--font-head); font-size:15px; font-weight:700;">Your Addresses</h3>
                    <button class="btn btn-outline" onclick="openAddressModal()" style="width:65px; height:28px; font-size:11.5px; border-radius:6px; padding:0;">+ Add</button>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:0.75rem;">
                    ${addresses.map(addr => `
                        <div style="border:1px solid var(--border-color); border-radius:8px; padding:1rem; font-size:13px; background:#fafafa; position: relative;">
                            <strong style="color:var(--text-primary); font-family:var(--font-head); font-size:13.5px;">${addr.street}</strong>
                            <div style="color:var(--text-secondary); margin-top:4px; line-height: 1.4;">${addr.city}, ${addr.state} - ${addr.postalCode}, ${addr.country}</div>
                            ${addr.isDefault ? `<span style="display:inline-block; font-size:9px; background:var(--success-bg); color:var(--success); border: 1px solid rgba(16,185,129,0.15); font-weight:700; padding:2px 6px; border-radius:10px; margin-top:0.5rem;">Default</span>` : ''}
                        </div>
                    `).join('')}
                    ${addresses.length === 0 ? `<p style="font-size:12.5px; color:var(--text-secondary); text-align:center; padding:1.5rem 0;">No addresses added.</p>` : ''}
                </div>
            </div>

            <!-- Price Watch Listing on Sidebar -->
            <div class="content-box" style="height:fit-content; margin-top:1.5rem;">
                <h3 style="font-family:var(--font-head); font-size:15px; font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem; margin-bottom:1.25rem;">Active Price Watches</h3>
                <div style="display:flex; flex-direction:column; gap:0.75rem;">
                    ${priceWatches.map(pw => `
                        <div style="border:1px solid var(--border-color); border-radius:8px; padding:0.75rem; font-size:12.5px; background:#fafafa; position: relative;">
                            <strong style="color:var(--text-primary); font-family:var(--font-head); display:block; padding-right:45px;">${pw.product.name}</strong>
                            <div style="color:var(--text-secondary); margin-top:4px;">Target Price: <strong>₹${pw.targetPrice.toFixed(2)}</strong></div>
                            <span style="position:absolute; top:8px; right:8px; font-size:11px; color:var(--danger); cursor:pointer; font-weight:600;" onclick="deletePriceWatch('${pw.id}')">Cancel</span>
                        </div>
                    `).join('')}
                    ${priceWatches.length === 0 ? `<p style="font-size:12.5px; color:var(--text-secondary); text-align:center; padding:1rem 0;">No active price watches.</p>` : ''}
                </div>
            </div>
        </div>
    `;
}

async function saveUserProfile(e) {
    e.preventDefault();
    const firstName = document.getElementById('prof-firstname').value;
    const lastName = document.getElementById('prof-lastname').value;
    const phoneNumber = document.getElementById('prof-phone').value;

    try {
        const data = await apiCall('/users/profile', {
            method: 'PUT',
            body: { firstName, lastName, phoneNumber }
        });
        state.user = data.data;
        showToast("Profile details updated!", "success");
        renderView();
    } catch (err) {}
}

/* ========================================================
   INITIALIZATION
   ======================================================== */
document.addEventListener('DOMContentLoaded', async () => {
    // Check initial hash route
    const initialRoute = window.location.hash.substring(1) || 'products';
    state.activeRoute = initialRoute;
    
    await initAuth();
    renderView();
    
    // Listen for enter key in global search bar
    document.getElementById('search-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') triggerSearch();
    });
});

// State additions
state.notifications = [];

// Toggle alerts dropdown
function toggleNotifDropdown() {
    const dropdown = document.getElementById('notif-dropdown-panel');
    if (dropdown) {
        dropdown.classList.toggle('active');
        if (dropdown.classList.contains('active')) {
            fetchNotifications();
        }
    }
}

// Global click handler to close alerts dropdown if clicking outside
document.addEventListener('click', (e) => {
    const container = document.getElementById('nav-notif-container');
    const dropdown = document.getElementById('notif-dropdown-panel');
    if (container && dropdown && !container.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// Fetch alerts from backend
async function fetchNotifications() {
    if (!state.user) return;
    try {
        const res = await apiCall('/notifications');
        state.notifications = res.data || [];
        updateNotifBadge();
        renderNotifDropdownList();
    } catch (err) {
        console.error(err);
    }
}

function updateNotifBadge() {
    const container = document.getElementById('notif-badge-container');
    const navNotif = document.getElementById('nav-notif-container');
    if (!container || !navNotif) return;

    if (state.user) {
        navNotif.style.display = 'block';
        const unreadCount = state.notifications.filter(n => !n.read).length;
        if (unreadCount > 0) {
            container.innerHTML = `<span class="cart-count" style="background:var(--danger); color:white; border-color:var(--navy-header);">${unreadCount}</span>`;
        } else {
            container.innerHTML = '';
        }
    } else {
        navNotif.style.display = 'none';
        container.innerHTML = '';
    }
}

function renderNotifDropdownList() {
    const list = document.getElementById('notif-dropdown-list');
    if (!list) return;

    if (state.notifications.length === 0) {
        list.innerHTML = `<div style="padding:1.5rem; text-align:center; color:var(--text-secondary); font-size:12px;">No new alerts</div>`;
        return;
    }

    list.innerHTML = state.notifications.map(n => {
        const timeStr = new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="notif-item ${!n.read ? 'unread' : ''}" onclick="readNotification('${n.id}')">
                <div class="notif-title">${n.title}</div>
                <div class="notif-desc">${n.message}</div>
                <div class="notif-time">${timeStr}</div>
            </div>
        `;
    }).join('');
}

async function readNotification(id) {
    try {
        await apiCall(`/notifications/${id}/read`, { method: 'PUT' });
        await fetchNotifications();
    } catch (err) {
        console.error(err);
    }
}

async function markAllNotifAsRead() {
    const unread = state.notifications.filter(n => !n.read);
    for (const n of unread) {
        try {
            await apiCall(`/notifications/${n.id}/read`, { method: 'PUT' });
        } catch (err) {}
    }
    await fetchNotifications();
    showToast("Notifications cleared.", "info");
}

async function subscribePriceAlert(productId) {
    const targetInput = document.getElementById('price-alert-target');
    const targetPrice = parseFloat(targetInput.value);
    
    if (isNaN(targetPrice) || targetPrice <= 0) {
        showToast("Please enter a valid target price.", "warning");
        return;
    }

    if (!state.user) {
        showToast("Please login to create a price watch.", "info");
        closeDetailsModal();
        navigate('auth');
        return;
    }

    try {
        await apiCall('/price-watch', {
            method: 'POST',
            body: { productId, targetPrice }
        });
        showToast("Price alert set successfully!", "success");
        targetInput.value = '';
    } catch (err) {}
}

async function deletePriceWatch(id) {
    try {
        await apiCall(`/price-watch/${id}`, { method: 'DELETE' });
        showToast("Price watch removed.", "info");
        renderView(); // Re-render profile view
    } catch (err) {}
}

/* ========================================================
   VIEW: SELLER PORTAL
   ======================================================== */
async function renderSellView(container) {
    if (!state.user) {
        // Marketing landing page for unregistered/logged-out users
        container.innerHTML = `
            <div style="max-width: 900px; margin: 2rem auto; text-align: center; padding: 3rem 1.5rem;" class="content-box">
                <h1 style="font-family: var(--font-head); font-size: 2.8rem; font-weight: 800; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem;">Sell on ShopGenius</h1>
                <p style="font-size: 1.25rem; color: var(--text-secondary); max-width: 650px; margin: 0 auto 2.5rem auto; line-height: 1.6;">
                    Unlock next-generation automated AI negotiations. List your products and let our intelligent bargainer interact with millions of buyers in real-time.
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; text-align: left;">
                    <div style="background: var(--body-bg); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🤖</div>
                        <h4 style="font-family: var(--font-head); font-weight: 700; font-size: 1.05rem; margin-bottom: 0.5rem; color: var(--text-primary);">AI Negotiation Desk</h4>
                        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">Set your cost margins and let our AI negotiate directly with customers to close sales faster.</p>
                    </div>
                    <div style="background: var(--body-bg); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
                        <h4 style="font-family: var(--font-head); font-weight: 700; font-size: 1.05rem; margin-bottom: 0.5rem; color: var(--text-primary);">Detailed Sales Analytics</h4>
                        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">Monitor your revenue, average margins, order fullfillment, and inventory health in real-time.</p>
                    </div>
                    <div style="background: var(--body-bg); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🌱</div>
                        <h4 style="font-family: var(--font-head); font-weight: 700; font-size: 1.05rem; margin-bottom: 0.5rem; color: var(--text-primary);">Eco Score Highlights</h4>
                        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">Highlight sustainable items. Products with higher Eco Scores receive premium visibility on the site.</p>
                    </div>
                </div>

                <button class="btn btn-primary" onclick="navigate('auth')" style="width: 240px; margin: 0 auto; font-size: 15px; font-weight: 700; height: 46px; border-radius: 6px;">Sign In to Start Selling</button>
            </div>
        `;
        return;
    }

    // Authenticated Seller Dashboard
    try {
        if (state.categories.length === 0) {
            const catRes = await apiCall('/categories?size=50');
            state.categories = catRes.data.content || [];
        }

        const dashRes = await apiCall('/seller/dashboard');
        const dash = dashRes.data;

        const prodRes = await apiCall('/seller/products?size=100');
        const products = prodRes.data.content || [];

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h1 style="font-family: var(--font-head); font-size: 2rem; font-weight: 800; color: var(--text-primary);">Seller Hub</h1>
                    <p style="color: var(--text-secondary); font-size: 13.5px; margin-top: 4px;">Welcome back, ${state.user.firstName}! Track your listings, view performance and process sales.</p>
                </div>
                <button class="btn btn-primary" onclick="openSellerProductForm()" style="width: auto; padding: 0 1.5rem; height: 40px; border-radius: 6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="margin-right: 6px;">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    List New Product
                </button>
            </div>

            <div class="cart-layout" style="grid-template-columns: 1fr 340px; gap: 2rem; display: grid;">
                <!-- Main Area -->
                <div style="display: flex; flex-direction: column; gap: 2rem;">
                    
                    <!-- Listings Table Box -->
                    <div class="content-box">
                        <h3 style="font-family: var(--font-head); font-size: 16px; font-weight: 700; margin-bottom: 1.25rem;">Active Inventory Listings (${products.length})</h3>
                        
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                                <thead>
                                    <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-secondary); font-weight: 600;">
                                        <th style="padding: 10px 8px;">Product</th>
                                        <th style="padding: 10px 8px;">SKU</th>
                                        <th style="padding: 10px 8px;">Price</th>
                                        <th style="padding: 10px 8px;">Stock</th>
                                        <th style="padding: 10px 8px; text-align: center;">Eco Rating</th>
                                        <th style="padding: 10px 8px; text-align: right;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${products.map(p => `
                                        <tr style="border-bottom: 1px solid var(--border-color); transition: var(--transition);" class="hover-row">
                                            <td style="padding: 12px 8px; display: flex; align-items: center; gap: 0.75rem;">
                                                <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}" style="width: 38px; height: 38px; object-fit: contain; border-radius: 4px; border: 1px solid var(--border-color); background: #fafafa;">
                                                <div style="font-weight: 600; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 180px;">${p.name}</div>
                                            </td>
                                            <td style="padding: 12px 8px; font-family: monospace; font-weight: bold; color: var(--text-secondary);">${p.sku}</td>
                                            <td style="padding: 12px 8px; font-weight: 700; color: var(--text-primary);">₹${p.price.toFixed(2)}</td>
                                            <td style="padding: 12px 8px;">
                                                <span style="font-weight: 700; color: ${p.stockQuantity > 5 ? 'var(--success)' : 'var(--danger)'};">
                                                    ${p.stockQuantity}
                                                </span>
                                            </td>
                                            <td style="padding: 12px 8px; text-align: center;">
                                                <span style="background: var(--success-bg); color: var(--success); font-weight: bold; padding: 2px 8px; border-radius: 12px; font-size: 11px;">🌱 ${p.ecoScore || 50}</span>
                                            </td>
                                            <td style="padding: 12px 8px; text-align: right;">
                                                <button class="btn btn-outline" onclick="openSellerProductForm('${p.id}')" style="display: inline-flex; width: auto; height: 28px; font-size: 11px; padding: 0 8px; border-radius: 4px; margin-right: 4px;">Edit</button>
                                                <button class="btn btn-outline" onclick="deleteSellerProduct('${p.id}')" style="display: inline-flex; width: auto; height: 28px; font-size: 11px; padding: 0 8px; border-radius: 4px; border-color: rgba(239,68,68,0.2); color: var(--danger);">Delete</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                    ${products.length === 0 ? `
                                        <tr>
                                            <td colspan="6" style="padding: 2.5rem; text-align: center; color: var(--text-secondary);">
                                                No listings active yet. Click "+ List New Product" to list your first item!
                                            </td>
                                        </tr>
                                    ` : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Recent Sales Box -->
                    <div class="content-box">
                        <h3 style="font-family: var(--font-head); font-size: 16px; font-weight: 700; margin-bottom: 1.25rem;">Recent Sales & Customer Orders</h3>
                        
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                                <thead>
                                    <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-secondary); font-weight: 600;">
                                        <th style="padding: 10px 8px;">Order ID</th>
                                        <th style="padding: 10px 8px;">Product</th>
                                        <th style="padding: 10px 8px;">Quantity</th>
                                        <th style="padding: 10px 8px;">Total</th>
                                        <th style="padding: 10px 8px;">Buyer</th>
                                        <th style="padding: 10px 8px;">Date</th>
                                        <th style="padding: 10px 8px; text-align: right;">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${dash.recentSales.map(s => {
                                        const dateStr = new Date(s.orderDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                                        let statusColor = 'var(--text-secondary)';
                                        if (s.status === 'PAID' || s.status === 'DELIVERED' || s.status === 'SHIPPED') statusColor = 'var(--success)';
                                        if (s.status === 'PENDING') statusColor = 'var(--warning)';
                                        if (s.status === 'CANCELLED') statusColor = 'var(--danger)';

                                        return `
                                            <tr style="border-bottom: 1px solid var(--border-color); transition: var(--transition);" class="hover-row">
                                                <td style="padding: 12px 8px; font-family: monospace; font-size: 12px; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 80px;">${s.orderId}</td>
                                                <td style="padding: 12px 8px; font-weight: 600; color: var(--text-primary);">${s.productName}</td>
                                                <td style="padding: 12px 8px; text-align: center; font-weight: 600;">${s.quantity}</td>
                                                <td style="padding: 12px 8px; font-weight: 700; color: var(--text-primary);">₹${(s.price * s.quantity).toFixed(2)}</td>
                                                <td style="padding: 12px 8px; color: var(--text-primary); font-weight: 500;">${s.buyerName}</td>
                                                <td style="padding: 12px 8px; color: var(--text-secondary);">${dateStr}</td>
                                                <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: ${statusColor}; font-size: 11px; text-transform: uppercase;">${s.status}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                    ${dash.recentSales.length === 0 ? `
                                        <tr>
                                            <td colspan="7" style="padding: 2.5rem; text-align: center; color: var(--text-secondary);">
                                                No sale activities recorded. Once buyers order your products, they will appear here.
                                            </td>
                                        </tr>
                                    ` : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Sidebar Box -->
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    
                    <!-- Stats Card -->
                    <div class="content-box" style="background: linear-gradient(135deg, var(--dark-navy) 0%, var(--navy-subnav) 100%); color: white; display: flex; flex-direction: column; gap: 1.5rem;">
                        <h4 style="font-family: var(--font-head); font-weight: 700; font-size: 14px; color: var(--secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: -0.5rem;">Business Performance</h4>
                        
                        <div style="display: flex; flex-direction: column; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem;">
                            <span style="font-size: 11px; color: var(--text-muted); font-weight: 500; text-transform: uppercase;">Gross Sales Revenue</span>
                            <span style="font-size: 2rem; font-weight: 800; font-family: var(--font-head); color: white; margin-top: 4px;">₹${dash.totalRevenue.toFixed(2)}</span>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem;">
                            <span style="font-size: 11px; color: var(--text-muted); font-weight: 500; text-transform: uppercase;">Total Items Dispatched</span>
                            <span style="font-size: 1.5rem; font-weight: 700; font-family: var(--font-head); color: white; margin-top: 4px;">${dash.totalItemsSold} items</span>
                        </div>

                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 11px; color: var(--text-muted); font-weight: 500; text-transform: uppercase;">Active Catalog Items</span>
                            <span style="font-size: 1.5rem; font-weight: 700; font-family: var(--font-head); color: white; margin-top: 4px;">${dash.totalProducts} listings</span>
                        </div>
                    </div>

                    <!-- Alerts Card -->
                    <div class="content-box">
                        <h4 style="font-family: var(--font-head); font-weight: 700; font-size: 14px; margin-bottom: 1rem; color: var(--text-primary);">Inventory Alerts</h4>
                        
                        ${dash.lowStockProducts.length > 0 ? `
                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                ${dash.lowStockProducts.map(lp => `
                                    <div style="border: 1px solid rgba(239, 68, 68, 0.15); background: var(--danger-bg); padding: 10px 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 12.5px;">
                                        <div>
                                            <strong style="color: var(--text-primary); display: block;">${lp.name}</strong>
                                            <span style="color: var(--text-secondary); font-size: 11px;">SKU: ${lp.sku}</span>
                                        </div>
                                        <div style="text-align: right;">
                                            <span style="color: var(--danger); font-weight: 800; font-size: 13px;">Stock: ${lp.stockQuantity}</span>
                                            <span style="display: block; font-size: 10px; color: var(--primary); font-weight: bold; cursor: pointer;" onclick="openSellerProductForm('${lp.id}')">Restock</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div style="border: 1px solid rgba(16, 185, 129, 0.15); background: var(--success-bg); padding: 12px; border-radius: 8px; text-align: center; color: var(--success); font-size: 13px; font-weight: 600;">
                                🌱 All listings healthy. No stock alerts.
                            </div>
                        `}
                    </div>

                </div>
            </div>
        `;

    } catch (err) {
        container.innerHTML = `<div style="text-align:center; padding: 4rem; color:var(--danger)">Error loading Seller Dashboard. Please retry.</div>`;
    }
}

// Global scope helpers for Seller Dashboard management
async function openSellerProductForm(productId = null) {
    const modal = document.getElementById('seller-product-modal');
    const content = document.getElementById('seller-product-modal-content');
    if (!modal || !content) return;

    let prod = null;
    if (productId) {
        try {
            // Find locally or query
            const res = await apiCall(`/products/${productId}`);
            prod = res.data;
        } catch (err) {
            showToast("Failed to fetch product information.", "error");
            return;
        }
    }

    const title = prod ? 'Edit Listed Product' : 'List a New Product';
    const skuAttr = prod ? 'disabled' : 'required';

    content.innerHTML = `
        <button class="close-btn" onclick="closeSellerProductForm()">✕</button>
        <h2 style="font-family: var(--font-head); font-weight: 700; font-size: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; color: var(--text-primary);">${title}</h2>
        
        <form onsubmit="handleSellerProductSubmit(event, ${prod ? `'` + prod.id + `'` : 'null'})" style="display: flex; flex-direction: column; gap: 1rem;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-weight: 700;">Product Name*</label>
                    <input type="text" id="sel-prod-name" class="form-input" required value="${prod ? prod.name : ''}" placeholder="e.g. EcoSmart Watch Pro">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-weight: 700;">Product SKU* (Unique)</label>
                    <input type="text" id="sel-prod-sku" class="form-input" ${skuAttr} value="${prod ? prod.sku : ''}" placeholder="e.g. ECO-WATCH-01">
                </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-weight: 700;">Description</label>
                <textarea id="sel-prod-desc" class="form-input" style="height: 80px; resize: none; padding-top: 8px;" placeholder="Describe your product's key features, specifications, and sustainability elements...">${prod && prod.description ? prod.description : ''}</textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-weight: 700;">Listing Price* (₹)</label>
                    <input type="number" id="sel-prod-price" class="form-input" required step="0.01" min="0.01" value="${prod ? prod.price : ''}" placeholder="15999">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-weight: 700;">Cost Price* (₹)</label>
                    <input type="number" id="sel-prod-cost" class="form-input" required step="0.01" min="0.01" value="${prod && prod.costPrice ? prod.costPrice : ''}" placeholder="10000">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-weight: 700;">Stock Quantity*</label>
                    <input type="number" id="sel-prod-stock" class="form-input" required min="0" value="${prod ? prod.stockQuantity : '10'}" placeholder="100">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-weight: 700;">Category*</label>
                    <select id="sel-prod-category" class="form-input" required style="outline: none; padding: 0 10px;">
                        <option value="">Select Category</option>
                        ${state.categories.map(c => `
                            <option value="${c.id}" ${prod && prod.categoryId === c.id ? 'selected' : ''}>${c.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-weight: 700;">Eco Score Rating (0-100)</label>
                    <input type="number" id="sel-prod-eco" class="form-input" min="0" max="100" value="${prod ? prod.ecoScore : '50'}" placeholder="e.g. 90">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Available Sizes (Comma Separated)</label>
                    <input type="text" id="sel-prod-sizes" class="form-input" value="${prod && prod.sizes ? prod.sizes : ''}" placeholder="e.g. S,M,L,XL">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Image URL</label>
                    <input type="url" id="sel-prod-image" class="form-input" value="${prod && prod.imageUrl ? prod.imageUrl : ''}" placeholder="https://images.unsplash.com/...">
                </div>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
                <button type="button" class="btn btn-outline" onclick="closeSellerProductForm()" style="width: 100px; height: 40px; border-radius: 6px;">Cancel</button>
                <button type="submit" class="btn btn-primary" style="width: 140px; height: 40px; border-radius: 6px;">Submit Listing</button>
            </div>
        </form>
    `;

    modal.classList.add('active');
}

function closeSellerProductForm() {
    const modal = document.getElementById('seller-product-modal');
    if (modal) modal.classList.remove('active');
}

async function handleSellerProductSubmit(e, productId) {
    e.preventDefault();

    const name = document.getElementById('sel-prod-name').value.trim();
    const sku = document.getElementById('sel-prod-sku')?.value?.trim() || '';
    const description = document.getElementById('sel-prod-desc').value.trim();
    const price = parseFloat(document.getElementById('sel-prod-price').value);
    const costPrice = parseFloat(document.getElementById('sel-prod-cost').value);
    const stockQuantity = parseInt(document.getElementById('sel-prod-stock').value);
    const categoryId = document.getElementById('sel-prod-category').value;
    const ecoScore = parseInt(document.getElementById('sel-prod-eco').value);
    const sizes = document.getElementById('sel-prod-sizes').value.trim();
    const imageUrl = document.getElementById('sel-prod-image').value.trim();

    if (costPrice >= price) {
        showToast("Cost price must be lower than selling price to permit negotiations.", "warning");
        return;
    }

    const payload = {
        name,
        sku,
        description,
        price,
        costPrice,
        stockQuantity,
        categoryId,
        ecoScore,
        sizes,
        imageUrl
    };

    try {
        if (productId) {
            // Update
            await apiCall(`/seller/products/${productId}`, {
                method: 'PUT',
                body: payload
            });
            showToast("Product listing updated successfully!", "success");
        } else {
            // Create
            await apiCall('/seller/products', {
                method: 'POST',
                body: payload
            });
            showToast("New product listed for sale!", "success");
        }
        closeSellerProductForm();
        state.products = []; // clear cache to force catalog reload
        renderView(); // Refresh Dashboard
    } catch (err) {
        console.error(err);
    }
}

async function deleteSellerProduct(productId) {
    if (!confirm("Are you sure you want to permanently delete this listing?")) return;

    try {
        await apiCall(`/seller/products/${productId}`, {
            method: 'DELETE'
        });
        showToast("Product listing deleted successfully.", "info");
        state.products = []; // clear cache
        renderView(); // Refresh Dashboard
    } catch (err) {
        console.error(err);
    }
}

// Expose functions globally to prevent scoping issues in HTML onclicks
window.renderSellView = renderSellView;
window.openSellerProductForm = openSellerProductForm;
window.closeSellerProductForm = closeSellerProductForm;
window.handleSellerProductSubmit = handleSellerProductSubmit;
window.deleteSellerProduct = deleteSellerProduct;

