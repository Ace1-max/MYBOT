const axios = require('axios');
const fs = require('fs-extra');
const validUrl = require('valid-url');

module.exports = {
  config: {
    name: "ssweb",
    version: "2.0.0",
    author: "James | API by Ace",
    countDown: 5,
    role: 2,
    description: {
      en: "Take a screenshot of the webpage provided."
    },
    category: "owner",
    guide: {
      en: "To use this command, type {pn} <image/video> <url> [options] - Takes a screenshot inside the webpage.\nOptions:\n- waitTime=<ms> (Optional wait time before taking the screenshot, e.g., 5000 for 5s)\n- fileType=<png/jpg/gif/mp4> (Optional format for output)"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const { getPrefix } = global.utils;
    const p = getPrefix(threadID);

    if (!args[0] || !args[1]) {
      return api.sendMessage(`❌ | Incorrect format! \n\nExample: ${p}ssweb <image/video> <url> [options]`, threadID, messageID);
    }

    const mode = args[0].toLowerCase();
    const url = args[1];

    if (!validUrl.isWebUri(url)) {
      return api.sendMessage(`❌ | The provided URL is not valid. Please check it and try again.`, threadID, messageID);
    }

    let waitTime = 0;
    let fileType = "png"; 

    args.slice(2).forEach(option => {
      if (option.startsWith("waitTime=")) {
        waitTime = parseInt(option.split("=")[1]) || 0;
      }
      if (option.startsWith("fileType=")) {
        fileType = option.split("=")[1];
      }
    });

    const baseApiUrl = 'https://shot.screenshotapi.net/screenshot';
    const apiToken = '8RNQ039-4NAMVYF-G8PB6NS-K41CAGF';
    let screenshotApiUrl = `${baseApiUrl}?token=${apiToken}&url=${encodeURIComponent(url)}&output=json&wait_for_event=load`;

    if (waitTime > 0) {
      screenshotApiUrl += `&delay=${waitTime}`;
    }

    if (mode === "video" || mode === "-v") {
      screenshotApiUrl += `&file_type=${fileType === "gif" ? "gif" : "mp4"}&scrolling_screenshot=true`;
    } else if (mode === "image" || mode === "-i") {
      screenshotApiUrl += `&file_type=${["png", "jpg", "jpeg"].includes(fileType) ? fileType : "png"}`;
    } else {
      return api.sendMessage(`❌ | Invalid mode! Please choose either "image" or "video".`, threadID, messageID);
    }

    try {
      const response = await axios.get(screenshotApiUrl);
      const screenshotUrl = response.data.screenshot;

      const fileName = mode === "video" ? `web.${fileType === "gif" ? "gif" : "mp4"}` : `web.${fileType}`;
      const filePath = __dirname + `/tmp/${fileName}`;

      const fileBuffer = (await axios.get(screenshotUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(filePath, Buffer.from(fileBuffer));

      return api.sendMessage({
        body: `✅ | Screenshot taken successfully! Mode: ${mode.toUpperCase()} | File Type: ${fileType.toUpperCase()}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (error) {
      console.error("Error while taking screenshot:", error);
      return api.sendMessage(`❌ | Failed to take screenshot. Please try again later.`, threadID, messageID);
    }
  }
};
