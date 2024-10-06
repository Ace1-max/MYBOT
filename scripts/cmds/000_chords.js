const tabs = require("ultimate-guitar");

module.exports = {
  config: {
    name: "chords",
    aliases: [],
    version: "1.0",
    countDown: 15,
    role: 0,
    author: "Joshua Sy & kshitiz | Ace",
    description: {
        en: "Search Chords"
    },
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡",
    guide: "{pn} <chords song title>"
  },
  
  onStart: async function({ api, event, args, usersData }) {
    let qwerty = args.join(" ");

    if (qwerty === "") {
     
      api.sendMessage("Please type 'chords' with the song name", event.threadID, event.messageID);
      return;
    }

    try {
      const res = await tabs.firstData(qwerty);

      if (!res) {
        
        console.error(`Chords for '${qwerty}' not found.`);
       
        api.sendMessage(`Chords for '${qwerty}' not found.`, event.threadID, event.messageID);
      } else {
        var title = res.title;
        var chords = res.chords;
        var type = res.type;
        var key = res.key;
        var artist = res.artist;

        api.sendMessage(
          `Artist: ${artist}\nTitle: ${title}\nType: ${type}\nKey: ${key}\n——Here’s the chords——\n\n${chords}\n\n——End——`,
          event.threadID,
          event.messageID
        );
      }
    } catch (err) {
      
      console.error("[ERROR] " + err);
   
      api.sendMessage("[ERROR] An error occurred while fetching chords.", event.threadID, event.messageID);
    }
  }
};
