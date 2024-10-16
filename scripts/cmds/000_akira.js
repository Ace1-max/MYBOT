const axios = require('axios');

module.exports = {
  config: {
    name: 'akira',
    version: '1.1.2',
    author: 'AceGerome',
    countDown: 5,
    role: 0,
    description: {
      en: 'Chat with Akira-AI with enhanced personality.',
    },
    category: '𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡',
    guide: {
      en: '{pn} [ask] - Chat with Akira-AI.',
    },
  },

  onStart: async function ({ api, event, args }) {
    const { messageID, threadID, senderID } = event;

    const name = await getUserName(api, senderID);
    const greeting = getTimeBasedGreeting(name);

    if (!args.length) return api.sendMessage(greeting, threadID, messageID);

    const userMessage = args.join(' ');

    try {
      const akiraResponse = await getAIResponse(userMessage);
      
      return api.sendMessage(akiraResponse, threadID, messageID);
    } catch (error) {
      console.error('Error in Akira-AI command:', error);
      return api.sendMessage('There was an error processing your request. Please try again later.', threadID, messageID);
    }
  }
};

function getTimeBasedGreeting(name) {
  const currentHour = new Date().getHours();
  let greeting;
  
  if (currentHour < 12) {
    greeting = `Ohayou gozaimasu, ${name}-san! Ready for a new day?`;
  } else if (currentHour < 18) {
    greeting = `Konnichiwa, ${name}-san! How's your afternoon going?`;
  } else {
    greeting = `Konbanwa, ${name}-san! Let's wind down with some knowledge!`;
  }

  return greeting;
}

async function getUserName(api, userID) {
  try {
    const userInfo = await api.getUserInfo(userID);
    return userInfo[userID].firstName || 'User';
  } catch (error) {
    console.error('Error fetching user info:', error);
    return 'User';
  }
}

async function getAIResponse(userMessage) {
  const apiUrl = `https://celestial-dainsleif-v2.onrender.com/gpt?gpt=You are Akira, an energetic, helpful anime-style assistant. Always respond in a fun, engaging, and slightly quirky way. Here's the user's message: "${encodeURIComponent(userMessage)}"`;
  
  const response = await axios.get(apiUrl);
  return response.data.content || response.data || "Sorry, I couldn't come up with a response!";
}
