const { articals } = require("../../Models/artical.Schema");

const Dashboard = async (req, res) => {

    res.send('Welcome to the Admin Dashboard ffffff!');

}

const TotallBlogs = async (req, res) => {
    try {
        const articles = await articals.find().lean();

        res.json({
            total: articles.length,
            articles: articles
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to load articles from MongoDB',
            error: error.message,
        });
    }
}

const AllUsers = async (req, res) => {
    res.send('Total Users: 5000');
}

const specificArticle = async (req, res) => {
    const { id } = req.params;
    // Logic to fetch specific article by ID
    const article = await articals.findOne({ id: id });
    if (!article) {
        return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
}

const user = async (req, res) => {
    const { id } = req.params;
    // Logic to fetch specific user by ID
    const user = await User.findOne({ id: id });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
}

const deleteArtical = async (req, res) => {
    const { id } = req.params;
    // Logic to delete specific article by ID
    const article = await articals.findOneAndDelete({ id: id });
    if (!article) {
        return res.status(404).json({ message: 'Article not found' });
    }
    res.json({ message: 'Article deleted successfully' });
}


const pendingArticles = async (req, res) => {
    res.send('List of pending articles for review');
}


module.exports = {
    Dashboard,
    TotallBlogs,
    AllUsers,
    specificArticle,
    user,
    deleteArtical,
    pendingArticles
} 
