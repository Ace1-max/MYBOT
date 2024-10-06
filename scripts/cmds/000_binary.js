const textToBinary = (text) => {
  return text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
};

const binaryToText = (binaryText) => {
  return binaryText.split(' ').map(binaryChar => String.fromCharCode(parseInt(binaryChar, 2))).join('');
};

module.exports = {
  config: {
    name: "binary",
    aliases: [],
    version: "1.0.1",
    author: "Lance Ajiro",
    countDown: 5,
    role: 0,
    description: {
      en: "Convert text to binary and decode binary to text."
    },
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡",
    guide: {
      en: "{pn} [text | -decode BinaryText]"
    }
  },
  onStart: async function ({ message, event, args }) {
    try {
      const input = args.join(" ").trim();

      if (!input) {
        return message.reply("Please provide some text to convert or decode.");
      }

      if (input.startsWith("-decode")) {
        const binaryText = input.slice(8).trim();
        if (!/^[01 ]+$/.test(binaryText)) {
          return message.reply("Invalid binary input. Please provide a valid binary string.");
        }
        const decodedText = binaryToText(binaryText);
        return message.reply(`Decoded Text: ${decodedText}`);
      } else {
        const binaryText = textToBinary(input);
        return message.reply(`Binary: ${binaryText}`);
      }
    } catch (error) {
      console.error(error);
      return message.reply("An error occurred while processing your request. Please try again.");
    }
  }
};
