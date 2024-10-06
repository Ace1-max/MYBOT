const axios = require('axios');

module.exports = {
  config: {
    name: 'word',
    aliases: ['dic', 'whatis'],
    version: '1.0',
    author: 'JV',
    countDown: 10,
    role: 0,
    category: '𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡',
    description: {
      en: 'Explain the word by dictionary.'
    },
    guide: {
      en: '{pn} <word>'
    }
  },
  onStart: async function ({ api, event, args }) {
    try {
      if (args.length === 0) {
        return api.sendMessage('❌ Please provide a word to define.', event.threadID);
      }

      const word = args.join(' ').toLowerCase();
      const apiKey = 'e7e3e3ad-a4b1-44f1-b7cf-ff5eea6d108a';
      const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${apiKey}`;

      const response = await axios.get(url);

      if (response.status !== 200 || !response.data || !response.data[0] || !response.data[0].shortdef) {
        throw new Error('No definitions found for this word.');
      }

      const definitions = response.data[0].shortdef;

      if (definitions.length === 0) {
        return api.sendMessage(`❌ No definitions found for "${word}".`, event.threadID);
      }

      const formattedDefinitions = definitions.map((definition, index) => `${index + 1}: ${definition}`).join('\n');
      const message = `📖 Definitions for "${word}":\n\n${formattedDefinitions}`;

      await api.sendMessage(message, event.threadID);
    } catch (error) {
      console.error(`Error fetching word definition: ${error.message}`);
      api.sendMessage('❌ An error occurred while fetching the word definition. Please try again later.', event.threadID);
    }
  }
};
