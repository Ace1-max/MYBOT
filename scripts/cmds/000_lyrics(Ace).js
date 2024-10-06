const axios = require("axios");

module.exports = {
  config: {
    name: "lyrics",
    aliases: ['ly'], 
    version: "1.0",
    author: "Rishad | Ace",
    countDown: 15,
    role: 0,
    description: {
      en: "Get song lyrics along with album artwork."
    },
    category: "music",
    guide: {
      en: "{pn} <song name>"
    }
  },
  
  onStart: async function ({ event, args, message }) {
    const prompt = args.join(' ');
    
    if (!prompt) {
      return message.reply("Please provide a song name! Example: {pn} Imagine by John Lennon");
    }
    
    try {
      const response = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(prompt)}`);
      const { title, artist, lyrics, image } = response.data;
      
      if (!title || !artist || !lyrics) {
        return message.reply("Sorry, I couldn't find the lyrics for that song.");
      }
      
      const messageData = {
        body: `❑ Title: ${title}\n❑ Artist: ${artist}\n\n❑ Lyrics:\n${lyrics}`,
        attachment: image ? await global.utils.getStreamFromURL(image) : null
      };
      
      return message.reply(messageData);
      
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      return message.reply("An error occurred while fetching lyrics. Please try again later.");
    }
  }
};
