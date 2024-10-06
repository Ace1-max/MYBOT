module.exports = {
  config: {
    name: "giveaway",
    aliases: ['gv'],
    version: "2.0",
    author: "AceGerome",
    countdown: 5,
    role: 0,
    description: {
      en: "Start a giveaway in the group chat."
    },
    category: "game",
    guide: {
      en: "{p}giveaway <amount>"
    }
  },

  onStart: async function ({ event, message, args, usersData, api }) {
    const amountToGiveaway = parseInt(args[0]);

    if (isNaN(amountToGiveaway) || amountToGiveaway <= 0) {
      return message.reply("❌ Please enter a valid positive amount to give away.");
    }

    const userData = await usersData.get(event.senderID);
    const userMoney = userData.money || 0;

    if (userMoney < amountToGiveaway) {
      return message.reply("❌ You don't have enough money to give away.");
    }

    message.reply(`You're about to give away ${amountToGiveaway} money. Reply 'yes' to confirm.`, async (error, info) => {
      if (error) return message.reply("❌ Error occurred, please try again.");

      global.GoatBot.onReply.set(info.messageID, {
        type: "confirmGiveaway",
        commandName: this.config.name,
        author: event.senderID,
        messageID: info.messageID,
        amountToGiveaway
      });
    });
  },

  onReply: async function ({ event, api, usersData, message, Reply }) {
    const { type, author, commandName, messageID, amountToGiveaway } = Reply;

    if (Reply && type === "confirmGiveaway" && event.senderID === author) {
      const userResponse = event.body.toLowerCase();

      if (userResponse === 'yes') {
        const userMoney = await usersData.get(event.senderID, "money");
        await usersData.set(event.senderID, { money: userMoney - amountToGiveaway });

        const { threadID } = event;
        const threadInfo = await api.getThreadInfo(threadID);
        const participantIDs = threadInfo.participantIDs.filter(id => id !== event.senderID); 

        if (participantIDs.length === 0) {
          return message.reply("❌ No eligible participants for the giveaway.");
        }

        const winnerID = participantIDs[Math.floor(Math.random() * participantIDs.length)];
        const winnerData = await usersData.get(winnerID);
        if (!winnerData) {
          return message.reply("❌ The winner's data doesn't exist. Please try again.");
        }

        const winnerName = winnerData.name || "Unknown";
        const newMoney = (winnerData.money || 0) + amountToGiveaway;
        await usersData.set(winnerID, { money: newMoney });

        const ment = [{ id: winnerID, tag: winnerName }];
        api.sendMessage({
          body: `🎉 Congratulations, ${winnerName}! You've won ${amountToGiveaway} money in the giveaway!`,
          mentions: ment
        }, threadID);

      } else {
        message.reply("❌ Giveaway cancelled.");
      }

      global.GoatBot.onReply.delete(event.messageID);
    }
  }
};
