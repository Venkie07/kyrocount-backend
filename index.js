const express = require("express");
const cors = require("cors");
require("dotenv").config();

const getSkillrackData = require("./scrapeResume");

const app = express();
app.use(cors());

app.get("/api/resume", async (req, res) => {
  const { id, key } = req.query;
  if (!id || !key) return res.status(400).json({ error: "Missing id or key" });

  try {
    const data = await getSkillrackData(id, key);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch resume data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
