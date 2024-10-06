const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "         [🧸 | 卂Ҝ|尺卂 シ︎]\n      ";
const characters = "━━━━━━━━━━━━━━━";
/** 
* @author NTKhang
* @author: do not delete it
* @message if you delete or edit it you will get a global ban
*/

module.exports = {
	config: {
		name: "help",
		version: "1.9",
		author: "NTKhang",
		countDown: 5,
		description: {
			vi: "Xem cách sử dụng của các lệnh",
			en: "View command usage"
		},
		category: "Info",
		guide: {
			vi: "{pn} [để trống | <số trang> | <tên lệnh>]",
			en: "{pn} [empty | <page number> | <command name>]"
		},
		priority: 1
	},

	langs: {
		en: {
			help: "%1"
				+ "\n%2"
				+ "\n%1"
				+ "\n⠀⠀ Page [ %3/%4 ]" 
				+ "\n━━ 𝗦𝗨𝗣𝗣𝗢𝗥𝗧𝗚𝗖 ━━"
				+ "\n» Type %6joingc to join you to our SupportGC"
				+ "\n%1"
				+ "\n» Currently, the bot has %5 commands that can be used"
				+ "\n» Type %6help <page> to view the command list"
				+ "\n» Type %6help <command name> to view the details of how to use that command"
				+ "\n%1"
				+ "\n%7", 
			help2: "%1\n━━ 𝗦𝗨𝗣𝗣𝗢𝗥𝗧𝗚𝗖 ━━"
				+ "\n» Type %4joingc to join you to our SupportGC"
				+ "\n%2"
				+ "\n» The bot has %3 commands that can be used"
				+ "\n» Type %4help <command name> to view the details of how to use that command"
				+ "\n%2"
				+ "\n%5", 
			commandNotFound: "Command \"%1\" does not exist",
			getInfoCommand: "%1" 
				+ "\n» Description: %2"
				+ "\n» Other names: %3"
				+ "\n» Other names in your group: %4"
				+ "\n» Version: %5"
				+ "\n» Role: %6"
				+ "\n» Time per command: %7s"
				+ "\n» Author: %8"
				+ "\n» Usage Guide:"
				+ "\n\n%9"
				+ "\n\n» Content inside <XXXXX> can be changed" 
				+ "\n» Content inside [a|b|c] is a or b or c",
			doNotHave: "Do not have",
			roleText0: "0 (All users)",
			roleText1: "1 (Group administrators)",
			roleText2: "2 (Admin bot)",
			roleText0setRole: "0 (set role, all users)",
			roleText1setRole: "1 (set role, group administrators)",
			pageNotFound: "Page %1 does not exist"
		}
	},

	onStart: async function ({ message, args, event, threadsData, getLang, role }) {
		const langCode = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
		let customLang = {};
		const pathCustomLang = path.join(__dirname, "..", "..", "languages", "cmds", `${langCode}.js`);
		if (fs.existsSync(pathCustomLang))
			customLang = require(pathCustomLang);
		const { threadID } = event;
		const threadData = await threadsData.get(threadID);
		const prefix = getPrefix(threadID);
		let sortHelp = threadData.settings.sortHelp || "name";
		if (!["category", "name"].includes(sortHelp))
			sortHelp = "name";
		const commandName = typeof args[0] === 'string' ? args[0].toLowerCase() : "";
const command = commands.get(commandName) || (aliases.has(commandName) ? commands.get(aliases.get(commandName)) : null);
		// ———————————————— LIST ALL COMMAND ——————————————— //
		if (!command && !args[0] || !isNaN(args[0])) {
			const arrayInfo = [];
			let msg = "";
     if (sortHelp == "name") {
       const page = parseInt(args[0]) || 1;
       const numberOfOnePage = 30;
       for (const [name, value] of commands) {
           if (value.config.role > 1 && role < value.config.role)
           continue;
           let describe = name;
           let description;
           const descriptionCustomLang = customLang[name]?.description;
           if (descriptionCustomLang != undefined)
              description = checkLangObject(descriptionCustomLang, langCode);
           else if (value.config.description)
              description = checkLangObject(value.config.description, langCode);
        
           if (description) {
              if (description.length > 40) {
                 description = description.slice(0, 37) + "...";
              }
              describe += ` ➪ ${description.charAt(0).toUpperCase() + description.slice(1)}`;
           }
        arrayInfo.push({
            data: describe,
            priority: value.priority || 0
        });
    }

				arrayInfo.sort((a, b) => a.data - b.data);
				arrayInfo.sort((a, b) => a.priority > b.priority ? -1 : 1);
				const { allPage, totalPage } = global.utils.splitPage(arrayInfo, numberOfOnePage);
				if (page < 1 || page > totalPage)
					return message.reply(getLang("pageNotFound", page));
				const returnArray = allPage[page - 1];
				const startNumber = (page - 1) * numberOfOnePage + 1;
				msg += (returnArray || []).reduce((text, item, index) => text += `${index + startNumber}/ ${item.data}\n`, '');
				await message.reply(getLang("help", characters, msg, page, totalPage, commands.size, prefix, doNotDelete));
			}
			else if (sortHelp == "category") {
				for (const [, value] of commands) {
					if (value.config.role > 1 && role < value.config.role)
						continue;
					if (arrayInfo.some(item => item.category == value.config.category?.toLowerCase())) {
						const index = arrayInfo.findIndex(item => item.category == value.config.category?.toLowerCase());
						arrayInfo[index].names.push(value.config.name);
					}
					else
						arrayInfo.push({
							category: value.config.category?.toLowerCase(),
							names: [value.config.name]
						});
				}
				arrayInfo.sort((a, b) => (a.category < b.category ? -1 : 1));
				for (const data of arrayInfo) {
					const categoryUpcase = `━━ ${data.category?.toUpperCase()} ━━`;
					data.names.sort();
					msg += `${categoryUpcase}\n${data.names.join(", ")}\n\n`;
				}
				message.reply(getLang("help2", msg, characters, commands.size, prefix, doNotDelete));
			}
		}
		// ———————————— COMMAND DOES NOT EXIST ———————————— //
		else if (!command && args[0]) {
			return message.reply(getLang("commandNotFound", args[0]));
		}
		// ————————————————— INFO COMMAND ————————————————— //
		else {
			const configCommand = command.config;
			const author = configCommand.author;

			const nameUpperCase = configCommand.name.toUpperCase();
			const title = `${characters}\n${nameUpperCase}\n${characters}`;

			const descriptionCustomLang = customLang[configCommand.name]?.description;
			let description;
			if (descriptionCustomLang != undefined)
				description = checkLangObject(descriptionCustomLang, langCode);
			else if (configCommand.description)
				description = checkLangObject(configCommand.description, langCode);
			const aliasesString = configCommand.aliases ? configCommand.aliases.join(", ") : getLang("doNotHave");
			const aliasesThisGroup = threadData.data.aliases ? (threadData.data.aliases[configCommand.name] || []).join(", ") : getLang("doNotHave");
			let roleOfCommand = configCommand.role;
			let roleIsSet = false;
			if (threadData.data.setRole?.[configCommand.name]) {
				roleOfCommand = threadData.data.setRole[configCommand.name];
				roleIsSet = true;
			}

			const roleText = roleOfCommand == 0 ?
				(roleIsSet ? getLang("roleText0setRole") : getLang("roleText0")) :
				roleOfCommand == 1 ?
					(roleIsSet ? getLang("roleText1setRole") : getLang("roleText1")) :
					getLang("roleText2");

			let guide;
			if (customLang[configCommand.name]?.guide != undefined)
				guide = customLang[configCommand.name].guide;
			else
				guide = configCommand.guide[langCode] || configCommand.guide.en;
			guide = guide || {
				body: ""
			};
			if (typeof guide == "string")
				guide = { body: guide };
			const guideBody = guide.body
				.replace(/\{prefix\}|\{p\}/g, prefix)
				.replace(/\{name\}|\{n\}/g, configCommand.name)
				.replace(/\{pn\}/g, prefix + configCommand.name);

			const formSendMessage = {
				body: getLang("getInfoCommand", title, description, aliasesString, aliasesThisGroup, configCommand.version, roleText, configCommand.countDown || 1, author || "", guideBody)
			};

			if (guide.attachment) {
				if (typeof guide.attachment == "object") {
					formSendMessage.attachment = [];
					for (const pathFile in guide.attachment) {
						if (!fs.existsSync(pathFile)) {
							const cutFullPath = pathFile.split("/");
							cutFullPath.pop();
							for (let i = 0; i < cutFullPath.length; i++) {
								const path = cutFullPath.slice(0, i + 1).join('/');
								if (!fs.existsSync(path))
									fs.mkdirSync(path);
							}
							const getFile = await axios.get(guide.attachment[pathFile], { responseType: 'arraybuffer' });
							fs.writeFileSync(pathFile, Buffer.from(getFile.data));
						}
						formSendMessage.attachment.push(fs.createReadStream(pathFile));
					}
				}
			}
			return message.reply(formSendMessage);
		}
	}
};

function checkLangObject(data, langCode) {
	if (typeof data == "string")
		return data;
	if (typeof data == "object" && !Array.isArray(data))
		return data[langCode] || data.en || "";
	return "";
}
