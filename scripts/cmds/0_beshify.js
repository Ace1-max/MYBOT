module.exports = {
  config: {
    name: "beshy",
    aliases: ["beshify"],
    version: "1.0",
    author: "Ace",
    description: { en: "Beshify your text" },
    category: "fun",
    guide: {
      en: "{pn} <text> - Replace spaces with 🤸\n{pn} <text> -s <separator> - Use a custom separator\n{pn} <text> -u - Convert text to uppercase\n{pn} <text> -l - Convert text to lowercase"
    }
  },
  onStart: async function({ args, message }) {
    const MAX_CHAR_LIMIT = 200; 
    const textArgs = args.filter(arg => !arg.startsWith("-"));
    const options = args.filter(arg => arg.startsWith("-"));
    const text = textArgs.join(" ");

    if (!text) {
      return message.reply("❌ Please provide some text to beshify.");
    }

    if (text.length > MAX_CHAR_LIMIT) {
      return message.reply(`❌ Please limit your text to ${MAX_CHAR_LIMIT} characters.`);
    }

    let separator = "🤸"; 

    options.forEach(option => {
      if (option === "-s" && options.indexOf(option) + 1 < options.length) {
        separator = options[options.indexOf(option) + 1];
      } else if (option === "-u") {
        textArgs.forEach((arg, index) => textArgs[index] = arg.toUpperCase());
      } else if (option === "-l") {
        textArgs.forEach((arg, index) => textArgs[index] = arg.toLowerCase());
      }
    });

    const reply = textArgs.join(separator);
    message.reply(reply);
  }
};
