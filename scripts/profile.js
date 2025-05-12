document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadUserProfile();
    setupTabs();
    setupLogout();
    setupShelf();
});

function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
}

function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    
    // Load user reviews
    loadUserReviews(currentUser);
    
    // Load user shelf
    loadUserShelf(currentUser);
    
    // Load recommendations
    loadRecommendations(currentUser);
}

function loadUserReviews(user) {
    const reviewsContainer = document.getElementById('user-reviews');
    
    if (!user.reviews || user.reviews.length === 0) {
        reviewsContainer.innerHTML = '<p>You have not submitted any reviews yet.</p>';
        return;
    }
    
    reviewsContainer.innerHTML = '';
    
    // Get books data to match with reviews
    fetch('data/books.json')
        .then(response => response.json())
        .then(books => {
            user.reviews.forEach(review => {
                const book = books.find(b => b.id === review.bookId);
                
                if (book) {
                    const reviewElement = document.createElement('div');
                    reviewElement.className = 'review-item';
                    reviewElement.innerHTML = `
                        <div class="review-header">
                            <span class="review-book-title">${book.title}</span>
                            <span class="review-rating">${getStarRating(review.rating)}</span>
                        </div>
                        <div class="review-date">${formatDate(review.date)}</div>
                        <h3 class="review-title">${review.title}</h3>
                        <p class="review-text">${review.text}</p>
                    `;
                    reviewsContainer.appendChild(reviewElement);
                }
            });
        })
        .catch(error => {
            console.error('Error loading books:', error);
            reviewsContainer.innerHTML = '<p>Error loading your reviews. Please try again later.</p>';
        });
}

function loadUserShelf(user) {
  const shelfContainer = document.getElementById('user-shelf');
  shelfContainer.innerHTML = '<p>Loading your shelf...</p>';
  
  const shelfCategory = document.getElementById('shelf-category').value;
  const bookIds = user.shelf[shelfCategory];
  
  if (!bookIds || bookIds.length === 0) {
    shelfContainer.innerHTML = `<p>Your ${shelfCategory.replace('-', ' ')} shelf is empty.</p>`;
    return;
  }
  
  // Get books data
  fetch('data/books.json')
    .then(response => response.json())
    .then(books => {
      const shelfBooks = books.filter(book => bookIds.includes(book.id));
      
      if (shelfBooks.length === 0) {
        shelfContainer.innerHTML = `<p>Your ${shelfCategory.replace('-', ' ')} shelf is empty.</p>`;
        return;
      }
      
      shelfContainer.innerHTML = '<div class="shelf-books-grid"></div>';
      const grid = shelfContainer.querySelector('.shelf-books-grid');
      
      shelfBooks.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'shelf-book';
        bookElement.innerHTML = `
          <img src="${book.cover}" alt="${book.title}" class="shelf-book-cover">
          <div class="shelf-book-title">${book.title}</div>
          <div class="shelf-book-author">${book.author}</div>
          <div class="shelf-status status-${shelfCategory.replace('-', '')}">
            ${shelfCategory.replace('-', ' ')}
          </div>
          <button class="remove-from-shelf" data-id="${book.id}">Remove</button>
        `;
        grid.appendChild(bookElement);
        
        // Add remove button handler
        bookElement.querySelector('.remove-from-shelf').addEventListener('click', function() {
          removeBookFromShelf(book.id, shelfCategory);
        });
      });
    })
    .catch(error => {
      console.error('Error loading shelf books:', error);
      shelfContainer.innerHTML = '<p>Error loading your shelf. Please try again later.</p>';
    });
}

// Add this new function to handle book removal
function removeBookFromShelf(bookId, shelfCategory) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  // Remove book from shelf
  currentUser.shelf[shelfCategory] = currentUser.shelf[shelfCategory].filter(id => id !== bookId);
  
  // Update user data
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
  
  // Refresh shelf display
  loadUserShelf(currentUser);
  
  // Show success message
  const successMsg = document.createElement('div');
  successMsg.className = 'success-message';
  successMsg.textContent = 'Book removed from your shelf!';
  document.querySelector('.shelf-actions').appendChild(successMsg);
  
  setTimeout(() => {
    successMsg.remove();
  }, 3000);
}

