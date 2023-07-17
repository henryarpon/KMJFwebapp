import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import User from './models/users.js';
import Content from './models/content.js';
import bcrypt from 'bcrypt';
import publicRouter from './publicRoute.js';
import privateRouter from './privateRoute.js';
import mongoose from 'mongoose';
import login from './controller/login.js';
import addUser from './controller/addUser.js';
import editUser from './controller/editUser.js';
import deleteUser from './controller/deleteUser.js';
import submitContent from './controller/submitContent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Middlewares 
const app = express();
const port = 3000;

app.use(flash());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
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

//post routes --located in controller directory
app.post('/login', login);
app.post('/addUser', addUser);
app.post('/editUser', editUser);
app.post('/deleteUser', deleteUser);
app.post('/submitContent', submitContent);

app.post('/deleteContent', async (req, res) => {
    try {
        const { contentId } = req.body;

        // Find and delete the content document by ID
        await Content.findByIdAndDelete(contentId);

        // Redirect the user back to the content manager page
        res.redirect('back');
    } 
    catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
