module.exports = {
  config: {
    name: "ht",
    version: "1.0",
    author: "JV Barcenas",
    countDown: 13,
    description: {
      en: "Heads or Tails game.",
    },
    category: "Game",
  },
  langs: {
    en: {
      invalid_choice: "Invalid choice! Use `head` or `tail` as your choice.",
      invalid_amount: "Enter a valid and positive amount to bet (maximum 9,999,999).",
      not_enough_money: "Check your balance if you have that amount.",
      flip_message: "Flipping the coin...",
      win_message: "Congratulations! You won $%1, bruh!",
      lose_message: "You lost $%1, stoopid.",
      flip_landed_on: "It landed on %1!",
    },
  },
  onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);

    const choice = args[0]?.toLowerCase();
    if (!["head", "tail"].includes(choice)) {
      return message.reply(getLang("invalid_choice"));
    }

    const betAmount = parseInt(args[1]);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > 9999999) {
      return message.reply(getLang("invalid_amount"));
    }

    if (betAmount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    const isHead = Math.random() < 0.5;
    const result = isHead ? "head" : "tail";

    const winnings = calculateWinnings(choice, result, betAmount);

    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    const messageText = getFlipResultMessage(result, winnings, getLang);

    return message.reply(messageText);
  },
};

function calculateWinnings(choice, result, betAmount) {
  if (choice === result) {
    return betAmount * 2; 
  } else {
    return -betAmount; 
  }
}

function getFlipResultMessage(result, winnings, getLang) {
  const landedOnMessage = getLang("flip_landed_on", result);

  if (winnings > 0) {
    return getLang("win_message", winnings) + ` ${landedOnMessage}`;
  } else {
    return getLang("lose_message", -winnings) + ` ${landedOnMessage}`;
  }
}
