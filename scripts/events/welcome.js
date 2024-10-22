const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
        global.temp.welcomeEvent = {};

const { name, gender, status, hobby, facebookLink, relationship, bio } = global.GoatBot.config;

const birthday = "10/17/2009";

const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const ownerInfo = {
        name, 
        birthday, 
        age: calculateAge(birthday), 
        gender, 
        status, 
        hobby, 
        facebookLink, 
        relationship, 
        bio
};

module.exports = {
        config: {
                name: "welcome",
                version: "1.7",
                author: "NTKhang",
                category: "events"
        },

        langs: {
                vi: {
                        session1: "sáng",
                        session2: "trưa",
                        session3: "chiều",
                        session4: "tối",
                        welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
                        multiple1: "bạn",
                        multiple2: "các bạn",
                        defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
                },
                en: {
                        session1: "morning",
                        session2: "noon",
                        session3: "afternoon",
                        session4: "evening",
                        welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1\nTo view the list of commands, please enter: %1help\n\n━ 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 ━\n❐ Name: %2\n❒ Birthday: %3\n❒ Age: %4\n❒ Gender: %5\n❒ Status: %6\n❒ Hobby: %7\n❒ Link: %8\n❒ Relationship: %9\n❒ Biography: %10",
                        multiple1: "you",
                        multiple2: "you guys",
                        defaultWelcomeMessage: `Hello {userName}.\nWelcome {multiple} to the chat group: {boxName}\nHave a nice {session} 😊`
                }
        },

        onStart: async ({ threadsData, message, event, api, getLang }) => {
                if (event.logMessageType == "log:subscribe")
                        return async function () {
                                const hours = getTime("HH");
                                const { threadID } = event;
                                const { nickNameBot } = global.GoatBot.config;
                                const prefix = global.utils.getPrefix(threadID);
                                const dataAddedParticipants = event.logMessageData.addedParticipants;
                                
                                
                                if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
                                        if (nickNameBot)
                                                api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
                                        return message.send(getLang("welcomeMessage", prefix, name, birthday, calculateAge(birthday), gender, status, hobby, facebookLink, relationship, bio));
                                }
                                
                                
                                if (!global.temp.welcomeEvent[threadID])
                                        global.temp.welcomeEvent[threadID] = {
                                                joinTimeout: null,
                                                dataAddedParticipants: []
                                        };

                                
                                global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
                                
                                clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

                               
                                global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
                                        const threadData = await threadsData.get(threadID);
                                        if (threadData.settings.sendWelcomeMessage == false)
                                                return;
                                        const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
                                        const dataBanned = threadData.data.banned_ban || [];
                                        const threadName = threadData.threadName;
                                        const userName = [],
                                                mentions = [];
                                        let multiple = false;

                                        if (dataAddedParticipants.length > 1)
                                                multiple = true;

                                        for (const user of dataAddedParticipants) {
                                                if (dataBanned.some((item) => item.id == user.userFbId))
                                                        continue;
                                                userName.push(user.fullName);
                                                mentions.push({
                                                        tag: user.fullName,
                                                        id: user.userFbId
                                                });
                                        }

                                        if (userName.length == 0) return;
                                        let { welcomeMessage = getLang("defaultWelcomeMessage") } =
                                                threadData.data;
                                        const form = {
                                                mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
                                        };
                                        welcomeMessage = welcomeMessage
                                                .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
                                                .replace(/\{boxName\}|\{threadName\}/g, threadName)
                                                .replace(
                                                        /\{multiple\}/g,
                                                        multiple ? getLang("multiple2") : getLang("multiple1")
                                                )
                                                .replace(
                                                        /\{session\}/g,
                                                        hours <= 10
                                                                ? getLang("session1")
                                                                : hours <= 12
                                                                        ? getLang("session2")
                                                                        : hours <= 18
                                                                                ? getLang("session3")
                                                                                : getLang("session4")
                                                );

                                        form.body = welcomeMessage;

                                        if (threadData.data.welcomeAttachment) {
                                                const files = threadData.data.welcomeAttachment;
                                                const attachments = files.reduce((acc, file) => {
                                                        acc.push(drive.getFile(file, "stream"));
                                                        return acc;
                                                }, []);
                                                form.attachment = (await Promise.allSettled(attachments))
                                                        .filter(({ status }) => status == "fulfilled")
                                                        .map(({ value }) => value);
                                        }
                                        message.send(form);
                                        delete global.temp.welcomeEvent[threadID];
                                }, 1500);
                        };
        }
};
