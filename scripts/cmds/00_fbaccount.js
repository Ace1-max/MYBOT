const accounts = [];
let backup = [];

function generateAccount(email, password) {
  return `[Generate Successfully]\n\n` +
         `Email: ${email}\n` + 
         `Password: ${password}`;
}

module.exports = {
  config: {
    name: "fbaccount",
    aliases: ['fbacc'],
    version: "1.1",
    author: "?/zed | Ace",
    countDown: 5,
    role: 2,
    description: {
      en: "Manage Facebook account stock with additional features."
    },
    category: "owner",
    guide: {
      en: "{pn} add <email> <password> - Add an account\n"
        + "{pn} get - Retrieve and remove an account\n"
        + "{pn} view <index> - View a specific account by index\n"
        + "{pn} list - View all stocked accounts\n"
        + "{pn} clear - Clear all stocked accounts\n"
        + "{pn} backup - Backup current accounts\n"
        + "{pn} restore - Restore accounts from backup\n"
        + "{pn} search <email> - Search for an account by email"
    }
  }, 
  
  onStart: async function ({ api, event, args }) {
    const action = args[0];
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID); 

    if (!action) {
      return api.sendMessage(`Invalid command. Usage:\n${p}fbacc add <email> <password>\n${p}fbacc get\n${p}fbacc list\n${p}fbacc view <index>\n${p}fbacc clear\n${p}fbacc backup\n${p}fbacc restore\n${p}fbacc search <email>`, event.threadID);
    }

    if (action === "get") {
      if (accounts.length > 0) {
        const { email, password } = accounts.shift();
        api.sendMessage(generateAccount(email, password), event.threadID);
      } else {
        api.sendMessage("No accounts available at the moment.", event.threadID);
      }
    } 
    else if (action === "add") {
      const email = args[1];
      const password = args[2];

      if (!email || !password) {
        return api.sendMessage(`Invalid format. Usage: ${p}fbacc add <email> <password>`, event.threadID);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return api.sendMessage("Please provide a valid email address.", event.threadID);
      }

      accounts.push({ email, password });
      api.sendMessage(`Account [${email}] added to stock.`, event.threadID);
    } 
    else if (action === "view") {
      const index = parseInt(args[1]) - 1;
      if (isNaN(index) || index < 0 || index >= accounts.length) {
        return api.sendMessage("Invalid index. Please provide a valid number within the account list range.", event.threadID);
      }
      const { email, password } = accounts[index];
      api.sendMessage(generateAccount(email, password), event.threadID);
    }
    else if (action === "list") {
      if (accounts.length === 0) {
        api.sendMessage("There are no accounts in stock.", event.threadID);
      } else {
        const accountList = accounts.map((acc, idx) => `${idx + 1}. Email: ${acc.email}`).join('\n');
        api.sendMessage(`Accounts in stock:\n${accountList}`, event.threadID);
      }
    } 
    else if (action === "clear") {
      accounts.length = 0;
      api.sendMessage("All accounts have been cleared.", event.threadID);
    }
    else if (action === "backup") {
      backup = [...accounts];
      api.sendMessage("Accounts backed up successfully.", event.threadID);
    }
    else if (action === "restore") {
      if (backup.length > 0) {
        accounts.length = 0;
        accounts.push(...backup);
        api.sendMessage("Accounts restored from backup.", event.threadID);
      } else {
        api.sendMessage("No backup available to restore.", event.threadID);
      }
    }
    else if (action === "search") {
      const searchEmail = args[1];
      if (!searchEmail) {
        return api.sendMessage(`Please provide an email to search for. Usage: ${p}fbacc search <email>`, event.threadID);
      }
      const found = accounts.find(acc => acc.email === searchEmail);
      if (found) {
        api.sendMessage(generateAccount(found.email, found.password), event.threadID);
      } else {
        api.sendMessage(`No account found with email: ${searchEmail}`, event.threadID);
      }
    }     
    else {
      api.sendMessage(`Invalid action. Use ${p}fbacc get, ${p}fbacc add <email> <password>, ${p}fbacc list, ${p}fbacc view <index>, ${p}fbacc clear, ${p}fbacc backup, ${p}fbacc restore, or ${p}fbacc search <email>`, event.threadID);
    }
  },
};
