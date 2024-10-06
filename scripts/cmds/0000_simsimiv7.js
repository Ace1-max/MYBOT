const axios = require("axios");

async function getMessage(yourMessage, langCode) {
  const url = `https://simsimi.site/api/v2/?mode=talk&lang=ph&message=${encodeURIComponent(yourMessage)}&filter=false`;
  const res = await axios.get(url);

  if (res.status > 200) {
    throw new Error(res.data.error);
  }

  return res.data.success;
}

module.exports = {
  config: {
    name: 'sim',
    aliases: ["simsimi"],
    version: '1.2',
    author: 'NIB/JARiF | Ace', //converted to goatbot by Ace
    countDown: 5,
    role: 0,
    description: {
      en: 'Talk with Akira Ai ♡'
    },
    category: 'fun',
    guide: {
      en: ' {pn} [on | off]: on/off Akira Ai ♡' 
        + '\n{pn} <word>: chat with Akira Ai ♡' 
        + '\nExample:\n{pn} hi'
    }
  },
  langs: {
    en: {
      turnedOn: 'Turned on Akira-AI ♡ successfully!',
      turnedOff: 'Turned off Akira-AI ♡ successfully!',
      chatting: 'Already Chatting with Akira-AI ♡...',
      error: 'Huh?🙂'
    }
  },
  onStart: async function ({ args, threadsData, message, event, getLang }) {
    if (args[0] == 'on' || args[0] == 'off') {
      await threadsData.set(event.threadID, args[0] == "on", "settings.simsimi");
      return message.reply(args[0] == "on" ? getLang("turnedOn") : getLang("turnedOff"));
    } else if (args[0]) {
      const yourMessage = args.join(" ");
      try {
        const responseMessage = await getMessage(yourMessage);
        return message.reply(`${responseMessage}`);
      } catch (err) {
        console.log(err);
        return message.reply(getLang("error"));
      }
    }
  },
  onChat: async function ({ args, message, threadsData, event, isUserCallCommand, getLang }) {
    if (args.length > 1 && !isUserCallCommand && (await threadsData.get(event.threadID, "settings.simsimi"))) {
      try {
        const langCode = (await threadsData.get(event.threadID, "settings.lang")) || global.GoatBot.config.language;
        const responseMessage = await getMessage(args.join(" "), langCode);
        return message.reply(`${responseMessage}`);
      } catch (err) {
        return message.reply(getLang("error"));
      }
    }
  }
};
