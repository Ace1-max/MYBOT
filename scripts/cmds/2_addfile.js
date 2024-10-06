const fs = require("fs");

module.exports = {
  config: {
    name: "addfile",
    //aliases: ["af"],
    version: "1.0",
    author: "EDINST",
    countDown: 10,
    role: 2,
    description: "This command allows you to add a file or folder to a specific directory.", 
    category: "owner",
    guide: {
      en: "To add a file to a specific directory, use the command: `{pn} <directory/no> <file/folder> <name> <content/no>`"
    }
  },
  langs: {
    en: {
      gg: ""
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      if (args.length < 4) {
        throw new Error("Invalid arguments. Usage: `/addfile <directory name/no> | <folder/file> | <name folder/file> | <content file/no>`");
      }

      const [directory, fileType, name, content] = args.join(" ").split(" | ");

      let fullPath = "";
      if (directory === "no") {
        fullPath = name;
      } else {
        fullPath = `${directory}/${name}`;
      }

      if (fileType === "file") {
        fs.writeFileSync(fullPath, content);
      } else if (fileType === "folder") {
        fs.mkdirSync(fullPath, { recursive: true });
      } else {
        throw new Error("Invalid file/folder type. Possible values: `file` or `folder`.");
      }

      return api.sendMessage(`Successfully added ${fileType} "${name}" to directory "${directory}".`, event.threadID);

    } catch (error) {
      console.error(error);
      return api.sendMessage(`An error occurred: ${error.message}`, event.threadID);
    }
  }
};
