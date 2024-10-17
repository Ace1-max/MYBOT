const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const pinterestDataPath = path.join(__dirname, "/assets/pinterest.json");
let pinterestData = {};

if (fs.existsSync(pinterestDataPath)) {
  pinterestData = require(pinterestDataPath);
}

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    version: "1.0.3",
    author: "JVB",
    role: 0,
    countDown: 50,
    description: {
      en: "Search for images on Pinterest",
    },
    category: "image",
    guide: {
      en: "{prefix}pinterest <search query> -<number of images> (default: 6)",
    },
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      const userID = event.senderID;
      const threadID = event.threadID;
      const messageID = event.messageID;

      if (!pinterestData[userID]) {
        pinterestData[userID] = {
          name: await usersData.getName(userID),
          searches: [],
          cooldowntime: 0,
        };
      }

      const currentTime = Date.now();
      if (pinterestData[userID].cooldowntime > currentTime) {
        const remainingTime = Math.ceil((pinterestData[userID].cooldowntime - currentTime) / 1000);
        return api.sendMessage(
          `❌ | Cooldown active. Please wait ${remainingTime} seconds before using this command again.`,
          threadID,
          messageID
        );
      }

      pinterestData[userID].cooldowntime = currentTime + 30000;
      fs.writeFileSync(pinterestDataPath, JSON.stringify(pinterestData, null, 2));

      const keySearch = args.join(" ");
      if (!keySearch.includes("-")) {
        return api.sendMessage(
          `⚠️ | Incorrect format! Please use: ${this.config.guide.en}`,
          threadID,
          messageID
        );
      }

      const keySearchs = keySearch.split("-")[0].trim();
      let numberSearch = parseInt(keySearch.split("-").pop().trim()) || 6;
      if (numberSearch > 100) numberSearch = 100;

      const res = await axios.get(`https://deku-rest-apis.ooguy.com/api/pinterest?q=${encodeURIComponent(keySearchs)}`);
      const data = res.data.result;

      if (!data || data.length === 0) {
        return api.sendMessage(`❌ | No results found for "${keySearchs}".`, threadID, messageID);
      }

      const imgData = [];
      const imgPaths = [];

      for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
        const imgResponse = await axios.get(data[i], {
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        });
        const imgPath = path.join(__dirname, "tmp", `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
        imgPaths.push(imgPath);
      }

      pinterestData[userID].searches.push({
        query: keySearchs,
        number: numberSearch,
        time: currentTime,
      });

      fs.writeFileSync(pinterestDataPath, JSON.stringify(pinterestData, null, 2));

      await api.sendMessage({
        attachment: imgData,
        body: `📸 Here are the top ${imgData.length} image results for "${keySearchs}":`,
      }, threadID, messageID);

      for (const imgPath of imgPaths) {
        try {
          fs.unlinkSync(imgPath);
        } catch (error) {
          console.error(`Error removing file ${imgPath}:`, error);
        }
      }

    } catch (error) {
      console.error("Error fetching Pinterest images:", error);
      return api.sendMessage("❌ | An error occurred while processing your request. Please try again later.", event.threadID, event.messageID);
    }
  }
};
