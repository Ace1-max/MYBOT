module.exports = {
  config: {
    name: "report",
    version: "1.0.9",
    author: "jeka",
    countDown: 5,
    role: 2,
    description: {
      en: "Report an account."
    },
    category: "owner",
    guide: {
      en: "To use this command, type {pn} to send information. Then, reply to the message and follow the prompts."
    }
  },

  onReply: async function({ message, event, Reply, api, commandName, args }) {
    if (event.senderID != Reply.author) return;

    const handleReply = (message, caseNum, additionalData = {}) => {
      return api.sendMessage(message, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          ...Reply,
          ...additionalData,
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          Case: caseNum
        });
      });
    };

    switch (Reply.Case) {
      case 1:
        handleReply("Reply to this message with the real name of the Facebook person you want to report!", 2, { Link: args[0] });
        break;

      case 2:
        handleReply("Please reply with your Gmail to receive Facebook notifications!", 3, { Link: Reply.Link, RealName: event.body });
        break;

      case 3:
        handleReply("Please reply with what you want to report!", 4, { 
          Link: Reply.Link, 
          RealName: Reply.RealName, 
          Gmail: event.body 
        });
        break;

      case 4:
        handleReply("Please reply with the number of times you want to report the victim!", 5, {
          Link: Reply.Link, 
          RealName: Reply.RealName, 
          Gmail: Reply.Gmail, 
          Content: event.body 
        });
        break;

      case 5:
        const time = parseInt(event.body);
        if (isNaN(time) || time < 1 || time > 100) {
          const errorMsg = isNaN(time) ? "Invalid number! Please re-enter the report number!" :
                            time > 100 ? "Please enter no more than 100 times to report!" :
                            "Please enter a number no less than 1!";
          handleReply(errorMsg, 5, {
            Link: Reply.Link,
            RealName: Reply.RealName,
            Gmail: Reply.Gmail,
            Content: Reply.Content,
            Time: event.body
          });
        } else {
          handleReply(`You requested to report with the following information:\nReal Name: ${Reply.RealName}\nGmail: ${Reply.Gmail}\nContent: ${Reply.Content}\nReport number: ${time}`, 6, { Time: time });
        }
        break;

      case 6:
        if (event.body.toLowerCase() !== "ok") {
          handleReply("Please reply with 'ok' to confirm the report!", 6);
        } else {
          for (let i = 0; i < (Reply.Time || time); i++) {
            try {
              const DataRp = await api.Premium('ReportV1', {
                Link: Reply.Link,
                RealName: Reply.RealName,
                Content: Reply.Content,
                Gmail: Reply.Gmail
              });
              console.log(`${i + 1}/ Report ${DataRp}`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
              console.log(e);
              return api.sendMessage("An error occurred while reporting! [ERROR]\n" + e.message, event.threadID);
            }
          }
          return api.sendMessage(`Sent: ${Reply.Time || time} report(s) to ${Reply.RealName}!`, event.threadID);
        }
        break;
    }
  },

  onStart: async function({ api, event, client }) {
    return api.sendMessage("Please reply with the Facebook link of the person you want to report!", event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        Case: 1
      });
    });
  }
};