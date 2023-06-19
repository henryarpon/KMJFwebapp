import express from 'express';

const privateRouter = express.Router();

privateRouter.get('/account', (req, res) => {
    res.render('private_views/account');
});

privateRouter.get('/dashboard', (req, res) => {
    res.render('private_views/dashboard');
});

export default privateRouter;