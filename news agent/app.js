require('dotenv').config();
const Groq = require('groq-sdk');
const axios = require('axios');
const RSSParser = require('rss-parser');
const cheerio = require('cheerio');
const fs = require('fs');
const cron = require('node-cron');

// Initialize API Clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const parser = new RSSParser();
const DB_FILE = 'news_database.json';

/**
 * Calculates estimated reading time based on word count
 * @param {string} text 
 * @returns {string}
 */
function calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
}

/**
 * Converts a string into an SEO-friendly URL slug
 * @param {string} title 
 * @returns {string}
 */
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
}

/**
 * Main function to fetch, scrape, and generate news content
 */
async function startNewsAgent() {
    try {
        console.log(`\n[${new Date().toLocaleString()}]  Agent checking for latest updates...`);
        
        // Fetch RSS Feed from BBC World News
        const feed = await parser.parseURL('https://feeds.bbci.co.uk/news/world/rss.xml');
        const topTenNews = feed.items.slice(0, 10);

        // Load existing database
        let newsList = [];
        if (fs.existsSync(DB_FILE)) {
            const fileData = fs.readFileSync(DB_FILE, 'utf-8');
            newsList = JSON.parse(fileData);
        }

        for (const item of topTenNews) {
            // Duplicate Check: Skip if link already exists in our database
            if (newsList.some(news => news.link === item.link)) continue;

            console.log(` Processing New Article: ${item.title}`);

            try {
                // 1. Scrape Full Content & Meta Image
                const { data } = await axios.get(item.link, { 
                    headers: { 'User-Agent': 'Mozilla/5.0' } 
                });
                const $ = cheerio.load(data);
                
                // Get the best possible thumbnail (OpenGraph Image)
                let thumbnail = $('meta[property="og:image"]').attr('content') || 
                                (item.enclosure ? item.enclosure.url : "https://images.unsplash.com/photo-1504711432869-5d39a1103c0b");

                // Extract all paragraph text
                let rawContent = "";
                $('p').each((idx, el) => {
                    const text = $(el).text().trim();
                    if (text.length > 50) rawContent += text + "\n\n";
                });

                // Fallback to snippet if scraping fails
                if (rawContent.length < 200) rawContent = item.contentSnippet;

                // 2. Generate Premium Content with Groq AI (Llama 3.3)
                const chatCompletion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: `You are a Senior Editorial Journalist. Your task is to rewrite the provided news article for a premium news portal. 
                            - Craft a compelling, click-worthy headline.
                            - Rewrite the entire story in a professional, unbiased, and engaging editorial tone.
                            - Ensure the content is unique and free from plagiarism.`
                        },
                        {
                            role: "user",
                            content: `Source Headline: ${item.title}\n\nFull Scraped Content:\n${rawContent}`
                        }
                    ],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.6,
                });

                const aiGeneratedContent = chatCompletion.choices[0]?.message?.content;

                // 3. Create Rich Data Object for Next.js Frontend
                const newEntry = {
                    id: item.guid || `news-${Date.now()}`,
                    title: item.title,
                    slug: createSlug(item.title),
                    link: item.link,
                    thumbnail: thumbnail,
                    content: aiGeneratedContent,
                    excerpt: aiGeneratedContent.substring(0, 160).replace(/\n/g, ' ') + "...",
                    category: item.categories ? item.categories[0] : "International",
                    isFeatured: Math.random() > 0.8, // 20% chance to be a featured post
                    readingTime: calculateReadingTime(aiGeneratedContent),
                    
                    author: {
                        name: "Tanvir AI Bot",
                        role: "AI Journalist",
                        avatar: "https://i.pravatar.cc/150?u=tanvir-ai",
                        bio: "An automated AI agent specializing in real-time world news and deep analysis."
                    },

                    meta: {
                        views: 0,
                        status: "published",
                        tags: ["World News", "Breaking", "AI Generated"]
                    },

                    published_at: item.pubDate,
                    scraped_at: new Date().toISOString()
                };

                // 4. Save to JSON Database
                newsList.push(newEntry);
                fs.writeFileSync(DB_FILE, JSON.stringify(newsList, null, 2), 'utf-8');
                
                console.log(` Successfully saved: ${newEntry.title}`);
                
                // Break after 1 item during testing to avoid API rate limits
                // The script will run again in 30 seconds to fetch the next item
                break; 

            } catch (err) {
                console.error(` Error at article "${item.title}":`, err.message);
            }
        }

    } catch (error) {
        console.error('Fatal Error:', error.message);
    }
}

/**
 * Schedule the Task
 * Runs every 30 seconds for testing purposes.
 * For production, use '0 * * * *' (Every Hour)
 */
cron.schedule('*/30 * * * * *', () => {
    startNewsAgent();
});

// Run immediately on start
startNewsAgent();