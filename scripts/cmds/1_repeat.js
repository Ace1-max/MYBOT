module.exports = {
  config: {
    name: "repeat",
    //aliases: ["rep"],
    version: "1.3",
    author: "Subash",
    role: 1,
    countDown: 10,
    description: "Repeats a message",
    category: "info",
    guide: {
      en: "{pn} <message> <times>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const message = args.slice(0, -1).join(" ");
    const times = parseInt(args[args.length - 1]);

    if (!message || isNaN(times)) {
      return api.sendMessage("Please provide a message to repeat and specify the number of times.", event.threadID, event.messageID);
    }

    if (times <= 0) {
      return api.sendMessage("Please specify a positive number of times to repeat the message.", event.threadID, event.messageID);
    }

    api.setMessageReaction("✅", event.messageID, () => { }, true);

    let repeatedMessage = "";
    for (let i = 0; i < times; i++) {
      repeatedMessage += message + "\n";
    }

    api.sendMessage(repeatedMessage, event.threadID, event.messageID);
  }
};
