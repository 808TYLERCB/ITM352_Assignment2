// When the page is loaded, set up necessary values
window.onload = function() {
    // Set up purchaseData and errorMessage from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const errorMessage = urlParams.get('error');


    // Prefill the email field if email is present in the URL parameters
    if (email) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = decodeURIComponent(email);
        }
    }

    // Display error message if present
    const errorDiv = document.getElementById('error-message');
    if (errorMessage) {
        errorDiv.textContent = decodeURIComponent(errorMessage);
        errorDiv.style.color = 'red';
        // Highlight error fields if there is an error message
        highlightErrorFields();
    }
};

// Function to highlight error fields
function highlightErrorFields() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Highlight both fields in case of any error
    if (emailInput && passwordInput) {
        emailInput.classList.add('error-input');
        passwordInput.classList.add('error-input');
    }
}

// Reset error highlighting when the user starts typing
document.getElementById('email').addEventListener('input', function() {
    this.classList.remove('error-input');
    document.getElementById('error-message').textContent = '';
});

document.getElementById('password').addEventListener('input', function() {
    this.classList.remove('error-input');
    document.getElementById('error-message').textContent = '';
});

document.addEventListener('DOMContentLoaded', function() {
    // Get the current URL query string
    const currentQueryString = window.location.search;

    // Select all anchor links on the page
    const allLinks = document.querySelectorAll('a');

    // Append the query string to each link's href attribute
    allLinks.forEach(link => {
        // Avoid appending query string to links that already have one
        if (!link.href.includes('?')) {
            link.href += currentQueryString;
        }
    });

    // Additional code for updating the user welcome message, if needed...
});

    // Retrieve the username and user count from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('userName') && urlParams.has('userCount')) {
        const userName = urlParams.get('userName');
        const userCount = urlParams.get('userCount');

        // Update the user welcome message
        const welcomeMessageElement = document.getElementById('user-welcome-message');
        if (welcomeMessageElement) {
            welcomeMessageElement.textContent = `Welcome ${userName}! there are ${userCount} other user(s) currently shopping.`;
        }
    }

    function checkIfLoggedIn() {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userName = urlParams.get('userName');
        const userCount = urlParams.get('userCount');
    
        // Check if the necessary parameters are present
        if (token && userName && userCount !== null) {
            // User is considered logged in, display a message
            const messageDiv = document.getElementById('already-logged-in-message');
            messageDiv.textContent = `Welcome back, ${decodeURIComponent(userName)}! You are already logged in.`;
            messageDiv.style.display = 'block'; // Ensure the div is visible
    
            // Disable the login button
            const loginButtons = document.querySelectorAll('button[type="submit"].btn.btn-primary'); // Selects all submit buttons with the specified classes
            loginButtons.forEach(button => {
                button.disabled = true;
                button.style.opacity = 0.5; // Optional: change the style to indicate it's disabled
            });
        }
    }
    
    // Call the function when the document is loaded
    document.addEventListener('DOMContentLoaded', checkIfLoggedIn);

    document.getElementById('login-show-password').addEventListener('change', function() {
        const passwordInput = document.getElementById('password');
        if (this.checked) {
            passwordInput.type = 'text';
        } else {
            passwordInput.type = 'password';
        }
    });
