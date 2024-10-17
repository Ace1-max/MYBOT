const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");

const styles = [
  "Hyper-Surreal Escape",        // 1
  "Neon Fauvism",                // 2
  "Post-Analog Glitchscape",      // 3
  "AI Dystopia",                 // 4
  "Vivid Pop Explosion"          // 5
];

module.exports = {
  config: {
    name: "dalle",
    aliases: ["imagegen", "aiimage"],
    author: "AceGerome",
    version: "2.2",
    cooldowns: 20,
    role: 0,
    description: "Generates an image based on a prompt with optional style selection.",
    category: "image",
    guide: "{p}dalle <prompt> | [style (optional)]\nExample: {p}dalle 'sunset over mountains' 2\nAvailable styles:\n1. Hyper-Surreal Escape\n2. Neon Fauvism\n3. Post-Analog Glitchscape\n4. AI Dystopia\n5. Vivid Pop Explosion",
  },
  
  onStart: async function ({ message, args, api, event }) {
    const userInput = args.join(" ").trim();
    
    if (!userInput) {
      return message.reply("❌ | Please provide a prompt to generate an image.");
    }
    
    const splitInput = userInput.split("|");
    const prompt = splitInput[0].trim();
    const styleIndex = splitInput[1] ? parseInt(splitInput[1].trim()) : Math.floor(Math.random() * styles.length) + 1;

    if (styleIndex < 1 || styleIndex > styles.length) {
      return message.reply(`❌ | Invalid style selected. Please choose a style between 1 and 5.\nAvailable styles:\n1. Hyper-Surreal Escape\n2. Neon Fauvism\n3. Post-Analog Glitchscape\n4. AI Dystopia\n5. Vivid Pop Explosion`);
    }

    const cacheFolderPath = path.join(__dirname, "tmp");
    const imageName = `${Date.now()}_generated_image.png`;
    const imagePath = path.join(cacheFolderPath, imageName);
    
    try {
      api.setMessageReaction("🕐", event.messageID, (err) => {}, true);

      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const { image, style } = await generateImage(prompt, styleIndex);
      
      const response = await axios.get(image, { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

      const stream = fs.createReadStream(imagePath);
      message.reply({ body: `Here's your image generated with the style "${style}":`, attachment: stream }, (err) => {
        if (err) {
          console.error("Error sending image:", err);
        } else {
          fs.unlink(imagePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
      });

    } catch (error) {
      console.error("Error:", error);
      message.reply(`❌ | An error occurred: ${error.message}\nPlease try again later.`);
    }
  }
};

async function generateImage(prompt, styleIndex) {
  try {
    const formData = new FormData();
    formData.append("field-0", prompt);
    formData.append("field-1", styles[styleIndex - 1]);

    const response = await axios.post("https://devrel.app.n8n.cloud/form/flux", formData, {
      headers: {
        ...formData.getHeaders(),
        Accept: "*/*",
        "User-Agent": "Postify/1.0.0"
      }
    });

    const data = response.data;
    const $ = cheerio.load(data);
    return {
      image: $(".image-container img").attr("src"),
      style: $(".style-text").text().replace("Style: ", "")
    };
  } catch (error) {
    throw new Error("Failed to generate the image.");
  }
}
