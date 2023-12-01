const express = require('express');
const app = express();

// Middleware for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// middleware and route handlers
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

// Import product data
const products = require(__dirname + "/products.json");
// Initialize quantity sold for each product
products.forEach(product => {
    product.qty_sold = 0;
});

// Serve product data
app.get('/products.js', function(request, response) {
    response.type('.js');
    const products_str = `let products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

// Process purchase
app.post('/process-purchase', (req, res) => {
    let validationErrors = quantityValidation(req.body, products);
    
    if (validationErrors.length > 0) {
        // Redirect with error messages
        res.redirect('/products_display.html?errors=' + encodeURIComponent(JSON.stringify(validationErrors)));
    } else {
        // Create an array to hold the invoice items
        const invoiceItems = products.map(product => {
            const quantityKey = `quantity_${product.name.replace(/\s+/g, '_')}`;
            const quantity = parseInt(req.body[quantityKey], 10);
            if (quantity > 0) {
                // Update available quantity
                product.qty_available -= quantity;
                // Update quantity sold
                product.qty_sold += quantity;

                // Return the item for the invoice
                return {
                    name: product.name,
                    quantity: quantity,
                    price: product.price,
                    extendedPrice: quantity * product.price,
                    icon: product.image, // Use the image URL from the product JSON
                    description: product.description // Use the description from the product JSON
                };
            }
            return null;
        }).filter(item => item != null); // Remove null entries where quantity was not greater than 0

        // Encode the invoice items array as a JSON string
        const invoiceQueryString = encodeURIComponent(JSON.stringify(invoiceItems));
        // Redirect to the invoice page with the invoice data as a query parameter
        res.redirect(`/invoice.html?invoiceData=${invoiceQueryString}`);
    }
});

function quantityValidation(reqBody, products) {
    let errors = [];
    let totalQuantitySelected = 0;

    // Check each product for selected quantity and validate
    products.forEach(product => {
        const quantityKey = `quantity_${product.name.replace(/\s+/g, '_')}`;
        let quantityStr = reqBody[quantityKey];

        // Check if the quantity is defined and not empty
        if (quantityStr !== undefined && quantityStr.trim() !== '') {
            let quantity = parseInt(quantityStr, 10);

            // Check if the parsed number is an integer and not NaN
            if (!isNaN(quantity) && quantity.toString() === quantityStr.trim()) {
                totalQuantitySelected += quantity;

                if (quantity < 0) {
                    errors.push(`Negative quantity for ${product.name} is not allowed.`);
                } else if (quantity > product.qty_available) {
                    errors.push(`Insufficient quantity available for ${product.name}. Only ${product.qty_available} left.`);
                }
            } else {
                // If the quantity is not an integer or is NaN
                errors.push(`Invalid quantity for ${product.name}. Please enter a positive whole number.`);
            }
        }
    });

    // Check for total quantity selected
    if (totalQuantitySelected === 0 && errors.length === 0) {
        // If no valid quantities have been entered and no other errors have been collected
        errors.push('No quantities were selected. Please select at least one product.');
    }

    return errors;
}

// Serve static files from 'public' directory
app.use(express.static(__dirname + '/public'));

// Start the server
app.listen(8080, () => console.log(`listening on port 8080`));
