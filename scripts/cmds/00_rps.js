module.exports = {
  config:{
    name: "rps",
    version: "1.0.0",
    role: 0,
    author: "Kaizen",
    description: {
      en: "Play the game of jak en poy with the computer"
    },
    category: "game",
    guide: { en: " To use this command, type {pn} < rock | paper | scissors> to start playing rps" },
    countDown: 10
  },

  onStart: async function({ message, event, args, usersData }) {
    const userData = await usersData.get(event.senderID);
    let choices = ['rock', 'paper', 'scissors'];
    let computerChoice = choices[Math.floor(Math.random() * choices.length)];
    
    if (!args || args.length === 0) {
        message.reply("Please provide your bet and choice of 'rock', 'paper', or 'scissors'");
        return;
    }

    let userChoice = args[1];
    let bet = parseInt(args[0]);
    
    if (bet > userData.money) {
        return message.reply("You don't have enough money.");
    }
    
    if (isNaN(bet) || bet <= 0) {
        return message.reply("Invalid bet amount. Please enter a valid bet.");
    }
    
    if (!userChoice || !choices.includes(userChoice)) {
        message.reply("Invalid choice, please choose either 'rock', 'paper', or 'scissors'");
        return;
    }
    const reward = bet * 2;
    if (userChoice === computerChoice) {
        message.reply("It's a tie! Both you and the computer chose " + userChoice);
    } else if (userChoice === 'rock' && computerChoice === 'scissors') {
        message.reply("You win " + reward + "! Rock beats scissors");
        await usersData.set(event.senderID, {
          money: userData.money + reward,
          data: userData.data,
        });
    } else if (userChoice === 'paper' && computerChoice === 'rock') {
        message.reply("You win " + reward + "! Paper beats rock");
        await usersData.set(event.senderID, {
          money: userData.money + reward,
          data: userData.data,
        });
    } else if (userChoice === 'scissors' && computerChoice === 'paper') {
        message.reply("You win " + reward + "! Scissors beats paper");
        await usersData.set(event.senderID, {
          money: userData.money + reward,
          data: userData.data,
        });
    } else {
        message.reply("You lose " + bet + "! " + computerChoice + " beats " + userChoice);
        await usersData.set(event.senderID, {
          money: userData.money + -bet,
          data: userData.data,
        });
    }
}
  };
