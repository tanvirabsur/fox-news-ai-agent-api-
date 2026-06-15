const adminRouter = require('express').Router();
const {
    Dashboard, 
    TotallBlogs,
    AllUsers,
    specificArticle,
    user,
    pendingArticles
} = require('../controllers/Admin.controllers/admin.dashboard');
const { CreateManualArticle, CreateArticalWithAI, exploreSourceArticles } = require('../controllers/Admin.controllers/create.artical');

adminRouter.get('/dashboard', Dashboard)
adminRouter.get('/total-blogs', TotallBlogs)
adminRouter.get('/all-users', AllUsers)
// adminRouter.get('/create-manual-article', CreateManualArticle);
adminRouter.get('/create-ai-article', CreateArticalWithAI);
adminRouter.get('/specific-article/:id', specificArticle);
adminRouter.get('/user/:id', user);
adminRouter.get('/pending-articles',pendingArticles);
adminRouter.get('/explore-source-articles', exploreSourceArticles);

module.exports = adminRouter;