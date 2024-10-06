module.exports = {
  config: {
    name: "wordcount",
    //aliases: ["wc", "wcount"],
    version: "1.0",
    author: "AceGerome",
    countDown: 5,
    role: 0,
    description: {
      en: "Count the words and characters in a given text."
    },
    category: "info",
    guide: {
      en: "{pn} <sentence or word> - Count the words and characters in the provided text."
    }
  },

  onStart: async function ({ message, args }) {
    if (args.length === 0) {
      return message.reply("❌ Please provide a sentence or word to count.");
    }

    const chat = args.join(" ").trim();

    if (chat.length === 0) {
      return message.reply("❌ You must provide a valid sentence or word.");
    }

    const wordCount = chat.split(/\s+/).length;
    const charCount = chat.length;

    message.reply(`✅ Word Count: ${wordCount}\n✅ Character Count: ${charCount}`);
  }
};
