/* ====== DATABASE SCHEMA ====== */
/**
 * Run: sudo -u postgres psql -d library_db -f db/init.sql
 */

-- Drop existing tables
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS books CASCADE;

-- Users table for authentication
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table for product catalog
CREATE TABLE books (
  book_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  description TEXT,
  image_url VARCHAR(255) NOT NULL
);

INSERT INTO books (title, author, genre, price, rating, review_count, description, image_url) VALUES
('1984', 'George Orwell', 'fiction', 15.99, 4.8, 12543, 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.', '1984.jpg'),
('Brave New World', 'Aldous Huxley', 'scifi', 14.99, 4.6, 8932, 'A dystopian novel set in a futuristic World State of genetically modified citizens and intelligence-based social hierarchy.', 'bnw.jpg'),
('The Catcher in the Rye', 'J.D. Salinger', 'fiction', 13.99, 4.4, 9821, 'A story about teenage rebellion and angst, following Holden Caulfield through New York City.', 'citr.jpg'),
('Dune', 'Frank Herbert', 'scifi', 18.99, 4.9, 15234, 'A science fiction epic about politics, religion, and ecology on the desert planet Arrakis.', 'dune.jpg'),
('Fahrenheit 451', 'Ray Bradbury', 'scifi', 14.99, 4.7, 10456, 'A dystopian novel about a future American society where books are outlawed and "firemen" burn any that are found.', 'f451.jpg'),
('The Fellowship of the Ring', 'J.R.R. Tolkien', 'fantasy', 19.99, 4.9, 18765, 'The first volume of The Lord of the Rings, following Frodo Baggins as he begins his quest to destroy the One Ring.', 'fotr.jpg'),
('The Hobbit', 'J.R.R. Tolkien', 'fantasy', 16.99, 4.8, 16234, 'A fantasy adventure about Bilbo Baggins, a hobbit who joins a quest to reclaim a treasure guarded by the dragon Smaug.', 'hobbit.jpg'),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'fantasy', 17.99, 4.9, 21543, 'The first novel in the Harry Potter series, introducing the young wizard and his magical adventures at Hogwarts.', 'hp.jpg'),
('Moby Dick', 'Herman Melville', 'fiction', 16.99, 4.3, 7654, 'An epic tale of obsession, following Captain Ahab''s quest for revenge against the white whale.', 'moby.jpg'),
('Pride and Prejudice', 'Jane Austen', 'romance', 12.99, 4.7, 13456, 'A romantic novel of manners following Elizabeth Bennet as she deals with issues of morality, education, and marriage.', 'pap.jpg'),
('The Great Gatsby', 'F. Scott Fitzgerald', 'fiction', 13.99, 4.6, 11234, 'A tragic story of Jay Gatsby and his pursuit of the American Dream in the Jazz Age.', 'tgg.jpg'),
('To Kill a Mockingbird', 'Harper Lee', 'fiction', 14.99, 4.8, 14567, 'A gripping tale of racial injustice and childhood innocence in the American South during the 1930s.', 'tkam.jpg');

-- test user 
INSERT INTO users (username, email, password_hash) VALUES
('testuser', 'test@library.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijkl');

-- Grant permissions (if needed)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;