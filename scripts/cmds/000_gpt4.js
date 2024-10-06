const axios = require("axios");

module.exports = {
  config: {
    name: "gpt4",
    version: "1.0",
    author: "SiAM",
    countDown: 15,
    role: 0,
    description: {
      en: "chatGPT with GPT 4 like model ( this is not the original gpt4 but its inspired from gpt4 model structure.."
    },
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡",
    guide: {
      en: "{pn} 'query'\nexample:\n{pn} hi there"
    }
  },
  onStart: async function ({ api, message, event, args, commandName }) {
    const userID = event.senderID;
    const query = encodeURIComponent(args.join(" ")); 


    if (!query) {
      message.reply("Please provide a query. \n\nExample: /gpt4 How does photosynthesis work?");
      return;
    }

    try {
      const response = await axios.get(`https://ai-chat-gpt-4-lite.onrender.com/api/hercai?question=${query}`);

      const answer = response.data.reply; 

      if (answer) {
        message.reply(
          {
            body: answer,
            attachment: ''
          },
          (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID
            });
          }
        );
      } else {
        console.error("Invalid API Response:", response.data);
        sendErrorMessage(message, "Server response is invalid ❌");
      }
    } catch (error) {
      console.error("Request Error:", error);
      sendErrorMessage(message, "Server not responding ❌");
    }
  },
  onReply: async function ({ message, event, Reply, args }) {
    let { author, commandName } = Reply;
    if (event.senderID !== author) return;
    const userID = author;
    const query = encodeURIComponent(args.join(" ")); 

    if (query.toLowerCase() === "clear") {
      global.GoatBot.onReply.delete(message.messageID);
      message.reply("Previous conversation has been cleared.");
      return;
    }

    try {
      const response = await axios.get(`https://ai-chat-gpt-4-lite.onrender.com/api/hercai?question=${query}`);

      const answer = response.data.reply; 

      if (answer) {
        message.reply(
          {
            body: answer,
            attachment: ''
          },
          (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID
            });
          }
        );
      } else {
        console.error("Invalid API Response:", response.data);
        sendErrorMessage(message, "Server response is invalid ❌");
      }
    } catch (error) {
      console.error("Request Error:", error);
      sendErrorMessage(message, "Server not responding ❌");
    }
  }
};

function sendErrorMessage(message, errorMessage) {
  message.reply({ body: errorMessage });
                    }
      
