const UserRouter = require('express').Router();
const { specificArticle, TotallBlogs } = require('../controllers/Admin.controllers/admin.dashboard');
const { user } = require('../controllers/User.controllers/user.controll');


UserRouter.get('/user', user)
UserRouter.get('/specific-article/:id', specificArticle);
UserRouter.get('/total-articles', TotallBlogs);

module.exports = {
    UserRouter
}