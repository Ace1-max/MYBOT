const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "dalle",
    aliases: [],
    author: "Vex_Kshitiz",
    version: "2.1",
    cooldowns: 20,
    role: 0,
    description: "Generates an image based on a prompt.",
    category: "image",
    guide: "{p}dalle <prompt>",
  },
  
  onStart: async function ({ message, args, api, event }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    
    const prompt = args.join(" ").trim();
    
    if (!prompt) {
      return message.reply("❌ | Please provide a prompt to generate an image.");
    }

    const dalleApiUrl = "https://markdevs-last-api.onrender.com/dalle";
    const cacheFolderPath = path.join(__dirname, "tmp");

    try {
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const dalleResponse = await axios.get(dalleApiUrl, {
        params: { prompt },
        responseType: "arraybuffer",
      });

      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(dalleResponse.data, "binary"));

      const stream = fs.createReadStream(imagePath);
      message.reply({ body: "Here's your generated image:", attachment: stream }, (err) => {
        if (err) {
          console.error("Error sending image:", err);
        } else {
          fs.unlink(imagePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
      });
      
    } catch (error) {
      console.error("Error:", error);
      message.reply(`❌ | An error occurred: ${error.message}\nPlease try again later.`);
    }
  }
};
