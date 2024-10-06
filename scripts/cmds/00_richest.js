const fs = require("fs");

module.exports = {
  config: {
    name: "richest",
    aliases: ["rich"],
    version: "1.0",
    author: "JV BARCENAS",
    countDown: 10,
    role: 0,
    description: {
      en: "This command displays the names and bank account balances of the top 10 richest users.",
    },
    category: "game",
    guide: {
      vi: "",
      en: "{pn} - Shows the top 15 richest users",
    },
  },

  onStart: async function ({ message, usersData }) {
    const bankData = JSON.parse(fs.readFileSync("bank.json", "utf8"));
    const topRiches = Object.entries(bankData)
      .map(([userID, data]) => ({ userID, balance: data.bank || 0 }))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 15);

    const richestUsers = await Promise.all(
      topRiches.map(async (user) => {
        const userData = await usersData.get(user.userID);
        const name = userData ? userData.name : "Unknown User";
        return { name, balance: user.balance };
      })
    );

    const reply = richestUsers
      .map((user, index) => `${index + 1}. ${user.name} 💰: $${user.balance}`)
      .join("\n\n");

    return message.reply(`🏦 Top 15 Richest Users 🏦\n\n${reply}`);
  },
};
