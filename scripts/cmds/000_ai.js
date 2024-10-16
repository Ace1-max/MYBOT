const axios = require('axios');

const Prefixes = [
  'gpt',
  '/gpt',
  'ai',
  '/ai'
];

const apiEndpoints = [
  'https://celestial-dainsleif-v2.onrender.com/gpt?gpt=',
  'https://deku-rest-apis.ooguy.com/api/llama-3-70b?q=',
  'https://deku-rest-apis.ooguy.com/api/gemma-7b?q=',
  'https://deku-rest-apis.ooguy.com/gemini?prompt=',
  'https://deku-rest-apis.ooguy.com/api/liner?q=', 
  'https://hiroshi-api.onrender.com/ai/gpt3?ask=', 
  'https://jailbreak-api.vercel.app/ai?ask='
];

function convertToBold(text) {
  const boldFont = {
    a: '𝗮', b: '𝗯', c: '𝗰', d: '𝗱', e: '𝗲', f: '𝗳', g: '𝗴', h: '𝗵',
    i: '𝗶', j: '𝗷', k: '𝗸', l: '𝗹', m: '𝗺', n: '𝗻', o: '𝗼', p: '𝗽',
    q: '𝗾', r: '𝗿', s: '𝘀', t: '𝘁', u: '𝘂', v: '𝘃', w: '𝘄', x: '𝘅',
    y: '𝘆', z: '𝘇', A: '𝗔', B: '𝗕', C: '𝗖', D: '𝗗', E: '𝗘', F: '𝗙',
    G: '𝗚', H: '𝗛', I: '𝗜', J: '𝗝', K: '𝗞', L: '𝗟', M: '𝗠', N: '𝗡',
    O: '𝗢', P: '𝗣', Q: '𝗤', R: '𝗥', S: '𝗦', T: '𝗧', U: '𝗨', V: '𝗩',
    W: '𝗪', X: '𝗫', Y: '𝗬', Z: '𝗭', 0: '𝟬', 1: '𝟭', 2: '𝟮', 3: '𝟯',
    4: '𝟰', 5: '𝟱', 6: '𝟲', 7: '𝟳', 8: '𝟴', 9: '𝟵'
  };

  return text.split('').map(char => boldFont[char] || char).join('');
}

function autoFont(text) {
  return text.replace(/\*\*(.*?)\*\*/g, (match, p1) => convertToBold(p1));
}

async function getImageURL(event) {
  if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0] && event.messageReply.attachments[0].url) {
    return event.messageReply.attachments[0].url;
  }
  return null;
}

module.exports = {
  config: {
    name: 'ai',
    version: '2.5',
    author: 'JV Barcenas',
    role: 0,
    category: '𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡',
    description: {
      en: 'Asks an AI for an answer based on the user prompt.',
    },
    guide: {
      en: '{pn} [prompt]',
    },
  },
  
  onStart: async function() {}, 
  
  onChat: async function ({ api, event, args, message }) {
    try {
      const prefix = Prefixes.find(p => event.body && event.body.toLowerCase().startsWith(p));
      if (!prefix) return;

      const prompt = event.body.substring(prefix.length).trim() || "Hello";
      const formattedPrompt = autoFont(prompt);

      const imageUrl = await getImageURL(event);

      if (prompt) {
        const sentMessage = await message.reply("Answering your question. Please wait a moment...");
        let respond = "Sorry, I couldn't generate an answer.";

        const shuffledEndpoints = apiEndpoints.sort(() => 0.5 - Math.random());

        for (let i = 0; i < shuffledEndpoints.length; i++) {
          try {
            let apiUrl = `${shuffledEndpoints[i]}${encodeURIComponent(formattedPrompt)}`;
            if (shuffledEndpoints[i].includes('gemini') && imageUrl) {
              apiUrl += `&url=${encodeURIComponent(imageUrl)}`;
            }

            const response = await axios.get(apiUrl);
            respond = response.data.content?.trim() || response.data.result?.trim() || response.data.gemini?.trim() || response.data.response?.trim();

            if (respond) break;
          } catch (error) {
            console.error(`❌ | API ${i + 1} failed:`, error);
          }
        }

        if (!respond) {
          respond = "All AI services are currently unavailable. Please try again later.";
        }

        await api.editMessage(respond, sentMessage.messageID);
        console.log('Sent answer as a reply to user');
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      await api.sendMessage("An unexpected error occurred. Please try again later.", event.threadID, event.messageID);
    }
  }
};
