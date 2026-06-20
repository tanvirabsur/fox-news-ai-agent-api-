require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const adminRouter = require('./Routes/Admin.routes');
const { UserRouter } = require('./Routes/User.routes');
const mongoose = require('mongoose');
const { createArticleFromRSS } = require('./controllers/Admin.controllers/create.artical');


const app = express(); 
const PORT = 8080; 

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

app.use('/api', UserRouter); 
app.use('/admin', adminRouter);

mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'Articals',
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req,res) => {

    res.send('server is getting hotter');
});

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`)
});