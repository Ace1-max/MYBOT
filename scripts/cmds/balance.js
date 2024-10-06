module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "top"],
    version: "1.2",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    description: {
      vi: "Xem số tiền hiện có của bạn hoặc người được tag hoặc top người chơi.",
      en: "View your money, the money of the tagged person, or the top users."
    },
    category: "game",
    guide: {
      vi: "{pn}: xem số tiền của bạn" +
           "\n{pn} <@tag>: xem số tiền của người được tag" +
           "\n{pn} top: xem người có số tiền cao nhất.",
      en: "{pn}: view your money" +
          "\n{pn} <@tag>: view the money of the tagged person" +
          "\n{pn} top: view the top users with the highest balance."
    }
  },

  langs: {
    vi: {
      money: "Bạn đang có %1$",
      moneyOf: "%1 đang có %2$",
      topUsers: "Danh sách người chơi có số tiền cao nhất:\n%1",
      noUsers: "Chưa có người chơi nào."
    },
    en: {
      money: "You have %1$",
      moneyOf: "%1 has %2$",
      topUsers: "Top 10 Richest Users:\n%1",
      noUsers: "No users found."
    }
  },

  onStart: async function ({ message, usersData, event, getLang, args }) {
    const command = args.length > 0 ? args[0] : null;

    if (command === "top") {
      const allUsers = await usersData.getAll();
      
      if (allUsers.length === 0) {
        return message.reply(getLang("noUsers"));
      }

      const topUsers = allUsers.sort((a, b) => b.money - a.money).slice(0, 10);
      
      const topUsersList = topUsers.map((user, index) => {
        const userName = user.name || "Unknown User";
        return `${index + 1}. ${userName}: $${user.money.toLocaleString()}`;
      });

      const messageText = getLang("topUsers", topUsersList.join('\n'));
      return message.reply(messageText);
    }

    if (Object.keys(event.mentions).length > 0) {
      const uids = Object.keys(event.mentions);
      let msg = "";
      for (const uid of uids) {
        const userMoney = await usersData.get(uid, "money");
        msg += getLang("moneyOf", event.mentions[uid].replace("@", ""), userMoney) + '\n';
      }
      return message.reply(msg);
    }

    const userData = await usersData.get(event.senderID);
    message.reply(getLang("money", userData.money));
  }
};
