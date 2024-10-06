const axios = require('axios');

module.exports = {
  config: {
    name: "countryinfo",
    //aliases: [""], 
    version: "1.0.0",
    author: "lahatra",
    countDown: 15,
    role: 0,
    description: {
        en: "Get The CountyInfo"
    }, 
    category: "info", 
    guide: {
      en: "To use this command, type {pn} [country] - To get the Info."
    }
  }, 
  onStart: async function ({ api, event, args }) {
    const query = args.join(' ');
    if (!query) {
      return api.sendMessage("Please provide a country!", event.threadID, event.messageID);
    }
    try {
      const response = await axios.get(`https://restcountries.com/v3/name/${query}`);
      if (response.data) {
        const country = response.data[0];
        let message = '';
        message  = `Name Of The Country: ${country.name.common}\n`
                  + `Official: ${country.name.official}\n`
                  + `Capital: ${country.capital}\n`
                  + `Currencies: ${Object.values(country.currencies).map(currency => `${currency.name} || ${currency.symbol}`).join(', ')}\n`
                  + `Population: ${country.population}\n`
                  + `Language: ${Object.values(country.languages).join(', ')}\n`
                  + `TimeZone: ${country.timezones.join(', ')}\n`
                  + `Continent: ${country.continents.join(', ')}`;
        await api.sendMessage(message, event.threadID, event.messageID);
      } else {
        api.sendMessage("I couldn't find a country matching your search!", event.threadID, event.messageID);
      }
    } catch (error) {
      api.sendMessage("I encountered an error retrieving country information!", event.threadID, event.messageID);
    }
  }
};
