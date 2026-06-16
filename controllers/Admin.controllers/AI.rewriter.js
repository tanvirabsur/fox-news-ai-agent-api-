const { v4: uuidv4 } = require("uuid");
const { GetApprovedNews } = require("./Approved.artical");
const Groq = require("groq-sdk");
const slugify = require("slugify");


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

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
                status: "pending",
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
        )
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

module.exports = { RewriteArticle, GenerateSummaryWithGroq };