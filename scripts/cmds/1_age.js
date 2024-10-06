module.exports = {
  config: {
    name: "age",
    author: "Samir Œ | Improved by Ace",
    countDown: 15,
    role: 0,
    category: "info",
    description: {
      en: "Calculate your age based on your birthdate.",
    },
  },

  onStart: async function ({ api, event, args }) {
    const birthday = args[0];

    if (!birthday) {
      return api.sendMessage("Please provide your birthdate in YYYY-MM-DD format.", event.threadID);
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthday)) {
      return api.sendMessage("Invalid format. Use YYYY-MM-DD format (e.g., 2000-05-25).", event.threadID);
    }

    const currentDate = new Date();
    const birthDate = new Date(birthday);

    if (birthDate > currentDate) {
      return api.sendMessage("The birthdate is in the future. Please provide a valid past date.", event.threadID);
    }

    const ageYears = currentDate.getFullYear() - birthDate.getFullYear();
    const ageMonths = currentDate.getMonth() - birthDate.getMonth();
    const ageDays = currentDate.getDate() - birthDate.getDate();

    let adjustedYears = ageYears;
    let adjustedMonths = ageMonths;
    let adjustedDays = ageDays;

    if (ageDays < 0) {
      adjustedMonths--;
      adjustedDays += new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    }

    if (adjustedMonths < 0) {
      adjustedYears--;
      adjustedMonths += 12;
    }

    if (adjustedYears === 0 && adjustedMonths === 0 && adjustedDays === 0) {
      return api.sendMessage("Happy Birthday! 🎉 You just turned 1 year older today!", event.threadID);
    }

    const finalMessage = `Your age is ${adjustedYears} years, ${adjustedMonths} months, and ${adjustedDays} days. Am I right?`;

    api.sendMessage(finalMessage, event.threadID);
  },
};
