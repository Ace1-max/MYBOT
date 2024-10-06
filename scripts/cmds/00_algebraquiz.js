module.exports = {
  config: {
    name: "algebraquiz",
    aliases: ["aq"], 
    version: "1.0.0",
    author: "Areil Violet",
    countDown: 10,
    role: 0,
    description: {
        en: "Multiply algebraic expressions to win $10k."
    }, 
    category: "Game", 
    guide: {
      en: "To use this command, type {pn} - To Play."
    } 
  },
  
  langs: {
      en: {
          showAnswer: "Wrong! ❌ The correct answer is %1. Better luck next time! 🍀 Try again!", 
          correct: "🎉 Congratulations! You won \n₱%1! 💵", 
          algebraQuiz: "%1\n━━━━━━━━━━━━━━━\nTime Limit: %2 seconds. ⏱\nReply this message to answer!"
      }
  }, 

  onReply: async function({ event, message, Reply, getLang, usersData }) {
    if (event.senderID !== Reply.author || Reply.type !== "reply") return;
    
    const prize = 1000000;
    const userReply = event.body.toLowerCase();
    const userData = await usersData.get(event.senderID);
    const correctAnswer = `${Reply.correctAnswer}`;
    
    if (userReply === correctAnswer.toString()) {
        await usersData.set(event.senderID, {
		     	money: userData.money + prize,
	     		data: userData.data
	     	});
	     	message.reply(getLang("correct", prize))
	     	message.unsend(Reply.messageID);
    } else {
        message.reply(getLang("showAnswer", correctAnswer));
        message.unsend(Reply.messageID);
    }
  },
    
  onStart: async function({ message, event, getLang }) {
    const { threadID, messageID } = event;
    const prize = 1000000;
    const timeLimit = 25; // 25 Seconds(s)

    try {
      const [question, correctAnswer] = generateAlgebraicQuestion();
      
      message.reply(getLang("algebraQuiz", question, timeLimit), async (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          type: "reply",
          commandName: this.config.name,
          author: event.senderID,
          messageID: info.messageID,
          correctAnswer,
        });
        
        setTimeout(() => {
            const replyData = global.GoatBot.onReply.get(info.messageID);
            if (replyData) {
              const { messageID } = replyData;
              global.GoatBot.onReply.delete(messageID);
              message.unsend(messageID);
            }
          }, timeLimit * 1000); //60 sec deleteee
      });
    } catch (error) {
      console.error("Error Occurred:", error);
      message.reply("[ERR]:", error);
    }
  }
};

function generateAlgebraicQuestion() {
  const min = 1;
  const max = 10;

  const num1 = getRandomNumber(min, max);
  const num2 = getRandomNumber(min, max);
  const variable = getRandomVariable();
  let exponent1, exponent2;

  do {
    exponent1 = getRandomExponent();
    exponent2 = getRandomExponent();
  } while (exponent1 === exponent2);

  const question = `${num1}${variable}^${exponent1} * (${num2}${variable}^${exponent2}) = ?`;
  const correctAnswer = num1 * num2;

  return [question, correctAnswer];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomVariable() {
  const variables = ['x', 'y'];
  const randomIndex = Math.floor(Math.random() * variables.length);
  return variables[randomIndex];
}

function getRandomExponent() {
  const exponents = ['2', '3', '4'];
  const randomIndex = Math.floor(Math.random() * exponents.length);
  return exponents[randomIndex];
}
