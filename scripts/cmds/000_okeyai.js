const Prefixes = [
            'okeyai',
            '/okeyai', 
            '!okeyai',
            '-okeyai',
            '+okeyai',
            '*okeyai',
            '%okeyai'
            
];

module.exports = {
    config: {
      name: 'okeyai', 
      version: '1.0.0', 
      author: 'OkeyMeta', 
      role: 0,
      category: '𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡', 
      description: {
          en: 'OkeyAi better than ChatGPT and Bard', 
      }, 
      guide: {
          en: '⠀⠀⠀{pn} [prompt]', 
      }, 
    }, 
    onStart: async function({}) {}, 
    onChat: async function({ api, event, args }) {
        try {
            const prefix = Prefixes.find((p) => event.body && event.body.toLowerCase().startsWith(p));
            if (!prefix) {
                return;
            }
            const axios = require("axios");
            const getUserInfo = async (api, userID) => {
                try {
                    const name = await api.getUserInfo(userID);
                    return name[userID].firstName;
                } catch (error) {
                    console.error(`${error}`);
                }
            };

            let { messageID, threadID, senderID } = event;
            const ask = event.body.substring(prefix.length).trim();

            if (ask === '') {
                const name = await getUserInfo(api, senderID);
                let greetingA = ["Hello", "Hi", "Hey", "Greetings"];
                let emojiA = ["✅💯", "😋😋❤", "❤😘😘"]; // Add more emojis here
                let respondA = ["how may I help you?", "how can I help?", "I am Okey AI Large Language Model Artificial Intelligence, how may I help you?", "do you need help?"]; // Add more responses here
                const muiGreetA = greetingA[Math.floor(Math.random() * greetingA.length)];
                const muiRespondA = respondA[Math.floor(Math.random() * respondA.length)];
                const muiEmojiA = emojiA[Math.floor(Math.random() * emojiA.length)];
                api.sendMessage({
                    body: `${muiGreetA} ${name}, ${muiRespondA} ${muiEmojiA}`,
                    mentions: [{
                        tag: name,
                        id: senderID
                    }]
                }, threadID, messageID);
                return;
            }

            const name = await getUserInfo(api, senderID);
            const train = `You%20are%20an%20AI%20known%20as%20OkeyAI.%20Your%20name%20is%20OkeyAI.%20You%20are%20created%20by%20OkeyMeta%20Company.%20You%20are%20not%20better%20than%20ChatGPT%20and%20Gemini%20Bard.%20Your%20responses%20must%20always%20contain%20emoji.%20You%20must%20always%20greet%20me%20before%20every%20responses.%20My%20name%20is%20${name},`;
            let greetingB = ["Hey", "Ah", "Oh", "Uhm", "Hmm"];
            const respondB = await axios.get(`https://api.kenliejugarap.com/blackbox/?text=${train}${ask}`);
            const muiRespondB = respondB.data.response;
            const text = muiRespondB.replace("\n\nIs this answer helpful to you? Kindly click the link below\nhttps:\/\/click2donate.kenliejugarap.com\n(Clicking the link and clicking any ads or button and wait for 30 seconds (3 times) everyday is a big donation and help to us to maintain the servers, last longer, and upgrade servers in the future)", "")
            const muiGreetB = greetingB[Math.floor(Math.random() * greetingB.length)];
            
            try {
                api.sendMessage(`➦ | 𝗢𝗞𝗘𝗬𝗔𝗜\n━━━━━━━━━━━━━━━\n${muiGreetB} ${text}`, threadID, messageID);
            } catch (error) {
                api.sendMessage("error", threadID, messageID);
            }
        } catch (error) {
            console.error(`${error}`);
        }
    }
};
