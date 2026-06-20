const { registerUser } = require('../controllers/Auth.controller/create.user');
const { user } = require('../controllers/User.controllers/user.controll');


const UserRouter = require('express').Router();

UserRouter.get('/user', user);
UserRouter.post('/create-user', registerUser);

module.exports = {
    UserRouter
}