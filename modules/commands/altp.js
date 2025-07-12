const moneydown = 1000; // Số tiền đăng kí chơi
  
const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports.config = {
  name: "altp",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Khoa & Nam",
  description: "Chương trình Ai là triệu phú",
  commandCategory: "Trò chơi",
  usages: "< register/play/info/stop >",
  cooldowns: 5
};

function equi(level) {
  if (level == 0) var tienthuong = 0;
  if (level == 1) var tienthuong = 200;
  if (level == 2) var tienthuong = 400;
  if (level == 3) var tienthuong = 600;
  if (level == 4) var tienthuong = 1000;
  if (level == 5) var tienthuong = 2000;
  if (level == 6) var tienthuong = 3000;
  if (level == 7) var tienthuong = 6000;
  if (level == 8) var tienthuong = 10000;
  if (level == 9) var tienthuong = 14000;
  if (level == 10) var tienthuong = 22000;
  if (level == 11) var tienthuong = 30000;
  if (level == 12) var tienthuong = 40000;
  if (level == 13) var tienthuong = 80000;
  if (level == 14) var tienthuong = 150000;
  if (level == 15) var tienthuong = 250000;
  return tienthuong;
}

module.exports.handleReply = async function ({ event, Users, api, handleReply, Currencies }) {
  if (handleReply.type == "answer") {
    var { threadID, messageID, senderID } = event;
    if (senderID !== handleReply.author) return api.sendMessage("Chỗ người khác đang chơi vô duyên thế 😠", threadID, messageID);
    var name = await Users.getNameUser(senderID);
    var senderInfo = await Users.getData(senderID);
    var choose = event.body.toUpperCase();
    if (choose !== "A" && choose !== "B" && choose !== "C" && choose !== "D") return api.sendMessage("Câu trả lời của bạn không hợp lệ",threadID, messageID);
    if (choose === handleReply.dapandung) {
      var levelcc = handleReply.level + 1;
      if (levelcc < 15) {
        if (levelcc == 1) { djtme = "Câu hỏi đầu tiên"; } else djtme = `Câu hỏi số ${levelcc}`;
        senderInfo.data.altp = { level: levelcc };
        await Users.setData(senderID, senderInfo);
        return api.sendMessage(`${choose} là đáp án chính xác, ${handleReply.giaithich}\n\nXin chúc mừng người chơi ${name} đã xuất sắc trả lời đúng câu hỏi ${djtme} nâng mức phần thưởng lên ${equi(levelcc)}$`, threadID, messageID);
      } else if (levelcc == 15) {
        var tienthuong = 250000;
        Currencies.increaseMoney(senderID, tienthuong);
        senderInfo.data.altp = { level: -1 };
        await Users.setData(senderID, senderInfo);
        return api.sendMessage(`${choose} là đáp án chính xác, ${handleReply.giaithich}\n\nXin chúc mừng người chơi ${name} đã xuất sắc vượt qua 15 câu hỏi của chương trình mang về ${tienthuong}$\nHẹn gặp lại bạn ở chương trình lần sau`, threadID, messageID);
      }
    } else {
      var level = handleReply.level;
      if (level > 5 && level < 10) { var tienthuong = 2000; } else if (level > 10) { var tienthuong = 22000; } else var tienthuong = 0;
      senderInfo.data.altp = { level: -1 };
      await Users.setData(senderID, senderInfo);
      if (tienthuong == 2000) var moc = "đầu tiên";
      if (tienthuong == 22000) var moc = "thứ hai";
      if (moc == "đầu tiên" || moc == "thứ hai") {
        Currencies.increaseMoney(senderID,tienthuong);
        return api.sendMessage(`${choose} là đáp án không chính xác, câu trả lời đúng của chúng ta là ${handleReply.dapandung}, ${handleReply.giaithich}\n\nNgười chơi của chúng ta đã trả lời sai và ra về với phần thưởng ở mốc ${moc} là ${tienthuong}$\nCảm ơn bạn đã tham gia chương trình, hẹn gặp lại bạn ở chương trình lần sau`, threadID, messageID);
      } else {
        return api.sendMessage(`${choose} là đáp án không chính xác, câu trả lời đúng của chúng ta là ${handleReply.dapandung}, ${handleReply.giaithich}\n\nCảm ơn bạn đã tham gia chương trình, hẹn gặp lại bạn ở chương trình lần sau`, threadID, messageID); 
      }
    }
  }
}

