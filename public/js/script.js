/* ====== FRONTEND JAVASCRIPT  ====== */
console.log("Script.js loaded!");

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM ready");
  
  // Setup header
  setupHeader();
  
  // Check which page we're on
  const path = window.location.pathname;
  console.log("Current page:", path);
  
  // Load books on homepage
  if (path.includes('index.html') || path === '/' || path === '') {
    loadBooks(6);
  }
  
  // Load books on products page
  if (path.includes('products.html')) {
    loadBooks();
  }

  // Book detail page
  if (path.includes('book.html')) {
    loadBookDetail();
  }
  // Cart page
  if (path.includes('cart.html')) {
    loadCart();
  }
  
  // Checkout page
  if (path.includes('checkout.html')) {
    loadCheckout();
    setupCheckoutForm();
  }

  
  // Setup registration form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    console.log("Found register form, attaching handler");
    
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log("REGISTER SUBMIT READY");
      
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      console.log("Form values:", {username, email, passwordLength: password.length});
      
      if (!username || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
      
      try {
        console.log("Sending request to /auth/register...");
        
        const response = await fetch('/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, email, password })
        });
        
        console.log("Response status:", response.status);
        
        const data = await response.json();
        console.log("Response data:", data);
        
        if (response.ok) {
          alert('Account created successfully!');
          window.location.href = 'index.html';
        } else {
          alert(data.error || 'Registration failed');
        }
      } catch (error) {
        console.error("Error:", error);
        alert('An error occurred: ' + error.message);
      }
    });
  } else {
    console.log("No register form on this page");
  }
  
  // Setup login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    console.log("Found login form, attaching handler");
    
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log("LOGIN SUBMIT FIRED!");
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      console.log("Login attempt for:", email);
      
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }
      
      try {
        console.log("Sending request to /auth/login...");
        
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        console.log("Response status:", response.status);
        
        const data = await response.json();
        console.log("Response data:", data);
        
        if (response.ok) {
          alert('Logged in successfully!');
          window.location.href = 'index.html';
        } else {
          alert(data.error || 'Login failed');
        }
      } catch (error) {
        console.error("Error:", error);
        alert('An error occurred: ' + error.message);
      }
    });
  } else {
    console.log("No login form on this page");
  }
});

// Helper functions
async function setupHeader() {
  try {
    const response = await fetch('/auth/current-user');
    const data = await response.json();
    
    const loginLink = document.getElementById('login-link');
    const logoutContainer = document.getElementById('logout-container');
    
    if (data.user) {
      // Hide login link
      if (loginLink) {
        loginLink.style.display = 'none';
        loginLink.classList.add('hidden');
      }
      
      // Create logout icon button
      if (logoutContainer) {
        logoutContainer.innerHTML = '';
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.setAttribute('data-username', data.user.username);
        logoutBtn.innerHTML = '<span class="logout-text">👤</span>';
        logoutContainer.appendChild(logoutBtn);
        
        logoutBtn.addEventListener('click', async function() {
          if (confirm('Are you sure you want to logout?')) {
            await fetch('/auth/logout', { method: 'POST' });
            window.location.href = 'index.html';
          }
        });
      }
    } else {
      // Show login link when not logged in
      if (loginLink) {
        loginLink.style.display = 'inline';
        loginLink.classList.remove('hidden');
      }
      if (logoutContainer) {
        logoutContainer.innerHTML = '';
      }
    }
  } catch (error) {
    console.error('Error setting up header:', error);
  }
}

