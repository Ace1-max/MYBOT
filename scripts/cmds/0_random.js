const axios = require('axios');

module.exports = {
  config: {
    name: 'random',
    //aliases: ['random'],
    version: '3.0',
    author: 'Subash | Ace',
    countDown: 10,
    role: 0,
    description: {
      en: 'Make Fun together with Bot',
    },
    category: 'fun',
    guide: {
      en: 'To use this command, type {pn} fact to send random fact, \n{pn} joke to send random joke, \n{pn} lines to send random lines, \n{pn} poem to send random lines in poem, \n{pn} quote to send random quotes.',
    },
  },

  onStart: async function({ api, event, args, message, usersData }) {
  
  /* - - - - - START OF THE OUTPUT - - - - - */
  
    try {
      if (!args[0]) return message.SyntaxError();

      const option = args[0].toLowerCase();
      
      /* - - - - - - - JOKE AREA - - - - - - - */
      
            if (option === 'joke') {
        
const response = await axios.get(`https://v2.jokeapi.dev/joke/Any`);

        if (response.status === 200) {
          const jokeData = response.data;

          let joke = '';
          if (jokeData.type === 'twopart') {
            joke = `${jokeData.setup}\n\n- ${jokeData.delivery}`;
          } else {
            joke = jokeData.joke;
          }
        
          message.reply({
              body: joke, 
              attachment: null
          });
        } else {
          message.reply({
              body: `Sorry I couldn't fetch a joke at this moment`, 
              attachment: null
          });
        }
        
        /* - - - - - QUOTES AREA - - - - - */
        
      } else if (option === 'quote') {
        const response = await axios.get('https://api.quotable.io/random');
        const quoteData = response.data;

        if (quoteData && quoteData.content && quoteData.author) {
          const messageToSend = `"${quoteData.content}"\n\n- ${quoteData.author}`;
          message.reply({
              body: messageToSend, 
              attachment: null
          });
        } else {
          message.reply({
              body: `Failed to retrieve a quote.`, 
              attachment: null
          });
        }
        
        /* - - - - - FACT AREA - - - - - */
        
      } else if (option === 'fact') {
        const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
        const factData = response.data;

        if (factData && factData.text) {
          const factText = `📌 - ${factData.text}`;
          message.reply({ 
               body: factText, 
               attachment: null 
           });
        } else {
          message.reply({ 
               body: 'Failed to retrieve a fact.', 
               attachment: null 
           });
        }
        
        /* - - - - - POEM AREA - - - - - */
        
      } else if (option === 'poem') {
        const response = await axios.get('https://poetrydb.org/random');
        const poemData = response.data[0];

        if (poemData && poemData.title && poemData.author && poemData.lines) {
          const poemTitle = poemData.title;
          const poemAuthor = poemData.author;
          const poemLines = poemData.lines.join('\n');
          const messageToSend = `📜 ${poemTitle}\n🖋 ${poemAuthor}\n\n${poemLines}`;
          message.reply({ 
               body: messageToSend, 
               attachment: null 
           });
        } else {
          message.reply({ 
               body: 'Failed to retrieve a poem.', 
               attachment: null 
           });
        }
        
        /* - - - - - BORED AREA - - - - - */
      /*} else if (option === 'bored') {
            const response = await axios.get("http://www.boredapi.com/api/activity/");
            const activity = response.data.activity;
            message.reply(`How about ${activity}?`);*/
        /* - - - - - LINES AREA - - - - - */
        
      } else if (option === 'lines') {
        const apiUrl = 'https://api.popcat.xyz/pickuplines';
        const response = await axios.get(apiUrl);

        const { pickupline } = response.data;

        const username = (await usersData.getName(event.senderID)) || 'User';
        const text = `${username}, ${pickupline}`;
        
        message.reply({
            body: text, 
            mentions: [{
                id: event.senderID, 
                tag: username
            }]
        });
      } else {
        message.reply(
          {
            body: '⚠ Usage guide:\nTo use this command, type /random fact — to send random fact,\n /random joke - to send random joke,\n /random lines - to send random lines,\n /random poem - to send random lines in poem,\n /random quote - to send random quotes.',
            attachment: null,
         });
        return;
      }
      
      /* - - - - - END OF THE OUTPUT - - - - - */
      
    } catch (error) {
      console.error(error);
      message.reply(
        {
            body: 'An error occurred: '+ error, 
            attachment: null
        });
    }
  },
};

