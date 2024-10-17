const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "enhance",
    aliases: ["4k", "upscale"],
    version: "1.1",
    author: "AceGerome",
    countDown: 15,
    role: 0,
    description: "Upscale your image using the Remini API.",
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡",
    guide: {
      en: "{pn} - reply to an image or provide an image URL"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    let imageUrl;
    const imageFilePath = path.join(__dirname, "tmp", "upscale.jpg");

    if (event.type === "message_reply") {
      const replyAttachment = event.messageReply.attachments[0];
      if (replyAttachment?.type === "photo") {
        imageUrl = replyAttachment.url;
      } else {
        return message.reply("Please reply to an image.");
      }
    } 
    else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/)) {
      imageUrl = args[0];
    } 
    else {
      return message.reply("Please reply to an image or provide a valid image URL.");
    }

    try {
      const downloadImage = await global.utils.getStreamFromURL(imageUrl);
      const writeStream = fs.createWriteStream(imageFilePath);
      downloadImage.pipe(writeStream);

      writeStream.on('finish', async () => {
        const apiUrl = `https://deku-rest-apis.ooguy.com/remini?q=${encodeURIComponent(imageUrl)}`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.result) {
          const resultUrl = response.data.result;
          message.reply("✅ | Image upscaled successfully. Please wait...");

          message.reply({
            body: "✅ | Here is the upscaled image:",
            attachment: await global.utils.getStreamFromURL(resultUrl)
          });
        } else {
          throw new Error("Failed to upscale the image.");
        }
      });

    } catch (error) {
      console.error("Error:", error.message);
      message.reply(`An error occurred: ${error.message}`);
    } finally {
      if (fs.existsSync(imageFilePath)) {
        fs.unlinkSync(imageFilePath);
      }
    }
  }
};
