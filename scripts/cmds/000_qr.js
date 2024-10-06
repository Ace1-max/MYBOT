const request = require('request');
const fs = require('fs');

module.exports = {
  config: {
    name: "qr",
    version: "1.0", 
    author: "???", 
    countDown: 15,
    role: 0,
    description: "Generate a QR code to share links/text easily. Any text after the qr command will be encoded in the QR code. For multi-coloured QR codes, use the qr+ command instead.",
    category: "𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡",
    guide: "{pn} {text}"
  },

  onStart: async function({ message, event, threadsData, args }) {
    if (args.length < 1) { 
      return message.reply("You must add text to your command, so I can convert it to a QR code.\nExample: `/qr This message is now encoded as a QR code`");
    } else {
      const colourArray = ["1211996", "3447003", "13089792", "16711858", "1088163", "16098851", "6150962"];
      const randomNumber = getRandomNumber(0, colourArray.length - 1);
      const randomColour = colourArray[randomNumber];
      const userText = encodeURIComponent(args.join(" "));
      const qrGenerator = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${userText}`;

      request(qrGenerator, { encoding: 'binary' }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          fs.writeFile(__dirname + '/tmp/qr.png', body, 'binary', function(err) {
            if (err) {
              console.error("Error saving QR code image:", err);
              return message.reply("An error occurred while generating the QR code.");
            }
            message.reply({
              attachment: fs.createReadStream(__dirname + '/tmp/qr.png')
            }, (err) => {
              if (err) {
                console.error("Error sending QR code image:", err);
                return message.reply("An error occurred while sending the QR code image.");
              }
              fs.unlink(__dirname + '/tmp/qr.png', function(err) {
                if (err) console.error("Error deleting temporary QR code file:", err);
              });
            });
          });
        } else {
          console.error("Error fetching QR code image:", error);
          return message.reply("An error occurred while generating the QR code.");
        }
      });
    }

    function getRandomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
};
