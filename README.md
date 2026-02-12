# 📚 Library() - Full-Stack E-Commerce Platform

> A modern, feature-rich online bookstore built with Node.js, Express, PostgreSQL, and vanilla JavaScript. Demonstrates comprehensive full-stack development skills including secure authentication, database design, RESTful APIs, and responsive UI/UX.

**Repository**: https://github.com/yaseensl/libraryecom

---

## 🎯 Project Overview

Library() is a fully functional e-commerce web application that allows users to browse books, manage shopping carts, and complete secure checkout transactions. Built as a demonstration of modern full-stack development practices, this project showcases skills in backend architecture, database design, API development, and frontend engineering.

### Key Features

- ✅ **Secure User Authentication** - bcrypt password hashing, session-based auth
- ✅ **Shopping Cart System** - Persistent cart storage with real-time updates
- ✅ **Checkout & Orders** - Transaction-based order processing with 10% tax
- ✅ **Dynamic Content Loading** - API-driven book catalog from PostgreSQL
- ✅ **Responsive Design** - Mobile-first approach with modern gradient UI
- ✅ **RESTful API** - Well-structured endpoints following REST conventions
- ✅ **Database Integrity** - Foreign keys, constraints, and CASCADE operations
- ✅ **Security Best Practices** - SQL injection prevention, secure password storage

---

## 🛠️ Technical Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js 4.18
- **Database**: PostgreSQL 14+
- **Authentication**: bcrypt, express-session
- **Database Client**: node-postgres (pg)

### Frontend
- **Languages**: HTML5, CSS3, JavaScript (ES6+)
- **Architecture**: Vanilla JavaScript (no frameworks)
- **Design**: Custom CSS with CSS Variables, Flexbox, Grid
- **API Communication**: Fetch API with async/await

### Development Tools
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Code Editor**: VS Code
- **Database Tool**: PostgreSQL CLI / pgAdmin

---

## 📋 Core Competencies Demonstrated

### 1. Backend Development
**Skills**: RESTful API Design, MVC Architecture, Middleware, Error Handling

// Example: Secure authentication endpoint with bcrypt
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Hash password with bcrypt (10 salt rounds)
  const password_hash = await bcrypt.hash(password, 10);
  
  // Parameterized query prevents SQL injection
  const result = await pool.query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email',
    [username, email, password_hash]
  );
  
  // Create session
  req.session.user = {
    id: result.rows[0].user_id,
    username: result.rows[0].username,
    email: result.rows[0].email
  };
  
  res.status(201).json({ message: 'Registered successfully', user: result.rows[0] });
});


**Implemented Features**:
- Modular route architecture (auth, cart, checkout)
- Session management with express-session
- Error handling and logging
- Parameterized SQL queries (security)
- HTTP status code best practices

---

### 2. Database Design & Management
**Skills**: Schema Design, Normalization, Relationships, Constraints, Transactions

**Database Schema** (5 Tables):
users ──┬──< cart_items >── books
        │
        └──< orders ──< order_items >── books

**Key Design Decisions**:
- **Foreign Keys with CASCADE**: Automatic cleanup of orphaned records
- **UNIQUE Constraints**: Prevents duplicate cart entries per user
- **CHECK Constraints**: Ensures data validity (quantity > 0)
- **Historical Pricing**: `price_at_purchase` field preserves order accuracy
- **Transactions**: ACID compliance for checkout operations

-- Example: Cart table with constraints
CREATE TABLE cart_items (
  cart_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)  -- Prevents duplicate cart entries
);

---

### 3. API Development
**Skills**: RESTful Design, JSON Responses, Authentication Middleware, CRUD Operations

**Implemented Endpoints** (10+):

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Create new user account | No |
| POST | `/auth/login` | Authenticate user | No |
| POST | `/auth/logout` | End user session | Yes |
| GET | `/auth/current-user` | Get session status | No |
| GET | `/books` | Retrieve all books | No |
| GET | `/books/:id` | Get single book | No |
| GET | `/cart` | Get user's cart items | Yes |
| POST | `/cart` | Add item to cart | Yes |
| PUT | `/cart/:cartId` | Update item quantity | Yes |
| DELETE | `/cart/:cartId` | Remove cart item | Yes |
| POST | `/checkout/create-order` | Process checkout | Yes |

**API Design Highlights**:
- Consistent JSON response format
- Proper HTTP status codes (200, 201, 400, 401, 404, 500)
- RESTful resource naming
- Authentication middleware for protected routes

---

### 4. Frontend Engineering
**Skills**: DOM Manipulation, Async/Await, Event Handling, Responsive Design, UX

