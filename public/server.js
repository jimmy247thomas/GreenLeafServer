// server.js

// Import necessary modules
const express = require('express'); // Express.js for creating the server
const bodyParser = require('body-parser'); // body-parser to handle request bodies
const fs = require('fs'); // File system module to work with files

const app = express();
const port = 3000; // You can choose any port number

// Middleware to parse URL-encoded and JSON request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
// This makes your HTML, CSS, and JavaScript files accessible to users
app.use(express.static('public'));

// --- Signup Endpoint ---
app.post('/signup', (req, res) => {
    // Extract email and password from the request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    // User data to be saved
    const newUser = {
        email: email,
        password: password, // In a real application, you should hash the password
        timestamp: new Date().toISOString() // Add a timestamp for when the user signed up
    };

    const usersFilePath = 'users.json';

    // Read existing users from users.json, or initialize an empty array if the file doesn't exist
    let users =;
    try {
        const usersData = fs.readFileSync(usersFilePath, 'utf8');
        users = JSON.parse(usersData);
    } catch (error) {
        // If the file doesn't exist or JSON is invalid, start with an empty array
        if (error.code !== 'ENOENT') { // ENOENT error means file not found
            console.error('Error reading users.json:', error);
            return res.status(500).send('Server error during signup.');
        }
    }

    // Add the new user to the users array
    users.push(newUser);

    // Write the updated users array back to users.json
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
        if (err) {
            console.error('Error writing to users.json:', err);
            return res.status(500).send('Could not save user data.');
        }
        // Respond to the client with a success message
        res.status(200).send('Signup successful!');
    });
});

// --- Login Endpoint ---
app.post('/login', (req, res) => {
    // Extract email and password from the request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    const usersFilePath = 'users.json';

    // Read users from users.json
    fs.readFile(usersFilePath, 'utf8', (err, usersData) => {
        if (err) {
            console.error('Error reading users.json:', err);
            return res.status(500).send('Server error during login.');
        }

        let users =;
        try {
            users = JSON.parse(usersData);
        } catch (parseError) {
            console.error('Error parsing users.json:', parseError);
            return res.status(500).send('Server error: Could not read user data.');
        }

        // Find a user that matches the provided email and password
        const user = users.find(u => u.email === email && u.password === password); // In real app, compare hashed passwords

        if (user) {
            // If user is found, login is successful
            res.status(200).send('Login successful!');
        } else {
            // If no user is found, login fails
            res.status(401).send('Invalid email or password.');
        }
    });
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
