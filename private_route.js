import User from './models/users.js';
import Content from './models/content.js';
import requireLogin from './auth_middleware.js';
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

privateRouter.get('/account', requireLogin, async (req, res) => {

    const users = await User.find();
    res.render('private_views/account', {
        pageTitle: 'Account Manager',
        cssPath: 'css/account.css',
        scriptPath: 'script/user_modal.js',
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

privateRouter.get('/getContents', requireLogin, async (req, res) => {
    try {
        const contents = await Content.find().sort({ created_at: -1 });
        res.json(contents);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

privateRouter.get('/content_manager', requireLogin, async (req, res) => {

    try {

        const contents = await Content.find().sort({ created_at: -1 });

        res.render('private_views/content_manager', {
            pageTitle: 'Content Manager',
            cssPath: 'css/contentmgr.css',
            scriptPath: 'script/content_manager.js',
            pageTab: 'content manager',
            contents
        });
    } 
    catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

privateRouter.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

export default privateRouter;