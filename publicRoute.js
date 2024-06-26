import express from 'express';
import Content from './models/content.js';

const publicRouter = express.Router();

// publicRouter.get('/', (req, res) => {
//   res.render('public_views/index');
// });

publicRouter.get('/gallery', (req, res) => {
  res.render('public_views/gallery');
});

publicRouter.get('/content', async (req, res) => {
  try {
    const contents = await Content.find().sort({ created_at: -1 });
    res.render('public_views/content', { contents });
  } 
  catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

publicRouter.get('/contact', (req, res) => {
    res.render('public_views/contact');
});

publicRouter.get('/login', (req, res) => {
  res.render('public_views/login');
});

publicRouter.get('/', async (req, res) => {
  
  try {
    const contents = await Content.find().sort({ created_at: -1 });
    res.render('public_views/landingpage', { contents });
  } 
  catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

export default publicRouter;
