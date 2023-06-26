import User from './models/users.js';
import session from 'express-session';
import express from 'express';

const privateRouter = express.Router();

privateRouter.get('/account', async (req, res) => {

    const users = await User.find();
    res.render('private_views/account', { users });
});

privateRouter.get('/dashboard', (req, res) => {
    res.render('private_views/dashboard');
});

export default privateRouter;