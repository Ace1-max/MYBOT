module.exports = {
  config: {
    name: "onlyadminbox",
    aliases: ["onlyadbox", "adboxonly", "adminboxonly"],
    version: "1.4",
    author: "NTKhang",
    countDown: 5,
    role: 1,
    description: {
      en: "Turn on/off admin-only mode for using the bot"
    },
    category: "box chat",
    guide: {
      en: "   {pn} [on | off]: Turn on/off the admin-only mode for bot usage" +
          "\n   {pn} noti [on | off]: Turn on/off notifications when non-admins use the bot"
    }
  },

  langs: {
    en: {
      turnedOn: "Admin-only mode is now enabled for bot usage.",
      turnedOff: "Admin-only mode is now disabled for bot usage.",
      turnedOnNoti: "Notifications enabled for non-admins attempting to use the bot.",
      turnedOffNoti: "Notifications disabled for non-admins attempting to use the bot.",
      syntaxError: "Syntax error. Use {pn} on or {pn} off."
    }
  },

  onStart: async function ({ args, message, event, threadsData, getLang }) {
    const isSetNoti = args[0] === "noti";
    const keySetData = isSetNoti ? "data.hideNotiMessageOnlyAdminBox" : "data.onlyAdminBox";
    const commandArg = args[isSetNoti ? 1 : 0];

    let value;
    if (commandArg === "on") value = true;
    else if (commandArg === "off") value = false;
    else return message.reply(getLang("syntaxError"));

    await threadsData.set(event.threadID, isSetNoti ? !value : value, keySetData);

    const replyMessage = isSetNoti
      ? value ? getLang("turnedOnNoti") : getLang("turnedOffNoti")
      : value ? getLang("turnedOn") : getLang("turnedOff");

    return message.reply(replyMessage);
  }
};