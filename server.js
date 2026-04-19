const express = require('express');

const app = express(); 
const PORT = 8080; 

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

app.use('/api', require('./controllers/user.routes')); 
app.use('/admin', require('./controllers/admin.router'));

app.get('/', (req,res) => {
    res.send('server is getting hotter');
})


app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`)
})