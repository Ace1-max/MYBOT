module.exports = {
  config: {
    name: "ping",
    aliases: [],
    version: "1.0",
    author: "Ace Gerome",
    countDown: 10,
    role: 0,
    description: {
      en: "Displays the current ping of the bot's system."
    },
    category: "Info",
    guide: {
      en: "Use {p}ping to check the current ping of the bot's system."
    }
  },
  onStart: async function ({ message }) {
    const timeStart = Date.now();
    await message.reply("Pong!");
    const ping = Date.now() - timeStart;
    
    let stat = "Very Poor";
    if (ping < 800) {
        stat = "Fair";
    }
    if (ping < 400) {
        stat = "Good";
    }
    message.reply(`[ Ping: ${stat} || ${ping}ms ]`);
  }
};
