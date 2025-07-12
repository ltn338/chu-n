module.exports.config = {
  name: "ghép",
  version: "1.0.1", 
  hasPermssion: 0,
  credits: "D-Jukie (Xuyên get) - sửa bởi ChatGPT",
  description: "Ghép đôi",
  commandCategory: "Tình Yêu", 
  usages: "ghép", 
  cooldowns: 10
};

module.exports.run = async function({ api, event, Threads, Users }) {
  const axios = global.nodemodule["axios"];
  const fs = global.nodemodule["fs-extra"];
  const path = require("path");

  var { participantIDs } = (await Threads.getData(event.threadID)).threadInfo;
  var tle = Math.floor(Math.random() * 101);

  let mung = [
    "💖 Chúc 2 bạn trăm năm hạnh phúc!",
    "🏠 Chúc 2 bạn xây dựng được 1 tổ ấm thật ấm cúng!",
    "🌈 Cùng nhau nương tựa đến cuối đời nhé!",
    "🌹 Chúc 2 bạn thật nhiều niềm vui và hạnh phúc!",
    "💔 Trách phận vô duyên, nhưng đừng buồn nhé!",
    "🌟 Hơi thấp nhưng không sao, hãy cố gắng lên!",
    "✨ 3 phần duyên nợ, 7 phần cố gắng!",
    "💌 Hãy chủ động bắt chuyện, hai bạn khá hợp đôi đấy!",
    "🔮 Hãy tin vào duyên số đi, vì nó có thật!",
    "❤️ Hợp đôi lắm rồi, hãy quan tâm nhau nhiều hơn nhé!",
    "📱 Lưu số nhau đi, bao giờ cưới thì gọi lên lễ đường!",
    "💍 Cưới đi chờ chi!"
  ];
  let chuc = mung[Math.floor(Math.random() * mung.length)];

  var namee = (await Users.getData(event.senderID)).name;
  const botID = api.getCurrentUserID();

  // Lọc ra danh sách user khác (trừ bot và sender)
  const listUserID = event.participantIDs.filter(ID => ID != botID && ID != event.senderID);
  var id = listUserID[Math.floor(Math.random() * listUserID.length)];
  var name = (await Users.getData(id)).name;

  var arraytag = [
    { id: event.senderID, tag: namee },
    { id: id, tag: name }
  ];

  // Đường dẫn file cache
  const cacheDir = path.join(__dirname, "cache");
  await fs.ensureDir(cacheDir);

  const avtPath1 = path.join(cacheDir, "avt.png");
  const avtPath2 = path.join(cacheDir, "avt2.png");

  // Tải 2 ảnh avatar cùng lúc
  try {
    const [avatar1, avatar2] = await Promise.all([
      axios.get(`https://graph.facebook.com/${event.senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" }),
      axios.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" }),
    ]);

    await Promise.all([
      fs.writeFile(avtPath1, Buffer.from(avatar1.data)),
      fs.writeFile(avtPath2, Buffer.from(avatar2.data)),
    ]);
  } catch (e) {
    return api.sendMessage("❌ Đã xảy ra lỗi khi tải ảnh, vui lòng thử lại sau!", event.threadID, event.messageID);
  }

  var imglove = [
    fs.createReadStream(avtPath1),
    fs.createReadStream(avtPath2)
  ];

  var msg = {
    body: 
`💞 𝗚𝗵𝗲́𝗽 𝗱𝗼̂𝗶 𝘁𝗵𝗮̀𝗻𝗵 𝗰𝗼̂𝗻𝗴! 💞

👤 ${namee}  💓  ${name}

💌 Lời chúc:
${chuc}

💕 Tỉ lệ hợp đôi: ${tle}%

❤️ Chúc các bạn luôn hạnh phúc và vui vẻ!`,
    mentions: arraytag,
    attachment: imglove
  };

  return api.sendMessage(msg, event.threadID, async (error, info) => {
    // Xóa file cache sau khi gửi xong
    await Promise.all([
      fs.unlink(avtPath1).catch(() => { }),
      fs.unlink(avtPath2).catch(() => { }),
    ]);
  }, event.messageID);
};