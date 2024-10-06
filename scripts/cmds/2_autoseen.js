const fs = require('fs-extra');
const path = require('path');
const pathFile = path.join(__dirname, 'autoseen.txt');

if (!fs.existsSync(pathFile)) {
  fs.writeFileSync(pathFile, 'false');
}

module.exports = {
  config: {
    name: "autoseen",
    aliases: ['autoseen'],
    version: "1.4",
    author: "tor maire chudi",
    countDown: 5,
    role: 2,
    description: {
      en: "Enable/disable auto-seen when a new message is available."
    },
    category: "admin",
    guide: {
      en: "Use {pn} on to enable auto-seen and {pn} off to disable."
    }
  },
  
  onStart: async function({ message, args }) {
    try {
      const action = args[0];
      
      if (action === 'on') {
        fs.writeFileSync(pathFile, 'true');
        message.reply('Auto-seen has been enabled.');
      } else if (action === 'off') {
        fs.writeFileSync(pathFile, 'false');
        message.reply('Auto-seen has been disabled.');
      } else {
        message.reply('Invalid syntax. Use "on" to enable or "off" to disable.');
      }
    } catch (error) {
      console.error('Error handling auto-seen command:', error);
      message.reply('An error occurred while processing the autoseen:.' + error.message);
    }
  },
  
  onChat: async ({ api, event }) => {
    try {
      const isEnabled = fs.readFileSync(pathFile, 'utf-8');
      if (isEnabled === 'true') {
        api.markAsReadAll(() => {});
      }
    } catch (error) {
      console.error('Error reading auto-seen status:', error);
    }
  },
};
