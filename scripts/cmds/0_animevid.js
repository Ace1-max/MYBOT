const axios = require('axios');

let sentVideos = [];

module.exports = {
  config: {
    name: "animevid",
    author: "Kshitiz | Ace",
    version: "1.1",
    countDown: 10, 
    role: 0,
    description: {
      en: "Get a random anime video from TikTok",
    },
    category: "info",
    guide: {
      en: "{pn}",
    },
  },
  
  onStart: async function ({ message, event, api }) {
    try {
      const loadingMessage = await message.reply('Loading Anime video...');

      const tikTokUserIds = [
        '6850681469859628034', 
        '7184871063795352603', 
        '6957010568603829254', 
        '7033020341324809242', 
        '6954581066443736069'
      ]; 

      const videos = await fetchTikTokUsersVideos(tikTokUserIds);

      if (!videos || videos.length === 0) {
        await message.reply({ body: 'No anime videos found.' });
        return;
      }

      const remainingVideos = videos.filter(video => !sentVideos.includes(video.video_id));

      if (remainingVideos.length === 0) {
        sentVideos = [];
        return message.reply({ body: 'All videos have been sent. Please try again later.' });
      }

      const randomVideo = remainingVideos[Math.floor(Math.random() * remainingVideos.length)];
      await sendVideo(api, event.threadID, randomVideo, event.messageID);

      sentVideos.push(randomVideo.video_id);
      api.unsendMessage(loadingMessage.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage({ body: 'An error occurred while processing your request. Please try again later.' }, event.threadID);
    }
  },
};

async function fetchTikTokUsersVideos(userIds) {
  const allVideos = [];
  
  for (const userId of userIds) {
    const videos = await fetchTikTokUserVideos(userId);
    if (videos) {
      allVideos.push(...videos);
    }
  }
  
  return allVideos;
}

async function sendVideo(api, threadID, video, messageID) {
  if (!video || !video.play) {
    api.sendMessage({ body: 'Error: Video not found.' }, threadID);
    return;
  }

  try {
    const videoStream = await getStreamFromURL(video.play);
    await api.sendMessage({
      body: `✅ | Random TikTok Anime Video`,
      attachment: videoStream,
    }, threadID, messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage({ body: 'An error occurred while sending the video. Please try again later.' }, threadID);
  }
}

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}

async function fetchTikTokUserVideos(userId) {
  const options = {
    method: 'GET',
    url: 'https://tiktok-scraper7.p.rapidapi.com/user/posts',
    params: {
      user_id: userId,
      count: '300',
    },
    headers: {
      'X-RapidAPI-Key': 'ece5655ae3msh55483dd9d60402fp12e36ajsn5adc6b59bc68',
      'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com',
    },
  };
  
  try {
    const response = await axios.request(options);
    return response.data.data.videos || [];
  } catch (error) {
    console.error(`Error fetching videos for user ${userId}:`, error);
    return [];
  }
}
