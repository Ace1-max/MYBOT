const fs = require('fs');

module.exports = {
  config: {
    name: "‌sendfile",
    aliases: ["fs"], 
    version: "1.0",
    author: "System | Ace",
    countDown: 5,
    role: 2,
    description: {
        en: "Send the file code from bot file"
    },
    category: "Owner",
    guide: "{pn} <cmd>"
  },

  onStart: async function ({ message, args, api, event }) {
   
    const permission = ["100085947075503"];
    if (!permission.includes(event.senderID)) {
      return api.sendMessage("You are not allowed to use this feature.", event.threadID, event.messageID);
    }
    
    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage("Please provide a file name.", event.threadID, event.messageID);
    }

    const filePath = __dirname + `/${fileName}.js`;
    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`File not found: "${fileName}.js"`, event.threadID, event.messageID);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    api.sendMessage({ body: `${fileContent}` }, event.threadID, event.messageID);
  }
};
