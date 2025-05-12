document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadAllBooks();
    setupFilters();
});

function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authLink = document.getElementById('auth-link');
    
    if (currentUser) {
        authLink.innerHTML = `<a href="profile.html">My Profile</a>`;
    } else {
        authLink.innerHTML = `<a href="login.html">Login</a>`;
    }
}

async function loadAllBooks() {
    try {
        const response = await fetch('data/books.json');
        let books = await response.json();
        
        // Apply filters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const genreFilter = urlParams.get('genre');
        const searchTerm = localStorage.getItem('searchTerm');
        
        if (genreFilter && genreFilter !== 'all') {
            books = books.filter(book => book.genre.toLowerCase() === genreFilter.toLowerCase());
            document.getElementById('genre-filter').value = genreFilter;
        }
        
        if (searchTerm) {
            books = books.filter(book => 
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                book.author.toLowerCase().includes(searchTerm.toLowerCase())
            );
            localStorage.removeItem('searchTerm');
        }
        
        // Apply hash navigation if present
        const bookId = window.location.hash.substring(1);
        if (bookId) {
            const book = books.find(b => b.id === bookId);
            if (book) {
                showBookDetails(book);
                return;
            }
        }
        
        // Apply sorting
        const sortBy = document.getElementById('sort-by').value;
        books = sortBooks(books, sortBy);
        
        // Display books
        displayBooks(books);
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

function sortBooks(books, sortBy) {
    switch (sortBy) {
        case 'title-asc':
            return [...books].sort((a, b) => a.title.localeCompare(b.title));
        case 'title-desc':
            return [...books].sort((a, b) => b.title.localeCompare(a.title));
        case 'rating-desc':
            return [...books].sort((a, b) => b.rating - a.rating);
        case 'rating-asc':
            return [...books].sort((a, b) => a.rating - b.rating);
        default:
            return books;
    }
}

function displayBooks(books) {
    const booksContainer = document.getElementById('all-books');
    booksContainer.innerHTML = '';
    
    if (books.length === 0) {
        booksContainer.innerHTML = '<p>No books found matching your criteria.</p>';
        return;
    }
    
    books.forEach(book => {
        const bookElement = createBookElement(book);
        booksContainer.appendChild(bookElement);
    });
}

function createBookElement(book) {
    const bookElement = document.createElement('div');
    bookElement.className = 'book-card';
    bookElement.innerHTML = `
        <img src="${book.cover}" alt="${book.title}" class="book-cover">
        <div class="book-info">
            <div class="book-title">${book.title}</div>
            <div class="book-author">by ${book.author}</div>
            <div class="book-rating">
                ${getStarRating(book.rating)}
                <span>(${book.reviews ? book.reviews.length : 0})</span>
            </div>
            <span class="book-genre">${book.genre}</span>
        </div>
    `;
    
    bookElement.addEventListener('click', () => {
        showBookDetails(book);
    });
    
    return bookElement;
}

function getStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<span class="star-filled">★</span>';
        } else {
            stars += '<span class="star-empty">★</span>';
        }
    }
    return stars;
}

function showBookDetails(book) {
    const booksContainer = document.getElementById('all-books');
    booksContainer.innerHTML = `
        <div class="book-details">
            <div class="book-details-left">
                <img src="${book.cover}" alt="${book.title}" class="book-details-cover">
                <button class="back-btn" id="back-to-books">Back to All Books</button>
            </div>
            <div class="book-details-right">
                <h2>${book.title}</h2>
                <p class="book-details-author">by ${book.author}</p>
                <div class="book-details-rating">
                    ${getStarRating(book.rating)}
                    <span>${book.rating.toFixed(1)} (${book.reviews ? book.reviews.length : 0} reviews)</span>
                </div>
                <p class="book-details-genre">Genre: ${book.genre}</p>
                <p class="book-details-description">${book.description}</p>
                
                <h3>Reviews</h3>
                <div class="book-reviews" id="book-reviews">
                    ${book.reviews && book.reviews.length > 0 ? 
                        book.reviews.map(review => `
                            <div class="review">
                                <div class="review-header">
                                    <span class="review-user">${review.user}</span>
                                    <span class="review-rating">${getStarRating(review.rating)}</span>
                                </div>
                                <h4 class="review-title">${review.title}</h4>
                                <p class="review-text">${review.text}</p>
                                <p class="review-date">${review.date}</p>
                            </div>
                        `).join('') : 
                        '<p>No reviews yet. Be the first to review!</p>'}
                </div>
                
                <a href="submit-review.html?book=${book.id}" class="submit-review-btn">Submit a Review</a>
            </div>
        </div>
    `;
    
    document.getElementById('back-to-books').addEventListener('click', () => {
        window.location.hash = '';
        loadAllBooks();
    });
}

function setupFilters() {
    document.getElementById('genre-filter').addEventListener('change', function() {
        const genre = this.value;
        const url = new URL(window.location);
        
        if (genre === 'all') {
            url.searchParams.delete('genre');
        } else {
            url.searchParams.set('genre', genre);
        }
        
        window.location.href = url.toString();
    });
    
    document.getElementById('sort-by').addEventListener('change', function() {
        loadAllBooks();
    });
}



