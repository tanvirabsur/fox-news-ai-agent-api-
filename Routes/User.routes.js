const UserRouter = require('express').Router();

const { user } = require('../controllers/User.controllers/user.controll');

UserRouter.get('/user', user);



module.exports = {
    UserRouter
}