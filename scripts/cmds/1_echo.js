module.exports = {
  config: {
    name: "echo",
    //aliases: ["repeat"],
    version: "1.0",
    author: "JV Barcenas",
    role: 0,
    description: {
      en: "Echoes back whatever the user has prompted or entered as arguments."
    },
    category: "fun",
    guide: {
      en: "Use {p}echo <your_message> to have the bot repeat your message."
    }
  },
  onStart: async function ({ api, event, args }) {
    const echoMessage = args.join(" ");

    const repliedMessageId = event.messageReply ? event.messageReply.messageID : null;

    if (echoMessage) {
      if (repliedMessageId) {
        api.sendMessage(echoMessage, event.threadID, repliedMessageId);
      } else {
        api.sendMessage(echoMessage, event.threadID);
      }
    } else {
      api.sendMessage("Please provide a message to echo.", event.threadID);
    }
  }
};
