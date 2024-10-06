const axios = require('axios');
const { join } = require('path'); 
const fs = require('fs').promises;
const Decimal = require('decimal.js'); 

const PATH = join('bank.json'); 


module.exports = {
  config: {
    name: "bank",
    aliases: ["Abank"], 
    version: "0.0.1",
    author: "Dymyrius (Referenced from Waifucat and Ariel Violet) | AceGerome",
    countDown: 10,
    role: 0,
    description: {
      en: "Virtual Akira Bank!"
    }, 
    category: "game", 
    guide: {
      en: "{pn}"
    } 
  },
 
  langs: {
    en: {
      noaccount: "【 ℹ 】➜ You don't have an account yet!",
      haveaccount: "【 ℹ 】➜ You already have an account!",
      noname: "【 ⚠ 】➜ Please add your bank name.",
      success: "【 ℹ 】➜ Successful!",
      fail: "【 ⚠ 】➜ Failed!",
      error: "【 ⚠ 】➜ Error!, Please try again", 
      loanrequested: "【 ℹ 】➜ Loan request of %1 has been submitted for approval.",
      loanapproved: "【 ℹ 】➜ Loan request for %1 has been approved.",
      loandenied: "【 ℹ 】➜ Loan request for %1 has been denied.",
      loanlist: "━━【 Request Lists 】━━\n\n%1",
      nomoney: "【 ℹ 】➜ You don't have enough money!",
      menu: "【 🏦 ❰ 𝐀𝐊𝐈𝐑𝐀 𝐁𝐀𝐍𝐊 ❱ 🏦 】\n— Experience modern banking with a touch of sophistication. How may I assist you today in managing your account?\n\n𝗬𝗼𝘂𝗿 𝗢𝗽𝘁𝗶𝗼𝗻𝘀:\n1. /bank register/r <bankName> - Register a bank account. 🧑‍💼\n2. /bank withdraw/w <amount> - Withdraw money. 💸\n3. /bank deposit/d <amount> - Deposit money. 💵\n4. /bank rename <newName> - Rename account. 🪪\n5. /bank check/show - Info account.💳\n6. /bank loan <amount> - Request a loan for a free balance 💰\n━━━━━━━━━━━━━\n𝗠𝗼𝗱𝗲𝗿𝗮𝘁𝗼𝗿𝘀 𝗢𝗽𝘁𝗶𝗼𝗻𝘀:\n7. /bank grant <bankName/sender ID/index> - Grant a loan request. 💼\n8. /bank list - List pending loan requests. 📜\n9. /bank decline <bankName/index> - Decline loan request. 🗑\n━━━━━━━━━━━━━\nPlease select the service you require, and I'll be delighted to assist you further. 👨‍💼",
    }
  },

onStart: async function({ message, args, getLang, usersData, event }) {
  const botAdmins = global.GoatBot.config.adminBot;
  const targetID = event.senderID;
  const image = (await axios.get("https://i.imgur.com/a1Y3iHb.png", {
    responseType: "stream"
  })).data;
  const MAX_LOAN_AMOUNT = 5000000;
  const PATH = join('bank.json');
 
  if (args.length === 0) {
    message.reply({
      body: getLang("menu"),
      attachment: image
    });
    return;
  }

  let bankData = {};

  try {
    const data = await fs.readFile(PATH, 'utf-8');
    bankData = JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON file:', error);
  }
  
  if (args[0] === 'register' || args[0] === 'r') {
    const name = args.slice(1).join(' ');

    if (bankData[targetID]) {
      message.reply(getLang("haveaccount"));
    } else if (!name) {
      message.reply(getLang("noname"));
    } else {
      bankData[targetID] = { name, coin: 0 };
      try {
        await fs.writeFile(PATH, JSON.stringify(bankData, null, 2), 'utf-8');
        message.reply(getLang("success"));
      } catch (error) {
        console.error('Error writing to JSON file:', error);
        message.reply(error.message);
      }
    }
  }

  else if (args[0] === 'withdraw' || args[0] === 'w') {
    const coinArg = args[1];

    if (!bankData[targetID]) {
      message.reply(getLang("noaccount"));
    } else if (!coinArg) {
      message.reply(getLang("error"));
    } else if (coinArg.toLowerCase() === 'all') {
      const userBalance = bankData[targetID].coin;
      const withdrawAmount = userBalance;

      if (withdrawAmount <= 0) {
        message.reply(getLang("nomoney"));
      } else {
        bankData[targetID].coin -= withdrawAmount;
        try {
          await fs.writeFile(PATH, JSON.stringify(bankData, null, 2), 'utf-8');
          await usersData.addMoney(targetID, withdrawAmount);
          message.reply(getLang("success"));
        } catch (error) {
          console.error('Error writing to JSON file:', error);
          message.reply(error.message);
        }
      }
    } else {
      const coin = parseFloat(coinArg);

      if (isNaN(coin) || coin <= 0) {
        message.reply(getLang("error"));
      } else if (bankData[targetID].coin < coin) {
        message.reply(getLang("nomoney"));
      } else {
        bankData[targetID].coin -= coin;
        try {
          await fs.writeFile(PATH, JSON.stringify(bankData, null, 2), 'utf-8');
          await usersData.addMoney(targetID, coin);
          message.reply(getLang("success"));
        } catch (error) {
          console.error('Error writing to JSON file:', error);
          message.reply(error.message);
        }
      }
    }
  }

  else if (args[0] === 'deposit' || args[0] === 'd') {
    const coinArg = args[1];
  
    if (!bankData[targetID]) {
      message.reply(getLang("noaccount"));
    } else if (!coinArg) {
      message.reply(getLang("error"));
    } else if (coinArg.toLowerCase() === 'all') {
      const userMoney = await usersData.getMoney(targetID);
  
      if (userMoney <= 0) {
        message.reply(getLang("nomoney"));
      } else {
        const depositAmount = userMoney;
  
        bankData[targetID].coin += depositAmount;
        try {
          await fs.writeFile(PATH, JSON.stringify(bankData, null, 2), 'utf-8');
          await usersData.subtractMoney(targetID, depositAmount);
          message.reply(getLang("success"));
        } catch (error) {
          console.error('Error writing to JSON file:', error);
          message.reply(error.message);
        }
      }
    } else if (!/^\d+(\.\d+)?$/.test(coinArg)) {
      message.reply("【 ℹ 】➜ Please enter a valid amount!");
    } else {
      const coin = parseFloat(coinArg);
  
      if (coin <= 0) {
        message.reply("【 ℹ 】➜ Please enter a valid amount!");
      } else {
        const userMoney = await usersData.getMoney(targetID);
  
        if (coin > userMoney) {
          message.reply(getLang("nomoney"));
        } else {
          bankData[targetID].coin += coin;
          try {
            await fs.writeFile(PATH, JSON.stringify(bankData, null, 2), 'utf-8');
            await usersData.subtractMoney(targetID, coin);
            message.reply(getLang("success"));
          } catch (error) {
            console.error('Error writing to JSON file:', error);
            message.reply(error.message);
          }
        }
      }
    }
  }

  else if (args[0] === 'rename') {
    const name = args.slice(1).join(' ');
    
    if (!bankData[targetID]) {
      message.reply(getLang("noaccount"));
    } else {
      bankData[targetID].name = name;
      try {
        await fs.writeFile(PATH, JSON.stringify(bankData, null, 2), 'utf-8');
        message.reply(getLang("success"));
      } catch (error) {
        console.error('Error writing to JSON file:', error);
        message.reply(error.message);
      }
    }
  }

  else if (args[0] === 'check' || args[0] === 'c') {
    if (bankData[targetID]) {
      const { name, coin } = bankData[targetID];
      
      const ownerBank = await usersData.getName(targetID);

      const balance = new Decimal(coin);

      const formattedBalance = balance.toDecimalPlaces(2).toString();

      message.reply(`━━━【 𝗕𝗮𝗻𝗸 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 】━━━\n👤 | 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗢𝘄𝗻𝗲𝗿: ${ownerBank}\n🏦 | 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗡𝗮𝗺𝗲: ${name}\n💰 | 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: ₱${formattedBalance}\n━━━━━━━━━━━━━━━━`);

    } else {
      message.reply(getLang("noaccount"));
    }
  }

  else if (args[0] === 'loan') {
    const loanAmountArg = args[1];

    if (!bankData[targetID]) {
      message.reply(getLang("noaccount"));
    } else if (!loanAmountArg || isNaN(loanAmountArg) || parseFloat(loanAmountArg) <= 0) {
      message.reply(getLang("error"));
    } else {
      const loanAmount = parseFloat(loanAmountArg);

      if (loanAmount > MAX_LOAN_AMOUNT) {
        message.reply(`【 ℹ 】➜ Loan request exceeds the maximum allowed amount of ₱${MAX_LOAN_AMOUNT.toLocaleString()}.`);
      } else {
        bankData[targetID].loanRequest = loanAmount;
        try {
          await fs.writeFile(PATH, JSON.stringify(bankData, null, 2), 'utf-8');
          const formattedLoanAmount = parseFloat(loanAmountArg).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          });
          const loanAmount = `₱${formattedLoanAmount}`;
          message.reply(getLang("loanrequested", loanAmount));

        } catch (error) {
          console.error('Error writing to JSON file:', error);
          message.reply(error.message);
        }
      }
    }
  }

  else if (args[0] === 'grant' && botAdmins.includes(event.senderID)) {
    const arg2 = args[1];
  
    if (arg2 && arg2.toLowerCase() === 'all') {
      const grantedUsers = [];
  
      for (const [userID, userData] of Object.entries(bankData)) {
        if (userData.loanRequest > 0) {
          userData.coin += userData.loanRequest;
          userData.loanRequest = 0;
          grantedUsers.push(userID);
        }
      }
  
      if (grantedUsers.length > 0) {
        try {
          await fs.writeFile(PATH, JSON.stringify(bankData, null, 2), 'utf-8');
          message.reply(`【 ℹ 】➜ Loans granted for all users with pending requests.`);
        } catch (error) {
          console.error('Error writing to JSON file:', error);
          message.reply(error.message);
        }
      } else {
        message.reply(`【 ℹ 】➜ No users have pending loan requests.`);
      }
    } else if (!isNaN(arg2) && arg2 > 0) {
      const index = parseInt(arg2) - 1; 
      
      const usersWithLoanRequests = Object.values(bankData).filter((user) => user.loanRequest > 0);
  
      if (index < 0 || index >= usersWithLoanRequests.length) {
        message.reply(`【 ℹ 】➜ Invalid index. Please provide a valid index from the list.`);
      } else {
        const loanUser = usersWithLoanRequests[index];
        const bankName = loanUser.name;
  
        loanUser.coin += loanUser.loanRequest;
        loanUser.loanRequest = 0;
        try {
          await fs.writeFile(PATH, JSON.stringify(bankData, null, 2), 'utf-8');
          message.reply(getLang("loanapproved", bankName));
        } catch (error) {
          console.error('Error writing to JSON file:', error);
          message.reply(error.message);
        }
      }
    } else {
      const bankName = args.slice(1).join(' ');
      const loanUser = Object.values(bankData).find((user) => user.name === bankName && user.loanRequest > 0);
  
      if (!loanUser) {
        message.reply(`【 ℹ 】➜ No loan request from ${bankName}.`);
      } else {
        loanUser.coin += loanUser.loanRequest;
        loanUser.loanRequest = 0;
        try {
          await fs.writeFile(PATH, JSON.stringify(bankData, null, 2), 'utf-8');
          message.reply(getLang("loanapproved", bankName));
        } catch (error) {
          console.error('Error writing to JSON file:', error);
          message.reply(error.message);
        }
      }
    }
  }

  else if (args[0] === 'list') {
    if (!botAdmins.includes(targetID)) {
      return message.reply(getLang("error"));
    }
  
    const loanRequests = Object.entries(bankData)
      .filter(([_, account]) => account.loanRequest)
      .map(([id, account], index) => `${index + 1}. ${account.name} (ID: ${id}): ${account.loanRequest}`)
      .join('\n');

    if (!loanRequests) {
      message.reply('【 ℹ 】➜ No loan requests found.');
    } else {
      message.reply(getLang("loanlist", loanRequests));
    }
  }

  else if (args[0] === 'decline' && botAdmins.includes(event.senderID)) {
    const arg2 = args[1];
  
    if (arg2 === 'all') {
      const pendingRequestsExist = Object.values(bankData).some((user) => user.loanRequest > 0);
  
      if (pendingRequestsExist) {
        for (const userID in bankData) {
          bankData[userID].loanRequest = 0;
        }
  
        try {
          await fs.writeFile(PATH, JSON.stringify(bankData, null, 2), 'utf-8');
          message.reply(`【 ℹ 】➜ All pending loan requests have been removed.`);
        } catch (error) {
          console.error('Error writing to JSON file:', error);
          message.reply(error.message);
        }
      } else {
        message.reply(`【 ℹ 】➜ No pending loan requests.`);
      }
    } else if (!isNaN(arg2) && arg2 > 0) {
      const index = parseInt(arg2) - 1; 
      
      const usersWithLoanRequests = Object.values(bankData).filter((user) => user.loanRequest > 0);
  
      if (index < 0 || index >= usersWithLoanRequests.length) {
        message.reply(`【 ℹ 】➜ Invalid index. Please provide a valid index from the list.`);
      } else {
        const loanUser = usersWithLoanRequests[index];
        const bankName = loanUser.name;
  
        loanUser.loanRequest = 0;
        try {
          await fs.writeFile(PATH, JSON.stringify(bankData, null, 2), 'utf-8');
          message.reply(`【 ℹ 】➜ Loan request from ${bankName} has been removed.`);
        } catch (error) {
          console.error('Error writing to JSON file:', error);
          message.reply(error.message);
        }
      }
    } else {
      const bankName = args.slice(1).join(' ');
      const loanUser = Object.values(bankData).find((user) => user.name === bankName && user.loanRequest > 0);
  
      if (!loanUser) {
        message.reply(`【 ℹ 】➜ No pending loan request from ${bankName}.`);
      } else {
        loanUser.loanRequest = 0;
        try {
          await fs.writeFile(PATH, JSON.stringify(bankData, null, 2), 'utf-8');
          message.reply(`【 ℹ 】➜ Loan request from ${bankName} has been removed.`);
        } catch (error) {
          console.error('Error writing to JSON file:', error);
          message.reply(error.message);
        }
      }
    }
  }

  else {
    message.reply(getLang("menu"));
   }
 }
}