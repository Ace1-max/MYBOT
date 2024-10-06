const axios = require('axios');
const Prefixes = [
  'box'
];

module.exports = {
  config: {
    name: 'box',
    version: '1.0',
    author: 'AceGerome', // do not change
    role: 0,
    category: '𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡',
    description: {
      en: 'Asks a response from BoxAI based on user-provided.'
    },
    guide: {
      en: '{pn} [prompt]',
    },
  },
  onStart: async function ({ message }) {
      message.reply("❌ | This Command Doesn't Have Any Prefix")
  }, 
  onChat: async function ({ api, event, args, message }) {
    try {
      const prefix = Prefixes.find((p) => event.body && event.body.toLowerCase().startsWith(p));
      if (!prefix) {
        return; 
      }
      const query = event.body.substring(prefix.length).trim()
      if (query === "") {
        await message.reply(
          "😿 Please provide a question or (Query).");
        return;
      }
      const sentMessage = await message.reply("BoxAI is searching, please wait...");
      const res = await axios.get(`https://api.kenliejugarap.com/blackbox/?text=${encodeURIComponent(query)}`);
      const messageText = res.data.response;
      const text = messageText.replace("\n\nIs this answer helpful to you? Kindly click the link below\nhttps:\/\/click2donate.kenliejugarap.com\n(Clicking the link and clicking any ads or button and wait for 30 seconds (3 times) everyday is a big donation and help to us to maintain the servers, last longer, and upgrade servers in the future)", "")
      await api.editMessage(text, sentMessage.messageID);
      console.log('Sent answer as a reply to user');
    } catch (error) {
      console.error(`Failed to get answer: ${error.message}`);
      api.sendMessage(
        `${error.message}.\n\nYou can try typing your question again or resending it, as there might be a bug from the server that's causing the problem. It might resolve the issue.`,
        event.threadID
      );
    }
  },
};
