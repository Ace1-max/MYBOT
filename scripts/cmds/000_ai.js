const axios = require('axios');

const Prefixes = [
  'gpt',
  '/gpt',
  'ai',
  '/ai'
];

const apiEndpoints = [
  'https://celestial-dainsleif-v2.onrender.com/gpt?gpt=',
  'https://deku-rest-api.gleeze.com/api/llama-3-70b?q=',
  'https://deku-rest-api.gleeze.com/api/gemma-7b?q=',
  'https://deku-rest-api.gleeze.com/gemini?prompt=',
  'https://deku-rest-api.gleeze.com/api/liner?q=', 
  'https://hiroshi-api.onrender.com/ai/gpt3?ask=', 
  'https://jailbreak-api.vercel.app/ai?ask='
];

module.exports = {
  config: {
    name: 'ai',
    version: '2.5',
    author: 'JV Barcenas',
    role: 0,
    category: '𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡',
    description: {
      en: 'Asks an AI for an answer based on the user prompt.',
    },
    guide: {
      en: '{pn} [prompt]',
    },
  },
  
  onStart: async function({}) {}, 
  
  onChat: async function ({ api, event, args, message }) {
    try {
      const prefix = Prefixes.find(p => event.body && event.body.toLowerCase().startsWith(p));
      if (!prefix) return;

      const prompt = event.body.substring(prefix.length).trim() || "Hello";

      if (prompt) {
        const sentMessage = await message.reply("Answering your question. Please wait a moment...");
        let respond = "Sorry, I couldn't generate an answer.";

        const shuffledEndpoints = apiEndpoints.sort(() => 0.5 - Math.random());

        for (let i = 0; i < shuffledEndpoints.length; i++) {
          try {
            const response = await axios.get(`${shuffledEndpoints[i]}${prompt}`);
            respond = response.data.content?.trim() || response.data.result?.trim() || response.data.gemini?.trim() || response.data.response?.trim();
            if (respond) break;
          } catch (error) {
            console.error(`❌ | API ${i + 1} failed:`, error);
          }
        }

        if (!respond) {
          respond = "All AI services are currently unavailable. Please try again later.";
        }

        await api.editMessage(respond, sentMessage.messageID);
        console.log('Sent answer as a reply to user');
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      await api.sendMessage("An unexpected error occurred. Please try again later.", event.threadID, event.messageID);
    }
  }
};
