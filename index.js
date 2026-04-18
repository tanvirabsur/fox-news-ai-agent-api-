require('dotenv').config();
const Groq = require('groq-sdk');
const { default: axios } = require('axios');
const RSSParser = require('rss-parser');
const cheerio = require('cheerio');
const fs = require('fs');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const parser = new RSSParser();

async function fetchNews() {
    try {
        console.log(`\n[${new Date().toLocaleString()}]  Agent started for collecting news...`);

        // this is the RSS feed URL for BBC World News, you can change it to any other news source that provides an RSS feed
        const feed = await parser.parseURL('https://feeds.bbci.co.uk/news/world/rss.xml')

    
        const latestNews = feed.items[3];

        const { data } = await axios.get(latestNews.link, {
            headers: { 'User-Agent': 'Mozilla/5.0' } // this is to avoid 403 forbidden error from some websites that block non-browser requests
        });

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

        console.log("Generating summary with Groq AI (Llama 3)");

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert news journalist. Your task is to rewrite the provided news article for a premium news website. 
                    Guidelines:
                    - Write a catchy new headline.
                    - Rewrite the entire story in your own professional words (avoid plagiarism).
                    - Make it engaging and easy to read.
                    - Tone: Professional and Editorial.`
                },
                {
                    role: "user",
                    content: `Original Title: ${latestNews.title}\n\nFull Scraped Content:\n${rawContent}`
                }
            ],
            model: "llama-3.3-70b-versatile", // free version of Llama 3 with 8B parameters and 8192 context length, you can choose other models as needed
            temperature: 0.7, // this controls the creativity of the output, you can adjust it as needed
        });

        // Final generated news article
        const generatedNews = chatCompletion.choices[0]?.message?.content;
        // console.log("Generated News Article:\n", generatedNews);


        const newEntry = {
            id: latestNews.guid || Date.now().toString(),
            title: latestNews.title,
            link: latestNews.link,
            content: generatedNews,
            date: latestNews.pubDate,
            scraped_at: new Date().toISOString()
        };

        // load existing news from the JSON file, if it exists, otherwise start with an empty array
        let newsList = [];
        if (fs.existsSync('news_database.json')) {
            const fileData = fs.readFileSync('news_database.json', 'utf-8');
            newsList = JSON.parse(fileData);
        }

        //  check for duplicate news using the link as a unique identifier
        const isDuplicate = newsList.some(item => item.link === newEntry.link);

        if (!isDuplicate) {
            newsList.push(newEntry);
            fs.writeFileSync('news_database.json', JSON.stringify(newsList, null, 2), 'utf-8');
            console.log("✅ Notun news save kora hoyeche!");
        } else {
            console.log("⚠️ Eita purono news, tai save kora hoy nai.");
        }

    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

fetchNews()