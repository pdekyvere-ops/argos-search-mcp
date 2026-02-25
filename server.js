import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Server is alive");
});

app.post("/mcp", (req, res) => {
  res.json({
    status: "ok",
    timestamp_utc: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
