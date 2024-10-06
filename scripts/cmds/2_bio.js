module.exports = {
  config: {
    name: "bio",
    version: "1.1.0",
    author: "AceGerome",
    countDown: 5,
    role: 2,
    description: {
      en: "Change the bot bio",
    },
    category: "Owner",
    guide: {
       en: "{pn} <text>",
    },
  },
  
  onStart: async function({ args, message }) {
      const text = args.join(" ").trim();
      const count = text.length;
      
      if (!text || !text.trim()) {
        return message.reply("Please provide a valid text to set the biography.");
      }
      
      if (text.length > 101) {
        return message.reply(`The text must be 101 characters or less. Current length: ${count}`);
      }
      
      try {
        await api.changeBio(text);
        console.log(`Bio changed .: ${text}`); 
        message.reply(`The bot biography has been updated to:\n${text}\n\nCharacter count: ${count}`);
      } catch (error) {
        console.error("Error changing bot biography:", error);
        message.reply("An error occurred while changing the bot biography. Please try again later.");
      }
  },
};
