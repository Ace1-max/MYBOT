const axios = require('axios');

module.exports = {
  config: {
    name: "news",
    aliases: [],
    author: "kshitiz",
    version: "2.0",
    cooldown: 5,
    role: 0,
    description: {
      en: "Search and Get News."
    },
    category: "info",
    guide: {
      en: "{p}{n} [search]"
    }
  },
  onStart: async function ({ api, event, args }) { 
    try {
      const apiKey = 'pub_50308beff1038e704fb069bda4b56b65548af'; // Replace with your actual API key
      const country = 'ph'; 
      const response = await axios.get(`https://newsdata.io/api/1/news?country=${country}&apikey=${apiKey}`);
      const newsdata = response.data.results;

      const articlesPerPage = 5; 
      let message = '𝗟𝗔𝗧𝗘𝗦𝗧 𝗡𝗘𝗪𝗦:\n\n';
      let page = 1;

      for (const article of newsdata) {
        message += `🖋️𝗧𝗶𝘁𝗹𝗲: \n${article.title}`
             + `\n📚𝗦𝗼𝘂𝗿𝗰𝗲: \n${article.source_name}`
             +`\n📜𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: \n${article.description || "No Description"}`
             +`\n🖇️𝗟𝗶𝗻𝗸: \n${article.link}\n\n`;

        if (message.length > 4000) {
          break; 
        }
      }

      if (message === '𝗟𝗔𝗧𝗘𝗦𝗧 𝗡𝗘𝗪𝗦:\n\n') {
        message = 'No news articles found.';
      }

      api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
      console.error('Something went wrong:', error);
      api.sendMessage('Something went wrong while fetching from the API. Please try again.', event.threadID, event.messageID);
    }
  }
};
