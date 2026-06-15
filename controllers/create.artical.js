require('dotenv').config(); // Load environment variables from .env file
const Groq = require("groq-sdk");
const RSSParser = require("rss-parser");
const axios = require("axios");
const cheerio = require("cheerio");
const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const parser = new RSSParser();

const sourceUrls = [
    "https://www.bbc.com/news/articles/c9824e0rz75o?at_medium=RSS&at_campaign=rss",
    "https://www.bbc.com/news/articles/cd952n4qz2qo?at_medium=RSS&at_campaign=rss",
    "https://www.bbc.com/news/articles/c6217106px6o?at_medium=RSS&at_campaign=rss",
    "https://www.bbc.com/news/articles/c20ygjem17zo?at_medium=RSS&at_campaign=rss",
    "https://www.bbc.com/news/articles/c8623n5pq2vo?at_medium=RSS&at_campaign=rss",
];

async function createArticleFromRSS(url) {
    try {
        return await parser.parseURL(url);
    } catch (error) {
        console.error("RSS Error:", error.message);
        return null;
    }
}

async function GetApprovedNews(urls) {
    const results = await Promise.allSettled(
        urls.map((url) => axios.get(url))
    );

    const articles = [];

    for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status !== "fulfilled") {
            console.log(`Failed: ${urls[i]}`);
            continue;
        }

        try {
            const html = result.value.data;

            const $ = cheerio.load(html);

            let rawContent = "";

            $("p").each((_, el) => {
                const text = $(el).text().trim();

                if (text.length > 50) {
                    rawContent += text + "\n\n";
                }
            });

            const title =
                $("h1").first().text().trim() ||
                "Untitled News";

            const thumbnail =
                $('meta[property="og:image"]').attr("content") ||
                "";

            const publishedAt =
                $('meta[property="article:published_time"]').attr(
                    "content"
                ) || new Date().toUTCString();

            articles.push({
                url: urls[i],
                title,
                thumbnail,
                publishedAt,
                content: rawContent,
            });
        } catch (error) {
            console.log(
                `Parsing failed for ${urls[i]}`,
                error.message
            );
        }
    }

    return articles;
}


async function RewriteArticle(article) {
    try {
        const completion =
            await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an expert journalist.Return ONLY valid JSON.
                     {
                   "title": "",
                      "content": "",
                     "excerpt": "",
                   "category": "International"
                  }

                        Rules:
               - Create a completely rewritten news article.
- No plagiarism.
- Professional editorial tone.
- Create an attractive headline.
- Excerpt should be under 200 characters.
`
                    },
                    {
                        role: "user",
                        content: `
Original Title:
${article.title}

Article Content:
${article.content}
`
                    }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                response_format: {
                    type: "json_object"
                }
            });

        const aiData = JSON.parse(
            completion.choices[0].message.content
        );

        return {
            id: uuidv4(),

            title: aiData.title,

            slug: slugify(aiData.title, {
                lower: true,
                strict: true,
            }),

            link: article.url,

            thumbnail: article.thumbnail,

            content: aiData.content,

            excerpt: aiData.excerpt,

            category:
                aiData.category || "International",

            isFeatured: false,

            readingTime: `${Math.max(
                1,
                Math.ceil(
                    aiData.content.split(" ").length / 200
                )
            )} min read`,

            author: {
                name: "Tanvir AI Bot",
                role: "AI Journalist",
                avatar:
                    "https://i.pravatar.cc/150?u=tanvir-ai",
                bio: "An automated AI agent specializing in real-time world news and deep analysis.",
            },

            meta: {
                views: 0,
                status: "published",
                tags: [
                    "World News",
                    "Breaking",
                    "AI Generated",
                ],
            },

            published_at: article.publishedAt,

            scraped_at: new Date().toISOString(),
        };
    } catch (error) {
        console.log(
            `AI Rewrite Failed: ${article.url}`,
            error.message
        );

        return null;
    }
}

async function GenerateSummaryWithGroq(urls) {
    const approvedNews = await GetApprovedNews(urls);

    const finalArticles = [];

    for (const article of approvedNews) {
        const rewritten = await RewriteArticle(article);

        if (rewritten) {
            finalArticles.push(rewritten);
        }
    }

    return {
        total: finalArticles.length,
        articles: finalArticles,
    };
}

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

module.exports = {
    CreateArticalWithAI,
    createArticleFromRSS,
    exploreSourceArticles,
};