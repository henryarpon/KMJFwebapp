import express from 'express';

const publicRouter = express.Router();

publicRouter.get('/', (req, res) => {
  res.render('public_views/index');
});

publicRouter.get('/gallery', (req, res) => {
  res.render('public_views/gallery');
});

publicRouter.get('/content', (req, res) => {
  res.render('public_views/content');
});

publicRouter.get('/contact', (req, res) => {
    res.render('public_views/contact');
});

publicRouter.get('/login', (req, res) => {
  res.render('public_views/login');
});

export default publicRouter;
