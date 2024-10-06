const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "say",
    version: "1.6",
    author: "AceGerome",
    countDown: 10,
    role: 0,
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡",
    description: "Converts your text into voice.",
    guide: {
      en: "{pn} <text> (default language is -en)"
        + "\n{pn} <text> -[use two-letter ISO 639-1 code,"
        + "\n Example: English -en, Tagalog -tl, or more; search Google for your language code]"
    }
  },

  onStart: async function ({ api, args, message, event }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);

    const langRegex = /^-[a-zA-Z]{2}$/;
    const lang = args.length > 0 && langRegex.test(args[args.length - 1]) ? args.pop().substring(1) : 'en';
    const text = args.join(" ");

    if (!text) {
      return message.reply("Please provide the text you want to convert to voice.");
    }

    const tempPath = path.join(__dirname, 'tmp', 'tts.mp3');
    const urlPrefix = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=`;

    try {
      await fs.ensureDir(path.dirname(tempPath));

      const writeStream = fs.createWriteStream(tempPath);

      const handleRequest = async (textChunk) => {
        try {
          const response = await axios({
            method: "get",
            url: `${urlPrefix}${encodeURIComponent(textChunk)}`,
            responseType: "stream"
          });

          response.data.pipe(writeStream, { end: false });
          return new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
          });
        } catch (error) {
          throw new Error("Error fetching TTS audio: " + error.message);
        }
      };

      if (text.length <= 150) {
        await handleRequest(text);
      } else {
        const chunks = text.match(/.{1,150}/g);
        for (let i = 0; i < chunks.length; i++) {
          await handleRequest(chunks[i]);
        }
      }

      message.reply({
        attachment: fs.createReadStream(tempPath)
      }, async () => {
        await fs.remove(tempPath);
      });

    } catch (err) {
      console.error("Error:", err.message);
      message.reply("An error occurred while trying to convert your text to speech. Please try again later.");
    }
  }
};
