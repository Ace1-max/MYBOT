const cheerio = require('cheerio');
const axios = require('axios');
const z = require('zod');

async function googleImage(query) {
  const GoogleImageSchema = z.string().url();
  const { data } = await axios.get(`https://www.google.com/search?q=${query}&tbm=isch`, {
    headers: {
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9',
      'sec-ch-ua': '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
    }
  });

  const $ = cheerio.load(data);
  const pattern =
    /\[1,\[0,"(?<id>[\d\w\-_]+)",\["https?:\/\/(?:[^"]+)",\d+,\d+\]\s?,\["(?<url>https?:\/\/(?:[^"]+))",\d+,\d+\]/gm;
  const matches = $.html().matchAll(pattern);
  const decodeUrl = (url) => decodeURIComponent(JSON.parse(`"${url}"`));

  return [...matches]
    .map(({ groups }) => decodeUrl(groups?.url))
    .filter((v) => /.*\.jpe?g|png$/gi.test(v))
    .map((value) => GoogleImageSchema.parse(value));
}

module.exports = {
  config: {
    name: "googleimage",
    author: "AceGerome",
    version: "1.0",
    description: "Fetches images from Google Images based on a search query.",
    category: "image",
    guide: {
      en: "{pn} <search_query>"
    }
  },

  onStart: async function ({ args, message }) {
    try {
      if (args.length === 0) {
        return message.reply("Please provide a search query. Example: /${this.config.name} cats");
      }

      const query = args.join(' ');
      const images = await googleImage(query);

      if (images.length === 0) {
        return message.reply(`No images found for "${query}".`);
      }

      const attachments = await Promise.all(images.slice(0, 5).map(url => global.utils.getStreamFromURL(url)));
      
      return message.reply({
        body: `Here are the top image results for "${query}":`,
        attachment: attachments
      });
      
    } catch (error) {
      console.error(error);
      return message.reply("Sorry, something went wrong while fetching the images. Please try again later.");
    }
  }
};
