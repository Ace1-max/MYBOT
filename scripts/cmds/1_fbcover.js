const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "fbcover",
    version: "1.0.0",
    author: "Shiron | AceGerome",
    countDown: 5,
    role: 0,
    shortDescription: "Create FB Banner",
    longDescription: {
      en: "Create a Facebook Banner.",
    },
    category: "image",
    guide: {
      en: "To use this command, type {pn} <first name>, then reply to the message and so on.",
    },
  },

  onStart: async function ({ api, args, event, message }) {
    const { threadID, senderID } = event;
    if (!args[0]) return message.reply('Please enter the main name!');
    else {
      return api.sendMessage(
        `You chose the main name: ${args.join(" ").toUpperCase()}\n\n(Reply to this message and choose your secondary name)`,
        threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            type: "tenphu",
            commandName: this.config.name,
            author: senderID,
            tenchinh: args.join(" ").toUpperCase(),
            messageID: info.messageID,
          });
        }
      );
    }
  },

  onReply: async function ({ api, event, Reply, commandName }) {
    const { threadID, senderID, body } = event;
    const { createCanvas, loadImage, registerFont } = require("canvas");
    const path = require("path");
    const __root = path.resolve(__dirname, "tmp");
    
    // Circle function for avatar image using canvas
    module.exports.circle = (img) => {
      return new Promise(async (resolve, reject) => {
        try {
          const image = await loadImage(img);
          const canvas = createCanvas(image.width, image.height);
          const ctx = canvas.getContext("2d");

          const radius = Math.min(image.width, image.height) / 2;
          ctx.beginPath();
          ctx.arc(image.width / 2, image.height / 2, radius, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(image, 0, 0, image.width, image.height);

          const buffer = canvas.toBuffer("image/png");
          resolve(buffer); // Return the circular image buffer
        } catch (err) {
          reject(err);
        }
      });
    };

    if (Reply.author !== senderID) return;

    let pathImg = `${__root}/${senderID + 20}.png`;
    let pathAva = `${__root}/${senderID + 30}.png`;
    let pathLine = `${__root}/${senderID + 40}.png`;

    // Process different reply types
    switch (Reply.type) {
      case "tenphu": {
        api.unsendMessage(Reply.messageID);
        return api.sendMessage(
          `🔍 You have chosen a sub-name: ${body.toUpperCase()}\n\n(Reply to this message to enter your phone number)`,
          threadID,
          function (err, info) {
            global.GoatBot.onReply.set(info.messageID, {
              type: "sdt",
              commandName,
              author: senderID,
              tenphu: body,
              tenchinh: Reply.tenchinh,
              messageID: info.messageID,
            });
          }
        );
      }

      case "sdt": {
        api.unsendMessage(Reply.messageID);
        return api.sendMessage(
          `🔍 You have selected your phone number: ${body.toUpperCase()}\n\n(Reply to this message to enter your email)`,
          threadID,
          function (err, info) {
            global.GoatBot.onReply.set(info.messageID, {
              type: "email",
              commandName, 
              author: senderID,
              sdt: body,
              tenchinh: Reply.tenchinh,
              tenphu: Reply.tenphu,
              messageID: info.messageID,
            });
          }
        );
      }

      case "email": {
        api.unsendMessage(Reply.messageID);
        return api.sendMessage(
          `🔍 You have selected email: ${body.toUpperCase()}\n\n(Reply to this message to enter your address)`,
          threadID,
          function (err, info) {
            global.GoatBot.onReply.set(info.messageID, {
              type: "color",
              commandName,
              author: senderID,
              sdt: Reply.sdt,
              tenchinh: Reply.tenchinh,
              tenphu: Reply.tenphu,
              email: body,
              messageID: info.messageID,
            });
          }
        );
      }

      case "color": {
        api.unsendMessage(Reply.messageID);
        return api.sendMessage(
          `🔍 You have chosen the address: ${body.toUpperCase()}\nReply with your background color (enter 'no' for default color)`,
          threadID,
          function (err, info) {
            global.GoatBot.onReply.set(info.messageID, {
              type: "create",
              commandName,
              author: senderID,
              sdt: Reply.sdt,
              tenchinh: Reply.tenchinh,
              tenphu: Reply.tenphu,
              diachi: body,
              email: Reply.email,
              messageID: info.messageID,
            });
          }
        );
      }

      case "create": {
        let color = body.toLowerCase() === "no" ? `#ffffff` : body;
        let address = Reply.diachi.toUpperCase();
        let name = Reply.tenchinh.toUpperCase();
        let email = Reply.email.toUpperCase();
        let subname = Reply.tenphu.toUpperCase();
        let phoneNumber = Reply.sdt.toUpperCase();

        api.unsendMessage(Reply.messageID);
        api.sendMessage(`⏳ Initializing image...`, threadID, (err, info) => {
          setTimeout(() => api.unsendMessage(info.messageID), 7000);
        });

        // Load images and create the banner
        let avatar = await this.circle(
          (
            await axios.get(
              `https://graph.facebook.com/${senderID}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
              { responseType: "arraybuffer" }
            )
          ).data
        );

        let background = (
          await axios.get(
            `https://1.bp.blogspot.com/-ZyXHJE2S3ew/YSdA8Guah-I/AAAAAAAAwtQ/udZEj3sXhQkwh5Qn8jwfjRwesrGoY90cwCNcBGAsYHQ/s0/bg.jpg`,
            { responseType: "arraybuffer" }
          )
        ).data;

        let mask = (
          await axios.get(
            `https://1.bp.blogspot.com/-zl3qntcfDhY/YSdEQNehJJI/AAAAAAAAwtY/C17yMRMBjGstL_Cq6STfSYyBy-mwjkdQwCNcBGAsYHQ/s0/mask.png`,
            { responseType: "arraybuffer" }
          )
        ).data;

        fs.writeFileSync(pathAva, Buffer.from(avatar));
        fs.writeFileSync(pathImg, Buffer.from(background));
        fs.writeFileSync(pathLine, Buffer.from(mask));

        let baseImage = await loadImage(pathImg);
        let baseAva = await loadImage(pathAva);
        let baseLine = await loadImage(pathLine);

        let canvas = createCanvas(baseImage.width, baseImage.height);
        let ctx = canvas.getContext("2d");

        // Draw the banner
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseAva, 824, 180, 285, 285);
        ctx.drawImage(baseLine, 0, 0, canvas.width, canvas.height);

        // Register the font and add text
        if (!fs.existsSync(`${__root}/UTMAvoBold.ttf`)) {
          let fontData = await axios.get(
            `https://drive.google.com/u/0/uc?id=1-j4SM9yWJBLy7X_03dziWFpmdb5Ic6Zs&export=download`,
            { responseType: "arraybuffer" }
          );
          fs.writeFileSync(`${__root}/UTMAvoBold.ttf`, Buffer.from(fontData.data));
        }

        registerFont(`${__root}/UTMAvoBold.ttf`, { family: "UTMAvoBold" });
        ctx.font = "100px UTMAvoBold";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(name, 680, 270);
        ctx.font = "40px UTMAvoBold";
        ctx.fillText(subname, 680, 320);

        const imageBuffer = canvas.toBuffer();
        fs.writeFileSync(pathImg, imageBuffer);

        // Send the final banner image as an attachment
        return api.sendMessage(
          { attachment: fs.createReadStream(pathImg) },
          threadID,
          () => {
            // Delete the temp files to free up space
            fs.unlinkSync(pathAva);
            fs.unlinkSync(pathImg);
            fs.unlinkSync(pathLine);
          }
        );
      }
    }
  },
};