module.exports.run = async function ({ api, event, args, Currencies, Users}) {
  const threadSetting = global.data.threadData.get(threadID) || {};
  var prefix = threadSetting.PREFIX || global.config.PREFIX;
  var { threadID, messageID, senderID } = event;
  const dataMoney = await Currencies.getData(senderID);
  const money = dataMoney.money;
  var senderInfo = await Users.getData(senderID);
   
  var msg = `Bạn có thể dùng:\n→ ${prefix}altp register: Đăng kí tham gia chương trình\n→ ${prefix}altp play: Bắt đầu chơi hoặc lấy câu hỏi tiếp theo\n→ ${prefix}altp info: Xem thông tin câu hỏi và tiền thưởng hiện tại của bạn\n→ ${prefix}altp stop: Dừng cuộc chơi và nhận tiền thưởng tương ứng`;
  if (args.length == 0) return api.sendMessage(msg, threadID, messageID);
  var type = args[0].toLowerCase();
  if (type !== "register" && type !== "play" && type !== "info" && type !== "stop") return api.sendMessage(msg, threadID, messageID);
  
  if (type == "register") {
    const path1 = __dirname + '/cache/intro.png';
    if (!fs.existsSync(path1)) {
      var down = (await axios.get("https://i.postimg.cc/1txB8Z3v/intro.png", { responseType: "arraybuffer" })).data;
      fs.writeFileSync(path1, Buffer.from(down, "utf-8"));
    };
    if (senderInfo.data.altp && senderInfo.data.altp.level !== -1) return api.sendMessage("Bạn đã đăng kí rồi, vui lòng vượt qua hết câu hỏi hoặc dừng cuộc chơi để có thể đăng kí lại", threadID, messageID);
    if (money < moneydown) return api.sendMessage(`Bạn không có đủ ${moneydown} để đăng kí để tham gia chương trình`, threadID, messageID);
    Currencies.decreaseMoney(senderID, moneydown);
    senderInfo.data.altp = { level: 0 };
    await Users.setData(senderID, senderInfo);
    return api.sendMessage({ body: "Đăng kí thành công, chào mừng bạn đến với chương trình Ai Là Triệu Phú" , attachment: fs.createReadStream(path1)}, threadID, () => fs.unlinkSync(path1), messageID);
  };
  
  if (type == "stop") {
    if (!senderInfo.data.altp || senderInfo.data.altp.level == -1) return api.sendMessage("Bạn chưa đăng kí tham gia chương trình", threadID, messageID);
    var level = senderInfo.data.altp.level;
    var name = await Users.getNameUser(senderID);
    Currencies.increaseMoney(senderID,equi(level));
    senderInfo.data.altp = { level: -1 };
    await Users.setData(senderID, senderInfo);
    return api.sendMessage(`Người chơi ${name} đã vượt qua ${level} câu hỏi, mang về phần thưởng là ${equi(level)}$\nHẹn gặp lại bạn ở chương trìn lần sau`, threadID, messageID);
  };
  
  if (type == "info") {
    const path2 = __dirname + '/cache/info.png';
    if (!fs.existsSync(path2)) {
      var down = (await axios.get("https://i.postimg.cc/D0nccdss/info.png", { responseType: "arraybuffer" })).data;
      fs.writeFileSync(path2, Buffer.from(down, "utf-8"));
    };
    if (!senderInfo.data.altp || senderInfo.data.altp.level == -1) return api.sendMessage({ body: `Bạn chưa đăng kí, dùng ${prefix}altp register để đăng kí nhé ( ${moneydown}$ )`, attachment: fs.createReadStream(path2)}, threadID, () => fs.unlinkSync(path2), messageID);
    var level = senderInfo.data.altp.level;
    if (level == 0) return api.sendMessage({ body: `Bạn chưa vượt qua câu hỏi nào, dùng ${prefix}altp play để chơi nhé`, attachment: fs.createReadStream(path2)}, threadID, () => fs.unlinkSync(path2), messageID);
    var name = await Users.getNameUser(senderID);
    return api.sendMessage({ body: `Người chơi ${name} đã vượt qua ${level} câu hỏi\nTiền thưởng hiện tại là ${equi(level)}$`, attachment: fs.createReadStream(path2)}, threadID, () => fs.unlinkSync(path2), messageID);
  };
  
  if (type == "play") {
    try {
      if (!senderInfo.data.altp || senderInfo.data.altp.level == -1) return api.sendMessage (`Bạn chưa đăng kí tham gia chương trình\nVui lòng dùng "${prefix}altp register" để đăng kí ( ${moneydown}$ )`, threadID, messageID);
      var level = senderInfo.data.altp.level;
      var cauhoi = level + 1;
      const res = await axios.get(`https://raw.githubusercontent.com/ThanhAli-Official/ailatrieuphu/main/altp${cauhoi}.json`);
      const question = res.data.allquestion[Math.floor(Math.random() * res.data.allquestion.length)];
      var linkanh = question.link;
      const dapandung = question.dapan;
      const giaithich = question.giaithich;
      if (cauhoi == 1) { var cc = "Câu hỏi đầu tiên" } else if (cauhoi == 5) { var cc = "Câu hỏi cột mốc đầu tiên" } else if (cauhoi == 10) { var cc = "Câu hỏi cột mốc thứ hai" } else var cc = `Câu hỏi số ${cauhoi}`;
      var callback = () => api.sendMessage({
        body: `${cc} trị giá ${equi(level+1)}$`,
        attachment: fs.createReadStream(__dirname + `/cache/question.png`)}, threadID, (error, info) => {
          global.client.handleReply.push({
          type: "answer",
          name: this.config.name,
          author: senderID,
          dapandung: dapandung,
          giaithich: giaithich,
          level: level,
          messageID: info.messageID
        })
        fs.unlinkSync(__dirname + "/cache/question.png")
      })
      return request(linkanh).pipe(fs.createWriteStream(__dirname + `/cache/question.png`)).on("close",() => callback());
    }
    catch (error) {
      return api.sendMessage("Đã xảy ra lỗi khi thực hiện lệnh", threadID, messageID)
    }
  }
}