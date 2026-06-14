const Groq = require('groq-sdk');
const RSSParser = require('rss-parser');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const parser = new RSSParser();

const createArticleFromRSS = async (url, range, role) => {
    try{
        const feed = await parser.parseURL(url);
    }catch(error){
        console.error('Error fetching RSS feed:', error);
        return null;
    }
}




const CreateManualArticle = async (req, res) => {
    res.send('Article is created manually!');
};

const CreateArticalWithAI = async (req, res) => {
    res.send('Article is created with AI!');
}

module.exports = { CreateManualArticle, CreateArticalWithAI };