const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

let isResting = false;

module.exports = {
  config: {
    name: "rest",
    aliases: ['sleep'],
    version: "1.0",
    author: "JVB",
    role: 2,
    shortDescription: {
      en: "Update rest time",
    },
    longDescription: {
      en: "Update rest time",
    },
    category: "Owner",
    guide: {
      en: "   {pn}: Update rest time",
    },
  },

  langs: {
    en: {
      updateSuccess: "✅ | Rest time updated! Waking at:",
    },
  },

  onLoad: function ({ api }) {
    const pathFile = `${__dirname}/tmp/rest.txt`;
    if (fs.existsSync(pathFile)) {
      const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
      api.sendMessage(
        `✅ | The Bot is awake.\n⏰ | The time taken was: ${(Date.now() - time) / 1000}s`,
        tid
      );
      fs.unlinkSync(pathFile);
    }
  },

  onStart: async function ({ message, event, args, getLang, api }) {
    const permission = ["100085947075503"];

    if (!permission.includes(event.senderID)) {
      return;
    }

    if (args.length < 2) {
      return message.reply("❌ | Invalid format. Use: rest <hours> <minutes>");
    }

    const hours = parseInt(args[0]);
    const minutes = parseInt(args[1]);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0) {
      return message.reply(
        "❌ | Invalid input. Hours and minutes must be non-negative integers."
      );
    }

    const currentTime = moment().tz("Asia/Manila");
    currentTime.add(hours, "hours");
    currentTime.add(minutes, "minutes");

    await message.reply(`${getLang("updateSuccess")} ${currentTime.format("HH:mm")}`);

    const pathFile = `${__dirname}/tmp/rest.txt`;
    fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);

    isResting = true;

    const delay = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);

    setTimeout(() => {
      isResting = false;
      process.exit(2);
    }, delay);
  },

  onChat: async function () {
    if (isResting) {
      return;
    }
  },
};