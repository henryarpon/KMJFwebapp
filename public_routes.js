import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('public_views/index');
});

router.get('/gallery', (req, res) => {
  res.render('public_views/gallery');
});

router.get('/contact', (req, res) => {
    res.render('public_views/contact');
  });

export default router;
