// Get the container element from the DOM where products will be displayed
const productsContainer = document.getElementById('products-container');
        let row = createRow();
        productsContainer.appendChild(row);

        products.forEach((product, index) => {
            const card = createCard(product);
            row.appendChild(card);

            if ((index + 1) % 3 === 0 && index + 1 < products.length) {
                row = createRow();
                productsContainer.appendChild(row);
            }
        });

// Define the createRow function that creates and returns a new row element
function createRow() {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row mb-4';
    return rowDiv;
}

// Define the createCard function that creates and returns a card element for a product
function createCard(product) {
    // Create a new div element for the column layout
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4';

    // Create a new div element for the card
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';

    // Create an image element for the product and set its attributes
    const img = document.createElement('img');
    img.className = 'card-img-top';
    img.src = product.image; // Set the image source to the product's image
    img.alt = product.name; // Set the alt text to the product's name
    cardDiv.appendChild(img); // Append the image to the card

    // Create a div for the card body
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    // Create and append the title to the card body
    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = product.name;
    cardBody.appendChild(title);

    // Create and append the price to the card body
    const price = document.createElement('p');
    price.className = 'card-text';
    price.textContent = `Price: $${product.price}`;
    cardBody.appendChild(price);

    // Create and append the quantity available to the card body
    const qty = document.createElement('p');
    qty.className = 'card-text';
    qty.textContent = `Quantity Available: ${product.qty_available}`;
    cardBody.appendChild(qty);

    // Create and append the quantity sold to the card body
    const qtySold = document.createElement('p');
    qtySold.className = 'card-text';
    qtySold.textContent = `Quantity Sold: ${product.qty_sold}`;
    cardBody.appendChild(qtySold);

    // Create and append the product description to the card body
    const description = document.createElement('p');
    description.className = 'card-text';
    description.textContent = product.description;
    cardBody.appendChild(description);

    // Create a div for the purchase section with layout settings
    const purchaseDiv = document.createElement('div');
    purchaseDiv.className = 'purchase-section d-flex flex-column align-items-start justify-content-between mt-2';

    // Create and configure an input for quantity
    const quantityInput = document.createElement('input');
    quantityInput.type = 'text';
    quantityInput.name = 'quantity_' + product.name.replace(/\s+/g, '_');
    quantityInput.className = 'form-control';
    quantityInput.placeholder = 'Qty:';
    quantityInput.addEventListener('input', () => validateQuantityInput(quantityInput, product.qty_available, messageDiv));

    // Create a div for displaying messages (e.g., validation)
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message mt-2';

    // Append elements to the purchase section and card body
    purchaseDiv.appendChild(quantityInput);
    purchaseDiv.appendChild(messageDiv);
    cardBody.appendChild(purchaseDiv);

    // Construct the final product card by appending elements
    cardDiv.appendChild(cardBody);
    colDiv.appendChild(cardDiv);

    // Return the column div, which contains the complete card
    return colDiv;
}

// Function to validate the inputted quantity against various criteria
function validateQuantityInput(inputElement, maxQuantity, messageDiv) {
    // Trim the value from the input element to remove any white spaces
    const value = inputElement.value.trim();
    let errorMessage = "";

    // Check if the input is empty
    if (value === '') {
        // If the input is empty, reset border color and don't display any error message
        inputElement.style.borderColor = '';
        messageDiv.textContent = '';
        return; // Exit the function early if there's no input
    }

    // Convert the input value to a floating-point number to detect decimals
    const numericValue = parseFloat(value);

    // Validate the numeric value against various conditions
    if (isNaN(numericValue) || numericValue < 0) {
        // Set an error message if the value is not a number or negative
        errorMessage = "Quantity must be a non-negative number!";
    } else if (numericValue === 0) {
        // Set an error message if the value is zero
        errorMessage = "Please enter a quantity greater than 0.";
    } else if (!Number.isInteger(numericValue)) {
        // Set an error message if the value contains decimals
        errorMessage = "Please enter a whole number, no decimals.";
    } else if (numericValue > maxQuantity) {
        // Set an error message if the value exceeds the available stock
        errorMessage = `Quantity exceeds available stock! Only ${maxQuantity} left.`;
    }

    // Display the error message if any, and adjust the input element's style accordingly
    if (errorMessage) {
        inputElement.style.borderColor = 'red'; // Set border color to red to indicate an error
        messageDiv.textContent = errorMessage; // Display the error message
        messageDiv.style.color = 'red'; // Set the color of the message to red
    } else {
        // Reset the styles if the input is valid
        inputElement.style.borderColor = '';
        messageDiv.textContent = '';
    }
}
// Error Message from Server if Validation not Passed

// Assign a function to be executed when the window is fully loaded
window.onload = function() {
    // Call the displayErrors function to check for and display any errors
    displayErrors();
};

// Function to display errors on the webpage
function displayErrors() {
    // Create a new URLSearchParams object to parse the query string of the URL
    const urlParams = new URLSearchParams(window.location.search);

    // Get the 'errors' parameter from the query string
    const errors = urlParams.get('errors');
    
    // Check if there are any errors present
    if (errors) {
        // Parse the 'errors' parameter value as JSON to get an array of error messages
        const errorList = JSON.parse(errors);

        // Create a new div element to display the errors
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger'; // Set class for styling the error div
        errorDiv.role = 'alert'; // Set the role attribute for accessibility

        // Iterate over each error message in the error list
        errorList.forEach(err => {
            // Create a paragraph element for each error message
            const errP = document.createElement('p');
            errP.textContent = err; // Set the text of the paragraph to the error message
            errorDiv.appendChild(errP); // Append the paragraph to the error div
        });

        // Get the container element where the errors will be displayed
        const container = document.getElementById('products-container');
        // Prepend the error div to the container so it appears at the top
        container.prepend(errorDiv);
    }
}

