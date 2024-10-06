module.exports = {
  config: {
    name: "leave",
    version: "1.1.0",
    author: "Ace/Akira",
    countDown: 5,
    role: 2,
    description: "Bot will leave the group.",
    category: "Owner",
    guide: {
      en: "{pn} [threadID | blank] [reason (optional)]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const threadID = !isNaN(args[0]) ? parseInt(args[0]) : event.threadID;
      const reasons = args.slice(1).join(" ") || "My admin has instructed me to leave.";

      const threadInfo = await api.getThreadInfo(threadID);

      await message.reply(
        `🔄 | Preparing to leave...\n━━━━━━━━━━━━━━━\nReason: ${reasons}`
      );

      await api.removeUserFromGroup(api.getCurrentUserID(), threadID);

      await api.sendMessage(
        `「 Leave Success 」\n━━━━━━━━━━━━━━━\n⪼ Name: ${threadInfo.threadName || "Unknown"}\n⪼ Thread ID: ${threadID}\n⪼ Reason: ${reasons}`,
        event.threadID
      );
    } catch (error) {
      message.reply(`❌ | An error occurred while trying to leave the group: ${error.message}`);
    }
  }
};
