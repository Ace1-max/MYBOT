const fs = require('fs');
const path = require('path');

const confessionHistoryPath = path.join(__dirname, 'confessions.json');

if (!fs.existsSync(confessionHistoryPath)) {
  fs.writeFileSync(confessionHistoryPath, JSON.stringify([]));
}

module.exports = {
  config: {
    name: "confess",
    version: "1.1.0",
    author: "AceGerome",
    countDown: 5,
    role: 0,
    description: {
      en: "Confess your feelings to someone!"
    },
    category: "fun",
    guide: {
      en: "{pn} <Fb URL or UserID> | <message> | <from> [anonymous] or {pn} history"
    }
  },

  onStart: async function ({ api, args, event, message }) {
    const input = args.join(" ").trim();

    if (input.toLowerCase() === "history") {
      const confessionHistory = JSON.parse(fs.readFileSync(confessionHistoryPath));
      if (confessionHistory.length === 0) {
        return message.reply("📜 No confessions found.");
      }

      const historyMessage = confessionHistory.map((confession, index) => 
        `${index + 1}. To: ${confession.id}, Message: ${confession.msg}, From: ${confession.author}, At: ${new Date(confession.timestamp).toLocaleString()}`
      ).join("\n");

      return message.reply(`📜 Confession History:\n${historyMessage}`);
    } else {
      const parts = input.split("|").map(item => item.trim());
      const id = parts[0];
      const msg = parts[1];
      const author = parts[2];
      const anonymous = parts[3] && parts[3].toLowerCase() === "anonymous";

      if (!id) {
        return message.reply("❌ Missing Facebook URL or UserID.");
      } else if (!msg) {
        return message.reply("❌ Missing message.");
      } else if (msg.length > 250) {
        return message.reply("❌ Message is too long. Please keep it under 250 characters.");
      }

      try {
        let targetID;
        if (id.startsWith("https://facebook.com")) {
          targetID = await api.getUID(id);
        } else {
          targetID = id;
        }

        if (!targetID) {
          return message.reply("❌ Unable to resolve the user ID. Please check the URL or ID.");
        }

        const confessionMessage = `🛂 | 𝗬𝗼𝘂'𝘃𝗲 𝗴𝗼𝘁 𝗮 𝗖𝗼𝗻𝗳𝗲𝘀𝘀 𝗠𝗲𝘀𝘀𝗮𝗴𝗲\n━━━━━━━━━━━━━━━━━━━━━━━━━\n📝: ${msg}\n━━━━━━━━━━━━━━━━━━━━━━━━━\nFrom: ${anonymous ? "Anonymous" : author}\n━━━━━━━━━━━━━━━━━━━━━━━━━\n•⁠| Don’t bother asking who the sender is; you’re just wasting your time!`;

        api.sendMessage(confessionMessage, targetID, () => {
          message.reply("✅ Confession has been sent successfully!");

          const confessionHistory = JSON.parse(fs.readFileSync(confessionHistoryPath));
          confessionHistory.push({ id: targetID, msg, author: anonymous ? "Anonymous" : author, timestamp: new Date() });
          fs.writeFileSync(confessionHistoryPath, JSON.stringify(confessionHistory, null, 2));
        });
      } catch (err) {
        console.error(err);
        message.reply("😢 I'm sorry, but your confession failed to send. It's time to chat with that person and confess your feelings. (◍•ᴗ•◍)");
      }
    }
  }
};
