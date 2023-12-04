// When the page is loaded, set up necessary values
window.onload = function() {
    // Set up purchaseData and errorMessage from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const purchaseData = urlParams.get('purchaseData');
    const errorMessage = urlParams.get('error');

    // Append purchaseData to the registration link
    const registrationLink = document.getElementById('registration-link');
    if (purchaseData) {
        registrationLink.href += `?purchaseData=${encodeURIComponent(purchaseData)}`;
        document.getElementById('purchaseData').value = purchaseData;
    }

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

