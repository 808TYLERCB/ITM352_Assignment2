document.addEventListener('DOMContentLoaded', function() {
    // Function to display server-side validation errors (if any)
    function displayServerSideErrors() {
        const urlParams = new URLSearchParams(window.location.search);
        const errors = urlParams.get('errors') ? JSON.parse(decodeURIComponent(urlParams.get('errors'))) : [];

        // Clear previous errors
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(function(element) {
            element.textContent = ''; // Clear any previous text content
        });

 // Display new errors
errors.forEach(error => {
    if (error.toLowerCase().includes('email')) {
        showError('email', error);
    } else if (error.toLowerCase().includes('password') && !error.toLowerCase().includes('confirm password')) {
        showError('password', error);
    } else if (error.toLowerCase().includes('confirm password')) {
        showError('confirm-password', error); // Adjust ID if necessary
    } else if (error.toLowerCase().includes('name')) {
        showError('name', error);
    }
});
    }

    // Function to show error messages
    function showError(inputId, message) {
        const errorDiv = document.getElementById('error-' + inputId);
        if (errorDiv) {
            errorDiv.textContent = message;
        }
    }

    // Call the function to display errors after the page loads
    displayServerSideErrors();
});

// Function to populate input fields with sticky data
function populateStickyInputs() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    const email = urlParams.get('email');

    // If there is a name in the URL parameters, set it as the value of the name input
    if (name) {
        const nameInput = document.getElementById('name');
        if (nameInput) {
            nameInput.value = decodeURIComponent(name);
        }
    }

    // If there is an email in the URL parameters, set it as the value of the email input
    if (email) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = decodeURIComponent(email);
        }
    }
}

// Call the function to populate sticky inputs after the page loads
populateStickyInputs();

    // Set up purchaseData from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseData = urlParams.get('purchaseData');

    // Populate the hidden purchaseData field in the form
    const purchaseDataField = document.querySelector('input[name="purchaseData"]');
    if (purchaseDataField && purchaseData) {
        purchaseDataField.value = purchaseData;
    }
    

    document.getElementById('show-password').addEventListener('change', function() {
        const passwordInput = document.getElementById('password');
        if (this.checked) {
            passwordInput.type = 'text';
        } else {
            passwordInput.type = 'password';
        }
    });
    
    document.getElementById('show-confirm-password').addEventListener('change', function() {
        const confirmPasswordInput = document.getElementById('confirm-password');
        if (this.checked) {
            confirmPasswordInput.type = 'text';
        } else {
            confirmPasswordInput.type = 'password';
        }
    });
