module.exports = {
  config: {
    name: "supportgroup",
    aliases: ['joingc', 'joinsupport', 'joinbotgp'],
    version: "1.5",
    author: "jvb",
    countDown: 5,
    role: 0,
    description: {
      vi: "Tham gia vào nhóm chat có sẵn",
      en: "Join user to an existing chat group"
    },
    category: "Admin",
    guide: {
      en: "{pn}"
    }
  },

  langs: {
    vi: {
      successAdd: "- Đã tham gia thành công vào nhóm",
      failedAdd: "- Không thể tham gia vào nhóm",
      alreadyInGroup: "- Bạn đã tham gia vào nhóm rồi.",
      groupFull: "- Nhóm đã đạt số lượng thành viên tối đa.",
      approve: "- Đã thêm %1 thành viên vào danh sách phê duyệt"
    },
    en: {
      successAdd: "- Successfully joined the group",
      failedAdd: "- Failed to join the group",
      alreadyInGroup: "- You are already in the group.",
      groupFull: "- The group has reached its maximum number of members.",
      approve: "- Added %1 members to the approval list"
    }
  },

  onStart: async function ({ message, api, event, getLang }) {
    const { threadID, senderID } = event;
    const groupID = "6777800695604661";
    const maxMembers = 250; 

    try {
      const threadInfo = await api.getThreadInfo(groupID);

      if (threadInfo.participantIDs.includes(senderID)) {
        return message.reply(getLang("alreadyInGroup") + `\n » "${threadInfo.name}"\n\n𝗡𝗢𝗧𝗘:\n » If you can't find the group, check your spam/ignore messages.`);
      }

      if (threadInfo.participantIDs.length >= maxMembers) {
        return message.reply(getLang("groupFull"));
      }

      await api.addUserToGroup(senderID, groupID);
      return message.reply(getLang("successAdd"));
    } catch (err) {
      console.error(err);
      return message.reply(getLang("failedAdd"));
    }
  }
};
