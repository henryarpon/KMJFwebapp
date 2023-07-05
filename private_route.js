import User from './models/users.js';
import session from 'express-session';
import express from 'express';

const privateRouter = express.Router();

privateRouter.get('/getUsers', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } 
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

privateRouter.get('/account', async (req, res) => {

    const users = await User.find();
    res.render('private_views/account', {
        pageTitle: 'Account Manager',
        cssPath: 'css/account.css',
        scriptPath: 'script/user_modal.js',
        users
    });
});

privateRouter.get('/dashboard', (req, res) => {
    res.render('private_views/dashboard', {
        pageTitle: 'Dashboard',
        cssPath: 'css/dashboard.css',
        scriptPath: 'script/dashboard.js'
    });
});

privateRouter.get('/content_manager', (req, res) => {
    res.render('private_views/content_manager', {
        pageTitle: 'Content Manager',
        cssPath: 'css/contentmgr.css',
        scriptPath: 'script/content_manager.js'
    });
});

export default privateRouter;