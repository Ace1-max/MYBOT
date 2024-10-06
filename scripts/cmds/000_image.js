const axios = require('axios');

module.exports = {
  config: {
    name: "image",
    author: "UnSplash.dev",
    version: "4.0",
    countDown: 20,
    role: 0,
    description: {
      en: "Search for high-quality images using Unsplash API and return a specified number of results."
    },
    category: "image",
    guide: {
      en: "{pn} <prompt>\n\nExample: {pn} cats"
    }
  },

  onStart: async function({ args, message }) {
    try {
      if (!args.length) {
        return message.reply("Please provide a search query (e.g., image cats).");
      }

      const query = args.join(' ').trim();

      const numResults = isNaN(parseInt(args[0])) ? 5 : Math.min(parseInt(args[0]), 10); // Default to 5, max 10 results

      const url = `https://api.unsplash.com/search/photos?page=1&per_page=${numResults}&query=${encodeURIComponent(query)}&client_id=oWmBq0kLICkR_5Sp7m5xcLTAdkNtEcRG7zrd55ZX6oQ`;

      const { data } = await axios.get(url);

      if (!data.results.length) {
        return message.reply(`No results found for "${query}". Please try a different query.`);
      }

      const results = data.results.map(result => result.urls.regular);

      const attachments = await Promise.all(results.map(url => global.utils.getStreamFromURL(url)));

      return message.reply({
        body: `Here are the top ${numResults} high-quality image results for "${query}" from Unsplash:`,
        attachment: attachments
      });

    } catch (error) {
      console.error("Error fetching images from Unsplash:", error);
      return message.reply("Sorry, an error occurred while fetching images. Please try again later.");
    }
  }
};
