// routes.js

import express from 'express';
const router = express.Router();

const pages = [
  { url: '/', lastmod: '2023-01-01', changefreq: 'weekly', priority: 1.0 },
  { url: '/about', lastmod: '2023-01-02', changefreq: 'monthly', priority: 0.8 },
  //   { url: '/contact', lastmod: '2023-01-03', changefreq: 'monthly', priority: 0.8 },
  // Diğer sayfaları buraya ekleyin
];

router.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.render('sitemap', { pages });
});

// Diğer sayfa rotalarını buraya ekleyin

export default router;