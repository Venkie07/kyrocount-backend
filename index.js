const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/skillrack', async (req, res) => {
  const { url } = req.body;
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
      const getText = (selector) => document.querySelector(selector)?.innerText || 'N/A';
      const getBadgeCount = (title) =>
        Array.from(document.querySelectorAll('img[title]')).filter(img => img.title.includes(title)).length;

      return {
        name: getText('h5'),
        college: getText('h6'),
        codeTrack: getText('p:has(strong:contains("CodeTrack"))'),
        dc: getText('p:has(strong:contains("Daily Challenge"))'),
        dt: getText('p:has(strong:contains("Daily Test"))'),
        codeTutor: getText('p:has(strong:contains("CodeTutor"))'),
        totalPoints: getText('div.mt-2 div h5'),
        overallRank: getText('div.mt-2 div h6'),
        badges: {
          gold: getBadgeCount('Gold'),
          silver: getBadgeCount('Silver'),
          bronze: getBadgeCount('Bronze')
        }
      };
    });

    await browser.close();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
