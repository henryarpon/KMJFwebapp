import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import User from './models/users.js';
import Content from './models/content.js';
import bcrypt from 'bcrypt';
import publicRouter from './public_routes.js';
import privateRouter from './private_route.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import loginHandler from './controller/loginhandler.js';
import addUserHandler from './controller/addUserHandler.js';
import editUserHandler from './controller/editUserHandler.js';
import deleteUserHandler from './controller/deleteUserHandler.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Middlewares 
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

//Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, 'public/uploads'));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  // Create multer instance
  const upload = multer({ storage: storage });

//Initiate mongodb database
mongoose.connect('mongodb://localhost:27017/KMJFDBase', {useNewUrlParser: true});
  
//pages routes
app.use('/', publicRouter);
app.use('/', privateRouter);

//post routes --located in controller directory
app.post('/login', loginHandler);
app.post('/addUser', addUserHandler);
app.post('/editUser', editUserHandler);
app.post('/deleteUser', deleteUserHandler);

app.post('/submitContent', upload.single('photo'), async (req, res) => {
    
    try {
        // Extract form data
        const { title, content } = req.body;
        // Create a new Content instance

        const newContent = new Content({
            uploaded_image: req.file.filename, // Save the file name in the database
            image_path: req.file.path,
            title,
            content,
            created_by: 'Your User ID', // Provide the user ID here
            created_at: new Date(),
            updated_at: new Date()
        });

        // Save the content to the database
        await newContent.save();
        req.flash('success', 'Content posted successfully');
        res.json({ success: true, message: 'Content posted successfully' });
    } 
    catch (error) {
        console.error('Error adding user:', err);
        req.flash('error', 'Error adding content');
        res.json({ success: false, message: 'Error adding content' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
