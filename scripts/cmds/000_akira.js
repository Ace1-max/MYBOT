const axios = require('axios');

module.exports = {
  config: {
    name: 'akira',
    version: '1.1.1',
    author: 'AceGerome',
    countDown: 5,
    role: 0,
    description: {
      en: 'Chat with Akira-AI.',
    },
    category: '𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡',
    guide: {
      en: '{pn} [ask] - Chat with Akira-AI.',
    },
  },

  onStart: async function ({ api, event, args }) {
    const { messageID, threadID, senderID } = event;

    const name = await getUserName(api, senderID);
    
    const greetings = [
      `Konichiwa ${name}!`,
      'Konichiwa senpai!',
      'Hora!',
      `Yoroshiku onegaishimasu, ${name}!`,
      `Ogenki desu ka, ${name}?`
    ];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    if (!args.length) return api.sendMessage(randomGreeting, threadID, messageID);

    // Chat message
    const userMessage = args.join(' ');

    try {
      const apiResponse = await getAIResponse(userMessage);

      return api.sendMessage(apiResponse, threadID, messageID);
    } catch (error) {
      console.error('Error in Akira-AI command:', error);
      return api.sendMessage('There was an error processing your request. Please try again later.', threadID, messageID);
    }
  }
};

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
  const apiUrl = `https://celestial-dainsleif-v2.onrender.com/gpt?gpt=${encodeURIComponent(userMessage)}`;
  const response = await axios.get(apiUrl);
  return response.data.content || response.data;
}
