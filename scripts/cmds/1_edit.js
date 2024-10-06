module.exports = {
	config: {
		name: "edit",
		version: "1.1",
		author: "Kshitiz",
		countDown: 15,
		role: 0,
		description: "Edit a bot's message by replying to it with 'edit <message>'.",
		category: "info",
		guide: {
			en: "{p}{n} <message>",
		},
	},

	onStart: async function ({ api, event, args }) {
		const replyMessage = event.messageReply;
		if (!replyMessage || replyMessage.senderID !== api.getCurrentUserID()) {
			api.sendMessage("Please reply to a bot message to edit.", event.threadID, event.messageID);
			return;
		}

		if (!args || args.length === 0) {
			api.sendMessage("Invalid input. Please provide a new message.", event.threadID, event.messageID);
			return;
		}

		const editedMessage = args.join(" ");

		try {
			await api.editMessage(editedMessage, replyMessage.messageID);
		} catch (error) {
			console.error("Error editing message", error);
			api.sendMessage("An error occurred while editing the message. Please try again later.", event.threadID);
		}
	},
};
