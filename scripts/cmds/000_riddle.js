const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "riddles",
    aliases: ['riddle'],
    version: "1.0",
    author: "AceGerome",
    countDown: 10,
    role: 0,
    description: {
      en: "Play a game of riddles"
    },
    category: "game",
    guide: {
      en: "{pn}"
    },
    envConfig: {
      reward: 1000
    }
  },

  langs: {
    en: {
      reply: "𝗤𝗨𝗘𝗦𝗧𝗜𝗢𝗡:\n%1\n\n𝗛𝗜𝗡𝗧: %2\n\n𝗧𝗜𝗠𝗘 𝗟𝗜𝗠𝗜𝗧: 60 seconds",
      notPlayer: "⚠️ You are not the player of this question",
      correct: "🎉 Congratulations! You have answered correctly and received %1$",
      wrong: "⚠️ You have answered incorrectly"
    }
  },

  onStart: async function ({ message, event, commandName, getLang }) {
    try {
      const apiKey = 'aiHcRUaxDWsFmAZjyavjVQ==ShD7d3yHY5yboJgB';
      const { data } = await axios.get('https://api.api-ninjas.com/v1/riddles', {
        headers: {
          'X-Api-Key': apiKey
        }
      });
      
      const { question, answer } = data[0];

      let hint = "";
      const words = answer.split(" ");
      if (words.length <= 2) {
        hint = scrambleLetters(answer);
      } else {
        hint = scrambleWords(words);
      }

      message.reply({
        body: getLang("reply", question, hint),
        attachment: []
      }, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          answer
        });

        setTimeout(() => {
          const replyData = global.GoatBot.onReply.get(info.messageID);
          if (replyData) {
            const { messageID } = replyData;
            global.GoatBot.onReply.delete(messageID);
            message.unsend(messageID);
          }
        }, 60000); 
      });
    } catch (error) {
      console.error("Error fetching riddle:", error);
      message.reply("An error occurred while fetching a riddle.");
    }
  },

  onReply: async ({ message, Reply, event, getLang, usersData, envCommands, commandName }) => {
    const { author, answer, messageID } = Reply;
    if (event.senderID != author) {
      return message.reply(getLang("notPlayer"));
    }

    const userAnswer = formatText(event.body);
    const correctAnswer = formatText(answer); 

    if (userAnswer === correctAnswer) { 
      global.GoatBot.onReply.delete(messageID);
      await usersData.addMoney(event.senderID, envCommands[commandName].reward);
      message.reply(getLang("correct", envCommands[commandName].reward));
    } else {
      message.reply(getLang("wrong"));
    }

    message.unsend(Reply.messageID);
  }
};

function formatText(text) {
  return text.normalize("NFD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đ|Đ]/g, (x) => x == "đ" ? "d" : "D");
}

function scrambleLetters(text) {
  return text.split('').sort(() => Math.random() - 0.5).join('');
}

function scrambleWords(words) {
  return words.sort(() => Math.random() - 0.5).join(' ');
}
