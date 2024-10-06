const axios = require('axios');

module.exports = {
  config: {
    name: 'chess',
    //aliases: ['chess'],
    version: '1.0',
    author: 'AceGerome',
    countDown: 10,
    role: 0,
    description: {
      en: 'Generate random Chess quotes and tips.'
    },
    category: 'fun',
    guide: {
      en: '⠀⠀⠀{pn} quotes' +
          '\n⠀⠀⠀{pn} tips'
    }
  },
  onStart: async function({ args, event, message }) {
    const action = args[0];
    try {
      if (action === 'quotes') {
        const url = 'https://chess-quotes-api.onrender.com/api';
        const response = await axios.get(url);
        const { quote, name } = response.data;

        if (!quote) {
          return message.reply('No Chess Quotes Available now, please try again later.');
        }

        const replyMessage = `𝗖𝗵𝗲𝘀𝘀 𝗤𝘂𝗼𝘁𝗲: ${quote} \n\n — ${name}`;
        message.reply(replyMessage);
      } 
      else if (action === 'tips') {
        const url = 'https://chess-tips-api.onrender.com/api';
        const response = await axios.get(url);
        const { tip, category } = response.data;

        if (!tip) {
          return message.reply('No Chess Tips Available now, please try again later.');
        }

        const replyMessage = `𝗖𝗵𝗲𝘀𝘀 𝗧𝗶𝗽: ${tip}\n\n — ${category}`;
        message.reply(replyMessage);
      } else {
        return message.reply(`Invalid Usage Input:\n\n/chess "quotes" or "tips"`);
      }
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while fetching chess content. Please try again later.');
    }
  },
};
