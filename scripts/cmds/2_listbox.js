module.exports = {
  config: {
    name: "listbox",
    aliases: [],
    version: "1.0.2",
    author: "Unknown | AceGerome",
    countDown: 15,
    role: 2,
    description: {
      en: "Lists the threads where the bot participated."
    },
    category: "Owner",
    guide: {
      en: "   {pn} <page>"
    }
  },

  onStart: async function({ api, event, message, args }) {
    try {
      const page = parseInt(args[0]) || 1;
      const threadsPerPage = 20;
      const offset = (page - 1) * threadsPerPage;

      // Fetch the inbox thread list
      var inbox = await api.getThreadList(100, null, ['INBOX']);
      let list = inbox.filter(group => group.isSubscribed && group.isGroup);

      // Map the threads and get their info
      let listthread = await Promise.all(list.map(async (groupInfo) => {
        const data = await api.getThreadInfo(groupInfo.threadID);
        return {
          id: groupInfo.threadID,
          name: groupInfo.name || "No name",
          sotv: data.userInfo.length,
        };
      }));

      var listbox = listthread.sort((a, b) => b.sotv - a.sotv);
      const paginatedList = listbox.slice(offset, offset + threadsPerPage);

      if (paginatedList.length === 0) {
        return message.reply(`No threads found for page ${page}.`);
      }

      // Generate the message content
      let msg = '';
      let groupid = [];
      let i = offset + 1;

      paginatedList.forEach(group => {
        msg += `${i++}. ${group.name}\n» TID: ${group.id}\n» Members: ${group.sotv}\n`;
        groupid.push(group.id);
      });

      const totalPages = Math.ceil(listbox.length / threadsPerPage);
      msg += `\nPage ${page}/${totalPages}\nReply with "out <number>" or "join <number>" to leave or join a thread!`;

      // Send the message and set up a reply listener
      message.reply(
        msg,
        (e, info) => {
          if (e) return message.reply("An error occurred while sending the message.");
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            messageID: info.messageID,
            groupid,
            type: 'reply',
          });

          // Set a timeout to auto-delete the message after 15 seconds
          setTimeout(() => {
            const replyData = global.GoatBot.onReply.get(info.messageID);
            if (replyData) {
              global.GoatBot.onReply.delete(info.messageID);
              try {
                message.unsend(info.messageID);
              } catch (error) {
                console.error("Error unsending message:", error.message);
              }
            }
          }, 15000); // 15 seconds timeout
        }
      );
    } catch (error) {
      console.error("Error fetching thread list:", error.message);
      if (error.response && error.response.status === 404) {
        message.reply("API returned a 404 status code. It seems the endpoint or thread is not found.");
      } else {
        message.reply(error.message + "\n\nAn error occurred while fetching the thread list. Please try again later.");
      }
    }
  },

  onReply: async function({ message, api, event, args, threadsData, Reply }) {
    if (parseInt(event.senderID) !== parseInt(Reply.author)) return;

    var arg = event.body.split(" ");
    const command = arg[0].toLowerCase();
    const index = parseInt(arg[1]);

    if (isNaN(index) || index < 1 || index > Reply.groupid.length) {
      return message.reply("Invalid thread number. Please provide a valid number from the list.");
    }

    var idgr = Reply.groupid[index - 1];

    switch (Reply.type) {
      case "reply": {
        try {
          if (command === "out") {
            await api.removeUserFromGroup(`${api.getCurrentUserID()}`, idgr);
            const threadName = (await threadsData.get(idgr)).threadName || "Unnamed thread";
            message.reply(`Successfully left the thread: ${threadName} (ID: ${idgr})`);
          } else if (command === "join") {
            await api.addUserToGroup(event.senderID, idgr);
            const threadName = (await threadsData.get(idgr)).threadName || "Unnamed thread";
            message.reply(`Added you back to the thread: ${threadName} (ID: ${idgr})`);
          } else {
            message.reply("Invalid command. Use 'out <number>' or 'join <number>'.");
          }
        } catch (error) {
          message.reply(`An error occurred: ${error.message}`);
        }
        try {
          message.unsend(event.messageReply.messageID);
        } catch (error) {
          console.error("Error unsending message:", error.message);
        }
        break;
      }
    }
  }
};
