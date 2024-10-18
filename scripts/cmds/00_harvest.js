const axios = require("axios");
const moment = require("moment-timezone");

const vegetables = [
  { name: 'Carrot', coinValue: getRandomValue(5000, 10000), emoji: '🥕' },
  { name: 'Tomato', coinValue: getRandomValue(7000, 12000), emoji: '🍅' },
  { name: 'Broccoli', coinValue: getRandomValue(8000, 15000), emoji: '🥦' },
  { name: 'Spinach', coinValue: getRandomValue(6000, 11000), emoji: '🍃' },
  { name: 'Pepper', coinValue: getRandomValue(9000, 16000), emoji: '🌶️' },
  { name: 'Cucumber', coinValue: getRandomValue(4000, 9000), emoji: '🥒' },
  { name: 'Zucchini', coinValue: getRandomValue(6000, 11000), emoji: '🥒' },
  { name: 'Lettuce', coinValue: getRandomValue(5000, 10000), emoji: '🥬' },
  { name: 'Onion', coinValue: getRandomValue(3000, 7000), emoji: '🧅' },
  { name: 'Potato', coinValue: getRandomValue(6000, 12000), emoji: '🥔' },
  { name: 'Eggplant', coinValue: getRandomValue(7000, 13000), emoji: '🍆' },
  { name: 'Corn', coinValue: getRandomValue(4000, 9000), emoji: '🌽' },
  { name: 'Radish', coinValue: getRandomValue(4000, 8000), emoji: '🌶️' },
  { name: 'Cabbage', coinValue: getRandomValue(7000, 13000), emoji: '🥬' },
  { name: 'Artichoke', coinValue: getRandomValue(8000, 15000), emoji: '🌿' },
  { name: 'Mushroom', coinValue: getRandomValue(5000, 10000), emoji: '🍄' },
  { name: 'Beetroot', coinValue: getRandomValue(6000, 11000), emoji: '🍠' },
];

const MAX_STORAGE = 30;
const UPGRADE_COOLDOWN = 60 * 60 * 1000;
const UPGRADE_COST = 5000;
const REPLANT_TIME = 220 * 60 * 1000; 

