// fetching URL from the server
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceDataEncoded = urlParams.get('invoiceData');
    
    if (invoiceDataEncoded) {
        // Decode the URL-encoded string and parse it as JSON
        const invoiceData = JSON.parse(decodeURIComponent(invoiceDataEncoded));
        // Call the function to populate the invoice with the data
        populateInvoice(invoiceData);
    } else {
        console.error('No invoice data available.');
        // show an error message, if error in fetching data
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
