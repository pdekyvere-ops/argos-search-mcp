import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const { query, limit } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];

    $(".result").each((i, el) => {
      if (i >= (limit || 10)) return false;

      const title = $(el).find(".result__a").text();
      const link = $(el).find(".result__a").attr("href");
      const snippet = $(el).find(".result__snippet").text();

      if (title && link) {
        results.push({
          rank: i + 1,
          title: title.trim(),
          url: link,
          domain: new URL(link).hostname,
          snippet: snippet.trim()
        });
      }
    });

    res.json({
      query,
      timestamp_utc: new Date().toISOString(),
      engine: "duckduckgo_html",
      results
    });

  } catch (err) {
    res.status(500).json({ error: "Search failed", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP Search Server running on port ${PORT}`);
});