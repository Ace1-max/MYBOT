const axios = require('axios');
const srod = require('srod-v2');
const fs = require('fs-extra');

const pathFile = __dirname + '/advice.txt';
if (!fs.existsSync(pathFile)) {
  fs.writeFileSync(pathFile, 'en'); 
}

module.exports = {
  config: {
    name: 'advice',
    version: '1.1',
    author: 'Ace',
    countDown: 5,
    role: 0,
    description: {
      en: 'Get a random advice in your chosen language.',
    },
    category: '𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡',
    guide: {
      en: '{pn} [english/tagalog] - Get random advice or set advice language.',
    },
  },

  onStart: async function ({ api, event, args, message }) {
    const selectedLang = args[0]?.toLowerCase();
    
    if (selectedLang === 'english' || selectedLang === 'tagalog') {
      const langCode = selectedLang === 'english' ? 'en' : 'tl';
      fs.writeFileSync(pathFile, langCode);
      return message.reply(
        selectedLang === 'english' ? 'Advice language set to English.' : 'Lengwahe ng Advice ay naset sa Tagalog.'
      );
    }

    if (!args[0]) {
      try {
        const adviceResult = await srod.GetAdvice();
        const advice = adviceResult.embed.description;
        
        const translatedAdvice = await translateAdvice(advice);
        const messageToSend = `𝗔𝗞𝗜𝗥𝗔~𝗔𝗜 (𝗔𝗗𝗩𝗜𝗖𝗘): \n\n${translatedAdvice}`;
        
        return api.sendMessage(messageToSend, event.threadID, event.messageID);
      } catch (error) {
        console.error(error);
        return message.reply('Something went wrong while fetching advice.');
      }
    }

    return message.reply("Invalid argument. Use 'english' or 'tagalog' to set the language.");
  },
};

async function translateAdvice(advice) {
  try {
    const langCode = fs.readFileSync(pathFile, 'utf-8');
    
    const response = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(advice)}`
    );
    const translations = response.data[0];
    const translatedAdvice = translations.map(translation => translation[0]).join('');

    return translatedAdvice;
  } catch (error) {
    console.error(error);
    return 'Error translating the advice.';
  }
}
