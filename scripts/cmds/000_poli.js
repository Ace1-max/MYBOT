const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "poli",
    version: "1.0",
    author: "AceGerome",
    countDown: 20,
    description: {
      en: "Generate images from your prompts."
    },
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡",
    role: 0,
    guide: {
      en: "{pn} prompt",
    }
  },

  onStart: async function({ message, event, args }) {
    const tmpPath = path.join(__dirname, 'tmp', 'poli.png');
    const query = args.join(" ");
    
    if (!query) {
      return message.reply("Please provide a prompt for generating the image.");
    }

    try {
      const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
        responseType: 'arraybuffer'
      });

      fs.ensureDirSync(path.dirname(tmpPath));
      fs.writeFileSync(tmpPath, response.data);

      await message.reply({
        body: "Here's your generated image from Pollinations.ai!",
        attachment: fs.createReadStream(tmpPath)
      });

    } catch (error) {
      console.error("Error generating image:", error);
      message.reply("An error occurred while generating the image. Please try again later.");
    } finally {
      if (fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath);
      }
    }
  }
};
