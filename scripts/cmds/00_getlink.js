const axios = require("axios");
const TinyURL = require("tinyurl");

module.exports = {
  config: {
    name: "getlink",
    aliases: ["tinyurl"],
    version: "2.0",
    author: "Samir | Enhanced by Ace",
    countDown: 10,
    role: 0,
    description: "Get shortened URLs for audio, video, or photo attachments in messages.",
    category: "box chat",
    guide: "{pn} - reply to a message containing an attachment or provide a direct link"
  },
  
  onStart: async function ({ api, event, args }) {
    const { messageReply, threadID, messageID } = event;

    if (event.type === "message_reply") {
      if (!messageReply.attachments || messageReply.attachments.length === 0) {
        return api.sendMessage("❌ Please reply to a message with an attachment (audio, video, or photo).", threadID, messageID);
      }

      let msg = `Processing ${messageReply.attachments.length} attachment(s):\n`;
      let num = 0;

      for (let i = 0; i < messageReply.attachments.length; i++) {
        try {
          let shortLink = await TinyURL.shorten(messageReply.attachments[i].url);
          num += 1;
          msg += `${num}: ${shortLink}\n`;
        } catch (error) {
          msg += `${num}: Error generating link for attachment ${i + 1}\n`;
        }
      }

      return api.sendMessage(msg, threadID, messageID);
    }
    
    else if (args[0]) {
      const url = args[0];
      if (!isValidURL(url)) {
        return api.sendMessage("Invalid URL provided. Please provide a valid link.", threadID, messageID);
      }

      try {
        let shortLink = await TinyURL.shorten(url);
        return api.sendMessage(`Shortened URL: ${shortLink}`, threadID, messageID);
      } catch (error) {
        return api.sendMessage("Error generating shortened link. Please try again later.", threadID, messageID);
      }
    } 
    else {    
      return api.sendMessage("Please reply to a message with an attachment or provide a valid URL.", threadID, messageID);
    }
  }
};

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
