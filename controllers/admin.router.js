const express = require('express');

const adminRouter = express.Router();

adminRouter.get('/dashboard', (req, res) => {
    res.send('Welcome to the Admin Dashboard!');
});

module.exports = adminRouter;