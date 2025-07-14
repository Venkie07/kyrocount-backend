const axios = require("axios");
const cheerio = require("cheerio");

const labels = [
  "RANK", "LEVEL", "GOLD", "SILVER", "BRONZE", "PROGRAMS SOLVED",
  "CODE TEST", "CODE TRACK", "DC", "DT", "CODE TUTOR",
  "C", "Python3", "Java", "CPP23", "SQL", "CPP"
];

async function getSkillrackData(id, key) {
  const url = `https://www.skillrack.com/faces/resume.xhtml?id=${id}&key=${key}`;
  const headers = { "User-Agent": "Mozilla/5.0" };

  try {
    const { data: html } = await axios.get(url, { headers });
    const $ = cheerio.load(html);
    const lines = $("body").text().split("\n").map(l => l.trim()).filter(Boolean);

    const result = {};
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === "PROGRAMMING SUMMARY" && i >= 5) {
        result.NAME = lines[i - 5];
        result.ID = lines[i - 4];
        result.DEPARTMENT = lines[i - 3];
        result.COLLEGE = lines[i - 2];
        result.YEAR = lines[i - 1].replace("(", "").replace(")", "");
        break;
      }
    }

    for (let i = 1; i < lines.length; i++) {
      if (labels.includes(lines[i])) {
        result[lines[i]] = lines[i - 1];
      }
    }

    result["GLOBAL RANK"] = result["RANK"];
    delete result["RANK"];

    return result;
  } catch (err) {
    console.error("❌ Error fetching SkillRack resume:", err.message);
    throw err;
  }
}

module.exports = getSkillrackData;
