const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

module.exports = {
  config: {
    name: "enhance",
    aliases: ["4k", "upscale"],
    version: "1.0",
    author: "AceGerome",
    countDown: 15,
    role: 0,
    description: "Upscale your image.",
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡",
    guide: {
      en: "{pn} - reply to an image or provide an image URL"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    let imageUrl;
    let imageFilePath = __dirname + "/tmp/upscale.jpg";

    if (event.type === "message_reply") {
      const replyAttachment = event.messageReply.attachments[0];
      if (["photo", "sticker"].includes(replyAttachment?.type)) {
        imageUrl = replyAttachment.url;
      } else {
        return message.reply("Reply must be an image.");
      }
    } else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/)) {
      imageUrl = args[0];
    } else {
      return message.reply("Please reply to an image or provide a valid image URL.");
    }

    try {
      const downloadImage = await global.utils.getStreamFromURL(imageUrl);
      const writeStream = fs.createWriteStream(imageFilePath);
      downloadImage.pipe(writeStream);

      writeStream.on('finish', async () => {
        const formData = new FormData();
        const jpgFileStream = fs.createReadStream(imageFilePath);
        formData.append('image', jpgFileStream);

        const response = await fetch('https://api.deepai.org/api/torch-srgan', {
          method: 'POST',
          headers: {
            'api-key': '319cbf3f-9b14-4cd6-907c-3a087825ddbf'
          },
          body: formData
        });

        const data = await response.json();

        if (data && data.output_url) {
          const resultUrl = data.output_url;
          message.reply("✅ | Image upscaled successfully. Please wait...");

          message.reply({ body: "✅ | Here is the upscaled image:", attachment: await global.utils.getStreamFromURL(resultUrl) });
        } else {
          throw new Error("Invalid response from the upscaling API.");
        }

        fs.unlinkSync(imageFilePath);
      });

    } catch (error) {
      console.error("Error:", error.message);
      message.reply("An error occurred while processing your request. Please try again later.: " + error.message);

      if (fs.existsSync(imageFilePath)) {
        fs.unlinkSync(imageFilePath);
      }
    }
  }
};
