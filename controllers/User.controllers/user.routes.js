const express = require('express');
const fs = require('fs');
const router = express.Router();


router.get('/from-user', (req, res) => {
    res.send('Hello from user route!');
})

router.get('/news', (req, res) => {
    const newsData = fs.readFileSync('collection-news/news_database.json', 'utf8');
    res.json(JSON.parse(newsData));
})


module.exports = router;