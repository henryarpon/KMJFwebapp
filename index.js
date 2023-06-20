import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import User from './models/users.js';
import bcrypt from 'bcrypt';
import publicRouter from './public_routes.js';
import privateRouter from './private_route.js';
import mongoose from 'mongoose';
import addUserHandler from './controller/addUserHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});

//Initiate mongodb database
mongoose.connect('mongodb://localhost:27017/KMJFDBase', {useNewUrlParser: true});
  
//pages routes
app.use('/', publicRouter);
app.use('/', privateRouter);

// //route for user login
// app.post('/login', (req, res) => {
//     const username = req.body.username;
//     const password = req.body.password;

//     console.log(username);
//     console.log(password);

//     if()
// });

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            console.log('User not found');
            req.flash('error', 'Invalid username or password');
            return res.json({ success: false, message: 'User not found' });
        }

        // Compare the password using bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Store the user's ID in the session
            req.session.userId = user._id;
            // Redirect to the private page (e.g., dashboard)
            return res.redirect('/dashboard');
        } else {
            console.log('Incorrect password');
            req.flash('error', 'Invalid username or password');
            return res.json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error:', error);
        req.flash('error', 'An error occurred');
        return res.json({ success: false, message: 'An error occurred' });
    }
});

app.post('/addUser', addUserHandler);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
