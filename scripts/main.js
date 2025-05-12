// Check if user is logged in and update UI
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadFeaturedBooks();
    setupGenreButtons();
    setupSearch();
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

async function loadFeaturedBooks() {
    try {
        const response = await fetch('data/books.json');
        const books = await response.json();
        
        // Get 4 random featured books
        const featuredBooks = [...books].sort(() => 0.5 - Math.random()).slice(0, 4);
        const featuredContainer = document.getElementById('featured-books');
        
        featuredBooks.forEach(book => {
            const bookElement = createBookElement(book);
            featuredContainer.appendChild(bookElement);
        });
    } catch (error) {
        console.error('Error loading featured books:', error);
    }
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
            </div>
            <span class="book-genre">${book.genre}</span>
        </div>
    `;
    
    bookElement.addEventListener('click', () => {
        window.location.href = `books.html#${book.id}`;
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

function setupGenreButtons() {
    const genreButtons = document.querySelectorAll('.genre-btn');
    
    genreButtons.forEach(button => {
        button.addEventListener('click', () => {
            const genre = button.getAttribute('data-genre');
            window.location.href = `books.html?genre=${genre}`;
        });
    });
}

function setupSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchBar = document.getElementById('search-bar');
    
    searchBtn.addEventListener('click', performSearch);
    searchBar.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function performSearch() {
    const searchTerm = document.getElementById('search-bar').value.trim();
    if (searchTerm) {
        localStorage.setItem('searchTerm', searchTerm);
        window.location.href = 'books.html';
    }
}