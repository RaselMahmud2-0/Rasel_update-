const axios = require('axios');

const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`);
  return base.data.api;
};

module.exports.config = {
  name: "baby",
  version: "6.9.9",
  credits: "Rasel Mahmud",
  cooldowns: 0,
  hasPermssion: 0,
  description: "better than all sim simi",
  commandCategory: "chat",
  category: "chat",
  usePrefix: true,
  prefix: true,
  usages: `[anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR\nall OR\nedit [YourMessage] - [NewMessage]`,
};

module.exports.run = async function ({ api, event, args, Users }) {
  try {
    const link = `${await baseApiUrl()}/baby`;
    const dipto = args.join(" ").toLowerCase();
    const uid = event.senderID;

    if (!args[0]) {
      const ran = ["type *baby hi"];
      return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
    }

    if (args[0] === 'remove') {
      const fina = dipto.replace("remove ", "");
      const respons = await axios.get(`${link}?remove=${fina}&senderID=${uid}`);
      return api.sendMessage(respons.data.message, event.threadID, event.messageID);
    }

    if (args[0] === 'rm' && dipto.includes('-')) {
      const [fi, f] = dipto.replace("rm ", "").split(/\s*-\s*/);
      const respons = await axios.get(`${link}?remove=${fi}&index=${f}`);
      return api.sendMessage(respons.data.message, event.threadID, event.messageID);
    }

    if (args[0] === 'list') {
      if (args[1] === 'all') {
        const res = await axios.get(`${link}?list=all`);
        const data = res.data.teacher.teacherList;
        const teachers = await Promise.all(data.map(async (item) => {
          const number = Object.keys(item)[0];
          const value = item[number];
          const name = await Users.getNameUser(number).catch(()=>{}) || "unknown";
          return { name, value };
        }));
        teachers.sort((a, b) => b.value - a.value);
        const output = teachers.map((teacher, index) => `${index + 1}/ ${teacher.name}: ${teacher.value}`).join('\n');
        return api.sendMessage(`Total Teach = ${res.data.length}\n\n👑 | List of Teachers of baby\n${output}`, event.threadID, event.messageID);
      } else {
        const respo = await axios.get(`${link}?list=all`);
        return api.sendMessage(`Total Teach = ${respo.data.length}`, event.threadID, event.messageID);
      }
    }

    if (args[0] === 'msg' || args[0] === 'message') {
      const fuk = dipto.replace("msg ", "");
      const respo = await axios.get(`${link}?list=${fuk}`);
      return api.sendMessage(`Message ${fuk} = ${respo.data.data}`, event.threadID, event.messageID);
    }

    if (args[0] === 'edit') {
      const command = dipto.split(/\s*-\s*/)[1];
      if (command.length < 2) {
        return api.sendMessage('❌ | Invalid format! Use edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
      }
      const res = await axios.get(`${link}?edit=${args[1]}&replace=${command}`);
      return api.sendMessage(`changed ${res.data.message}`, event.threadID, event.messageID);
    }

    if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
      const [comd, command] = dipto.split(/\s*-\s*/);
      const final = comd.replace("teach ", "");
      if (command.length < 2) {
        return api.sendMessage('❌ | Invalid format! Use [YourMessage] - [Reply1], [Reply2]...', event.threadID, event.messageID);
      }
      const re = await axios.get(`${link}?teach=${encodeURIComponent(final)}&reply=${encodeURIComponent(command)}&senderID=${uid}&threadID=${event.threadID}`);
      const name = await Users.getNameUser(re.data.teacher).catch(() => {}) || "unknown";
      return api.sendMessage(`✅ Replies added ${re.data.message}\nTeacher: ${name}\nTeachs: ${re.data.teachs}`, event.threadID, event.messageID);
    }

    if (args[0] === 'teach' && args[1] === 'amar') {
      const [comd, command] = dipto.split(/\s*-\s*/);
      const final = comd.replace("teach ", "");
      if (command.length < 2) {
        return api.sendMessage('❌ | Invalid format! Use [YourMessage] - [Reply1], [Reply2]...', event.threadID, event.messageID);
      }
      const re = await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`);
      return api.sendMessage(`✅ Replies added ${re.data.message}`, event.threadID, event.messageID);
    }

    if (args[0] === 'teach' && args[1] === 'react') {
      const [comd, command] = dipto.split(/\s*-\s*/);
      const final = comd.replace("teach react ", "");
      if (command.length < 2) {
        return api.sendMessage('❌ | Invalid format! Use teach react [YourMessage] - [react1]...', event.threadID, event.messageID);
      }
      const re = await axios.get(`${link}?teach=${final}&react=${command}`);
      return api.sendMessage(`✅ Replies added ${re.data.message}`, event.threadID, event.messageID);
    }

    if (['amar name ki', 'amr nam ki', 'amar nam ki', 'amr name ki'].some(phrase => dipto.includes(phrase))) {
      const response = await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`);
      return api.sendMessage(response.data.reply, event.threadID, event.messageID);
    }

    const a = (await axios.get(`${link}?text=${dipto}&senderID=${uid}&font=1`)).data.reply;
    return api.sendMessage(a, event.threadID, (error, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        lnk: a,
        apiUrl: link
      });
    }, event.messageID);

  } catch (e) {
    console.error('Error in command execution:', e);
    return api.sendMessage(`Error: ${e.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  try {
    if (event.type == "message_reply") {
      const reply = event.body.toLowerCase();
      if (isNaN(reply)) {
        const b = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(reply)}&senderID=${event.senderID}&font=1`)).data.reply;
        await api.sendMessage(b, event.threadID, (error, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            lnk: b
          });
        }, event.messageID);
      }
    }
  } catch(err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    const body = event.body ? event.body?.toLowerCase() : "";
    if (body.startsWith("🤺baby") || body.startsWith("🤺bby") || body.startsWith("🤺 bot") || body.startsWith("🤺janu") || body.startsWith("🤺babu") || body.startsWith("🤺bbz")) {
      const arr = body.replace(/^\S+\s*/, "");
      const randomReplies = [
        "হাসো তো প্লিজ 🌸, রাসেল মাহমুদ চাইছে তোমার মুখে আবার সেই সুন্দর হাসিটা দেখতে 🙂💙",
        "মন খারাপ করলে মনে রেখো, আমি সবসময় তোমার পাশে আছি 🤗",
        "তুমি একটুখানি হাসলেই, 𝐇𝐞𝐈𝐢•𝗟𝗨𝗠𝗢 💎✨আমার পুরো দিনের ক্লান্তি উড়ে যায় 😍",
        "জানো? পৃথিবীতে সবচেয়ে মিষ্টি জিনিসটা হলো তোমার হাসি আর 𝐇𝐞𝐈𝐢•𝗟𝗨𝗠𝗢 💎✨আমার ভালোবাসা 💕",
        "আমি 𝐇𝐞𝐈𝐢•𝗟𝗨𝗠𝗢 💎✨আমি চায় তুমি সব সময় খুশি থাকো, কারণ তোমার সুখ মানেই আমার সুখ 🌺",
        "কষ্ট যতই আসুক, 𝐇𝐞𝐈𝐢•𝗟𝗨𝗠𝗢 💎✨ তোমাকে হাসাতে ভুলবে না কখনো 🥰"
      ];
      if (!arr) {
        await api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, (error, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID
          });
        }, event.messageID);
      }
      const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;     
      await api.sendMessage(a, event.threadID, (error, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          lnk: a
        });
      }, event.messageID);
    }
  } catch(err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};
