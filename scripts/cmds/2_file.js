const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "file",
    version: "1.0.3",
    author: "Ace",
    countDown: 5,
    role: 0,
    description: "Manage files or folders in the commands directory.",
    category: "owner",
    guide: {
      en: "    • {pn} start <text>" 
        + "\n• Filter files by starting characters."
        + "\n\n• {pn} ext <extension>" 
        + "\n• Filter files by file extension."
        + "\n\n• {pn} <leave blank>"
        + "\n• List all files in the directory."
    }
  },

  onStart: async function({ api, event, args, message }) {
    const command = args[0];
    const allowedUsers = ["100085947075503"]; // Adjust to authorized users
    
    if (!allowedUsers.includes(event.senderID)) {
      return message.reply("You don't have permission to use this feature.");
    }

    let files = fs.readdirSync(__dirname) || [];
    let msg = "", i = 1;

    if (command === 'help') {
      const helpMsg = `—— How to use the command:
• /file start <text> - Filter files by starting characters.
• /file ext <extension> - Filter files by file extension.
• /file <leave blank> - List all files in the directory.
• /file help - Show this guide.`;
      return message.reply(helpMsg);
    }

    if (command === "start" && args[1]) {
      const word = args.slice(1).join(" ");
      files = files.filter(file => file.startsWith(word));
      if (files.length === 0) {
        return message.reply(`No files start with: ${word}`);
      }
      msg = `There are ${files.length} files starting with: ${word}`;
    }

    else if (command === "ext" && args[1]) {
      const ext = args[1];
      files = files.filter(file => file.endsWith(ext));
      if (files.length === 0) {
        return message.reply(`No files have the extension: ${ext}`);
      }
      msg = `There are ${files.length} files with extension: ${ext}`;
    }

    else if (!args[0]) {
      if (files.length === 0) return message.reply("No files or folders found in the directory.");
      msg = "All files in the commands folder:";
    }

    else {
      const word = args.slice(0).join(" ");
      files = files.filter(file => file.includes(word));
      if (files.length === 0) {
        return message.reply(`No files contain: ${word}`);
      }
      msg = `There are ${files.length} files containing: ${word}`;
    }

    // Display list of files/folders
    files.forEach(file => {
      const stat = fs.statSync(path.join(__dirname, file));
      const typef = stat.isDirectory() ? "[Folder🗂️]" : "[File📄]";
      msg += `\n${i++}. ${typef} ${file}`;
    });

    message.reply(`Reply with "open <number>" to open or "delete <number>" to delete the corresponding file. You can reply with multiple commands, separated by spaces.\n${msg}`, (e, info) => {
      global.GoatBot.onReply.set({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        files
      });
    });
  },

  onReply: async function({ api, event, args, Reply, message }) {
  if (event.senderID != Reply.author) return;

  const commands = event.body.split(" ");
  const action = commands[0].toLowerCase(); // 'open' or 'delete'
  const numbers = commands.slice(1).map(n => parseInt(n));

  if (action !== "open" && action !== "delete") {
    return message.reply(`Invalid command. Please use "open <number>" or "delete <number>".`);
  }

  let msg = "";

  for (let num of numbers) {
    if (isNaN(num) || num < 1 || num > Reply.files.length) {
      msg += `Invalid file number: ${num}\n`;
      continue;
    }

    const target = Reply.files[num - 1];
    const targetPath = path.join(__dirname, target);
    
    try {
      const stat = fs.statSync(targetPath);

      if (action === "open") {
        if (stat.isDirectory()) {
          // Opening folder and listing its files
          const folderFiles = fs.readdirSync(targetPath);
          if (folderFiles.length === 0) {
            msg += `[Folder🗂️] ${target} is empty.\n`;
          } else {
            msg += `[Folder🗂️] ${target} contains the following files:\n`;
            let i = 1;
            folderFiles.forEach(file => {
              const fileStat = fs.statSync(path.join(targetPath, file));
              const typef = fileStat.isDirectory() ? "[Folder🗂️]" : "[File📄]";
              msg += `  ${i++}. ${typef} ${file}\n`;
            });
          }
        } 
        else if (stat.isFile()) {
          // Read file content and send it
          const content = fs.readFileSync(targetPath, "utf8");
          msg += `[File📄] ${target} opened. Content:\n\n${content}\n\n`;
        }
      } 
      
      else if (action === "delete") {
        if (stat.isDirectory()) {
          fs.rmdirSync(targetPath, { recursive: true });
          msg += `[Folder🗂️] ${target} deleted.\n`;
        } else if (stat.isFile()) {
          fs.unlinkSync(targetPath);
          msg += `[File📄] ${target} deleted.\n`;
        }
      }

    } catch (err) {
      msg += `[Error] Could not perform action on: ${target} (${err.message})\n`;
    }
  }

  message.reply(msg);
 }
};
