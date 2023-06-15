import express from 'express';

const privateRouter = express.Router();

privateRouter.get('/account', (req, res) => {
    res.render('private_views/account');
});

export default privateRouter;