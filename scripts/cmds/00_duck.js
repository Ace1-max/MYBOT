const moment = require("moment-timezone");

module.exports = {
    config: {
        name: "duck",
        aliases: ["dailyduck"], 
        version: "1.3",
        author: "AceGerome",
        countDown: 15,
        role: 0,
        description: {
            en: "Receive daily Duck gift"
        },
        category: "game",
        guide: {
            en: "   {pn}"
                + "\n   {pn} info: View Daily Duck gift information"
                + "\n   {pn} stats: View your Duck gift statistics"
        }, 
        envConfig: {
            duckReward: {
                baseCoin: 1000,
                festiveMultiplier: 2
            }
        }
    }, 

    langs: {
        en: {
            monday: "Monday",
            tuesday: "Tuesday",
            wednesday: "Wednesday",
            thursday: "Thursday",
            friday: "Friday",
            saturday: "Saturday",
            sunday: "Sunday",
            alreadyReceived: "Quack! You have already received the Duck gift today. Quack! 🦆",
            received: "Quack! You got %1 coins from the Duck gift. Now you have a total of %2 coins! Quack! 🦆",
            stats: "Quack! You have received the Duck gift %1 times this week. Your total Duck coins: %2.",
            festiveBonus: "🎉 Happy Holidays! You've received a festive bonus of %1 Duck coins! 🎉"
        }
    },

    onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
        const rewardConfig = envCommands[commandName].duckReward;
        const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
        const date = new Date();
        const currentDay = date.getDay();
        const { senderID } = event;

        const userData = await usersData.get(senderID);
        
        if (args[0] === "info") {
            let msg = "Duck Gift Rewards:\n";
            for (let i = 0; i < 7; i++) {
                const getCoin = Math.floor(rewardConfig.baseCoin * (1 + 0.20) ** i);
                const day = getLang(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"][i]);
                msg += `${day}: ${getCoin} Duck coins\n`;
            }
            return message.reply(msg);
        }

        if (args[0] === "stats") {
            const duckCount = userData.data.duckCount || 0;
            const totalCoins = userData.money || 0;
            return message.reply(getLang("stats", duckCount, totalCoins));
        }

        if (userData.data.duckReward === dateTime) {
            return message.reply(getLang("alreadyReceived"));
        }

        const isFestivePeriod = /* your condition for festive events here, e.g., holidays */;
        const festiveMultiplier = isFestivePeriod ? rewardConfig.festiveMultiplier : 1;
        const getCoin = Math.floor(rewardConfig.baseCoin * (1 + 0.20) ** (currentDay) * festiveMultiplier);

        userData.data.duckReward = dateTime;
        userData.data.duckCount = (userData.data.duckCount || 0) + 1;
        await usersData.set(senderID, {
            money: userData.money + getCoin,
            data: userData.data
        });

        let responseMessage = getLang("received", getCoin, userData.money + getCoin);
        if (isFestivePeriod) {
            responseMessage += `\n${getLang("festiveBonus", getCoin)}`;
        }
        message.reply(responseMessage);
    }
};
		
