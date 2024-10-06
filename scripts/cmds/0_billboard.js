const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const config = {
  name: "billboard",
  version: "1.0.0",
  role: 0,
  author: "AceGerome",
  category: "fun", 
  description: "Generate a billboard image",
  aliases: ["billboard"],
  guide: "[billboard <text>]",
  countDown: 15
};

async function handleCommand({ api, event, args, message }) {
  const text = args.join(" ");

  if (!text) {
    return api.sendMessage("❌ Usage: billboard <text>", event.threadID);
  }

  const imgurUrl = "https://i.imgur.com/U4WgPjQ.jpeg";
  const outputPath = path.join(__dirname, "output.png");

  try {
    const img = await loadImage(imgurUrl);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0);

    ctx.font = '48px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const x = img.width / 2;
    const y = img.height / 2;
    ctx.fillText(text, x, y);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    await api.sendMessage({
      body: "Here’s your billboard image:",
      attachment: fs.createReadStream(outputPath)
    }, event.threadID);

    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error('Error:', error);
    api.sendMessage("❌ An error occurred while generating the billboard image.", event.threadID);
  }
}

module.exports = {
  config: config,
  handleCommand: handleCommand,
  onStart: function({ api, message, event, args }) {
    return handleCommand({ api, event, args, message });
  },
  onReply: function({ api, message, event, args }) {
    return handleCommand({ api, event, args, message });
  }
};
