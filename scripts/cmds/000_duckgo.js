const axios = require('axios');

module.exports = {
  config: {
    name: "duckgo",
    version: "1.1.0",
    author: "Yan Maglinte",
    countDown: 10,
    role: 0,
    description: {
      en: "Searches the DuckDuckGo API for information."
    },
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡",
    guide: {
      en: "To use this command, type {pn} <query> - To search for information."
    }
  },

  onStart: async function({ message, event, args }) {
    const query = args.join(' ');
    
    if (!query) {
      return message.reply('⚠️ Please provide a search query.');
    }

    try {
      const response = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`);
      const data = response.data;

      const heading = data.Heading || 'No topic found';
      const abstract = data.Abstract || 'No description available.';
      const sourceUrl = data.AbstractURL || '';
      const relatedTopics = data.RelatedTopics || [];

      let msg = `🔎 **You searched for:** ${query}\n━━━━━━━━━━━━━━━\n📚 **Topic**: ${heading}\n\n${abstract}`;

      if (sourceUrl) {
        msg += `\n\n🌐 **More Info**: [Click here](${sourceUrl})`;
      }

      if (relatedTopics.length > 0) {
        msg += `\n\n📂 **Related Topics**:\n`;
        relatedTopics.slice(0, 3).forEach((topic, index) => {
          msg += `  ${index + 1}. [${topic.Text}](${topic.FirstURL})\n`;
        });
      }

      message.reply(msg);

    } catch (error) {
      message.reply(`❌ An error occurred: ${error.message}`);
    }
  }
};
