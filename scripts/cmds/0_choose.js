module.exports = {
  config: {
    name: "choose",
    aliases: ['prefer'],
    version: "1.0",
    author: "Ace",
    countDown: 15,
    role: 0,
    description: {
      en: "Akira chooses things/food/place."
    },
    category: "fun",
    guide: {
      en: "{pn} <choose1> or <choose2>"
    }
  },
  
  langs: {
    en: {
      result: "%1 is more suitable for you, I think so (🤔)",
      invalid: "Invalid input. Please type: /choose <choose1> or <choose2>",
      multipleChoices: "You can choose more options: /choose <choose1> or <choose2> or <choose3>."
    }
  },

  onStart: async function({ message, args, getLang }) {
    const input = args.join(" ").trim();

    if (!input) {
      return message.reply(getLang("invalid"));
    }

    const choices = input.split(" or ").map(choice => choice.trim()).filter(Boolean);
    
    if (choices.length < 2) {
      return message.reply(getLang("invalid") + " " + getLang("multipleChoices"));
    }

    const selectedChoice = choices[Math.floor(Math.random() * choices.length)];
    
    return message.reply(getLang("result", selectedChoice));
  }
};
