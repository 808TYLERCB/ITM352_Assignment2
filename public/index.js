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

document.addEventListener('DOMContentLoaded', function() {
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
});