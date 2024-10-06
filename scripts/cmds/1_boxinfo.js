const fs = require("fs-extra");
const request = require("request");

module.exports = {
    config: {
        name: "groupinfo",
        aliases: ['boxinfo'],
        version: "1.0",
        author: "Loid Butter",
        countDown: 5,
        role: 0,
        description: { 
            en: "See Full Box Information With Image" 
        },
        category: "info",
        guide: {
            en: "{pn}" 
        }
    },

    onStart: async function ({ api, event, args }) {
        let threadInfo = await api.getThreadInfo(event.threadID);

        // Gather information about thread members
        let genderM = [];
        let genderF = [];
        let nope = [];
        for (let userId in threadInfo.userInfo) {
            const userGender = threadInfo.userInfo[userId].gender;
            const userName = threadInfo.userInfo[userId].name;

            if (userGender === "MALE") {
                genderM.push(userId + userGender);
            } else if (userGender === "FEMALE") {
                genderF.push(userGender);
            } else {
                nope.push(userName);
            }
        }

        // Count gender distribution
        let M = genderM.length;
        let F = genderF.length;
        
        // Shortcut Variables
        let threadName = threadInfo.threadName;
        let threadID = threadInfo.threadID;
        
        // Collect information about administrators
        let listAdmins = '';
        for (let i = 0; i < threadInfo.adminIDs.length; i++) {
            const adminInfo = (await api.getUserInfo(threadInfo.adminIDs[i].id));
            const adminName = adminInfo[threadInfo.adminIDs[i].id].name;
            listAdmins += `• ${adminName}\n`;
        }

        // Gather general information about the thread
        let approvalMode = threadInfo.approvalMode;
        let pd = approvalMode === false ? 'Turned off' : approvalMode === true ? 'Turned on' : 'loid';
        let callback = () => api.sendMessage({
            body: `「 NAME 」: ${threadName}\n` +
                `「 GROUP ID 」: ${threadID}\n` +
                `「 Approval 」: ${pd}\n` +
                `「 Emoji 」: ${threadInfo.emoji}\n` +
                `「 Information 」: 𝐈𝐧𝐜𝐥𝐮𝐝𝐢𝐧𝐠 ${threadInfo.participantIDs.length} 𝐌𝐞𝐦𝐛𝐞𝐫𝐬\n` +
                `「 Number Of MALE 」: ${M}\n` +
                `「 Number Of FEMALE 」: ${F}\n` +
                `「 Total Administrator 」: ${threadInfo.adminIDs.length} \n` +
                `「 Include 」:\n${listAdmins}\n` +
                `「 Total number of Messages 」: ${threadInfo.messageCount} msgs.`,
            attachment: fs.createReadStream(__dirname + '/tmp/${threadName},${threadID}.png')
        },
            event.threadID,
            () => fs.unlinkSync(__dirname + '/tmp/${threadName},${threadID}.png'),
            event.messageID
        );

        // Download thread image and execute the callback
        return request(encodeURI(`${threadInfo.imageSrc}`))
            .pipe(fs.createWriteStream(__dirname + '/tmp/${threadName},${threadID}.png'))
            .on('close', () => callback());
    }
};