function loadRecommendations(user) {
    const recContainer = document.getElementById('user-recommendations');
    recContainer.innerHTML = '<p>Loading recommendations...</p>';
    
    // In a real app, this would be based on user preferences and reading history
    // For demo purposes, we'll just show some random books
    
    fetch('data/books.json')
        .then(response => response.json())
        .then(books => {
            // Filter out books already in user's shelf
            const allShelfBooks = [
                ...user.shelf.read,
                ...user.shelf['currently-reading'],
                ...user.shelf['want-to-read']
            ];
            
            const availableBooks = books.filter(book => !allShelfBooks.includes(book.id));
            
            // Get 3 random recommendations
            const recommendations = [...availableBooks].sort(() => 0.5 - Math.random()).slice(0, 3);
            
            if (recommendations.length === 0) {
                recContainer.innerHTML = '<p>No recommendations available at this time.</p>';
                return;
            }
            
            recContainer.innerHTML = '';
            
            recommendations.forEach(book => {
                const recElement = document.createElement('div');
                recElement.className = 'recommendation-card';
                recElement.innerHTML = `
                    <img src="${book.cover}" alt="${book.title}" class="recommendation-cover">
                    <div class="recommendation-title">${book.title}</div>
                    <div class="recommendation-author">by ${book.author}</div>
                    <div class="recommendation-reason">Popular in ${book.genre}</div>
                `;
                recContainer.appendChild(recElement);
            });
        })
        .catch(error => {
            console.error('Error loading recommendations:', error);
            recContainer.innerHTML = '<p>Error loading recommendations. Please try again later.</p>';
        });
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

function setupLogout() {
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

function setupShelf() {
    document.getElementById('shelf-category').addEventListener('change', function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        loadUserShelf(currentUser);
    });
    
    document.getElementById('add-to-shelf-btn').addEventListener('click', function() {
        // In a real app, this would open a modal to select books
        alert('In a complete implementation, this would open a book selector to add books to your shelf.');
    });
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

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Add these functions to profile.js

// Initialize shelf functionality
function setupShelf() {
  document.getElementById('shelf-category').addEventListener('change', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    loadUserShelf(currentUser);
  });

  document.getElementById('add-to-shelf-btn').addEventListener('click', openAddToShelfModal);
  
  // Modal close button
  document.querySelector('.close-modal').addEventListener('click', closeAddToShelfModal);
  
  // Confirm add button
  document.getElementById('confirm-add-to-shelf').addEventListener('click', addSelectedBooksToShelf);
}

// Open the add to shelf modal
function openAddToShelfModal() {
  const modal = document.getElementById('add-to-shelf-modal');
  modal.style.display = 'block';
  
  // Load available books
  loadBooksForShelfSelection();
}

// Close the modal
function closeAddToShelfModal() {
  document.getElementById('add-to-shelf-modal').style.display = 'none';
}

// Load books for selection
function loadBooksForShelfSelection() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const selectionContainer = document.querySelector('.book-selection');
  selectionContainer.innerHTML = '<p>Loading books...</p>';
  
  fetch('data/books.json')
    .then(response => response.json())
    .then(books => {
      // Filter out books already in any shelf
      const allShelfBooks = [
        ...currentUser.shelf.read,
        ...currentUser.shelf['currently-reading'],
        ...currentUser.shelf['want-to-read']
      ];
      
      const availableBooks = books.filter(book => !allShelfBooks.includes(book.id));
      
      if (availableBooks.length === 0) {
        selectionContainer.innerHTML = '<p>All books are already in your shelves!</p>';
        return;
      }
      
      selectionContainer.innerHTML = '';
      
      availableBooks.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-selection-item';
        bookElement.innerHTML = `
          <img src="${book.cover}" alt="${book.title}" class="book-selection-cover" data-id="${book.id}">
          <div class="book-selection-title">${book.title}</div>
          <div class="book-selection-author">${book.author}</div>
        `;
        selectionContainer.appendChild(bookElement);
        
        // Add click handler for selection
        bookElement.addEventListener('click', function() {
          this.querySelector('.book-selection-cover').classList.toggle('selected');
        });
      });
    })
    .catch(error => {
      console.error('Error loading books:', error);
      selectionContainer.innerHTML = '<p>Error loading books. Please try again.</p>';
    });
}

// Add selected books to shelf
function addSelectedBooksToShelf() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const shelfCategory = document.getElementById('shelf-category').value;
  const selectedBooks = Array.from(document.querySelectorAll('.book-selection-cover.selected'))
    .map(img => img.getAttribute('data-id'));
  
  if (selectedBooks.length === 0) {
    alert('Please select at least one book to add to your shelf.');
    return;
  }
  
  // Add books to shelf
  selectedBooks.forEach(bookId => {
    if (!currentUser.shelf[shelfCategory].includes(bookId)) {
      currentUser.shelf[shelfCategory].push(bookId);
    }
  });
  
  // Update user data
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
  
  // Close modal and refresh shelf
  closeAddToShelfModal();
  loadUserShelf(currentUser);
  
  // Show success message
  const successMsg = document.createElement('div');
  successMsg.className = 'success-message';
  successMsg.textContent = `${selectedBooks.length} book(s) added to your ${shelfCategory.replace('-', ' ')} shelf!`;
  document.querySelector('.shelf-actions').appendChild(successMsg);
  
  setTimeout(() => {
    successMsg.remove();
  }, 3000);
}