**Frontend Architecture**:
- **11 HTML Pages**: Homepage, products, book details, auth, cart, checkout, about, FAQ, settings, profile
- **Single Stylesheet**: ~1,200 lines of organized CSS
- **Single Script File**: ~600 lines of modular JavaScript
- **No Framework**: Demonstrates vanilla JS proficiency

// Example: Dynamic content loading with error handling
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
    bookList.innerHTML = '<p>Failed to load books. Please try again.</p>';
  }
}

**Design Features**:
- Modern gradient color scheme (purple to pink)
- Card-based layouts with hover effects
- Smooth CSS transitions and animations
- Responsive breakpoints (mobile, tablet, desktop)
- Accessible semantic HTML

---

### 5. Security Implementation
**Skills**: Authentication, Authorization, Input Validation, Secure Storage

**Security Measures Implemented**:

1. **Password Security**
   - bcrypt hashing with 10 salt rounds
   - 60-character hashes stored in database
   - No plain text password storage

2. **SQL Injection Prevention**
   - All queries use parameterized statements
   - User input never concatenated into SQL

3. **Session Security**
   - Server-side session storage
   - HttpOnly cookies (prevents XSS access)
   - Session-based authentication

4. **Payment Security**
   - Only last 4 digits of credit card stored
   - No full card numbers in database
   - PCI-DSS consideration in design

5. **Data Integrity**
   - Foreign key constraints
   - UNIQUE constraints on usernames/emails
   - CHECK constraints on quantities

---

### 6. Transaction Management
**Skills**: ACID Properties, Rollback Handling, Database Transactions

// Example: Atomic checkout transaction
router.post('/create-order', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Fetch cart items
    const cartResult = await client.query(/* ... */);
    
    // 2. Calculate totals
    const subtotal = cartResult.rows.reduce(/* ... */);
    const tax = subtotal * 0.10;
    
    // 3. Create order
    const orderResult = await client.query(/* ... */);
    
    // 4. Create order items
    for (const item of cartResult.rows) {
      await client.query(/* ... */);
    }
    
    // 5. Clear cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    
    await client.query('COMMIT');
    res.json({ message: 'Order created successfully' });
    
  } catch (error) {
    await client.query('ROLLBACK');  // Rollback on any error
    res.status(500).json({ error: 'Checkout failed' });
  } finally {
    client.release();
  }
});

**Benefits**:
- Atomicity: All-or-nothing order creation
- Consistency: Cart always matches orders
- Isolation: Concurrent checkouts don't interfere
- Durability: Committed orders survive crashes

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- PostgreSQL v14 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   git clone https://github.com/yaseensl/libraryecom.git
   cd libraryecom

2. **Install dependencies**
   npm install

3. **Set up environment variables**
   cp .env.example .env
   # Edit .env with your database credentials

   Required variables:
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=library_db
   DB_PASS=your_password
   DB_PORT=5432
   SESSION_SECRET=your_secret_key_here
   PORT=3000

4. **Create and initialize database**
   # Create database
   sudo -u postgres psql -c "CREATE DATABASE library_db;"
   
   # Initialize schema and seed data
   sudo -u postgres psql -d library_db -f db/init.sql

5. **Start the server**
   npm start
   # or
   node server.js

6. **Access the application**
   http://localhost:3000

---

## 📁 Project Structure

libraryecom/
├── public/                     # Frontend static files
│   ├── index.html             # Homepage
│   ├── products.html          # Book catalog
│   ├── book.html              # Book details
│   ├── login.html             # Login page
│   ├── register.html          # Registration
│   ├── cart.html              # Shopping cart
│   ├── checkout.html          # Checkout flow
│   ├── about.html             # About page
│   ├── faq.html               # FAQ
│   ├── settings.html          # User settings
│   ├── profile.html           # User profile
│   ├── css/
│   │   └── style.css          # Main stylesheet (~1200 lines)
│   ├── js/
│   │   └── script.js          # Frontend logic (~600 lines)
│   └── img/                   # Book cover images
│
├── routes/                     # Backend route handlers
│   ├── auth.js                # Authentication endpoints
│   ├── cart.js                # Shopping cart operations
│   └── checkout.js            # Order processing
│
├── db/                         # Database files
│   ├── pool.js                # PostgreSQL connection pool
│   └── init.sql               # Schema and seed data
│
├── server.js                   # Express server entry point
├── package.json                # Dependencies and scripts
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file

---

## 💾 Database Schema

### Tables Overview

**1. users** - User accounts
- Stores usernames, emails, hashed passwords
- UNIQUE constraints on username and email

