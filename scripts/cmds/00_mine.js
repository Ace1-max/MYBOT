const axios = require('axios');
const moment = require("moment-timezone");

const minerals = [
  { name: 'Coal', coinValue: getRandomValue(5000, 1000) },
  { name: 'Iron', coinValue: getRandomValue(1000, 5000) },
  { name: 'Bronze', coinValue: getRandomValue(5000, 10000) },
  { name: 'Silver', coinValue: getRandomValue(10000, 15000) },
  { name: 'Gold', coinValue: getRandomValue(1500, 20000) },
  { name: 'Diamond 💎', coinValue: getRandomValue(2000, 50000) },
  // Add more minerals here
];

function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomEvent() {
  const events = [
    { message: "You found a treasure chest!", multiplier: 2 },
    { message: "A cave-in occurs! No extra coins this time.", multiplier: 0 },
    { message: "You discover a rare gem!", multiplier: 3 }
  ];
  return events[Math.floor(Math.random() * events.length)];
}

module.exports = {
  config: {
    name: "mine",
    version: "1.1.0",
    author: "Dymyrius",
    countDown: 15,
    role: 0,
    description: {
        en: "Dig for minerals and earn coins!"
    }, 
    category: "game", 
    guide: {
      en: "{pn}"
    } 
  },

  onStart: async function({ message, args, usersData, event }) {
    const mineImage = await getImage();
    try {
      const targetID = event.senderID;
      const userData = await usersData.get(targetID);
      const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");

      if (userData.data.mineTime === dateTime) {
        return message.reply("You've already done your mining today! Come back tomorrow.");
      }

      let totalAmount = 0;
      let minedData = [];

      for (let i = 0; i < 3; i++) {
        const randomMineral = minerals[Math.floor(Math.random() * minerals.length)];
        const name = randomMineral.name;
        const coin = randomMineral.coinValue;

        totalAmount += coin;
        minedData.push({
          name: `Mineral: ${name}`,
          coin: ` ${coin.toLocaleString()} Coins`
        });
      }

      // Introduce random event
      const randomEvent = getRandomEvent();
      totalAmount *= randomEvent.multiplier;

      let replyMessage = `〔【 ⛏️ Mining Time ⛏️ 】〕\n`;
      for (const data of minedData) {
        replyMessage += `➡︎ ${data.name}: ${data.coin}\n\n`;
      }

      replyMessage += `💰 Total Coins earned: ${totalAmount.toLocaleString()} Coins 💰\n`;
      replyMessage += `${randomEvent.message}\n`; 

      await message.reply({
        body: replyMessage,
        attachment: mineImage
      });

      userData.data.mineTime = dateTime;
      userData.money += totalAmount;
      await usersData.set(targetID, userData);

    } catch (error) {
      console.error(error);
      message.reply("An error occurred while processing your request. Please try again.");
    }
  }
};

async function getImage() {
  const response = await axios.get("https://i.imgur.com/lFL3n0S.gif", { responseType: "stream" });
  return response.data;
}
