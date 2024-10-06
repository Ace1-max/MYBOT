const cards = [
  "A♥", "2♥", "3♥", "4♥", "5♥", "6♥", "7♥", "8♥", "9♥", "10♥", "J♥", "Q♥", "K♥",
  "A♠", "2♠", "3♠", "4♠", "5♠", "6♠", "7♠", "8♠", "9♠", "10♠", "J♠", "Q♠", "K♠",
  "A♦", "2♦", "3♦", "4♦", "5♦", "6♦", "7♦", "8♦", "9♦", "10♦", "J♦", "Q♦", "K♦",
  "A♣", "2♣", "3♣", "4♣", "5♣", "6♣", "7♣", "8♣", "9♣", "10♣", "J♣", "Q♣", "K♣"
];

const cardValues = {
  "A": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 10, "Q": 10, "K": 10
};

module.exports = {
  config: {
    name: "card",
    version: "1.1.0",
    author: "WaifuCat",
    countDown: 10,
    role: 0,
    description: {
      en: "Play a card game against the bot and bet money!"
    },
    category: "game",
    guide: {
      en: "{pn} <bet>"
    }
  },

  onStart: async function ({ message, args, usersData, event }) {
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply("Please enter a valid bet amount greater than zero.");
    }

    const userBalance = await usersData.getMoney(event.senderID);

    if (userBalance == null) {
      return message.reply("Unable to retrieve your balance.");
    }
    
    if (userBalance < amount) {
      return message.reply(`Insufficient funds. Your Balance: $${userBalance}`);
    }

    const userCards = drawCards(3);
    const botCards = drawCards(3);

    const userScore = calculateScore(userCards);
    const botScore = calculateScore(botCards);

    const result = determineResult(userScore, botScore);

    let winnings = 0;
    if (result === "Win") {
      winnings = amount * 2;
    } else if (result === "Lose") {
      winnings = -amount;
    }

    await usersData.addMoney(event.senderID, winnings);

    const userData = await usersData.get(event.senderID);
    let streak = userData.data.cardStreak || 0;

    if (result === "Win") {
      streak++;
      await handleWinStreak(event.senderID, usersData);
    } else if (result === "Lose") {
      streak = 0;
    }

    userData.data.cardStreak = streak;
    await usersData.set(event.senderID, { data: userData.data });

    const response = formatResponse(userCards, botCards, userScore, botScore, result, winnings, streak);
    message.reply(response);
  }
};

function drawCards(count) {
  return shuffleArray(cards).slice(0, count);
}

function calculateScore(cards) {
  let total = 0;
  let aces = 0;
  
  cards.forEach(card => {
    const value = cardValues[card.slice(0, -1)];
    total += value;
    if (card.startsWith("A")) aces++;
  });

  while (aces > 0 && total + 10 <= 21) {
    total += 10;
    aces--;
  }

  return total;
}

function determineResult(userScore, botScore) {
  if (userScore > 21) return "Lose";
  if (botScore > 21) return "Win";
  if (userScore > botScore) return "Win";
  if (userScore < botScore) return "Lose";
  return "Tie";
}

function formatResponse(userCards, botCards, userScore, botScore, result, winnings, streak) {
  const winMessage = winnings > 0 ? `― You Won $${winnings}! 💵` : winnings < 0 ? `― You Lost $${Math.abs(winnings)}. 💸` : "It's A Tie.";
  const streakMessage = streak > 0 ? `🔥 Current Win Streak: ${streak}` : "";
  return `🎴 Your Cards: ${userCards.join(", ")} - Total Score: ${userScore}\n🤖 Bot's Cards: ${botCards.join(", ")} - Total Score: ${botScore}\n\n📊 Result: ${result}\n━━━━━━━━━━━━━━━\n${winMessage}\n${streakMessage}`;
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function handleWinStreak(userID, usersData) {
  const userData = await usersData.get(userID);
  let streak = userData.data.cardStreak || 0;
  
  if (streak % 3 === 0) {
    const bonus = streak * 1000;
    await usersData.addMoney(userID, bonus);
    message.reply(`🎉 Streak Bonus! You have won ${streak} times in a row and received a bonus of $${bonus}!`);
  }

  await usersData.set(userID, { 
    data: userData.data
  });
}