function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  config: {
    name: "harvest",
    version: "2.2",
    author: "AceGerome",
    countDown: 10,
    role: 0,
    description: {
      en: "Harvest vegetables and earn coins!"
    },
    category: "game",
    guide: {
      en: "{pn} [total | upgrade | check]"
    }
  },

  onStart: async function ({ message, args, usersData, event }) {
    const targetID = event.senderID;
    const userData = await usersData.get(targetID);

    if (!userData.data.storage) {
      userData.data.storage = MAX_STORAGE;
      userData.data.crops = 0;
    }

    const command = args[0];
    switch (command) {
      case "total":
        return await this.showTotalCrops({ message, userData });
      case "upgrade":
        return await this.upgradeStorage({ message, usersData, userData, targetID });
      case "check":
        return await this.showHarvestSummary({ message, userData });
      default:
        return await this.harvestCrops({ message, usersData, userData, targetID });
    }
  },

  async showTotalCrops({ message, userData }) {
    let total = userData.data.crops || 0;
    let replyMessage = `🌾 𝙷𝚊𝚛𝚟𝚎𝚜𝚝\n▱▱▱▱▱▱▱▱▱▱▱▱▱\n📝 𝗧𝗼𝘁𝗮𝗹 𝗖𝗿𝗼𝗽𝘀 𝗛𝗮𝗿𝘃𝗲𝘀𝘁𝗲𝗱:\n\n`;

    const cropSummary = vegetables.map(veg => `• ${veg.emoji} ${veg.name}: ${userData.data[veg.name.toLowerCase()] || 0}`).join("\n");

    replyMessage += `${cropSummary}\n\n𝗧𝗼𝘁𝗮𝗹: ${total}`;
    message.reply(replyMessage);
  },

  async upgradeStorage({ message, usersData, userData, targetID }) {
    const currentTime = Date.now();

    if (!userData.data.upgradeTime) {
      userData.data.upgradeTime = 0;
    }

    const timeSinceLastUpgrade = currentTime - userData.data.upgradeTime;

    if (timeSinceLastUpgrade < UPGRADE_COOLDOWN) {
      const remainingTime = Math.ceil((UPGRADE_COOLDOWN - timeSinceLastUpgrade) / 60000); 
      return message.reply(`⏳ You need to wait ${remainingTime} minutes before upgrading again.`);
    }

    if (userData.money < UPGRADE_COST) {
      return message.reply(`You need ${UPGRADE_COST}$ to upgrade your storage.`);
    }

    userData.data.storage += 10;
    userData.money -= UPGRADE_COST;
    userData.data.upgradeTime = currentTime; 
  
    await usersData.set(targetID, userData);

    message.reply(`🗃 Storage upgraded! New capacity: ${userData.data.storage}.`);
  }, 


  async showHarvestSummary({ message, userData }) {
    let replyMessage = `🌾 𝙷𝚊𝚛𝚟𝚎𝚜𝚝\n▱▱▱▱▱▱▱▱▱▱▱▱▱\n📝 𝗛𝗮𝗿𝘃𝗲𝘀𝘁 𝗦𝘂𝗺𝗺𝗮𝗿𝘆:\n`;

    let totalCoins = 0;
    let cropsHarvested = 0;

    for (let veg of vegetables) {
      const cropName = veg.name.toLowerCase();
      const harvestedAmount = userData.data[cropName] || 0;
      if (harvestedAmount > 0) {
        totalCoins += harvestedAmount * veg.coinValue;
        cropsHarvested++;
        replyMessage += `• ${veg.emoji} ${harvestedAmount} ${veg.name}(s) sold for ${veg.coinValue}$ each, total: ${harvestedAmount * veg.coinValue}$\n`;
      }
    }

    replyMessage += `\nHarvested ${cropsHarvested} type(s) of crops.\n🗃 Storage: ${userData.data.storage}/${userData.data.storage}\n𝗧𝗼𝘁𝗮𝗹 𝗲𝗮𝗿𝗻𝗶𝗻𝗴𝘀: ${totalCoins}$`;

    message.reply(replyMessage);
  },

  async harvestCrops({ message, usersData, userData, targetID }) {
    const currentTime = moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");

    const lastHarvestTime = userData.data.harvestTime || 0;
    const replantTimeRemaining = lastHarvestTime + REPLANT_TIME - Date.now();

    if (replantTimeRemaining > 0) {
      return message.reply(`⏳ You need to wait ${Math.ceil(replantTimeRemaining / 60000)} minutes to replant and harvest again.`);
    }

    const maxCrops = userData.data.storage;
    let harvestedData = [];
    let totalCoins = 0;
    let storedCrops = userData.data.crops || 0;

    for (let i = 0; i < 3; i++) {
      const randomVegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
      const { name, coinValue, emoji } = randomVegetable;

      if (storedCrops >= maxCrops) {
        harvestedData.push({ name: `${emoji} ${name}`, failed: true });
        continue;
      }

      const amountHarvested = Math.min(getRandomValue(1, 10), maxCrops - storedCrops);
      storedCrops += amountHarvested;
      totalCoins += amountHarvested * coinValue;

      userData.data[name.toLowerCase()] = (userData.data[name.toLowerCase()] || 0) + amountHarvested;
      harvestedData.push({ name: `${emoji} ${name}`, amountHarvested, coinValue });
    }

    let replyMessage = `〔 🌾 【  Harvest Time 】🌾〕\n\n`;
    let failedCrops = 0;

    for (let crop of harvestedData) {
      if (crop.failed) {
        replyMessage += `🥲 Failed harvesting ${crop.name} due to full storage.\n`;
        failedCrops++;
      } else {
        replyMessage += `• ${crop.amountHarvested} ${crop.name}(s) sold for ${crop.coinValue}$ each.\n`;
      }
    }

    if (failedCrops === 0) {
      replyMessage += `Successfully harvested all crops.\n`;
    }

    replyMessage += `🗃 Storage: ${storedCrops}/${maxCrops}\n𝗧𝗼𝘁𝗮𝗹 𝗲𝗮𝗿𝗻𝗶𝗻𝗴𝘀: ${totalCoins}$`;

    userData.data.crops = storedCrops;
    userData.data.harvestTime = Date.now();
    await usersData.set(targetID, {
      money: userData.money + totalCoins,
      data: userData.data
    });

    message.reply(replyMessage + `\n\n🌱 Replanting seeds now, come back in 220 minutes to harvest again!`);
  }
};
