const axios = require("axios");

module.exports = {
  config: {
    name: "fixgrammar",
    aliases: ["fixgram", "gram", "grammar"],
    version: "1.5",
    author: "Jvb",
    countDown: 10,
    role: 0, 
    description: {
      en: "Fixes your embarrassing grammar mistakes in any text you provide."
    },
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡",
    guide: {
      en: "{pn} [text] - Fix grammar mistakes in the provided text."
    }
  },

  onStart: async function ({ args, message }) {
    const prefix = global.GoatBot.config.prefix;
    const commandName = this.config.name;
    const pn = prefix + commandName;
    const inputText = args.join(" ").trim();

    if (!inputText) {
      return message.reply(`❌ Incorrect format.\nUse: ${pn} [text] to fix grammar.`);
    }

    try {
      const encodedText = encodeURIComponent(`Please carefully analyze the following text for grammar, punctuation, and style improvements. Correct any errors or awkward phrasing. Format your response by putting the corrected version of the text inside the brackets [" "] without changing the original meaning. Text to analyze: "${inputText}".`);
      const apiUrl = `https://celestial-dainsleif-v2.onrender.com/gpt?gpt=${encodedText}`;
      
      const res = await axios.get(apiUrl);
      const { content: correctedText } = res.data;

      if (!correctedText || typeof correctedText !== 'string') {
        return message.reply("⚠️ No corrections were found or the API response was invalid.");
      }

      return message.reply(`📜 Corrected Text:\n\n${correctedText}`);

    } catch (error) {
      console.error("Error correcting grammar:", error);

      if (error.response) {
        switch (error.response.status) {
          case 404:
            return message.reply("❌ The grammar correction API is currently unavailable. Please try again later.");
          case 500:
            return message.reply("❌ The server encountered an error. Please try again later.");
          default:
            return message.reply("❌ An unexpected error occurred while correcting the grammar.");
        }
      } else if (error.request) {
        return message.reply("❌ Network error. Please check your connection and try again.");
      } else {
        return message.reply("❌ An unexpected error occurred: " + error.message);
      }
    }
  }
};