async function loadBooks(limit) {
  const bookList = document.querySelector('.book-list');
  if (!bookList) return;
  
  try {
    const response = await fetch('/books');
    const books = await response.json();
    
    const booksToShow = limit ? books.slice(0, limit) : books;
    
    bookList.innerHTML = booksToShow.map(book => `
      <div class="item">
        <a href="book.html?id=${book.book_id}">
          <img src="img/${book.image_url}" alt="${book.title}" />
          <h3>${book.title}</h3>
          <p>by ${book.author}</p>
          <p class="book-price">$${parseFloat(book.price).toFixed(2)}</p>
        </a>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading books:', error);
  }
}

/* ====== BOOK DETAIL PAGE ====== */
async function loadBookDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');
  
  console.log("📖 Loading book detail for ID:", bookId);
  
  if (!bookId) {
    console.log("❌ No book ID in URL");
    const errorMsg = document.querySelector('#error-message, .error-message');
    if (errorMsg) {
      errorMsg.classList.remove('hidden');
      errorMsg.style.display = 'block';
    }
    const wrapper = document.querySelector('.book-wrapper');
    if (wrapper) wrapper.style.display = 'none';
    return;
  }
  
  try {
    console.log("🚀 Fetching book from /books/" + bookId);
    const response = await fetch(`/books/${bookId}`);
    
    if (!response.ok) {
      throw new Error('Book not found');
    }
    
    const book = await response.json();
    console.log("✅ Book loaded:", book);
    
    // Update page with book data
    const bookCover = document.getElementById('book-cover');
    const bookTitle = document.getElementById('book-title');
    const bookAuthor = document.getElementById('book-author');
    const bookDescription = document.getElementById('book-description');
    const bookPrice = document.getElementById('book-price');
    const bookRating = document.getElementById('book-rating');
    
    if (bookCover) {
      bookCover.src = `img/${book.image_url}`;
      bookCover.alt = book.title;
    }
    
    if (bookTitle) bookTitle.textContent = book.title;
    if (bookAuthor) bookAuthor.textContent = `by ${book.author}`;
    if (bookDescription) bookDescription.textContent = book.description || 'No description available.';
    if (bookPrice) bookPrice.textContent = `${parseFloat(book.price).toFixed(2)}`;
    
    if (bookRating && book.rating) {
      bookRating.textContent = `⭐ ${book.rating} / 5.0`;
      if (book.review_count) {
        bookRating.textContent += ` (${book.review_count} reviews)`;
      }
    }
    
    // Setup add to cart button - FIXED VERSION
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
      console.log("✅ Found add to cart button, attaching handler");
      
      // Remove any existing listeners by cloning the button
      const newBtn = addToCartBtn.cloneNode(true);
      addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);
      
      // Add new listener
      newBtn.addEventListener('click', function() {
        console.log("🔥 Add to cart button clicked! Book ID:", book.book_id);
        addToCart(book.book_id);
      });
    } else {
      console.log("⚠️ Add to cart button not found");
    }
    
    // Hide error message, show book
    const errorMsg = document.querySelector('#error-message, .error-message');
    if (errorMsg) {
      errorMsg.classList.add('hidden');
      errorMsg.style.display = 'none';
    }
    const wrapper = document.querySelector('.book-wrapper');
    if (wrapper) wrapper.style.display = 'block';
    
  } catch (error) {
    console.error('❌ Error loading book:', error);
    const errorMsg = document.querySelector('#error-message, .error-message');
    if (errorMsg) {
      errorMsg.classList.remove('hidden');
      errorMsg.style.display = 'block';
    }
    const wrapper = document.querySelector('.book-wrapper');
    if (wrapper) wrapper.style.display = 'none';
  }
}


/* ====== SHOPPING CART FUNCTIONS ====== */

// Add item to cart (called from book detail page and product cards)
async function addToCart(bookId) {
  try {
    console.log("Adding book to cart:", bookId);
    
    const response = await fetch('/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookId: parseInt(bookId), quantity: 1 })
    });

    const data = await response.json();
    console.log("Response:", data);

    if (response.ok) {
      alert('Added to cart! Go to cart to checkout.');
    } else {
      if (data.error && data.error.includes('login')) {
        alert('Please login to add items to cart');
        window.location.href = 'login.html';
      } else {
        alert(data.error || 'Failed to add to cart');
      }
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('An error occurred. Please try again.');
  }
}

// Load cart items
async function loadCart() {
  const cartContainer = document.querySelector('.cart-items-list');
  const cartSummary = document.querySelector('.cart-summary');
  
  if (!cartContainer) return;

  try {
    console.log("Loading cart...");
    
    const response = await fetch('/cart');
    
    if (!response.ok) {
      if (response.status === 401) {
        document.body.innerHTML = `
          <div class="empty-cart" style="margin: 4rem auto; max-width: 600px;">
            <h2>Please login to view your cart</h2>
            <a href="login.html" class="btn">Login</a>
          </div>
        `;
        return;
      }
      throw new Error('Failed to load cart');
    }

    const data = await response.json();
    const cartItems = data.cartItems;
    console.log("Cart loaded:", cartItems);

    if (cartItems.length === 0) {
      cartContainer.innerHTML = `
        <div class="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some books to get started!</p>
          <a href="products.html" class="btn">Browse Books</a>
        </div>
      `;
      if (cartSummary) cartSummary.style.display = 'none';
      return;
    }

    // Calculate total
    let total = 0;
    const itemsHtml = cartItems.map(item => {
      const subtotal = parseFloat(item.price) * item.quantity;
      total += subtotal;
      
      return `
        <div class="cart-item" data-cart-id="${item.cart_id}">
          <div class="cart-item-image">
            <img src="img/${item.image_url}" alt="${item.title}" />
          </div>
          <div class="cart-item-info">
            <h2 class="book-title">${item.title}</h2>
            <p class="book-author">by ${item.author}</p>
            <p class="book-price">$${parseFloat(item.price).toFixed(2)} each</p>
            <label>
              Quantity:
              <input type="number" class="quantity" value="${item.quantity}" min="1" max="99" />
            </label>
            <button class="remove-btn">Remove</button>
          </div>
        </div>
      `;
    }).join('');

    cartContainer.innerHTML = itemsHtml;

    if (cartSummary) {
      cartSummary.innerHTML = `
        <p class="cart-total">
          <strong>Total: $<span class="cart-total-value">${total.toFixed(2)}</span></strong>
        </p>
        <button class="btn checkout-btn">Proceed to Checkout</button>
      `;
    }

    setupCartEventListeners();

  } catch (error) {
    console.error('Error loading cart:', error);
    cartContainer.innerHTML = '<p>Error loading cart. Please try again.</p>';
  }
}

// Setup event listeners for cart items
function setupCartEventListeners() {
  // Quantity change
  document.querySelectorAll('.cart-item').forEach(item => {
    const cartId = item.dataset.cartId;
    const quantityInput = item.querySelector('.quantity');
    
    quantityInput.addEventListener('change', async function() {
      const newQuantity = parseInt(this.value);
      
      if (newQuantity < 1) {
        this.value = 1;
        return;
      }
      
      try {
        const response = await fetch(`/cart/${cartId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQuantity })
        });
        
        if (response.ok) {
          loadCart(); // Reload to update total
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        alert('Failed to update quantity');
      }
    });

    // Remove button
    const removeBtn = item.querySelector('.remove-btn');
    removeBtn.addEventListener('click', async function() {
      if (confirm('Remove this item from cart?')) {
        try {
          const response = await fetch(`/cart/${cartId}`, { method: 'DELETE' });
          
          if (response.ok) {
            alert('Item removed from cart');
            loadCart(); // Reload cart
          }
        } catch (error) {
          console.error('Error removing item:', error);
          alert('Failed to remove item');
        }
      }
    });
  });

  // Checkout button
  const checkoutBtn = document.querySelector('.checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      window.location.href = 'checkout.html';
    });
  }
}

