import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import User from './models/users.js';
import Content from './models/content.js';
import Inventory from './models/inventory.js';
import bcrypt from 'bcrypt';
import publicRouter from './publicRoute.js';
import privateRouter from './privateRoute.js';
import mongoose from 'mongoose';
import login from './controller/login.js';
import addUser from './controller/addUser.js';
import editUser from './controller/editUser.js';
import deleteUser from './controller/deleteUser.js';
import submitContent from './controller/submitContent.js';
import deleteContent from './controller/deleteContent.js';
import editContent from './controller/editContent.js';
import addInventory from './controller/addInventory.js';
import editInventoryItem from './controller/editInventory.js';
import deleteInventoryItem from './controller/deleteInventory.js';
import requireAdmin from "./authorizationMiddleware.js";

//********************************************************************************
//Middlewares for express, flash and ejs view engines 
//********************************************************************************
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 3000;

app.use(flash());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


//********************************************************************************
//SESSION Middleware
//********************************************************************************
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


//********************************************************************************
//MongoDB initialization 
//********************************************************************************
mongoose.connect('mongodb://localhost:27017/KMJFDBase', {useNewUrlParser: true});
  
//pages routes
app.use('/', publicRouter);
app.use('/', privateRouter);


//********************************************************************************
//POST routes --located in controller directory
//********************************************************************************

//********************************************************************************
//Account Management Modules
//********************************************************************************
app.post('/login', login);
app.post('/addUser', addUser);
app.post('/editUser', editUser);
app.post('/deleteUser', deleteUser);


//********************************************************************************
//Content Management Modules
//********************************************************************************
app.post('/submitContent', submitContent);
app.post('/deleteContent', deleteContent);
app.post('/editContent', editContent);


//********************************************************************************
//Inventory Management Modules
//********************************************************************************
app.post('/addInventory', addInventory);
app.post('/editInventoryItem', editInventoryItem);
app.post('/deleteInventoryItem/:itemId', deleteInventoryItem);


//********************************************************************************
//Server Logging port
//********************************************************************************
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
