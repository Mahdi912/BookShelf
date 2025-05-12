document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadBookSelector();
    setupRatingStars();
    setupReviewForm();
});

function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html?redirect=submit-review.html';
        return;
    }
}

async function loadBookSelector() {
    try {
        const response = await fetch('data/books.json');
        const books = await response.json();
        const bookSelect = document.getElementById('review-book');
        
        // Check if a book is preselected in URL
        const urlParams = new URLSearchParams(window.location.search);
        const preselectedBook = urlParams.get('book');
        
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} by ${book.author}`;
            
            if (book.id === preselectedBook) {
                option.selected = true;
            }
            
            bookSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

function setupRatingStars() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('review-rating');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            ratingInput.value = value;
            
            // Update star display
            stars.forEach((s, index) => {
                if (index < value) {
                    s.textContent = '★';
                    s.style.color = '#f1c40f';
                } else {
                    s.textContent = '☆';
                    s.style.color = '#bdc3c7';
                }
            });
        });
        
        star.addEventListener('mouseover', function() {
            const value = parseInt(this.getAttribute('data-value'));
            
            stars.forEach((s, index) => {
                if (index < value) {
                    s.textContent = '★';
                    s.style.color = '#f1c40f';
                }
            });
        });
        
        star.addEventListener('mouseout', function() {
            const currentRating = parseInt(ratingInput.value) || 0;
            
            stars.forEach((s, index) => {
                if (index >= currentRating) {
                    s.textContent = '☆';
                    s.style.color = '#bdc3c7';
                }
            });
        });
    });
}

function setupReviewForm() {
    const reviewForm = document.getElementById('review-form');
    const errorElement = document.getElementById('review-error');
    const successElement = document.getElementById('review-success');
    
    reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const bookId = document.getElementById('review-book').value;
        const rating = document.getElementById('review-rating').value;
        const title = document.getElementById('review-title').value;
        const text = document.getElementById('review-text').value;
        
        if (!bookId || !rating || !title || !text) {
            showError(errorElement, 'Please fill in all fields.');
            return;
        }
        
        try {
            // Get books data
            const booksResponse = await fetch('data/books.json');
            let books = await booksResponse.json();
            
            // Find the book
            const bookIndex = books.findIndex(b => b.id === bookId);
            
            if (bookIndex === -1) {
                showError(errorElement, 'Book not found.');
                return;
            }
            
            // Create new review
            const newReview = {
                id: generateId(),
                bookId,
                user: currentUser.name,
                userId: currentUser.id,
                rating: parseInt(rating),
                title,
                text,
                date: new Date().toISOString()
            };
            
            // Add review to book
            if (!books[bookIndex].reviews) {
                books[bookIndex].reviews = [];
            }
            books[bookIndex].reviews.push(newReview);
            
            // Update book rating (average)
            const reviews = books[bookIndex].reviews;
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            books[bookIndex].rating = totalRating / reviews.length;
            
            // Save updated books data
            localStorage.setItem('books', JSON.stringify(books));
            
            // Add review to user's profile
            let users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex !== -1) {
                if (!users[userIndex].reviews) {
                    users[userIndex].reviews = [];
                }
                users[userIndex].reviews.push(newReview);
                
                // Update current user data
                currentUser.reviews = users[userIndex].reviews;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Save updated users data
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Show success message
            showSuccess(successElement, 'Review submitted successfully!');
            reviewForm.reset();
            
            // Reset stars
            document.querySelectorAll('.star').forEach(star => {
                star.textContent = '☆';
                star.style.color = '#bdc3c7';
            });
            
            // Redirect to book page after delay
            setTimeout(() => {
                window.location.href = `books.html#${bookId}`;
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting review:', error);
            showError(errorElement, 'An error occurred. Please try again.');
        }
    });
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function showSuccess(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadBookSelector();
    setupRatingStars();
    setupReviewForm();
    
    // Add book selection change listener
    document.getElementById('review-book').addEventListener('change', function() {
        const bookId = this.value;
        if (bookId) {
            displayBookInfo(bookId);
        } else {
            resetBookPreview();
        }
    });
});

// Add this new function to display book info
async function displayBookInfo(bookId) {
    const bookPreview = document.getElementById('book-preview');
    bookPreview.innerHTML = '<div class="loading-spinner">Loading book info...</div>';
    
    try {
        const response = await fetch('data/books.json');
        const books = await response.json();
        const book = books.find(b => b.id === bookId);
        
        if (book) {
            bookPreview.innerHTML = `
                <div class="book-info-display">
                    <img src="${book.cover}" alt="${book.title}" class="book-info-cover">
                    <div class="book-info-text">
                        <h3 class="book-info-title">${book.title}</h3>
                        <p class="book-info-author">by ${book.author}</p>
                        <div class="book-info-rating">
                            ${getStarRating(book.rating)}
                            <span>${book.rating.toFixed(1)}</span>
                        </div>
                        <p class="book-info-genre">${book.genre}</p>
                        <p class="book-info-description">${book.description}</p>
                    </div>
                </div>
            `;
        } else {
            bookPreview.innerHTML = '<div class="error-message">Book information not available</div>';
        }
    } catch (error) {
        console.error('Error loading book info:', error);
        bookPreview.innerHTML = '<div class="error-message">Error loading book information</div>';
    }
}

