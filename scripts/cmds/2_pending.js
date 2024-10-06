module.exports = {
  config: {
    name: "pending",
    version: "1.1",
    author: "AceGerome",
    countDown: 5,
    role: 2,
    description: {
      en: "Show the pending list of threads."
    },
    category: "Admin"
  },
  
  langs: {
    en: {
      invalidNumber: "%1 is not a valid number",
      cancelSuccess: "Canceled %1 thread(s)!",
      approveSuccess: "Approved %1 thread(s) successfully!",
      cantGetPendingList: "Unable to retrieve the pending list!",
      pendingList: "»「PENDING」«❮ Total pending threads: %1 ❯\n\n%2\n\n➥ Reply with the number to approve or type 'cancel <number>' to reject.",
      noPendingList: "「PENDING」There are no pending threads."
    }
  },
  
  onStart: async function({ api, message, event, getLang, commandName }) {
    const { threadID, messageID } = event;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

      if (list.length === 0) return message.reply(getLang("noPendingList"));
      
      const msg = list.map((group, index) => `${index + 1}. ${group.name} (${group.threadID})`).join('\n');
      
      return message.reply(getLang("pendingList", list.length, msg), (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          pending: list
        });
      });

    } catch (e) {
      return message.reply(getLang("cantGetPendingList"));
    }
  },
  
  onReply: async function({ api, message, event, Reply, getLang }) {
    if (String(event.senderID) !== String(Reply.author)) return;

    const { body } = event;
    let count = 0;

    if (body.toLowerCase().startsWith("cancel")) {
      const indices = body.slice(6).split(/\s+/).map(Number);

      for (const index of indices) {
        if (isNaN(index) || index <= 0 || index > Reply.pending.length) {
          return message.reply(getLang("invalidNumber", index));
        }
        await api.removeUserFromGroup(api.getCurrentUserID(), Reply.pending[index - 1].threadID);
        count++;
      }
      return message.reply(getLang("cancelSuccess", count));

    } else {
      const indices = body.split(/\s+/).map(Number);

      for (const index of indices) {
        if (isNaN(index) || index <= 0 || index > Reply.pending.length) {
          return message.reply(getLang("invalidNumber", index));
        }
        await api.sendMessage(
          `「 𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗 」\n\n• This thread is officially approved by the admin.\nEnjoy using the bot and please do not spam. ♡\n— [ -Akira ]`,
          Reply.pending[index - 1].threadID
        );
        count++;
      }
      return message.reply(getLang("approveSuccess", count));
    }
  }
};
