const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const pinterestDataPath = path.join(__dirname + "/assets/pinterest.json");
let pinterestData = {};

if (fs.existsSync(pinterestDataPath)) {
  pinterestData = require(pinterestDataPath);
}

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    version: "1.0.2",
    author: "JVB",
    role: 0,
    countDown: 50,
    description: {
      en: "Search for images on Pinterest"
    },
    category: "image",
    guide: {
      en: "{prefix}pinterest <search query> -<number of images>"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      const userID = event.senderID;

      if (!pinterestData[userID]) {
        pinterestData[userID] = {
          name: await usersData.getName(userID),
          searches: [],
          cooldowntime: 0 // Initialize cooldown time
        };
      }

      const currentTime = Date.now();
      if (pinterestData[userID].cooldowntime > currentTime) {
        const remainingTime = Math.ceil((pinterestData[userID].cooldowntime - currentTime) / 1000);
        return api.sendMessage(
          `Sorry, you are on cooldown. Please wait ${remainingTime} seconds before using this command again.\nLast triggered by: ${pinterestData[userID].name}`,
          event.threadID,
          event.messageID
        );
      }

      pinterestData[userID].cooldowntime = currentTime + 30000;

      fs.writeFileSync(pinterestDataPath, JSON.stringify(pinterestData, null, 2));

      const keySearch = args.join(" ");
      if (!keySearch.includes("-")) {
        return api.sendMessage(`Please enter the search query and number of images to return in the format: ${this.config.guide.en}`, event.threadID, event.messageID);
      }
      const keySearchs = keySearch.substr(0, keySearch.indexOf('-')).trim();
      const numberSearch = parseInt(keySearch.split("-").pop().trim()) || 6;
      if (numberSearch > 100) {
        numberSearch = 100;
      }

      const res = await axios.get(`https://king-aryanapis.onrender.com/api/pin?query=${encodeURIComponent(keySearchs)}&limits=${numberSearch}`);
      const data = res.data;
      const imgData = [];

      for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
        const imgResponse = await axios.get(data[i], {
            responseType: "arraybuffer",
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const imgPath = path.join(__dirname, 'tmp', `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
      }

      pinterestData[userID].searches.push({
        query: keySearchs,
        number: numberSearch,
        cooldown: currentTime
      });

      fs.writeFileSync(pinterestDataPath, JSON.stringify(pinterestData, null, 2));

      await api.sendMessage({
        attachment: imgData,
        body: `Here are the top ${imgData.length} image results for "${keySearchs}":`
      }, event.threadID, event.messageID);

      await fs.remove(path.join(__dirname, 'tmp'));
    } catch (error) {
      console.error(error);
      return api.sendMessage(`An error occurred. Please try again later.`, event.threadID, event.messageID);
    }
  }
};
