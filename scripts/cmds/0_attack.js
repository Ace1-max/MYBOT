const fs = require('fs');
const path = require('path');
const axios = require('axios');
const pathFile = path.join(__dirname, 'atck.json');

if (!fs.existsSync(pathFile)) {
  fs.writeFileSync(pathFile, JSON.stringify({ uids: [] }, null, 2));
}

function readWarJson() {
  try {
    const jsonData = fs.readFileSync(pathFile, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading JSON:', error);
    return { uids: [] };
  }
}

function writeWarJson(data) {
  try {
    fs.writeFileSync(pathFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing JSON:', error);
  }
}

let warData = readWarJson();
let t = warData.uids;

const permissions = ["100085947075503"];

module.exports = {
  config: {
    name: "attack",
    version: "1.0",
    author: "kshitiz",
    countDown: 5,
    role: 0,
    description: "Launch an attack of roasts on someone",
    category: "fun",
    guide: {
      en: "{p}",
    },
  },

  onStart: async function ({ api, event, args }) {
    const subCommand = args[0];
    const userId = event.senderID.toString();

    if (!permissions.includes(userId)) {
      await api.sendMessage("🛑 Access denied! You are not authorized to use this command.", event.threadID, event.messageID);
      return;
    }

    const uidToModify = args[1];

    if (subCommand === "on") {
      if (uidToModify) {
        if (!t.includes(uidToModify)) {
          t.push(uidToModify);
          writeWarJson({ uids: t });
          await api.sendMessage("😈 Target added for roasting!", event.threadID, event.messageID);
        } else {
          await api.sendMessage("⚠️ This UID is already on the roast list!", event.threadID, event.messageID);
        }
      } else {
        await api.sendMessage("❌ Please provide a UID to add.", event.threadID, event.messageID);
      }
    } else if (subCommand === "off") {
      if (uidToModify) {
        t = t.filter(uid => uid !== uidToModify);
        writeWarJson({ uids: t });
        await api.sendMessage("🗑️ Target removed from roasting list!", event.threadID, event.messageID);
      } else {
        await api.sendMessage("❌ Please provide a UID to remove.", event.threadID, event.messageID);
      }
    } else {
      await api.sendMessage("❓ Invalid command. Use 'on' to add a UID and 'off' to remove a UID.", event.threadID, event.messageID);
    }
  },

  onChat: async function ({ api, event }) {
    const senderId = event.senderID.toString();

    if (t.includes(senderId)) {
      try {
        const response = await axios.get("https://evilinsult.com/generate_insult.php?lang=en&type=json");
        const insult = response.data.insult;

        await api.sendMessage(`🔥 Roast Incoming! 🔥\n${insult}`, event.threadID, event.messageID);
      } catch (error) {
        console.error('Error fetching insult:', error);
        await api.sendMessage("💔 Oops! Error fetching insult. Please try again later.", event.threadID, event.messageID);
      }
    }
  },
};