**2. books** - Product catalog
- 12 classic books with titles, authors, prices, ratings
- Includes descriptions and cover images

**3. cart_items** - Shopping cart persistence
- Links users to books with quantities
- UNIQUE constraint prevents duplicate entries
- CASCADE DELETE when user or book is deleted

**4. orders** - Order records
- Stores shipping information and totals
- Includes subtotal, tax (10%), and total amount
- Only last 4 digits of credit card stored

**5. order_items** - Order line items
- Snapshot of cart at time of purchase
- Preserves historical pricing (`price_at_purchase`)
- CASCADE DELETE when order is deleted

### Entity Relationships

users (1) ──< (N) cart_items (N) >── (1) books
  │
  └─< (N) orders (1) ──< (N) order_items (N) >── (1) books

---

## 🎨 Features in Detail

### User Authentication
- Secure registration with bcrypt password hashing
- Login with session creation
- Logout with session destruction
- Password change functionality
- Account deletion option
- Session-based authorization for protected routes

### Shopping Cart
- Add books to cart with quantity selection
- Automatic quantity increment for duplicate items
- Update quantities (1-99)
- Remove individual items
- Real-time subtotal calculation
- Database persistence (survives page refresh)
- User-specific carts (filtered by session)

### Checkout Process
- Order summary with itemized list
- Tax calculation (10% of subtotal)
- Shipping information form (name, address, city, state, ZIP)
- Payment information (demo mode)
- Order creation with database transaction
- Automatic cart clearing after successful checkout
- Order confirmation with order ID

### Book Catalog
- Browse 12 classic books
- Individual book detail pages
- Book information: title, author, genre, price, rating, reviews
- High-quality cover images
- Dynamic loading from database
- Homepage features 6 books, products page shows all

### User Interface
- Modern gradient design (purple #6366f1 to pink #ec4899)
- Responsive layout (mobile, tablet, desktop)
- Smooth animations and transitions
- Card-based layouts with hover effects
- Interactive navigation with user profile icon
- Loading states and error handling
- Form validation and feedback

---

## 🧪 API Examples

### Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'


### Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }' \
  -c cookies.txt

### Get all books
curl http://localhost:3000/books

### Add to cart
curl -X POST http://localhost:3000/cart \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "bookId": 1,
    "quantity": 2
  }'

### View cart
curl http://localhost:3000/cart -b cookies.txt

---

## 🔒 Security Considerations

### Implemented
- ✅ bcrypt password hashing (10 salt rounds)
- ✅ Parameterized SQL queries (SQL injection prevention)
- ✅ Session-based authentication
- ✅ HttpOnly cookies
- ✅ Environment variables for sensitive data
- ✅ Last 4 digits only for credit cards
- ✅ Foreign key constraints for data integrity

### Future Enhancements
- [ ] Input sanitization with validator library
- [ ] Rate limiting for brute force protection
- [ ] CSRF token implementation
- [ ] HTTPS in production
- [ ] Password complexity requirements
- [ ] Two-factor authentication
- [ ] Security headers (helmet.js)

---

## 👥 Development Team

**Yaseen Zuberi** - Lead Full-Stack Developer & Designer
- Database architecture and schema design
- Backend API development (auth, cart, checkout)
- Shopping cart implementation
- Transaction processing
- Technical documentation

**Gavin Main** - Backend Engineer
- Backend route development
- Shopping cart business logic
- Database connection management
- Server configuration
- Testing and quality assurance

**Olivia Ruvalcaba** - Frontend Developer & Designer
- Frontend HTML/CSS development
- Responsive design implementation
- UI/UX design and branding
- JavaScript frontend logic
- Accessibility implementation

---

## 🤝 Contributing

While this is primarily a portfolio project, contributions, issues, and feature requests are welcome!

---

## 📞 Contact

**Yaseen Zuberi**
- GitHub: [@yaseensl](https://github.com/yaseensl)
- LinkedIn: [Yaseen Zuberi](https://linkedin.com/in/yaseenzuberi17)
- Email: [yaseenzuberi@gmail.com](yaseenzuberi@gmail.com)
- Portfolio: [yaseensl.github.io](yaseensl.github.io)

**Project Link**: [https://github.com/yaseensl/libraryecom](https://github.com/yaseensl/libraryecom)

---

## 🙏 Acknowledgments

- Built as part of CSC317 Web Development coursework
- Book catalog features classic literature titles
- Design inspired by modern e-commerce platforms

---

**⭐ If you found this project helpful or interesting, please consider giving it a star!**

**Last Updated**: December 2025
