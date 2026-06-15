// const Groq = require('groq-sdk');
// const RSSParser = require('rss-parser');
// const { default: axios } = require('axios');
// const cheerio = require('cheerio');
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// const parser = new RSSParser();
// const uuid = require('uuid');
// const createArticleFromRSS = async (url, role) => {
//     try {
//         const feed = await parser.parseURL(url);

//         return feed;

//     } catch (error) {
//         console.error('Error fetching RSS feed:', error);
//         return null;
//     }
// }


// const sourceUrls = [
//     'https://www.bbc.com/news/articles/c9824e0rz75o?at_medium=RSS&at_campaign=rss',
//     'https://www.bbc.com/news/articles/cd952n4qz2qo?at_medium=RSS&at_campaign=rss',
//     'https://www.bbc.com/news/articles/c6217106px6o?at_medium=RSS&at_campaign=rss',
//     'https://www.bbc.com/news/articles/c20ygjem17zo?at_medium=RSS&at_campaign=rss',
//     'https://www.bbc.com/news/articles/c8623n5pq2vo?at_medium=RSS&at_campaign=rss',
//     'https://www.bbc.com/news/videos/crkvek3dnrgo?at_medium=RSS&at_campaign=rss',
//     'https://www.bbc.com/news/articles/c892xnwg5vlo?at_medium=RSS&at_campaign=rss',
//     'https://www.bbc.com/sport/football/articles/c79y10r2plzo?at_medium=RSS&at_campaign=rss',
//     'https://www.bbc.com/news/articles/c14yn10jzyeo?at_medium=RSS&at_campaign=rss',
//     'https://www.bbc.com/news/articles/cwy24v72n19o?at_medium=RSS&at_campaign=rss'
// ]

// const id = uuid.v4();
// async function GetApprovedNews(url) {
//     const results = await Promise.allSettled(
//         url.map((url) => axios.get(url))
//     );

//     const articles = [];

//     for (let i = 0; i < results.length; i++) {
//         const result = results[i];

//         if (result.status === "fulfilled") {
//             const html = result.value.data;

//             const $ = cheerio.load(html);

//             let rawContent = "";

//             $("p").each((i, el) => {
//                 const text = $(el).text().trim();

//                 if (text.length > 50) {
//                     rawContent += text + "\n\n";
//                 }
//             });

//             articles.push({
//                 url: url[i],
//                 content: rawContent,
//             });
//         } else {
//             articles.push({
//                 url: url[i],
//                 error: result.reason.message,
//             });
//         }
//     }

//     return articles;
// }

// function GenerateSummaryWithGroq(content) {

//     const chatCompletion = await groq.chat.completions.create({
//         messages: [
//             {
//                 role: "system",
//                 content: `You are an expert news journalist. Your task is to rewrite the provided news article for a premium news website. 
//                     Guidelines:
//                     - Write a catchy new headline.
//                     - Rewrite the entire story in your own professional words (avoid plagiarism).
//                     - Make it engaging and easy to read.
//                     - Tone: Professional and Editorial.`
//             },
//             {
//                 role: "user",
//                 content: `Original Title: ${latestNews.title}\n\nFull Scraped Content:\n${rawContent}`
//             }
//         ],
//         model: "llama-3.3-70b-versatile", // free version of Llama 3 with 8B parameters and 8192 context length, you can choose other models as needed
//         temperature: 0.7, // this controls the creativity of the output, you can adjust it as needed
//     });


// }

// const CreateManualArticle = async (req, res) => {
//     res.send('Article is created manually!');
// };

// const CreateArticalWithAI = async (req, res) => {

//     const article = await GetApprovedNews(sourceUrls)

//     res.json({ total: article.length, articles: article })
// }

// const exploreSourceArticles = async (req, res) => {

//     try {
//         const article = await createArticleFromRSS('https://feeds.bbci.co.uk/news/world/rss.xml', 'editor')
//         res.json({
//             total: article.items.length,
//             article: article.items.map(item => ({ title: item.title, link: item.link }))
//         })

//     } catch (error) {
//         console.error('Error exploring source articles:', error);
//         res.status(500).json({ error: 'Failed to explore source articles' });
//     }
// }



// module.exports = {
//     CreateManualArticle,
//     CreateArticalWithAI,
//     createArticleFromRSS,
//     exploreSourceArticles
// };