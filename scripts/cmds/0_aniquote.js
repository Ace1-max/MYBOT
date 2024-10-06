const fetch = require('node-fetch');

module.exports = {
  config: {
    name: 'aniquote',
    version: '1.0',
    author: 'AceGerome',
    role: 0,
    category: 'fun',
    description: {
      en: 'Get a random anime quote from the API.',
    },
    guide: {
      en: '{pn} - Generates Random Anime Quotes',
    },
  },  

  onStart: async function ({ api, event, args, message }) {
    try {
        fetch('https://ace-aniquotes.onrender.com/api/animequote')
          .then(response => response.json())
          .then(data => {
            const quoteMessage = `🔥 Anime Quote Incoming! 🔥\n“${data.quote}”\n— ${data.character}\nLet it ignite your passion!`;

            api.sendMessage(quoteMessage, event.threadID);
          })
          .catch(error => {
            console.error('Error:', error);
            api.sendMessage('An error occurred while fetching the anime quote. Please try again later.', event.threadID);
          });
    } catch (error) {
      console.error(error);
      api.sendMessage('An error occurred while fetching the anime quote. Please try again later.', event.threadID)
    }
  },
};

