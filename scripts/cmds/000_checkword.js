module.exports = {
  config: {
    name: "check",
    version: "1.0.0",
    author: "AceGerome",
    countDown: 15,
    role: 0,
    description: {
      en: "Check if its what called that symbol?, Consonant, vowels, or number.",
    },
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡",
    guide: {
      en: "{pn}",
    },
  }, 
  onStart: async function ({ event, message }) {
    const { body } = event;
    const input = body.slice(body.indexOf(' ') + 1).trim().toLowerCase(); // Assuming command is called like "{p}check a" or "{p}check 5"

    if (!input) {
      message.reply("Please provide a character.");
      return;
    }

    if (input.length === 1) {
      if (input >= '0' && input <= '9') {
        message.reply("It's a number.");
      } else if ("aeiou".includes(input)) {
        message.reply("It's a vowel.");
      } else if (input >= 'a' && input <= 'z') {
        message.reply("It's a consonant.");
      } else if ("@".includes(input)) {
        message.reply("It's an At Sign.");
      } else if ("!".includes(input)) {
        message.reply("It's an Exclamation point.");
      } else if ("#".includes(input)) {
        message.reply("It's a Number sign or hash."); 
      } else if ("$".includes(input)) {
        message.reply("It's a Dollar Sign.");
      } else if ("%".includes(input)) {
        message.reply("It's a Percent Sign.");
      } else if ("^".includes(input)) {
        message.reply("It's a Caret.");
      } else if ("&".includes(input)) {
        message.reply("It's an Ampersand.");
      } else if ("*".includes(input)) {
        message.reply("It's an Asterisk.");
      } else if ("(".includes(input)) {
        message.reply("It's an Open Parenthesis.");
      } else if (")".includes(input)) {
        message.reply("It's a Close Parenthesis.");
      } else if ("_".includes(input)) {
        message.reply("It's an Underscore.");
      } else if ("+".includes(input)) {
        message.reply("It's a Plus Sign.");
      } else if ("-".includes(input)) {
        message.reply("It's a Hyphen.");
      } else if ("=".includes(input)) {
        message.reply("It's an Equal Sign.");
      } else if ("{".includes(input)) {
        message.reply("It's an Open Curly Brace.");
      } else if ("}".includes(input)) {
        message.reply("It's a Close Curly Brace.");
      } else if ("[".includes(input)) {
        message.reply("It's an Open Square Bracket.");
      } else if ("]".includes(input)) {
        message.reply("It's a Close Square Bracket.");
      } else if ("\ ".includes(input)) {
        message.reply("It's a Backslash.");
      } else if (":".includes(input)) {
        message.reply("It's a Colon.");
      } else if (";".includes(input)) {
        message.reply("It's a Semicolon.");
      } else if ("'".includes(input)) {
        message.reply("It's a Single Quote.");
      } else if ("<".includes(input)) {
        message.reply("It's a Less Than Sign.");
      } else if (">".includes(input)) {
        message.reply("It's a Greater Than Sign.");
      } else if ("?".includes(input)) {
        message.reply("It's a Question Mark.");
      } else if (",".includes(input)) {
        message.reply("It's a Comma.");
      } else if (".".includes(input)) {
        message.reply("It's a Period.");
      } else if ("/".includes(input)) {
        message.reply("It's a Forword Slash.");
      } else if ("`".includes(input)) {
        message.reply("It's a Backtick.");
      } else if ("~".includes(input)) {
        message.reply("It's a Tilde.");
      } else if ("₱".includes(input)) {
        message.reply("It's a Philippines Peso Sign.");
      } else if ("÷".includes(input)) {
        message.reply("It's a Division Sign.");
      } else if (`"`.includes(input)) {
        message.reply("It's a Double Quote.");
      } else if ("€".includes(input)) {
        message.reply("It's an Euro Sign.");
      } else if ("¥".includes(input)) {
        message.reply("It's a Yen Sign.");
      } else if ("¢".includes(input)) {
        message.reply("It's a Cent Sign.");
      } else if ("©".includes(input)) {
        message.reply("It's a Copyright Sign.");
      } else if ("®".includes(input)) {
        message.reply("It's a Registered Trademark Sign.");
      } else if ("™".includes(input)) {
        message.reply("It's a Trademark Sign.");
      } else if ("¿".includes(input)) {
        message.reply("It's an Inverted Question Mark.");
      } else if ("¡".includes(input)) {
        message.reply("It's an Inverted Exclamation Mark.");
      } else if ("¦".includes(input)) {
        message.reply("It's a Broken Bar.");
      } else if ("¬".includes(input)) {
        message.reply("It's a Not Sign.");
      } else if ("×".includes(input)) {
        message.reply("It's a Multiplication Sign.");
      } else if ("§".includes(input)) {
        message.reply("It's a Section Sign.");
      } else if ("¶".includes(input)) {
        message.reply("It's a Pilcrow Sign.");
      } else if ("°".includes(input)) {
        message.reply("It's a Degree Sign.");
      } else {
        message.reply("Invalid input. Please enter a single character.");
      }
    } else {
      message.reply("Invalid input. Please enter only one character.");
    }
  }
};
