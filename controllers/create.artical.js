const Groq = require('groq-sdk');
const RSSParser = require('rss-parser');
const { default: axios } = require('axios');
const cheerio = require('cheerio');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const parser = new RSSParser();

const createArticleFromRSS = async (url, range, role) => {
    try{
        const feed = await parser.parseURL(url);
        // const latestNews = feed.slice(0, range);

        // console.log(latestNews);

        return feed.items.slice(0, range).map(item => ({
            title: item.title,
            link: item.link
        }));

    }catch(error){
        console.error('Error fetching RSS feed:', error);
        return null;
    }
}

async function GenarateSummaryWithGroq (){
    const {data} = await axios.get('https://www.bbc.com/news/articles/cvglmn49xz0o?at_medium=RSS&at_campaign=rss')
    const $ = cheerio.load(data);

    let rawContent = "";
    $('p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 50) rawContent += text + "\n\n";
    });

    if (rawContent.length < 200) {
        console.log("there is not enough content, using content snippet instead");
        rawContent = latestNews.contentSnippet;
    }
    return rawContent;

    console.log("Generating summary with Groq AI (Llama 3)");
   console.log(`main artical ${rawContent}`)
}




const CreateManualArticle = async (req, res) => {
    res.send('Article is created manually!');
};

const CreateArticalWithAI = async (req, res) => {

  const article =  await GenarateSummaryWithGroq()

    res.json({ article })
}

const exploreSourceArticles = async (req, res) => {
    const article = await createArticleFromRSS('https://feeds.bbci.co.uk/news/world/rss.xml', 20, 'editor')

    res.json({ article })
}



module.exports = { 
    CreateManualArticle, 
    CreateArticalWithAI,
    createArticleFromRSS, 
    exploreSourceArticles 
};