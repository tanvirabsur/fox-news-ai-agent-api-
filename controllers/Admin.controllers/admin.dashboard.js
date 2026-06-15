const Dashboard = async (req,res) => {

    res.send('Welcome to the Admin Dashboard ffffff!');

}

const TotallBlogs = async (req,res) => {
    res.send('Total Blogs: 100');
}

const AllUsers = async (req,res) => {
    res.send('Total Users: 5000');
}

const specificArticle = async(req,res) =>{
    const { id } = req.params;
    // Logic to fetch specific article by ID
    res.send(`This is the article with ID: ${id}`);
}

const user = async (req,res) => {
    const { id } = req.params;
    // Logic to fetch specific user by ID
    res.send(`This is the user with ID: ${id}`);
}


const pendingArticles = async (req,res) => {
    res.send('List of pending articles for review');
}



module.exports = {
    Dashboard, 
    TotallBlogs,
    AllUsers,
    specificArticle,
    user,
    pendingArticles
} 
