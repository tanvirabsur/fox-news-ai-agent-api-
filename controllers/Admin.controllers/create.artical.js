require('dotenv').config(); // Load environment variables from .env file
const RSSParser = require("rss-parser");
const { GetApprovedNews } = require('./Approved.artical');
const { RewriteArticle, GenerateSummaryWithGroq } = require('./AI.rewriter');


const parser = new RSSParser();

const sourceUrls = [
    "https://www.bbc.com/news/articles/c9824e0rz75o?at_medium=RSS&at_campaign=rss",
    "https://www.bbc.com/news/articles/cd952n4qz2qo?at_medium=RSS&at_campaign=rss",
    "https://www.bbc.com/news/articles/c6217106px6o?at_medium=RSS&at_campaign=rss",
];


async function createArticleFromRSS(url) {
    try {
        return await parser.parseURL(url);
    } catch (error) {
        console.error("RSS Error:", error.message);
        return null;
    }
};


const CreateArticalWithAI = async (req, res) => {
    try {
        const result =
            await GenerateSummaryWithGroq(sourceUrls);

        res.status(200).json(result);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const CreateManualArticle = async (req, res) => {
    // Logic to create a manual article
    res.send('Manual article creation endpoint');
}

const exploreSourceArticles = async (req, res) => {
    try {
        const feed = await createArticleFromRSS(
            "https://feeds.bbci.co.uk/news/world/rss.xml"
        );

        res.json({
            total: feed.items.length,
            articles: feed.items.map((item) => ({
                title: item.title,
                link: item.link,
            })),
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to explore source articles",
        });
    }
};


const BlogsFromSquarespaceUseRSS = async (req, res) => {
    try{

    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch blogs from Squarespace",
        });
    }
}


module.exports = {
    CreateArticalWithAI,
    createArticleFromRSS,
    exploreSourceArticles,
    CreateManualArticle
};