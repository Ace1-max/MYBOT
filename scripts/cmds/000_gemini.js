const axios = require('axios');

const Prefixes = [
  'gemini',
  '/gemini'
];

module.exports = {
  config: {
    name: 'gemini',
    version: '2.5',
    author: 'JV Barcenas', // do not change
    role: 0,
    category: '𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡',
    description: {
      en: 'Asks GEMINI for an answer based on the user prompt.',
    },
    guide: {
      en: '{pn} [prompt] - Ask GEMINI for help.',
    },
  },
  
  onStart: async function () {},

  onChat: async function ({ api, event, args, message, usersData }) {
    const senderID = event.senderID;
    const { name } = await usersData.get(senderID);
    
    try {
      const prefix = Prefixes.find((p) => event.body && event.body.toLowerCase().startsWith(p));

      if (!prefix) {
        return; 
      }

      const prompt = event.body.substring(prefix.length).trim();

      if (!prompt) {
        await message.reply(
          `Hello ${name}, this is GEMINI, your personal AI assistant. Please provide the question you'd like me to answer.\n\nName: ${name}\nSenderID: ${senderID}`
        );
        return;
      }

      const sentMessage = await message.reply("🔄 Answering your question. Please wait...");

      const response = await axios.get(`https://celestial-dainsleif.onrender.com/gem?chat=${encodeURIComponent(prompt)}&id=${senderID}`);

      if (response.status !== 200 || !response.data) {
        throw new Error('Received an invalid or incomplete response from the API');
      }

      const messageText = response.data.content.trim();
      const formatText = `🤖 GEMINI's Answer:\n${messageText}\n\n👤 Name: ${name}\n🆔 SenderID: ${senderID}`;

      await api.editMessage(formatText, sentMessage.messageID);

      console.log('Successfully sent the reply with the answer to the user.');
    } catch (error) {
      console.error(`Failed to get an answer: ${error.message}`);

      api.sendMessage(
        `❌ Error: ${error.message}\n\nPlease try asking your question again or resend it, as the issue might be due to temporary server problems. We apologize for the inconvenience.`,
        event.threadID
      );
    }
  },
};
