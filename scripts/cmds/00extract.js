const axios = require('axios');

module.exports = {
  config: {
    name: "extract",
    version: "1.1.0",
    author: "LiANE",
    countDown: 15,
    role: 0,
    description: { en: "Reads and sends the content of a Pastebin link" },
    category: "Owner",
    guide: { en: "{pn} <link> - Reads and sends the content of the given Pastebin link" }
  },

  onStart: async function({ args, message }) {
    const link = args[0];

    if (!link || !link.startsWith("https://pastebin.com/raw/")) {
      return message.reply("Invalid Pastebin link provided. Please provide a valid link starting with 'https://pastebin.com/raw/'.");
    }

    try {
      const response = await axios.get(link);
      const content = response.data;

      const MAX_LENGTH = 63000; 
      
      if (content.length > MAX_LENGTH) {
        message.reply(`Content too long to display fully. Here are the first ${MAX_LENGTH} characters:\n\n${content.substring(0, MAX_LENGTH)}...`);
      } else {
        message.reply(content);
      }
    } catch (error) {
      if (error.response) {
        message.reply(`Error: Received status code ${error.response.status}. Unable to retrieve the content.`);
      } else if (error.request) {
        message.reply("Error: No response received from the server. Please check the link or try again later.");
      } else {
        message.reply("An error occurred while trying to read the Pastebin link.");
      }
      console.error(error);
    }
  }
};