// Add this function to reset the preview
function resetBookPreview() {
    document.getElementById('book-preview').innerHTML = `
        <div class="preview-placeholder">
            <i class="fas fa-book-open"></i>
            <p>Book information will appear here</p>
        </div>
    `;
}

// Update the loadBookSelector function
async function loadBookSelector() {
    try {
        const response = await fetch('data/books.json');
        const books = await response.json();
        const bookSelect = document.getElementById('review-book');
        
        // Clear existing options except the first one
        while (bookSelect.options.length > 1) {
            bookSelect.remove(1);
        }
        
        // Sort books alphabetically
        books.sort((a, b) => a.title.localeCompare(b.title));
        
        // Add books to selector
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} by ${book.author}`;
            bookSelect.appendChild(option);
        });
        
        // Check if a book is preselected in URL
        const urlParams = new URLSearchParams(window.location.search);
        const preselectedBook = urlParams.get('book');
        
        if (preselectedBook) {
            bookSelect.value = preselectedBook;
            displayBookInfo(preselectedBook);
        }
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Update the setupRatingStars function
function setupRatingStars() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('review-rating');
    const ratingText = document.querySelector('.rating-text');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            ratingInput.value = value;
            ratingText.textContent = `${value} out of 5`;
            
            // Update star display
            stars.forEach((s, index) => {
                if (index < value) {
                    s.classList.add('active');
                    s.textContent = '★';
                } else {
                    s.classList.remove('active');
                    s.textContent = '☆';
                }
            });
        });
        
        star.addEventListener('mouseover', function() {
            const value = parseInt(this.getAttribute('data-value'));
            
            stars.forEach((s, index) => {
                s.classList.toggle('hover', index < value);
                s.textContent = index < value ? '★' : '☆';
            });
        });
        
        star.addEventListener('mouseout', function() {
            const currentRating = parseInt(ratingInput.value) || 0;
            
            stars.forEach((s, index) => {
                s.classList.remove('hover');
                s.textContent = index < currentRating ? '★' : '☆';
            });
        });
    });
}



function setupReviewForm() {
    const reviewForm = document.getElementById('review-form');
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    reviewForm.appendChild(errorElement);
    
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    reviewForm.parentNode.insertBefore(successElement, reviewForm.nextSibling);

    reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous messages
        errorElement.style.display = 'none';
        successElement.style.display = 'none';
        
        // Validate form
        const bookId = document.getElementById('review-book').value;
        const rating = document.getElementById('review-rating').value;
        const title = document.getElementById('review-title').value;
        const text = document.getElementById('review-text').value;
        
        if (!bookId || !rating || !title || !text) {
            showError(errorElement, 'Please fill in all fields');
            return;
        }
        
        if (text.length < 10) {
            showError(errorElement, 'Review must be at least 10 characters');
            return;
        }
        
        try {
            // Get current user
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                showError(errorElement, 'You must be logged in to submit a review');
                return;
            }
            
            // Create review object
            const newReview = {
                id: generateId(),
                bookId,
                user: currentUser.name,
                userId: currentUser.id,
                rating: parseInt(rating),
                title,
                text,
                date: new Date().toISOString()
            };
            
            // In a real app, you would send this to a server
            // For demo, we'll update localStorage
            
            // Show loading state
            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update books data
            let books = JSON.parse(localStorage.getItem('books')) || [];
            const bookIndex = books.findIndex(b => b.id === bookId);
            
            if (bookIndex === -1) {
                throw new Error('Book not found');
            }
            
            if (!books[bookIndex].reviews) {
                books[bookIndex].reviews = [];
            }
            books[bookIndex].reviews.push(newReview);
            
            // Update rating average
            const reviews = books[bookIndex].reviews;
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            books[bookIndex].rating = totalRating / reviews.length;
            
            // Save to localStorage
            localStorage.setItem('books', JSON.stringify(books));
            
            // Update user's reviews
            let users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex !== -1) {
                if (!users[userIndex].reviews) {
                    users[userIndex].reviews = [];
                }
                users[userIndex].reviews.push(newReview);
                localStorage.setItem('users', JSON.stringify(users));
                
                // Update current user data
                currentUser.reviews = users[userIndex].reviews;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            
            // Show success message
            showSuccess(successElement, 'Review submitted successfully!');
            
            // Reset form
            reviewForm.reset();
            resetStars();
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = `books.html#${bookId}`;
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting review:', error);
            showError(errorElement, 'An error occurred. Please try again.');
        } finally {
            // Reset button state
            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

function showSuccess(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Add animation class
    element.classList.add('animate-in');
    
    // Remove animation after it completes
    setTimeout(() => {
        element.classList.remove('animate-in');
    }, 500);
}

function resetStars() {
    const stars = document.querySelectorAll('.star');
    const ratingText = document.querySelector('.rating-text');
    
    stars.forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
    });
    
    ratingText.textContent = 'Select rating';
    document.getElementById('review-rating').value = '';
}