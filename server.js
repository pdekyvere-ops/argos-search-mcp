import express from "express";
import cheerio from "cheerio";

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const { query, limit } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      return res.status(500).json({
        error: "Search request failed",
        status: response.status
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];

    $(".result").each((i, el) => {
      if (i >= (limit || 10)) return false;

      const title = $(el).find(".result__a").text();
      const link = $(el).find(".result__a").attr("href");
      const snippet = $(el).find(".result__snippet").text();

      if (title && link) {
        let domain = "";
        try {
          domain = new URL(link).hostname;
        } catch {
          domain = "";
        }

        results.push({
          rank: i + 1,
          title: title.trim(),
          url: link,
          domain,
          snippet: snippet.trim()
        });
      }
    });

    return res.json({
      query,
      timestamp_utc: new Date().toISOString(),
      engine: "duckduckgo_html",
      results
    });

  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({
      error: "Search failed",
      details: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
