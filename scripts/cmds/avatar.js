const axios = require('axios');
const { getStreamFromURL } = global.utils;

module.exports = {
	config: {
		name: "avatar",
		author: "NTKhang",
		version: "1.6",
		cooldowns: 5,
		role: 0,
		description: {
			vi: "tạo avatar anime với chữ ký",
			en: "create anime avatar with signature"
		},
		category: "image",
		guide: {
			vi: "   {p}{n} <mã số nhân vật> | <chữ nền> | <chữ ký> | <tên màu tiếng anh hoặc mã màu nền (hex color)>"
				+ "\n   {p}{n} help: xem cách dùng lệnh",
			en: "   {p}{n} <character id> | <background text> | <signature> | <background color name or hex color>"
				+ "\n   {p}{n} help: view how to use this command"
		}
	},

	langs: {
		vi: {
			initImage: "Đang khởi tạo hình ảnh, vui lòng chờ đợi...",
			invalidCharacter: "Vui lòng nhập mã số nhân vật hợp lệ.",
			errorGetCharacter: "Đã xảy ra lỗi lấy dữ liệu nhân vật:\n%1: %2",
			success: "✅ Avatar của bạn\nMã số: %1\nChữ nền: %2\nChữ ký: %3\nMàu: %4",
			defaultColor: "mặc định",
			error: "Đã xảy ra lỗi\n%1: %2"
		},
		en: {
			initImage: "Initializing image, please wait...",
			invalidCharacter: "Please enter a valid character ID.",
			errorGetCharacter: "An error occurred while getting character data:\n%1: %2",
			success: "✅ Your avatar\nID: %1\nBackground text: %2\nSignature: %3\nColor: %4",
			defaultColor: "default",
			error: "An error occurred\n%1: %2"
		}
	},

	onStart: async function ({ args, message, getLang }) {
		const content = args.join(" ").split("|").map(item => item.trim());
		const characterId = parseInt(content[0]);
		const backgroundText = content[1];
		const signature = content[2];
		const backgroundColor = content[3];

		if (isNaN(characterId)) {
			return message.reply(getLang("invalidCharacter"));
		}

		message.reply(getLang("initImage"));

		const endpoint = `https://deku-rest-api.gleeze.com/canvas/avatar`;
		const params = {
			id: characterId,
			bgname: backgroundText,
			signature: signature,
			color: backgroundColor
		};

		try {
			const avatarImage = await getStreamFromURL(endpoint, "avatar.png", { params });
			message.reply({
				body: getLang("success", characterId, backgroundText, signature, backgroundColor || getLang("defaultColor")),
				attachment: avatarImage
			});
		} catch (error) {
			const err = error.response?.data || { error: "Unknown error", message: "Please try again later." };
			message.reply(getLang("error", err.error, err.message));
		}
	}
};