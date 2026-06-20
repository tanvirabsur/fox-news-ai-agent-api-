const { articals } = require("../../Models/artical.Schema");
const { UserModel } = require("../../Models/user.model");

const formatBdDateTime = (value) => {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    return date.toLocaleString('en-GB', {
        timeZone: 'Asia/Dhaka',
        hour12: false,
    });
};


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
    try {
        const users = await UserModel.find().lean();
        const formattedUsers = users.map((user) => ({
            ...user,
            createdAt: formatBdDateTime(user.createdAt),
            updatedAt: formatBdDateTime(user.updatedAt),
        }));

        res.json({
            total: formattedUsers.length,
            users: formattedUsers
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to load users from MongoDB',
            error: error.message,
        });
    }
}

const specificArticle = async (req, res) => {
    const { id } = req.params;
    // Logic to fetch specific article by ID
    const article = await articals.findOne({ _id: id });
    if (!article) {
        return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
}

const user = async (req, res) => {
    const { id } = req.params;
    // Logic to fetch specific user by ID
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const payload = user.toObject();

    res.json({
        ...payload,
        createdAt: formatBdDateTime(payload.createdAt),
        updatedAt: formatBdDateTime(payload.updatedAt),
    });
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
