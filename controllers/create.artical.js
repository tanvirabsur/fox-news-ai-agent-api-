const CreateManualArticle = async (req, res) => {
    res.send('Article is created manually!');
};

const CreateArticalWithAI = async (req, res) => {
    res.send('Article is created with AI!');
}

module.exports = { CreateManualArticle, CreateArticalWithAI };