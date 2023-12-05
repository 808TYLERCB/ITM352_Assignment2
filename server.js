const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const path = require('path');

// Middleware for parsing application/x-www-form-urlencoded and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware to validate token
const validateToken = (req, res, next) => {
    const { token } = req.query;
    const users = getUserData();
    const user = users.find(user => user.token === token);

    if (!user) {
        res.status(403).send('Access Denied');
    } else {
        req.user = user; // Store user information for further use
        next();
    }
};

// Global array to track logged-in users
let loggedInUsers = [];

// Protect the invoice route
app.get('/invoice.html', validateToken, (req, res) => {
    // Serve the invoice page
    res.sendFile(path.join(__dirname, '/public', 'invoice.html'));
});

// Log all requests
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

// Function to get user data
const getUserData = () => {
    try {
        const jsonData = fs.readFileSync(__dirname + '/user_data.json', 'utf-8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error("Error reading from user_data.json:", error);
        return [];
    }
};

// Function to save user data
const saveUserData = (data) => {
    try {
        const stringifyData = JSON.stringify(data, null, 2);
        fs.writeFileSync(__dirname + '/user_data.json', stringifyData);
    } catch (error) {
        console.error("Error writing to user_data.json:", error);
    }
};

// Function to generate a token
const generateToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

// Function to validate user credentials with encrypted password
const validateUser = (email, password) => {
    const users = getUserData();
    const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());

    if (user) {
        // Hash the provided password with the stored salt
        const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`);
        // Compare the hash with the stored hash
        return user.password === hash;
    } else {
        return false;
    }
};

// Function to check if email is already in use
const isEmailInUse = (email) => {
    const users = getUserData();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
};

//Route for user login
app.post('/login', (req, res) => {
    const { email, password, purchaseData } = req.body;

    // Validate user credentials
    if (validateUser(email, password)) {
        const users = getUserData();
        const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
        
        // Generate and assign a new token
        user.token = generateToken();
        saveUserData(users);

        if (!loggedInUsers.includes(email.toLowerCase())) {
            loggedInUsers.push(email.toLowerCase());
        }

        // Prepare personalization info
        const personalizationInfo = {
            userName: user.name,
            userCount: loggedInUsers.length - 1 // Exclude the current user from the count
        };

        // Redirect based on presence of purchase data
        if (purchaseData) {
            // Redirect to invoice page with token, purchase data, and personalization info
            res.redirect(`/invoice.html?token=${user.token}&purchaseData=${encodeURIComponent(purchaseData)}&userName=${encodeURIComponent(personalizationInfo.userName)}&userCount=${personalizationInfo.userCount}`);
        } else {
            // Redirect to the index page with token, userName, and userCount
            res.redirect(`/index.html?token=${user.token}&userName=${encodeURIComponent(personalizationInfo.userName)}&userCount=${personalizationInfo.userCount}`);
        }
    } else {
        // Redirect back to login page with error message and sticky email field
        res.redirect(`/login.html?error=${encodeURIComponent('*Invalid Email or Password. Please try again.')}&email=${encodeURIComponent(email)}`);
    }
});

// Route for user registration
app.post('/register', async (req, res) => {
    const { email, password, name, confirmPassword, purchaseData } = req.body;
    let errors = [];

    // Check for empty fields
    if (!name.trim()) {
        errors.push('*Name is required.');
    }
    if (!email.trim()) {
        errors.push('*Email is required.');
    }
    if (!password.trim()) {
        errors.push('*Password is required.');
    }
    if (!confirmPassword.trim()) {
        errors.push('*Please confirm password.');
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        errors.push('Passwords do not match.');
    }

    // Email validation (format and uniqueness)
    if (email.trim() && !/^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/.test(email)) {
        errors.push('*Invalid email format.');
    } else if (email.trim()) {
        const emailInUse = await isEmailInUse(email);
        if (emailInUse) {
            errors.push('*Email is already in use.');
        }
    }

    // Password validation
    if (password.trim()) {
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < 10 || password.length > 16) {
            errors.push('*Password must be 10-16 characters long.');
        } else if (!hasNumber) {
            errors.push('*Password must contain at least one number.');
        } else if (!hasSpecialChar) {
            errors.push('*Password must contain at least one special character.');
        } else if (password.includes(' ')) {
            errors.push('*Password cannot include spaces.');
        }
    }

    // Full name validation
    if (name.trim() && !/^[a-zA-Z\s]{2,30}$/.test(name)) {
        errors.push('*Name must only contain letters and be 2-30 characters long.');
    }

    if (errors.length > 0) {
        res.redirect(`/register.html?errors=${encodeURIComponent(JSON.stringify(errors))}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&purchaseData=${encodeURIComponent(purchaseData)}`);
        return;
    }

    if (errors.length === 0) {
        // Encrypt the password
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);

        // Generate a token for the new user
        const token = generateToken();

        // Create new user object with hashed password and token
        const newUser = { name, email, password: hash, salt, token };
        const users = getUserData();
        users.push(newUser);
        saveUserData(users);

        if (!loggedInUsers.includes(email.toLowerCase())) {
            loggedInUsers.push(email.toLowerCase());
        }

         // Redirect to the invoice page with token, purchase data, and personalization info
         const personalizationInfo = {
            userName: name,
            userCount: loggedInUsers.length - 1 // Exclude the current user from the count
        };


        // Redirect based on the presence of purchase data
        if (purchaseData) {
            // Redirect to success page with token, purchase data, and personalization info
            res.redirect(`/registration_success.html?token=${newUser.token}&purchaseData=${encodeURIComponent(purchaseData)}&userName=${encodeURIComponent(personalizationInfo.userName)}&userCount=${personalizationInfo.userCount}`);
        } else {
            // Redirect to the index page with token, userName, and userCount
            res.redirect(`/registration_success2.html?token=${newUser.token}&userName=${encodeURIComponent(personalizationInfo.userName)}&userCount=${personalizationInfo.userCount}`);
        }
        } else {
        // Redirect back with errors and sticky data (excluding passwords)
        res.redirect(`/register.html?errors=${encodeURIComponent(JSON.stringify(errors))}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&purchaseData=${encodeURIComponent(purchaseData)}`);
        }
});

// Route for checking email uniqueness
app.get('/check-email', (req, res) => {
    const email = req.query.email;
    if (isEmailInUse(email)) {
        res.json({ isUnique: false });
    } else {
        res.json({ isUnique: true });
    }
});


app.post('/process-purchase', (req, res) => {
    let validationErrors = quantityValidation(req.body, products);
    
    // Extract token, userName, and userCount from the request body
    const { token, userName, userCount } = req.body;

    if (validationErrors.length > 0) {
        // Redirect with error messages, retaining token, userName, and userCount
        res.redirect(`/products_display.html?errors=${encodeURIComponent(JSON.stringify(validationErrors))}` + 
                     (token ? `&token=${token}` : '') + 
                     (userName ? `&userName=${encodeURIComponent(userName)}` : '') + 
                     (userCount !== undefined ? `&userCount=${userCount}` : ''));
    } else {
        // Create an array to hold the invoice items
        const invoiceItems = products.map(product => {
            const quantityKey = `quantity_${product.name.replace(/\s+/g, '_')}`;
            const quantity = parseInt(req.body[quantityKey], 10);
            if (quantity > 0) {
                // Prepare the item for the invoice
                return {
                    name: product.name,
                    quantity: quantity,
                    price: product.price,
                    extendedPrice: quantity * product.price,
                    icon: product.image,
                    description: product.description
                };
            }
            return null;
        }).filter(item => item != null);

        // Encode the invoice items array as a JSON string
        const invoiceDataEncoded = encodeURIComponent(JSON.stringify(invoiceItems));

        // Find the email associated with the token
        const users = getUserData();
        const user = users.find(u => u.token === token);

        // Check if the user's email is in the loggedInUsers array
        if (user && loggedInUsers.includes(user.email.toLowerCase())) {
            // Redirect to the invoice page with the purchase data, including token, userName, and userCount
            res.redirect(`/invoice.html?token=${token}&purchaseData=${invoiceDataEncoded}&userName=${encodeURIComponent(userName)}&userCount=${userCount}`);
        } else {
            // If the user is not logged in or token is not valid, redirect to the login page with the purchase data
            res.redirect(`/login.html?purchaseData=${invoiceDataEncoded}`);
        }
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

app.post('/confirm-purchase', (req, res) => {
    const { token, purchaseData } = req.body; // Expecting token and purchaseData in the request body

    // the token and find the user
    const users = getUserData();
    const user = users.find(user => user.token === token);

    if (user) {
        // Parse the purchaseData sent from the client
        const invoiceItems = JSON.parse(purchaseData);

        // Update the product inventory
        invoiceItems.forEach(item => {
            // Find the product in the inventory
            const productIndex = products.findIndex(p => p.name === item.name);
            if (productIndex !== -1) {
                // Update available quantity and quantity sold
                products[productIndex].qty_available -= item.quantity;
                products[productIndex].qty_sold += item.quantity;
            }
        });

        // Remove the user's token to log them out
        user.token = null;
        saveUserData(users);

        // Remove user from logged-in users array
        loggedInUsers = loggedInUsers.filter(email => email !== user.email);

        // Respond to the client with a success message
        res.json({ message: "Thank you for your purchase! You will be logged out and redirected to the home page." });
    } else {
        res.status(403).send('Access Denied');
    }
});


// Serve static files from 'public' directory
app.use(express.static(__dirname + '/public'));

// Start the server
app.listen(8080, () => console.log(`listening on port 8080`));
