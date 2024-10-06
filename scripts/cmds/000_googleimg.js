const cheerio = require('cheerio');
const axios = require('axios');

module.exports = {
  config: {
    name: "googleimg",
    author: "AceGerome",
    version: "2.0",
    description: "Search for images using Google Images and return a specified number of results.",
    category: "image",
    guide: {
      en: "{pn} <number_of_results> <search_query>"
    }
  },

  onStart: async function({ args, message, getLang }) {
    try {
      if (args.length < 2) {
        return message.reply("Please provide the number of results and a search query. Example: {pn} 5 cats");
      }

      const numResults = parseInt(args[0]);
      if (isNaN(numResults) || numResults <= 0) {
        return message.reply("Please provide a valid number of results greater than 0.");
      }

      const query = args.slice(1).join(' ');
      const encodedQuery = encodeURIComponent(query);
      const url = `https://www.google.com/search?q=${encodedQuery}&tbm=isch`;

      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const results = [];
      $('img[src^="https://"]').each(function() {
        const src = $(this).attr('src');
        if (src) {
          results.push(src);
        }
      });

      if (results.length === 0) {
        return message.reply(`No images found for "${query}".`);
      }

      const limitedResults = results.slice(0, numResults);

      const attachments = await Promise.all(limitedResults.map(url => global.utils.getStreamFromURL(url)));
      
      return message.reply({
        body: `Here are the top ${numResults} image results for "${query}":`,
        attachment: attachments
      });

    } catch (error) {
      console.error(error);
      return message.reply("Sorry, something went wrong while fetching the images. Please try again later.");
    }
  }
};
