const fs = require('fs');

module.exports = {
  config: {
    name: "truthordare",
    aliases: ['tod', 't&d'], 
    version: "1.0",
    author: "SiAM",
    countDown: 5,
    role: 0,
    description: {
      en: "This command enables users to play the classic Truth or Dare game. They can choose either 'Truth' or 'Dare' and receive a randomly selected question or challenge."
    },
    category: "fun",
    guide: {
      en: "To play the Truth or Dare game, use the command '{pn} truth' for a truth question or '{pn} dare' for a dare challenge."
    }
  },

  onStart: async function({ api, args, message }) {
    
    const [arg1] = args;

    if (!arg1) {
      message.reply("If you want to play Truth or Dare, please specify either 'truth' or 'dare'.");
      return;
    }

    if (arg1.toLowerCase() === 'truth') {
      const truthFile = JSON.parse(fs.readFileSync(`TRUTHQN.json`));
      const randomIndex = Math.floor(Math.random() * truthFile.length);
      const randomQuestion = truthFile[randomIndex];

      message.reply(`Here's your truth question: ${randomQuestion}`);
    } 
    else if (arg1.toLowerCase() === 'dare') {
      const dareChallenges = JSON.parse(fs.readFileSync(`DAREQN.json`));
      const randomIndex = Math.floor(Math.random() * dareChallenges.length);
      const randomChallenge = dareChallenges[randomIndex];

      message.reply(`Here's your dare challenge: ${randomChallenge}`);
    } else {
      message.reply("Invalid input. Please use '/t&d truth' for a truth question or '/t&d dare' for a dare challenge.");
    }
  }
};
