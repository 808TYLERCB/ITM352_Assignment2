document.addEventListener('DOMContentLoaded', function() {
    // Parse the purchaseData from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseDataEncoded = urlParams.get('purchaseData');

    // Check if purchaseData is present
    if (purchaseDataEncoded) {
        // Decode and parse the purchase data
        const invoiceData = JSON.parse(decodeURIComponent(purchaseDataEncoded));

        // Debug: Log the invoice data
        console.log('Invoice Data:', invoiceData);

        // Populate the invoice on the page
        populateInvoice(invoiceData);
    } else {
        // If purchaseData is not present, log an error and possibly display a message to the user
        console.error('No invoice data available.');
    }
});


// Function that populates the invoice from the decoded URL
function populateInvoice(invoiceItems) {
    const invoiceBody = document.getElementById('invoice-body');
    let subtotal = 0;
    let totalQuantity = 0;

    // Clear existing invoice items
    invoiceBody.innerHTML = '';

    // Iterate over each item in the invoice data
    invoiceItems.forEach(item => {
        // Create a new row and cells with the item data
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${item.icon}" alt="${item.name}" class="product-icon" data-toggle="tooltip" data-placement="top" title="${item.description}">
                ${item.name}
            </td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${item.extendedPrice.toFixed(2)}</td>
        `;
        // Append the row to the invoice body
        invoiceBody.appendChild(row);

        // Update subtotal and total quantity
        subtotal += item.extendedPrice;
        totalQuantity += item.quantity;
    });

    // Initialize Bootstrap tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

    // Calculate sales tax and shipping
    const salesTax = subtotal * 0.04;
    let shipping = totalQuantity < 10 ? 2 : totalQuantity < 25 ? 5 : 10;

    // Calculate and display the total amount
    const totalAmount = subtotal + salesTax + shipping;
    document.getElementById('subtotal-amount').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax-amount').textContent = `$${salesTax.toFixed(2)}`;
    document.getElementById('shipping-amount').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `$${totalAmount.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', function() {
    // Your existing code to populate the invoice...
});

// Add event listener for the "Confirm Purchase" button
document.getElementById('confirm-purchase').addEventListener('click', function() {
    // Retrieve the token and purchaseData from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const purchaseDataEncoded = urlParams.get('purchaseData');

    // Send a POST request to the server to confirm the purchase
    fetch('/confirm-purchase', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            purchaseData: purchaseDataEncoded // Send the encoded purchase data
        })
    })
    .then(response => response.json())
    .then(data => {
        // Show the thank-you message
        document.getElementById('thank-you-message').textContent = data.message;
        document.getElementById('thank-you-message').style.display = 'block';

        // Redirect to the home page after 5 seconds
        setTimeout(function() {
            window.location.href = '/index.html';
        }, 5000);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Add event listener for the "Continue Shopping" button
document.getElementById('continue-shopping').addEventListener('click', function() {
    window.location.href = '/products_display.html' + window.location.search;
});


document.addEventListener('DOMContentLoaded', function() {
    // Retrieve the username and user count from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userName = urlParams.get('userName');
    const userCount = urlParams.get('userCount');

    // Update the user welcome message
    const welcomeMessageElement = document.getElementById('user-welcome-message');
    if (welcomeMessageElement) {
        welcomeMessageElement.textContent = `Welcome ${userName}! there are ${userCount} other user(s) currently shopping.`;
    }
});