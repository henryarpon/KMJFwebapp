import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
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

//route for user login
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    console.log(username);
    console.log(password);
});

app.post('/addUser', addUserHandler);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
