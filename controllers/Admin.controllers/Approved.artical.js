const cheerio = require("cheerio");

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

module.exports = { GetApprovedNews };