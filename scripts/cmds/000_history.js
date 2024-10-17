const axios = require('axios');

module.exports = {
  config: {
    name: "history",
    aliases: [],
    version: "1.0",
    author: "AceGerome",
    countDown: 10,
    role: 0,
    description: { en: "Send information about historical events." },
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡",
    guide: "{pn} search_query",
  },

  onStart: async function ({ api, args, event }) {
    const searchQuery = args.join(" ").trim(); 

    if (!searchQuery) {
      return api.sendMessage("Please provide a search query (e.g., history WW1).", event.threadID);
    }

    try {
      const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`);

      const { title, extract, thumbnail, content_urls } = response.data;

      if (title && extract) {
        let messageContent = `📜 Information about "${title}":\n\n${extract}\n\n🔗 [Read more here](${content_urls.desktop.page})`;

        if (thumbnail && thumbnail.source) {
          messageContent += `\n🖼️ Image: ${thumbnail.source}`;
        }

        api.sendMessage(messageContent, event.threadID, event.messageID);
      } else {
        api.sendMessage(`No information found for "${searchQuery}".`, event.threadID, event.messageID);
      }
    } catch (error) {
      console.error("Error fetching historical information:", error);
      api.sendMessage("An error occurred while fetching historical information. Please try again later.", event.threadID, event.messageID);
    }
  }
};
