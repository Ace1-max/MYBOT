const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "duck",
		aliases: ["dailyduck"], 
		version: "1.2",
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
		}, 
		envConfig: {
			duckReward: {
				coin: 1000
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
			alreadyReceived: "Quack! You have already received the Duck gift. Quack! 🦆",
			received: "Quack! You got %1 coins from the duck Now. Quack! 🦆"
		}
	},

	onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
	  const reward = envCommands[commandName].duckReward;
		if (args[0] == "info") {
			let msg = "";
			for (let i = 1; i < 8; i++) {
				const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((i == 0 ? 7 : i) - 1));
				const day = i == 7 ? getLang("sunday") :
					i == 6 ? getLang("saturday") :
						i == 5 ? getLang("friday") :
							i == 4 ? getLang("thursday") :
								i == 3 ? getLang("wednesday") :
									i == 2 ? getLang("tuesday") :
										getLang("monday");
				msg += `${day}: ${getCoin} Duck coin\n`;
			}
			return message.reply(msg);
		}
		
		const dailyMoney = Math.floor(Math.random() * 1000) + 1;
		const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
		const date = new Date();
		const currentDay = date.getDay(); // 0: sunday, 1: monday, 2: tuesday, 3: wednesday, 4: thursday, 5: friday, 6: saturday
		const { senderID } = event;

		const userData = await usersData.get(senderID);
		if (userData.data.duckReward === dateTime)
			return message.reply(getLang("alreadyReceived"));

		const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((currentDay == 0 ? 7 : currentDay) - 1));
		userData.data.duckReward = dateTime;
		await usersData.set(senderID, {
			money: userData.money + getCoin,
			data: userData.data
		});
		message.reply(getLang("received", getCoin));
	}
};

