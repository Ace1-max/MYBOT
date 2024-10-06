const axios = require('axios');
const triviaData = {};

const difficultyMap = {
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
};

const categoryMap = {
  general: 9,
  books: 10,
  film: 11,
  music: 12,
  theatres: 13,
  television: 14,
  videogames: 15,
  boardgames: 16,
  science: 17,
  computers: 18,
  math: 19,
  mythology: 20,
  sports: 21,
  geography: 22,
  history: 23,
  politics: 24,
  art: 25,
  celebrity: 26,
  animals: 27,
  vehicles: 28,
  comics: 29,
  gadgets: 30,
  anime: 31,
  cartoon: 32,
};

module.exports = {
  config: {
    name: "quiz",
    aliases: ['quiz'],
    version: "1.0",
    author: "Ace",
    countDown: 5,
    role: 0,
    description: {
      en: "Answer the Trivia or Random Question provided by the quiz."
    },
    category: "game",
    guide: {
      en: "{pn} [difficulty] [category]"
    }
  },

  onStart: async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    if (triviaData[threadID]) {
      clearTimeout(triviaData[threadID].timeout);
      delete triviaData[threadID];
    }

    try {
      const [difficultyInput, categoryInput] = args.map(arg => arg.toLowerCase());
      const difficulty = difficultyMap[difficultyInput] || ''; 
      const category = categoryMap[categoryInput] || ''; 

      if (args[0] === 'help') {
        return api.sendMessage(`Welcome to the Quiz!\n\nDifficulties:\n\neasy\nmedium\nhard\n\nCategories:\n${Object.keys(categoryMap).join('\n')}\n\nUsage:\n${global.GoatBot.config.prefix}quiz [difficulty] [category]`, threadID, messageID);
      }

      const response = await axios.get(`https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986&difficulty=${difficulty}&category=${category}`);
      const question = response.data.results[0];

      if (!question) {
        return api.sendMessage("Could not find any trivia for the given category or difficulty. Please try again with different parameters.", threadID);
      }

      const options = [question.correct_answer, ...question.incorrect_answers].sort(() => Math.random() - 0.5);
      const optionsString = options.map((option, index) => `${String.fromCharCode(65 + index)}. ${decodeURIComponent(option)}`).join('\n');

      const questionMessage = `Difficulty: ${capitalizeFirstLetter(decodeURIComponent(question.difficulty))}\nCategory: ${decodeURIComponent(question.category)}\n\n${decodeURIComponent(question.question)}\n\n${optionsString}`;
      api.sendMessage(questionMessage, threadID, messageID);

      triviaData[threadID] = {
        correctIndex: options.indexOf(question.correct_answer),
        answered: false,
        options,
        senderID
      };

      const timeout = setTimeout(() => {
        revealAnswer(api, threadID);
      }, 30000);

      triviaData[threadID].timeout = timeout;

    } catch (error) {
      console.error("Error fetching trivia question:", error);
      api.sendMessage("An error occurred while fetching the trivia question.", threadID);
    }
  },

  onChat: function({ api, event }) {
    const { threadID, body, senderID, messageID } = event;

    if (!triviaData[threadID] || triviaData[threadID].answered) return;

    const userAnswer = body.trim().toLowerCase();
    if (!/^[a-d]$/.test(userAnswer)) return;

    const { correctIndex, options, senderID: playerID } = triviaData[threadID];
    const correctLetter = String.fromCharCode(65 + correctIndex).toLowerCase();

    if (senderID !== playerID) return;

    clearTimeout(triviaData[threadID].timeout);
    triviaData[threadID].answered = true;

    if (userAnswer === correctLetter) {
      getUserName(api, senderID)
        .then(senderName => {
          api.sendMessage(`${senderName}, congrats! 🎉 Your answer is correct: ${correctLetter.toUpperCase()}. ${decodeURIComponent(options[correctIndex])}`, threadID, messageID);
        })
        .catch(() => api.sendMessage("Congrats! Your answer is correct!", threadID, messageID));
    } else {
      getUserName(api, senderID)
        .then(senderName => {
          api.sendMessage(`Sorry, ${senderName}. The correct answer is: ${correctLetter.toUpperCase()}. ${decodeURIComponent(options[correctIndex])}`, threadID, messageID);
        })
        .catch(() => api.sendMessage(`The correct answer is: ${correctLetter.toUpperCase()}. ${decodeURIComponent(options[correctIndex])}`, threadID, messageID));
    }
  }
};

async function getUserName(api, senderID) {
  try {
    const userInfo = await api.getUserInfo(senderID);
    const user = userInfo[senderID];
    return user && user.name ? user.name : "Anonymous";
  } catch (error) {
    console.error("Error fetching user info:", error);
    return "Anonymous";
  }
}

function revealAnswer(api, threadID) {
  if (!triviaData[threadID]?.answered) {
    const { correctIndex, options } = triviaData[threadID];
    const correctLetter = String.fromCharCode(65 + correctIndex);
    api.sendMessage(`Time's up! The correct answer is:\n\n${correctLetter}. ${decodeURIComponent(options[correctIndex])}`, threadID);
    triviaData[threadID].answered = true;
  }
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}