const axios = require("axios");

module.exports = {
	config: {
		name: 'blackbox',
		version: '2.1.1',
		author: 'KENLIEPLAYS',
		countDown: 5,
		role: 0,
		description: {
			en: 'Ask Blackbox anything.'
		},
		category: '𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡',
		guide: {
			en: '{pn} <word>: Ask with Blackbox\nExample: {pn} hi'
		}
	},

	langs: {
		en: {
			waiting: 'Please wait...',
			error: 'There was an error. Please contact Kenlie Navacilla Jugarap if this issue persists.'
		}
	},

	onStart: async function ({ args, message, getLang }) {
		const query = args.join(" ").trim();
		if (!query) {
			return message.reply("Please provide a query to ask Blackbox.");
		}

		message.reply(getLang("waiting"));

		try {
			const responseMessage = await getMessage(query);
			const cleanedMessage = responseMessage.replace("\n\nIs this answer helpful to you? Kindly click the link below\nhttps:\/\/click2donate.kenliejugarap.com\n(Clicking the link and clicking any ads or button and wait for 30 seconds (3 times) everyday is a big donation and help to us to maintain the servers, last longer, and upgrade servers in the future)", ""); // Removing unwanted promotional text
			return message.reply(cleanedMessage);
		} catch (error) {
			console.error(error);
			return message.reply(getLang("error"));
		}
	},

	onChat: async function ({ args, message, threadsData, event, isUserCallCommand, getLang }) {
		if (!isUserCallCommand || args.length < 2) return;

		message.reply(getLang("waiting"));

		try {
			const langCode = await threadsData.get(event.threadID, "settings.lang") || global.GoatBot.config.language;
			const responseMessage = await getMessage(args.join(" "), langCode);
			return message.reply(responseMessage);
		} catch (error) {
			console.error(error);
			return message.reply(getLang("error"));
		}
	}
};

async function getMessage(query) {
	try {
		const res = await axios.get(`https://api.kenliejugarap.com/blackbox?text=${encodeURIComponent(query)}`);
		if (!res.data.response) throw new Error("Invalid response from Blackbox API.");
		return res.data.response;
	} catch (err) {
		console.error("Error fetching data from Blackbox:", err);
		throw err;
	}
}
