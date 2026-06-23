const AuthRouter = require('express').Router();
const { loginUser } = require('../controllers/Auth.controller/auth.controller');
const { registerUser } = require('../controllers/Auth.controller/create.user');
const { verifyEmail } = require('../controllers/Auth.controller/email.verify');

AuthRouter.post('/register', registerUser);
AuthRouter.post('/login', loginUser);
AuthRouter.get('/verify-email/:token', verifyEmail);


module.exports = {
    AuthRouter
}