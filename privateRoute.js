import User from './models/users.js';
import Content from './models/content.js';
import requireLogin from './authMiddleware.js';
import express from 'express';


const privateRouter = express.Router();

//Get routes that fetch data from db
privateRouter.get('/getUsers', requireLogin, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } 
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

privateRouter.get('/getContents', requireLogin, async (req, res) => {
    try {
        const contents = await Content.find().sort({ created_at: -1 });
        res.json(contents);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

privateRouter.get('/getContent', requireLogin, async (req, res) => {
    try {
        const contentId = req.query.contentId; // Get the contentId from the query parameter
        const content = await Content.findOne({ _id: contentId }); // Find a single document that matches the contentId
        res.json(content);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

//logout route
privateRouter.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});


//Page routes 
privateRouter.get('/account', requireLogin, async (req, res) => {

    const users = await User.find();
    res.render('private_views/account', {
        pageTitle: 'Account Manager',
        cssPath: 'css/account.css',
        scriptPath: 'script/userModal.js',
        pageTab: 'account',
        users
    });
});

privateRouter.get('/dashboard', requireLogin, (req, res) => {
    res.render('private_views/dashboard', {
        pageTitle: 'Dashboard',
        cssPath: 'css/dashboard.css',
        scriptPath: 'script/dashboard.js',
        pageTab: 'dashboard',
    });
});

privateRouter.get('/contentManager', requireLogin, async (req, res) => {

    try {
        const contents = await Content.find().sort({ created_at: -1 });

        res.render('private_views/contentManager', {
            pageTitle: 'Content Manager',
            cssPath: 'css/contentmgr.css',
            scriptPath: 'script/contentManager.js',
            pageTab: 'content manager',
            contents
        });
    } 
    catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

export default privateRouter;