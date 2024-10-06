const axios = require('axios');
module.exports = {
  config: {
    name: "chrome",
    //aliases: [""], 
    version: "1.0.0",
    author: "XyryllPanget",
    countDown: 15,
    role: 0,
    description: {
        en: "Search on Chrome for a given query."
    }, 
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡", 
    guide: {
      en: "To use this command, type {pn} [query] - To search in Chrome from your given query."
    } 
  },
  
  onStart: async function({ message, event, args }) {
    const query = args.join(' ');
    if (!query) {
        message.reply("Please provide a search query.");
        return;
    }

    const cx = "7514b16a62add47ae"; // Replace with your Custom Search Engine ID
    const apiKey = "AIzaSyAqBaaYWktE14aDwDE8prVIbCH88zni12E"; // Replace with your API key
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}`;

    try {
        const response = await axios.get(url);
        const searchResults = response.data.items.slice(0, 5);
        let msg = `Top 5 results for '${query} Searching on Chrome':\n\n`;
        searchResults.forEach((result, index) => {
            msg += `${index + 1}. ${result.title}\n${result.link}\n${result.snippet}\n\n`;
        });
        message.reply(msg);
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while searching Chrome.", event.threadID);
    }
  }
};

