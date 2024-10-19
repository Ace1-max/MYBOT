const axios = require('axios');
const moment = require("moment-timezone");

const recyclableMaterials = [
  { name: 'Phoenix Feather', emoji: '🔥', rarity: 'legendary' },
  { name: 'Fairy Wings', emoji: '🍯', rarity: 'epic' },
  { name: 'Ancient Relic', emoji: '🏺', rarity: 'rare' },
  { name: 'Mystic Scroll', emoji: '📜', rarity: 'rare' },
  { name: 'Enchanted Sword', emoji: '⚔️', rarity: 'rare' },
  { name: 'Mermaid Pearl', emoji: '🧜‍♀️', rarity: 'common' },
  { name: 'Crystal Orb', emoji: '🔮', rarity: 'common' },
  { name: 'Emerald Idol', emoji: '🌿', rarity: 'uncommon' },
  { name: 'Golden Crown', emoji: '👑', rarity: 'uncommon' },
  { name: 'Jeweled', emoji: '💎', rarity: 'epic' },
  { name: 'Compass', emoji: '🧭', rarity: 'common' },
];

function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCoinValue(material) {
  switch (material.rarity) {
    case 'legendary':
      return getRandomValue(10000, 50000);
    case 'epic':
      return getRandomValue(5000, 30000);
    case 'rare':
      return getRandomValue(3000, 20000);
    case 'uncommon':
      return getRandomValue(1000, 15000);
    default:
      return getRandomValue(500, 10000);
  }
}

module.exports = {
  config: {
    name: "explore",
    version: "1.1.0",
    author: "Margaux",
    countDown: 15,
    role: 0,
    description: {
      en: "Explore a virtual world to find hidden treasures and earn rewards!"
    },
    category: "game",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, args, usersData, event }) {
    const collectImage = (await axios.get("https://i.imgur.com/U8ICtpE.jpeg", { responseType: "stream" })).data;

    try {
      const targetID = event.senderID;
      const userData = await usersData.get(targetID);
      let totalAmount = 0;
      let collectedData = [];
      const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");

      if (userData.data.exploreTime === dateTime) {
        return message.reply("You've already explored today. Try again tomorrow!");
      }

      for (let i = 0; i < 3; i++) {
        const randomMaterial = recyclableMaterials[Math.floor(Math.random() * recyclableMaterials.length)];
        const coin = getCoinValue(randomMaterial);
        totalAmount += coin;

        collectedData.push({
          name: `𝗠𝗮𝘁𝗲𝗿𝗶𝗮𝗹𝘀: ${randomMaterial.emoji} ${randomMaterial.name}`,
          coin: ` ${coin.toLocaleString()} 𝗖𝗼𝗶𝗻𝘀`,
          rarity: randomMaterial.rarity,
        });
      }

      let replyMessage = `❛ ━❪ 𝗬𝗼𝘂 𝗳𝗼𝘂𝗻𝗱 𝘁𝗿𝗲𝗮𝘀𝘂𝗿𝗲𝘀! 🗺️ ❫━ ❜\n`;
      for (const data of collectedData) {
        replyMessage += `➡︎ ${data.name} (Rarity: ${data.rarity}): ${data.coin}\n\n`;
      }

      replyMessage += `💰Total coins earned: ${totalAmount.toLocaleString()} coins 💰`;

      message.reply({
        body: replyMessage,
        attachment: collectImage,
      });

      userData.data.exploreTime = dateTime;

      if (!userData.data.exploreData) {
        userData.data.exploreData = {
          totalExplorations: 0,
          materialsFound: [],
        };
      }
      
      userData.data.exploreData.totalExplorations += 1;
      collectedData.forEach((item) => {
        userData.data.exploreData.materialsFound.push({
          name: item.name,
          coin: item.coin,
          rarity: item.rarity,
          date: dateTime,
        });
      });

      await usersData.set(targetID, {
        money: userData.money + totalAmount,
        data: userData.data,
      });

    } catch (error) {
      console.error(error);
      message.reply('An error occurred while collecting recyclable materials: ' + error.message);
    }
  },
};
   
