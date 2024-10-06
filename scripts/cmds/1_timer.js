const timersQueue = [];

module.exports = {
  config: {
    name: "timer",
    version: "1.12",
    author: "Subash",
    countDown: 5,
    role: 0,
    description: {
      en: "Allows you to set a countdown timer and receive a notification when it's done."
    },
    category: "info",
    guide: {
      en: "{pn} <duration> <custom message>" 
       + "\n{pn} list"
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    if (args[0] === "list") {
      if (timersQueue.length === 0) {
        message.reply("🚫 There are no timers in the queue!");
      } else {
        const queueList = timersQueue.map(timer => {
          return `${timer.name}, ✅ Timer set for ${timer.duration} ${timer.timeUnit} - "${timer.message}"`;
        });
        message.reply(`🚀 Timers in queue:\n\n» ${queueList.join("\n» ")}`);
      }
    } else if (args.length < 2) {
      message.reply("ℹ Usage guide -\n\n• /timer <duration (e.g., 1s, 1m, 1h)> <custom message>\n• /timer list (To see the timer queue list)");
    } else {
      const input = args[0].toLowerCase();
      const messageToSet = args.slice(1).join(' ');

      let duration = 0;
      let timeUnit = "";

      if (input.endsWith("s")) {
        duration = parseFloat(input);
        timeUnit = "second(s)";
      } else if (input.endsWith("m")) {
        duration = parseFloat(input);
        timeUnit = "minute(s)";
      } else if (input.endsWith("h")) {
        duration = parseFloat(input);
        timeUnit = "hour(s)";
      }

      if (isNaN(duration) || duration <= 0 || !messageToSet || !timeUnit) {
        message.reply("Usage: !timer <duration (e.g., 1s, 1m, 1h)> <custom message> or !timer list");
      } else {
        const seconds = duration * (timeUnit === "second(s)" ? 1 : timeUnit === "minute(s)" ? 60 : 3600);
        const id = event.senderID;
        const userData = await usersData.get(id);
        const name = userData.name;

        const timerInfo = {
          name: name,
          duration: duration,
          timeUnit: timeUnit,
          message: messageToSet
        };

        timersQueue.push(timerInfo);

        const timerMessage = `✅ Timer set for ${duration} ${timeUnit}`;
        const timerReply = await message.reply({
          body: timerMessage
        });

        setTimeout(() => {
          api.unsendMessage(timerReply.messageID);

          message.reply({
            mentions: [{ id: id, tag: name }],
            body: `${name}, ${messageToSet}`
          });

          const index = timersQueue.indexOf(timerInfo);
          if (index > -1) {
            timersQueue.splice(index, 1);
          }
        }, seconds * 1000);
      }
    }
  },
};
