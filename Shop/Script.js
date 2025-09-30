 <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize smooth scrolling
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });

            // Initialize intersection observer for fade-in animations
            const fadeElements = document.querySelectorAll('.fade-in');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            fadeElements.forEach(el => observer.observe(el));

            // Navigation and page switching
            const pages = document.querySelectorAll('.page');
            const navLinks = document.querySelectorAll('[data-page]');
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            
            // Show specific page and hide others
            function showPage(pageId) {
                pages.forEach(page => {
                    page.classList.remove('active');
                });
                document.getElementById(pageId).classList.add('active');
                window.scrollTo(0, 0);
                
                // If it's a category page, load the appropriate products
                if (pageId === 'category-page') {
                    const category = localStorage.getItem('currentCategory');
                    if (category) {
                        document.getElementById('category-title').textContent = category.charAt(0).toUpperCase() + category.slice(1);
                        loadCategoryProducts(category);
                    }
                } else if (pageId === 'products-page') {
                    loadAllProducts();
                }
            }
            
            // Add event listeners to navigation links
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const pageId = this.getAttribute('data-page') + '-page';
                    
                    // Handle category links
                    if (pageId === 'stationery-page' || pageId === 'cosmetics-page' || 
                        pageId === 'clothing-page' || pageId === 'gifts-page') {
                        localStorage.setItem('currentCategory', this.getAttribute('data-page'));
                        showPage('category-page');
                    } else {
                        showPage(pageId);
                    }
                    
                    // Close mobile menu if open
                    mobileMenu.classList.add('hidden');
                });
            });
            
            // Mobile menu toggle
            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
            
            // Cart functionality
            const cartIcon = document.getElementById('cart-icon');
            const cartModal = document.getElementById('cart-modal');
            const closeCart = document.getElementById('close-cart');
            const cartItems = document.getElementById('cart-items');
            const cartTotal = document.getElementById('cart-total');
            const cartCount = document.getElementById('cart-count');
            const emptyCartMessage = document.getElementById('empty-cart-message');
            const addToCartButtons = document.querySelectorAll('.add-to-cart');
            
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Open cart
            cartIcon.addEventListener('click', function() {
                cartModal.classList.remove('opacity-0');
                cartModal.classList.remove('pointer-events-none');
                document.querySelector('.cart-modal').classList.remove('translate-x-full');
                document.body.style.overflow = 'hidden';
            });
            
            // Close cart
            closeCart.addEventListener('click', function() {
                cartModal.classList.add('opacity-0');
                cartModal.classList.add('pointer-events-none');
                document.querySelector('.cart-modal').classList.add('translate-x-full');
                document.body.style.overflow = 'auto';
            });
            
            // Add to cart
            addToCartButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const name = this.getAttribute('data-name');
                    const price = parseFloat(this.getAttribute('data-price'));
                    const img = this.getAttribute('data-img');
                    
                    // Check if product already in cart
                    const existingItem = cart.find(item => item.id === id);
                    
                    if (existingItem) {
                        existingItem.quantity += 1;
                    } else {
                        cart.push({
                            id,
                            name,
                            price,
                            img,
                            quantity: 1
                        });
                    }
                    
                    updateCart();
                    
                    // Visual feedback
                    cartCount.classList.add('cart-pulse');
                    setTimeout(() => {
                        cartCount.classList.remove('cart-pulse');
                    }, 500);
                });
            });
            
            // Update cart
            function updateCart() {
                // Save to localStorage
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Update cart count
                const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
                cartCount.textContent = totalItems;
                
                // Clear cart items
                cartItems.innerHTML = '';
                
                // Check if cart is empty
                if (cart.length === 0) {
                    emptyCartMessage.classList.remove('hidden');
                    cartTotal.textContent = '₹ 0.00';
                    return;
                }
                
                emptyCartMessage.classList.add('hidden');
                
                // Add items to cart
                let total = 0;
                
                cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    total += itemTotal;
                    
                    const cartItem = document.createElement('div');
                    cartItem.classList.add('flex', 'items-center', 'border-b', 'pb-4');
                    cartItem.innerHTML = `
                        <div class="w-16 h-16 overflow-hidden rounded">
                            <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover">
                        </div>
                        <div class="ml-4 flex-1">
                            <h4 class="font-semibold">${item.name}</h4>
                            <p class="text-accent font-bold">₹  ${item.price.toFixed(2)} x ${item.quantity}</p>
                        </div>
                        <button class="remove-from-cart text-gray-500 hover:text-red-500" data-id="${item.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    
                    cartItems.appendChild(cartItem);
                });
                
                // Update total
                cartTotal.textContent = `₹ ${total.toFixed(2)}`;
                
                // Add event listeners to remove buttons
                const removeButtons = document.querySelectorAll('.remove-from-cart');
                removeButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        cart = cart.filter(item => item.id !== id);
                        updateCart();
                    });
                });
            }
            
            // Load category products
            function loadCategoryProducts(category) {
                const categoryProducts = document.getElementById('category-products');
                categoryProducts.innerHTML = '<div class="col-span-full text-center py-8 mb-3 mt-2"><i class="fas fa-spinner fa-spin text-4xl text-accent"></i><p class="mt-4">Loading products...</p></div>';
                
                // Simulate loading delay
                setTimeout(() => {
                    categoryProducts.innerHTML = '';
                    
                    // In a real application, you would fetch this data from a server
                    const products = {
                        stationery: [
                            {id: 5, name: 'Premium Pen Set', price: 49.99, img: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVuJTIwc2V0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=80'},
                            {id: 6, name: 'Diary', price: 35.50, img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Ym9va3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=80'},
                            {id: 7, name: 'Desk Organizer', price: 29.99, img:'deksorg.webp'},
                            {id: 8, name: 'Notebook', price: 18.75, img: 'book.webp'},
                            {id: 9, name: 'Glue Pen – Transparent, Quick-Dry Adhesive', price: 18.75, img:'pen1.webp'},
                            {id: 10, name: '4 In 1 Effective Four-Colour Ball-Point Pen Four-In-One ', price: 18.75, img:'pen2.webp'},
                            {id: 11, name: 'Gliter Pens', price: 18.75, img:'pen3.webp'},
                            {id: 12, name: 'Elegant Fountain Pen: Black with Silver Clip ', price: 18.75, img:'pen4.webp'}

                        ],
                        cosmetics: [
                            {id: 13, name: 'Luxury Face Cream', price: 89.00, img: 'cream.webp'},
                            {id: 14, name: 'Matte Lipstick Set', price: 65.00, img: 'lipsstick.webp'},
                            {id: 15, name: 'Make-up Products', price: 120.00, img: 'makeup.jpg'},
                            {id: 16, name: 'Eyeshadow Palette', price: 75.00, img: 'eyeshadow.webp'},
                            {id: 17, name: 'Perfume', price: 75.00, img: 'perfume.webp'},
                            {id: 18, name: 'Serum', price: 75.00, img: 'serium.webp'},
                            {id: 19, name: 'Shampoo', price: 75.00, img: 'shampoo.webp'},
                        ],
                        clothing: [
                            {id: 17, name: 'Designer Blouse', price: 199.99, img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGNsb3RoaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=80'},
                            {id: 18, name: 'Elegant Dress', price: 199.99, img: 'https://imgs.search.brave.com/l6TUVt_ZfDOMDFfj-9QRlAOC0b_WzTmdULn3hHzbvPw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YTMubmV3bG9va2Fz/c2V0cy5jb20vaS9u/ZXdsb29rLzkzNTEx/NDYwOS5qcGc_c3Ry/aXA9dHJ1ZSZxbHQ9/NTA'},
                            {id: 19, name: 'Cashmere Sweater', price: 599.50, img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2xvdGhpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=80'},
                            {id: 20, name: 'Silk Scarf', price: 59.00, img: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZmFzaGlvbiUyMGNsb3Roc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=80'}
                        ],
                        gifts: [
                            {id: 21, name: 'Steel Gift Articles', price: 89.99, img: 'gift1.jpg'},
                            {id: 22, name: 'Terracotta Pots', price: 42.00, img: 'gift2.jpeg'},
                            {id: 23, name: 'Photo Frame Collection', price: 55.75, img: 'gift3.jpg'},
                            {id: 24, name: 'Custom Jewelry Box', price: 67.99, img: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHNob3BwaW5nJTIwc3RvcmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=80'}
                        ]
                    };
                    
                    if (products[category]) {
                        products[category].forEach((product, index) => {
                            const productCard = document.createElement('div');
                            productCard.classList.add('product-card', 'bg-white', 'rounded-lg', 'overflow-hidden', 'shadow-md', 'animate-fade-in');
                            productCard.style.animationDelay = `${index * 0.1}s`;
                           productCard.innerHTML = `
                                <div class="h-56 overflow-hidden">
                                    <img src="${product.img}" alt="${product.name}" class="w-full h-full object-cover">
                                </div>
                                <div class="p-4">
                                    <div class="flex justify-between items-start mb-2">
                                        <h3 class="text-lg font-semibold">${product.name}</h3>
                                        <span class="text-accent font-bold">₹ ${product.price.toFixed(2)}</span>
                                    </div>
                                    <p class="text-gray-600 text-sm mb-4">Premium quality product</p>
                                    <button class="add-to-cart w-full bg-secondary text-white py-2 rounded hover:bg-accent transition duration-300" 
                                        data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-img="${product.img}">
                                        Add to Cart
                                    </button>
                                </div>
                            `;

                            
                            categoryProducts.appendChild(productCard);
                        });
                        
                        // Add event listeners to new add to cart buttons
                        document.querySelectorAll('.add-to-cart').forEach(button => {
                            button.addEventListener('click', function() {
                                const id = this.getAttribute('data-id');
                                const name = this.getAttribute('data-name');
                                const price = parseFloat(this.getAttribute('data-price'));
                                const img = this.getAttribute('data-img');
                                
                                const existingItem = cart.find(item => item.id === id);
                                
                                if (existingItem) {
                                    existingItem.quantity += 1;
                                } else {
                                    cart.push({
                                        id,
                                        name,
                                        price,
                                        img,
                                        quantity: 1
                                    });
                                }
                                
                                updateCart();
                                
                                cartCount.classList.add('cart-pulse');
                                setTimeout(() => {
                                    cartCount.classList.remove('cart-pulse');
                                }, 500);
                            });
                        });
                    }
                }, 800); // Simulated loading delay
            }
            
            // Load all products
            function loadAllProducts() {
                const productsContainer = document.querySelector('#products-page .grid');
                productsContainer.innerHTML = '<div class="col-span-full text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-accent"></i><p class="mt-4">Loading products...</p></div>';
                
                // Simulate loading delay
                setTimeout(() => {
                    productsContainer.innerHTML = '';
                    
                    const allProducts = [
                        {id: 5, name: 'Premium Pen Set', price: 49.99, img: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVuJTIwc2V0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=80', category: 'stationery'},
                        {id: 6, name: 'Diary', price: 35.50, img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Ym9va3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=80'},
                         {id: 7, name: 'Desk Organizer', price: 29.99, img:'deksorg.webp'},
                            {id: 8, name: 'Notebook', price: 18.75, img: 'book.webp'},
                            {id: 9, name: 'Glue Pen – Transparent, Quick-Dry Adhesive', price: 18.75, img:'pen1.webp'},
                            {id: 10, name: '4 In 1 Effective Four-Colour Ball-Point Pen Four-In-One ', price: 18.75, img:'pen2.webp'},
                            {id: 11, name: 'Gliter Pens', price: 18.75, img:'pen3.webp'},
                            {id: 12, name: 'Elegant Fountain Pen: Black with Silver Clip ', price: 18.75, img:'pen4.webp'},
                             {id: 13, name: 'Luxury Face Cream', price: 89.00, img: 'cream.webp'},
                            {id: 14, name: 'Matte Lipstick Set', price: 65.00, img: 'lipsstick.webp'},
                            {id: 15, name: 'Make-up Products', price: 120.00, img: 'makeup.jpg'},
                            {id: 16, name: 'Eyeshadow Palette', price: 75.00, img: 'eyeshadow.webp'},
                            {id: 17, name: 'Perfume', price: 75.00, img: 'perfume.webp'},
                            {id: 18, name: 'Serum', price: 75.00, img: 'serium.webp'},
                            {id: 19, name: 'Shampoo', price: 75.00, img: 'shampoo.webp'},
                              {id: 17, name: 'Designer Blouse', price: 79.99, img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGNsb3RoaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=80'},
                            {id: 18, name: 'Elegant Dress', price: 129.99, img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZmFzaGlvbiUyMGNsb3RoaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=80'},
                            {id: 19, name: 'Cashmere Sweater', price: 95.50, img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2xvdGhpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=80'},
                            {id: 20, name: 'Silk Scarf', price: 45.00, img: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZmFzaGlvbiUyMGNsb3Roc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=80'},
                             {id: 21, name: 'Steel Gift Articles', price: 89.99, img: 'gift1.jpg'},
                            {id: 22, name: 'Terracotta Pots', price: 42.00, img: 'gift2.jpeg'},
                            {id: 23, name: 'Photo Frame Collection', price: 55.75, img: 'gift3.jpg'},
                            {id: 24, name: 'Custom Jewelry Box', price: 67.99, img: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHNob3BwaW5nJTIwc3RvcmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=80'},

                    ];
                    
                    allProducts.forEach((product, index) => {
                        const productCard = document.createElement('div');
                        productCard.classList.add('product-card', 'bg-white', 'rounded-lg', 'overflow-hidden', 'shadow-md', 'animate-fade-in');
                        productCard.style.animationDelay = `${index * 0.1}s`;
                        productCard.innerHTML = `
                            <div class="h-56 overflow-hidden">
                                <img src="${product.img}" alt="${product.name}" class="w-full h-full object-cover">
                            </div>
                            <div class="p-4">
                                <div class="flex justify-between items-start mb-2">
                                    <h3 class="text-lg font-semibold">${product.name}</h3>
                                        <span class="text-accent font-bold">₹ ${product.price.toFixed(2)}</span>
                                </div>
                                <p class="text-gray-600 text-sm mb-4">Premium quality product</p>
                                <button class="add-to-cart w-full bg-secondary text-white py-2 rounded hover:bg-accent transition duration-300" 
                                    data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-img="${product.img}">
                                    Add to Cart
                                </button>
                            </div>
                        `;
                        
                        productsContainer.appendChild(productCard);
                    });
                    
                    // Add event listeners to new add to cart buttons
                    document.querySelectorAll('.add-to-cart').forEach(button => {
                        button.addEventListener('click', function() {
                            const id = this.getAttribute('data-id');
                            const name = this.getAttribute('data-name');
                            const price = parseFloat(this.getAttribute('data-price'));
                            const img = this.getAttribute('data-img');
                            
                            const existingItem = cart.find(item => item.id === id);
                            
                            if (existingItem) {
                                existingItem.quantity += 1;
                            } else {
                                cart.push({
                                    id,
                                    name,
                                    price,
                                    img,
                                    quantity: 1
                                });
                            }
                            
                            updateCart();
                            
                            cartCount.classList.add('cart-pulse');
                            setTimeout(() => {
                                cartCount.classList.remove('cart-pulse');
                            }, 500);
                        });
                    });
                }, 600); // Simulated loading delay
            }
            
            // Initialize cart
            updateCart();
        });
    </script>