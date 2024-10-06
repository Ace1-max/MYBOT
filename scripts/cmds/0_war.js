module.exports = {
  config: {
    name: "war",
    aliases: [],
    version: "1.0.0",
    author: "Ace",
    countDown: 60,
    role: 0, 
    description: {
      en: "Making War in the box chat."
    },
    category: "fun",
    guide: {
      en: "   {pn}"
    }
  },
  
  langs: {
    en: {
      text1: "%1, ginalit moko putanginamo ka walang iyakan ah bwakananginaka eh", 
      text2: "%1, gumagamit ka nalang bot ingay mo pa tanginaka ket nga siguro reboot ng cp mo di mo alam dami mong satsat ampota", 
      text3: "%1, gawa ka bot mo tas isali mo sa maraming gc ewan ko di ka mag panic", 
      text4: "gago ampota palamunin",
      text5: "pabigat sa pamilya tanginaka lagay mo na cp mo %1, paluin ka mamaya di kapa nag hugas plato HAHAHAHA tanga ampota", 
      text6: "%1, ew asa sa magulang feeling coolkid ang cool mo naman tanginamo pwede kana mamatay", 
      text7: "syempre mag rereply ka dito %1 tanga ka eh alam mong bot kakausapin mo ulol kanaba? %1", 
      text8: "jejemon ka pa %1 frfr HAHAHAHAHAHAHAHA patayin kaya kitang jejemon ka", 
      text9: "%1, kaya pa? %1 baka mapahiya ka sa gc nyo leave kana block mo bot HAHAHAHAHA luha mo boi punasan mo na",
      text10: "%1, pumapatol sa bot yuucckkkk -nudes lng naman ambag walang alam", 
      text11: "feeling expert ampota ket one name siguro di mo alam", 
      text12: "kaya paba? %1, pag naluluha kana stop na ah leave na awa ako sayo eh bata",
      text13: "%1, baka ikaw yung 16 years old na nag cocomment sabi ng minor ah ulol HAHAHAHAHA",
      text14: "Walis kana ng bahay nyo %1, tamo lilipad tsinelas sa mukha mo mamaya",
      text15: "tanginaka ginigigil mo bot ko sarap mong i sidekick with recall putanginaka %1",
      text16: "%1, gulat ka no? HAHAHAHA tanga ka kase d moto alam ",
      text17: "nagrereply ka palang minumura na kita tanginamo %1",
      text18: "Hinayupak kang piste...tangina mong yawa ka %1...ilalabas mo pagiging coolkid mo frfr istg",
      text19: "%1, baka pag in-english kita pati nanay mo mahimatay",
      text20: "%1, what a lame name you have there. It seems like your parents had a momentary lapse of judgment when they decided to give you such a ridiculous name",
      text21: "%1, Your existence is as pointless as a broken pencil, and your intelligence level would make a rock look like a genius.",
      text22: ` Seriously, %1 who even raised you? Probably someone who doesn't know the meaning of the word "%2." You must be a real disappointment to them.`,
      text23: `%1, feeling famous nagmamakaawa i heart profile agoiiii HAHAHAHAHAA LT si tanga`,
      text24: "lakas maka myday pangit naman tuwang tuwa pa pag may nag heart napindot lng naman yak",
      text25: "face reveal nga baka puro sipon at luha kna ah HAAHHAHAHA iyakin ka %1 eh",
      text26: "stop naba ako? %1 baka hiyang hiya kana sa sarili mo leave kana wala kang ambag sa gc nato",
      text27: "Hoy, %1, ang pangit-pangit mo! Mukha ka talagang sinapian ng kalaswaan! Mga bobo ang kasama mo kasi katulad lang kayo, walang kwenta!",
      text28: "%1, ang simbolismo ng kahinaan! 🙄 Ang pangalan mo man ay bongga, pero ang iyong personalidad? 🤔 Ito ay tila pinakamababaw na kawalan. Parang isa kang bagay na walang kabuluhan, at napakatuwang tignan.",
      text29: `Pero, %1 pahintulutan mong pag-usapan natin ang iyong hitsura, ha? 😆 Tinatawag mo ang iyong sarili \"gwapo/maganda,\" pero sa katotohanan, tila isang pangit na nilalang ka na mula sa pelikulang pang-agham. 🤢 Nakakagulat kung paano mo nakakayang maging pangit at walang kabuhay-buhay sa iisang pagkakataon.`,
      text30: "wala kang masabi? %1, malamang tanga ka gago ka putangina kang nigga ka HAHAHAHAHA",
      text31: "%1, feeling gwapo/maganda pag hinubad facemask mukhang tilapiang nakawala sa tubig ampota",
      text32: "%1, till next time gago bye na pasok kana sa aquarium mo bawal ka sa lupa mukha kang wtf",
      text33: "%1, Thank You for listening my war messages."
    }
  }, 
  onStart: async function({ api, message, args, event, getLang, usersData }) {
    const { threadID } = event;
    var mention = Object.keys(event.mentions);
    const userData = await usersData.get(event.senderID);
    const requiredMoney = "1000000";
    if (requiredMoney > userData.money) {
      return message.reply(`You dont have ${requiredMoney} money to make war.`);
    }
    if (mention.length !== 1) {
        message.reply("Please mention one person to make war.");
        return;
    }
    const mentionName =  event.mentions[mention[0]].replace("@", "");
    
    const getUserInfo = async (api, userID) => {
         try {
             const name = await api.getUserInfo(userID);
             return name[userID].firstName;
         } catch (error) {
             console.error(error);
         }
    };
    
    await usersData.set(event.senderID, {
      money: userData.money + -requiredMoney,
      data: userData.data,
    });
    
    const name = await getUserInfo(api, mention[0]);
    if (name.toLowerCase().includes("ace")) {
        message.reply("Ayo GAY!! You can't make war in my owner🤬");
        return;
    }
    api.sendMessage(getLang("text1", name), threadID);
    setTimeout(() => {
        api.sendMessage(getLang("text2", name), threadID)
    }, 3000);
    setTimeout(() => {
        api.sendMessage(getLang("text3", name), threadID)
    }, 5000);
    setTimeout(() => {
        api.sendMessage(getLang("text4"), threadID)
    }, 7000);
    setTimeout(() => {
        api.sendMessage(getLang("text5", name), threadID)
    }, 9000);
    setTimeout(() => {
        api.sendMessage(getLang("text6", name), threadID)
    }, 12000);
    setTimeout(() => {
        api.sendMessage(getLang("text7", name), threadID)
    }, 15000);
    setTimeout(() => {
        api.sendMessage(getLang("text8", name), threadID)
    }, 17000);
    setTimeout(() => {
        api.sendMessage(getLang("text9", name), threadID)
    }, 20000);
    setTimeout(() => {
        api.sendMessage(getLang("text10", name), threadID)
    }, 23000);
    setTimeout(() => {
        api.sendMessage(getLang("text11"), threadID)
    }, 25000);
    setTimeout(() => {
        api.sendMessage(getLang("text12", name), threadID)
    }, 28500);
    setTimeout(() => {
        api.sendMessage(getLang("text13", name), threadID)
    }, 31000);
    setTimeout(() => {
        api.sendMessage(getLang("text14", name), threadID)
    }, 36000);
    setTimeout(() => {
        api.sendMessage(getLang("text15", name), threadID)
    }, 39000);
    setTimeout(() => {
        api.sendMessage(getLang("text16", name), threadID)
    }, 40000);
    setTimeout(() => {
        api.sendMessage(getLang("text17", name), threadID)
    }, 65000);
    setTimeout(() => {
        api.sendMessage(getLang("text18", name), threadID)
    }, 70000);
    setTimeout(() => {
        api.sendMessage(getLang("text19", name), threadID)
    }, 75000);
    setTimeout(() => {
        api.sendMessage(getLang("text20", name), threadID)
    }, 80000);
    setTimeout(() => {
        api.sendMessage(getLang("text21", name), threadID)
    }, 85000);
    const arrayWords = ["decency", "innane", "splendid"]
    const words = arrayWords[Math.floor(Math.random() * arrayWords.length)];
    setTimeout(() => {
        api.sendMessage(getLang("text22", name, words), threadID)
    }, 90000);
    setTimeout(() => {
        api.sendMessage(getLang("text23", name), threadID)
    }, 95000);
    setTimeout(() => {
        api.sendMessage(getLang("text24"), threadID)
    }, 100000);
    setTimeout(() => {
        api.sendMessage(getLang("text25", name), threadID)
    }, 105000);
    setTimeout(() => {
        api.sendMessage(getLang("text26", name), threadID)
    }, 110000);
    setTimeout(() => {
        api.sendMessage(getLang("text27", name), threadID)
    }, 115000);
    setTimeout(() => {
        api.sendMessage(getLang("text28", name), threadID)
    }, 119000);
    setTimeout(() => {
        api.sendMessage(getLang("text29", name), threadID)
    }, 124000);
    setTimeout(() => {
        api.sendMessage(getLang("text30", name), threadID)
    }, 128000);
    setTimeout(() => {
        api.sendMessage(getLang("text31", name), threadID)
    }, 135000);
    setTimeout(() => {
        api.sendMessage(getLang("text32", name), threadID)
    }, 140000);
    setTimeout(() => {
        api.sendMessage(getLang("text33", name), threadID)
    }, 145000);
  }
};
