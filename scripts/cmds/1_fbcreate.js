const fs = require("fs");
const axios = require("axios");
const crypto = require("crypto");

module.exports = {
  config: {
    name: "fbcreate",
    aliases: [],
    version: "1.0.0",
    author: "Developer",
    countDown: 10,
    role: 2,
    description: {
      en: "Create Facebook accounts using randomly generated email addresses."
    },
    category: "owner",
    guide: {
      en: "   {pn} <amount>"
    }
  },

  onStart: async function ({ message, event, args }) {
    try {
      const senderID = event.senderID;
      const amount = parseInt(args[0], 10);

      if (isNaN(amount) || amount <= 0) {
        return message.reply("❌ Invalid number of accounts requested. Please specify a positive integer.");
      }

      message.reply(`🚀 Creating ${amount} Facebook account(s)... This may take some time.`);

      const results = await createMultipleAccounts(amount);
      const successfulAccounts = results.filter(result => result.success);
      const failedAccounts = results.filter(result => !result.success);

      let resultMessage = `🎉 ${successfulAccounts.length} account(s) created successfully:\n`;
      successfulAccounts.forEach((acc, index) => {
        resultMessage += `\n${index + 1}: ${acc.firstName} ${acc.lastName} - ${acc.email} (Password: ${acc.password})`;
      });

      if (failedAccounts.length > 0) {
        resultMessage += `\n⚠️ ${failedAccounts.length} account(s) failed to create:\n`;
        failedAccounts.forEach((fail, index) => {
          resultMessage += `\n${index + 1}: ${fail.email || `Account ${index + 1}`} - ${fail.error}`;
        });
      }

      message.reply(resultMessage);

    } catch (error) {
      console.error(error);
      return message.reply("❌ An error occurred while creating Facebook accounts. Please try again.");
    }
  },
};

const genRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomName = () => {
  const firstNames = [
    'Naruto', 'Sakura', 'Luffy', 'Goku', 'Ichigo', 
    'Eren', 'Mikasa', 'Levi', 'Edward', 'Alphonse',
    'Shinji', 'Asuka', 'Kirito', 'Asuna', 'Natsu',
    'Lucy', 'Saitama', 'Genos', 'Yusuke', 'Spike'
  ];

  const surnames = [
    'Uzumaki', 'Haruno', 'Monkey', 'Son', 'Kurosaki', 
    'Yeager', 'Ackerman', 'Heichou', 'Elric', 'Ikari', 
    'Langley', 'Kirigaya', 'Dragneel', 'Heartfilia', 
    'Saitama', 'Kojima', 'Urameshi', 'Spiegel', 'Kamina', 'Todoroki'
  ];

  return {
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: surnames[Math.floor(Math.random() * surnames.length)],
  };
};


const getMailDomains = async () => {
  const url = 'https://api.mail.tm/domains';
  try {
    const response = await axios.get(url);
    return response.data['hydra:member'];
  } catch (error) {
    console.error(`[×] E-mail Error: ${error}`);
    return null;
  }
};

const createMailTmAccount = async () => {
  const mailDomains = await getMailDomains();
  if (!mailDomains) return null;

  const domain = mailDomains[Math.floor(Math.random() * mailDomains.length)].domain;
  const username = genRandomString(10);
  const password = genRandomString(12);
  const birthday = getRandomDate(new Date(1976, 0, 1), new Date(2004, 0, 1));
  const { firstName, lastName } = getRandomName();
  const url = 'https://api.mail.tm/accounts';
  const data = { address: `${username}@${domain}`, password };

  try {
    const response = await axios.post(url, data, { headers: { 'Content-Type': 'application/json' } });
    if (response.status === 201) {
      console.log(`[✓] E-mail Created: ${username}@${domain}`);
      return { email: `${username}@${domain}`, password, firstName, lastName, birthday };
    } else {
      console.error(`[×] Email Error: ${response.data}`);
      return null;
    }
  } catch (error) {
    console.error(`[×] Error: ${error}`);
    return null;
  }
};

const registerFacebookAccount = async (email, password, firstName, lastName, birthday) => {
  const api_key = '882a8490361da98702bf97a021ddc14d';
  const secret = '62f8ce9f74b12f84c123cc23437a4a32';
  const gender = Math.random() < 0.5 ? 'M' : 'F';
  const req = {
    api_key: api_key,
    attempt_login: true,
    birthday: birthday.toISOString().split('T')[0],
    client_country_code: 'EN',
    fb_api_caller_class: 'com.facebook.registration.protocol.RegisterAccountMethod',
    fb_api_req_friendly_name: 'registerAccount',
    firstname: firstName,
    format: 'json',
    gender: gender,
    lastname: lastName,
    email: email,
    locale: 'en_US',
    method: 'user.register',
    password: password,
    reg_instance: genRandomString(32),
    return_multiple_errors: true,
  };
  const sig = Object.keys(req).sort().map(k => `${k}=${req[k]}`).join('') + secret;
  const ensig = crypto.createHash('md5').update(sig).digest('hex');
  req.sig = ensig;

  const api_url = 'https://b-api.facebook.com/method/user.register';
  try {
    const response = await axios.post(api_url, new URLSearchParams(req), {
      headers: { 'User-Agent': '[FBAN/FB4A;FBAV/35.0.0.48.273;FBDM/{density=1.33125,width=800,height=1205};FBLC/en_US;FBCR/;FBPN/com.facebook.katana;FBDV/Nexus 7;FBSV/4.1.1;FBBK/0;]' }
    });
    const reg = response.data;
    console.log(`Registration Success`);
    return reg;
  } catch (error) {
    console.error(`[×] Registration Error: ${error}`);
    return null;
  }
};

const createMultipleAccounts = async (amount) => {
  const accountPromises = Array.from({ length: amount }, async (_, i) => {
    try {
      const account = await createMailTmAccount();
      if (!account) {
        throw new Error('Failed to create email');
      }
      const regData = await registerFacebookAccount(account.email, account.password, account.firstName, account.lastName, account.birthday);
      if (!regData) {
        throw new Error('Failed to register Facebook account');
      }
      return { success: true, ...account, gender: regData.gender, userId: regData.new_user_id, token: regData./*session_info.*/access_token };
    } catch (error) {
      console.error(`Account ${i + 1} creation failed: ${error.message}`);
       return { success: false, error: error.message, email: account ? account.email : `Account ${i + 1}` };
    }
  });
  
  return await Promise.all(accountPromises);
};

      
