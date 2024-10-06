module.exports = {
  config: {
    name: "sendmsg",
    version: "1.0.7",
    author: "manhG",
    countDown: 5,
    role: 2,
    description: {
      en: "Send Message to the ThreadID provided."
    },
    category: "Owner",
    guide: {
      en: "To use this command, type {pn} <tid> <text> to send your message to the uid you provided."
    }
  },
  onStart: async function({ api, event, args, message, usersData }) {
    if (args.length === 0) {
      return message.reply("Please provide ThreadID and text.");
    }

    const threadID = args[0];
    const text = args.slice(1).join(" ");
    const { name } = (await usersData.get(event.senderID));
    
    if (!text) {
      return message.reply("Please provide text to send.");
    }

    try {
      await api.sendMessage(`Message from Admin `+name+`\n━━━━━━━━━━━━━━━\n➥ ${text}`, threadID);
      await api.sendMessage(`Sent message: ${text}`, event.threadID);
    } catch (error) {
      console.error(error);
      message.reply("Error sending message.");
    }
  }
};
