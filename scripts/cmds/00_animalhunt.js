     const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "animalhunt",
    version: "3.2.1",
    author: "AceGerome",
    countDown: 10,
    role: 0,
    description: {
      en: "Embark on an animal hunting adventure. Collect rare animals and treasures. Compete for the best collection!"
    },
    category: "Game",
    guide: {
      en: "{pn} <bet_amount>\n{pn} collection - View your collected animals\n{pn} leaderboard - View the top animal hunters"
    }
  },

  langs: {  
    en: {
      animalhuntUserNoData: "Your data is not ready yet.",
      animalhuntNotEnoughMoney: "Not enough money.",
      animalhuntMinMoney: "Minimum bet is %1. 💵",
      animalhuntFail: "You didn't find any animals or treasures. Better luck next time!",
      animalhuntSuccessAnimal: "You hunted down a %1 (%2) worth %3! 💵",
      animalhuntSuccessTreasure: "You discovered a treasure chest worth $50,000! 💰",
      animalhuntCollectedAnimal: "You added a %1 to your collection! 🦁",
      animalhuntRareFind: "🎉 You found a rare animal: %1 (%2) worth %3! 🏆",
      error: "Please provide a valid bet amount to start.",
      animalhuntCooldown: "You need to wait %1 minutes before you can hunt again.",
      animalhuntDailyLimit: "You've reached your daily hunt limit. Come back tomorrow!",
      animalhuntNoCollection: "You don't have any animals in your collection yet.",
      leaderboardHeader: "🏆 Animal Hunt Leaderboard 🏆",
      leaderboardEmpty: "No one has hunted any animals yet!"
    }
  }, 

  huntCooldown: 30 * 60 * 1000, 
  maxHuntsPerDay: 5,

  onStart: async function({ message, args, getLang, usersData, event }) { 
    const command = args[0]?.toLowerCase(); 
    
    if (command === "collection") {
      return this.onCollectionView({ message, usersData, event });
    }

    if (command === "leaderboard") {
      return this.onLeaderboardView({ message, usersData });
    }

    const bet = parseInt(command); 
    const minBet = 200;
    const rareAnimalChance = 0.05;
    const now = Date.now();
    const currentDate = moment().format("DD/MM/YYYY");

    if (isNaN(bet) || bet <= 0) {
      return message.reply(getLang("error"));
    }

    try {
      const userData = await usersData.get(event.senderID);
      if (!userData) return message.reply(getLang("animalhuntUserNoData"));
      
      const animalHuntData = userData.data.animalHuntData || {};
      
      if (!animalHuntData.lastHuntTime) animalHuntData.lastHuntTime = 0;
      if (!animalHuntData.dailyHunts) animalHuntData.dailyHunts = 0;
      if (!animalHuntData.lastHuntDate || animalHuntData.lastHuntDate !== currentDate) {
        animalHuntData.dailyHunts = 0;
        animalHuntData.lastHuntDate = currentDate;
      }

      if (animalHuntData.dailyHunts >= this.maxHuntsPerDay) {
        return message.reply(getLang("animalhuntDailyLimit"));
      }

      const timeSinceLastHunt = now - animalHuntData.lastHuntTime;
      if (timeSinceLastHunt < this.huntCooldown) {
        const remainingTime = Math.ceil((this.huntCooldown - timeSinceLastHunt) / 60000);
        return message.reply(getLang("animalhuntCooldown", remainingTime));
      }

      if (userData.money < bet) return message.reply(getLang("animalhuntNotEnoughMoney"));
      if (bet < minBet) return message.reply(getLang("animalhuntMinMoney", minBet));

      await usersData.set(event.senderID, {
        money: userData.money - bet,
        data: {
          ...userData.data,
          animalHuntData
        },
      });

      const huntSuccessful = Math.random() < 0.6;
      if (huntSuccessful) {
        const isTreasureFound = Math.random() < 0.1;
        if (isTreasureFound) {
          await usersData.set(event.senderID, {
            money: userData.money + 50000,
            data: {
              ...userData.data,
              animalHuntData
            },
          });
          message.reply(getLang("animalhuntSuccessTreasure"));
        } else {
          const minAnimalValue = 800;
          const maxAnimalValue = 10000;

          const animals = [
            { emoji: "🐂", name: "Wild Bull", rare: false },
            { emoji: "🐍", name: "King Cobra", rare: false },
            { emoji: "🐕‍🦺", name: "Guard Dog", rare: false },
            { emoji: "🦓", name: "Zebra", rare: false },
            { emoji: "🦜", name: "Parrot", rare: false },
            { emoji: "🐅", name: "Bengal Tiger", rare: true },
            { emoji: "🦔", name: "Hedgehog", rare: false },
            { emoji: "🦘", name: "Kangaroo", rare: false },
            { emoji: "🦧", name: "Orangutan", rare: false },
            { emoji: "🦏", name: "Rhinoceros", rare: true },
            { emoji: "🐆", name: "Leopard", rare: true },
            { emoji: "🦛", name: "Hippopotamus", rare: false }
          ];

          const animal = animals[Math.floor(Math.random() * animals.length)];
          const animalValue = Math.floor(Math.random() * (maxAnimalValue - minAnimalValue + 1)) + minAnimalValue;

          if (animal.rare && Math.random() < rareAnimalChance) {
            await usersData.set(event.senderID, {
              money: userData.money + animalValue,
              data: {
                ...userData.data,
                animalHuntData
              },
            });
            message.reply(getLang("animalhuntRareFind", animal.emoji, animal.name, animalValue.toString()));
          } else {
            await usersData.set(event.senderID, {
              money: userData.money + animalValue,
              data: {
                ...userData.data,
                animalHuntData
              },
            });
            message.reply(getLang("animalhuntSuccessAnimal", animal.emoji, animal.name, animalValue.toString()));
          }

          if (!animalHuntData.collection) animalHuntData.collection = [];
          if (!animalHuntData.collection.find(a => a.name === animal.name)) {
            animalHuntData.collection.push({ name: animal.name, value: animalValue });
            await usersData.set(event.senderID, {
              data: {
                ...userData.data,
                animalHuntData
              }
            });
            message.reply(getLang("animalhuntCollectedAnimal", animal.name));
          }
        }
      } else {
        message.reply(getLang("animalhuntFail"));
      }

      animalHuntData.lastHuntTime = now;
      animalHuntData.dailyHunts += 1;
      await usersData.set(event.senderID, {
        data: {
          ...userData.data,
          animalHuntData
        }
      });

    } catch (error) {
      console.error(error);
      return message.reply(getLang("error"));
    }
  },

  onCollectionView: async function({ message, usersData, event }) {
    const userData = await usersData.get(event.senderID);
    const animalHuntData = userData.data.animalHuntData || {};
    
    if (!animalHuntData.collection || animalHuntData.collection.length === 0) {
      return message.reply("You don't have any animals in your collection yet.");
    }
    
    const collection = animalHuntData.collection.map(animal => `• ${animal.name} (Value: ${animal.value}$)`).join("\n");
    message.reply(`🦁 Your animal collection:\n${collection}`);
  },

  onLeaderboardView: async function({ message, usersData }) {
    const allUsers = await usersData.getAll();
    const leaderboard = [];

    allUsers.forEach(user => {
      const animalHuntData = user.data.animalHuntData;
      if (animalHuntData && animalHuntData.collection && animalHuntData.collection.length > 0) {
        const totalValue = animalHuntData.collection.reduce((sum, animal) => sum + animal.value, 0);
        leaderboard.push({ userID: user.id, totalValue });
      }
    });

    if (leaderboard.length === 0) {
      return message.reply(getLang("leaderboardEmpty"));
    }

    leaderboard.sort((a, b) => b.totalValue - a.totalValue);
    const top10 = leaderboard.slice(0, 10);

    const leaderboardText = top10.map((entry, index) => {
      const user = allUsers.find(u => u.id === entry.userID);
      return `${index + 1}. ${user.name} - Total Animal Value: ${entry.totalValue}$`;
    }).join("\n");

    message.reply(`🏆 Animal Hunt Leaderboard 🏆\n\n${leaderboardText}`);
  }
};
              