/* ====== CHECKOUT PAGE ====== */
async function loadCheckout() {
  const orderItemsDiv = document.getElementById('order-items');
  const subtotalSpan = document.getElementById('subtotal');
  const taxSpan = document.getElementById('tax');
  const totalSpan = document.getElementById('total');

  if (!orderItemsDiv) return;

  try {
    const response = await fetch('/cart');
    
    if (!response.ok) {
      window.location.href = 'login.html';
      return;
    }

    const data = await response.json();
    const cartItems = data.cartItems;

    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      window.location.href = 'cart.html';
      return;
    }

    // Calculate totals
    let subtotal = 0;
    const itemsHtml = cartItems.map(item => {
      const itemTotal = parseFloat(item.price) * item.quantity;
      subtotal += itemTotal;
      
      return `
        <div class="order-item">
          <div class="order-item-info">
            <div class="order-item-title">${item.title}</div>
            <div class="order-item-quantity">Qty: ${item.quantity}</div>
          </div>
          <div class="order-item-price">$${itemTotal.toFixed(2)}</div>
        </div>
      `;
    }).join('');

    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + tax;

    orderItemsDiv.innerHTML = itemsHtml;
    subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
    taxSpan.textContent = `$${tax.toFixed(2)}`;
    totalSpan.textContent = `$${total.toFixed(2)}`;

  } catch (error) {
    console.error('Error loading checkout:', error);
    alert('Failed to load checkout');
  }
}

// Handle checkout form submission
function setupCheckoutForm() {
  const checkoutForm = document.getElementById('checkout-form');
  
  if (!checkoutForm) return;

  // Format card number with spaces
  const cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s/g, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formattedValue;
    });
  }

  // Format expiry date
  const expiryInput = document.getElementById('card-expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      e.target.value = value;
    });
  }

  checkoutForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
      shippingName: document.getElementById('shipping-name').value,
      shippingAddress: document.getElementById('shipping-address').value,
      shippingCity: document.getElementById('shipping-city').value,
      shippingState: document.getElementById('shipping-state').value,
      shippingZip: document.getElementById('shipping-zip').value,
      cardNumber: document.getElementById('card-number').value.replace(/\s/g, '')
    };

    try {
      const response = await fetch('/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Order placed successfully! 🎉\nOrder #${data.orderId}\nTotal: $${data.total}`);
        window.location.href = 'index.html';
      } else {
        alert(data.error || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout');
    }
  });
}
