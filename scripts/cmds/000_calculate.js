module.exports = {
  config: {
    name: "calculate",
    version: "1.0",
    author: "OtinXSandip",
    role: 0,
    countDown: 15,
    description: {
        en: "Perform  calculbasic arithmetications."
    }, 
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡",
    guide: "{pn} <expression>"
  },
  onStart: async function ({ message, args }) {
    const expression = args.join(" ");

    if (!expression) {
      return message.reply("Please provide an expression to calculate!");
    }

    let result;
    try {
      result = eval(expression);
    } catch (error) {
      console.error(error);
      return message.reply("Oops! Something went wrong while trying to calculate your expression.: " + error.message);
    }

    message.reply(`The result of ${expression} is ${result}.`);
  },
};
