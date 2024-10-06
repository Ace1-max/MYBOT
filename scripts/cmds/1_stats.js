module.exports = {
  config: {
    name: "stats",
    //aliases: ["ping","upt","time"],
    version: "1.0",
    author: "OtinXSandip",
    countDown: 10,
    role: 0,
    description: {
      en: "Shows stats of Bot.",
    },
    category: "info",
    guide: {
      en: "Use {pn} — To see stats of bot.",
    },
  },

  onStart: async function ({ api, event, args, usersData, threadsData }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();

      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const uptimeString = `${hours} hours ${minutes} minutes ${seconds} Second`;

      const currentDate = new Date();
      const options = { year: "numeric", month: "numeric", day: "numeric" };
      const date = currentDate.toLocaleDateString("en-US", options);
      const time = currentDate.toLocaleTimeString("en-US", {
        timeZone: "Asia/Manila",
        hour12: true,
      });

      const timeStart = Date.now();
      const BoxID = api.getCurrentUserID();
      await api.sendMessage({
        body: "Hulat bala BOY",
      }, BoxID);

      const ping = Date.now() - timeStart;

      let pingStatus = "Not Smooth";
      if (ping < 400) {
        pingStatus = "Smooth than Ferrari";
      }

      api.sendMessage({
        body: `Currently, Bot was running in ${uptimeString}`
         + `\n\n━━INFO━━`
         + `\n📅 Date: ${date}`
         + `\n⏰ Time: ${time}`
         + `\n👪 Total Users: ${allUsers.length}`
         + `\n📔 Total threads: ${allThreads.length}`
         + `\n📊 Ping: ${ping}ms`
         + `\n➥ Ping status: ${pingStatus}`
      }, event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while retrieving data.", event.threadID);
    }
  }
};
