const jobs = {
    industrial: [
        'Staff Recruitment',
        'Hotel Administrator',
        'at the Power Plant',
        'Restaurant Chef',
        'as Worker'
    ],
    service: [
        'Plumber',
        'Neighbors Air Conditioner Repair',
        'Multi-level Sale',
        'Flyer Distribution',
        'Shipper',
        'Computer Repair',
        'Tour Guide',
        'Breastfeeding'
    ],
    oil: [
        'earn 13 Barrels of Oil',
        'earn 8 Barrels of Oil',
        'earn 9 Barrels of Oil',
        'steal the Oil',
        'take water and pour it into Oil and sell it'
    ],
    mining: [
        'Iron Ore',
        'Gold Ore',
        'Coal Ore',
        'Lead Ore',
        'Copper Ore',
        'Oil Ore'
    ],
    digging: [
        'Diamond',
        'Gold',
        'Coal',
        'Emerald',
        'Iron',
        'Ordinary Stone',
        'Lazy',
        'Bluestone'
    ],
    challenge: [
        'say iloveyou to any admin',
        'dance like nobody watching',
        'speak in emojis',
        'sing a song backwards',
        'confess to your crush',
        'wear a sock in your hands'
    ]
};

const moment = require("moment-timezone");

module.exports = {
    config: {
        name: "workv2",
        aliases: [],
        version: "1.0.2",
        author: "Ace",
        countDown: 5,
        role: 0,
        description: {
            en: "Work to earn money, work to earn money."
        },
        category: "game",
        guide: {
            en: "{pn}"
        },
        envConfig: {
            cooldownTime: 600000
        }
    },
    langs: {
        en: {
            cooldown: "You're done for your working. Come back tomorrow."
        }
    },

    onStart: async function ({ event, message, getLang, usersData, envCommands, commandName }) {
        // Cooldown setup
        const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
        const userData = await usersData.get(event.senderID);

        // Check cooldown
        if (userData.data.work2Time === dateTime) {
            return message.reply(getLang("cooldown"));
        } 

        // Display job options
        const jobMessage = "=== EARN EVERY DAY ===" +
            "\n━━━━━━━━━━━━━━━" +
            "\n1/ Industrial park." +
            "\n2/ Service area." +
            "\n3/ Oil field." +
            "\n4/ Mining Ore." +
            "\n5/ Digging stones" +
            "\n6/ Stand in the way" +
            "\n7/ Challenge" +
            "\n━━━━━━━━━━━━━━━" +
            "\nPlease reply to the message and choose by number";

        return message.reply(jobMessage, (error, info) => { 
            global.GoatBot.onReply.set(info.messageID, {
                commandName,
                author: event.senderID,
                messageID: info.messageID,
                type: "reply", 
                dateTime
            });
        });
    }, 

    onReply: async function ({ event, api, Reply, getLang, usersData, args, message }) {
        const { senderID } = event;
        const { type, author, messageID, dateTime } = Reply;
        const userData = await usersData.get(senderID);

        // Randomized coin earnings based on job type
        const randomCoins = {
            industrial: Math.floor(Math.random() * 401) + 200,
            service: Math.floor(Math.random() * 801) + 200,
            oil: Math.floor(Math.random() * 401) + 200,
            mining: Math.floor(Math.random() * 601) + 200,
            digging: Math.floor(Math.random() * 201) + 200,
            challenge: Math.floor(Math.random() * 1500) + 500
        };

        const selectedOption = parseInt(args);

        // Validate user input
        if (isNaN(selectedOption) || selectedOption < 1 || selectedOption > 7) {
            return message.reply("Please enter a valid option (1-7).");
        }

        // Handle job selection responses
        const jobResponses = [
            {
                job: jobs.industrial,
                message: "You are working ${job} in the Industrial Zone and Earn ${coin}$",
                coin: randomCoins.industrial
            },
            {
                job: jobs.service,
                message: "You are working as ${job} in the Service Area and Earn ${coin}$",
                coin: randomCoins.service
            },
            {
                job: jobs.oil,
                message: "You ${job} at the Oil Field and Sold ${coin}$",
                coin: randomCoins.oil
            },
            {
                job: jobs.mining,
                message: "You are Mining ${job} and Earn ${coin}$",
                coin: randomCoins.mining
            },
            {
                job: jobs.digging,
                message: "You dig ${job} and Earn ${coin}$",
                coin: randomCoins.digging
            },
            {
                job: jobs.digging,
                message: "You Found ${job} and Earn ${coin}$.",
                coin: randomCoins.digging
            },
            {
                job: jobs.challenge,
                message: "You got the 24h challenge to ${job} and you got it ${coin}$",
                coin: randomCoins.challenge
            }
        ];

        const { job, message: templateMessage, coin } = jobResponses[selectedOption - 1];
        global.GoatBot.onReply.delete(messageID);
        message.unsend(event.messageReply.messageID);

        // Respond to the user
        await message.reply(templateMessage.replace(/\${job}/g, job[Math.floor(Math.random() * job.length)]).replace(/\${coin}/g, coin));

        // Update user data
        userData.data.work2Time = dateTime;
        userData.money += coin; // Increment money
        await usersData.set(senderID, { 
            money: userData.money,
            data: userData.data 
        });
    }
};
