document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('login-form')) {
        setupLoginForm();
    }
    
    if (document.getElementById('register-form')) {
        setupRegisterForm();
    }
    
    checkAuthStatus();
});

function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authLink = document.getElementById('auth-link');
    
    if (currentUser && authLink) {
        authLink.innerHTML = `<a href="profile.html">My Profile</a>`;
    } else if (authLink) {
        authLink.innerHTML = `<a href="login.html">Login</a>`;
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    const errorElement = document.getElementById('login-error');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Get users from localStorage
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find user with matching email
        const user = users.find(u => u.email === email);
        
        if (!user) {
            showError(errorElement, 'No account found with this email.');
            return;
        }
        
        if (user.password !== password) {
            showError(errorElement, 'Incorrect password.');
            return;
        }
        
        // Login successful
        localStorage.setItem('currentUser', JSON.stringify(user));
        showSuccess('Login successful! Redirecting...');
        
        // Redirect to profile page after a short delay
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
    });
}

function setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    const errorElement = document.getElementById('register-error');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        
        // Validate form
        if (password !== confirmPassword) {
            showError(errorElement, 'Passwords do not match.');
            return;
        }
        
        if (password.length < 6) {
            showError(errorElement, 'Password must be at least 6 characters.');
            return;
        }
        
        // Get existing users
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            showError(errorElement, 'An account with this email already exists.');
            return;
        }
        
        // Create new user
        const newUser = {
            id: generateId(),
            name,
            email,
            password,
            joined: new Date().toISOString(),
            shelf: {
                read: [],
                'currently-reading': [],
                'want-to-read': []
            },
            reviews: []
        };
        
        // Save user
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        showSuccess('Registration successful! Redirecting...');
        
        // Redirect to profile page after a short delay
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
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

function showSuccess(message) {
    const successElement = document.querySelector('.success-message') || document.getElementById('review-success');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}