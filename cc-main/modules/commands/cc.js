module.exports.config = {
  name: "cc",
  version: "4.0.0",
  hasPermssion: 0,
  credit: "Vdang (nâng cấp: Kenne400k1 & Copilot + 500+ câu chửi)",
  description: "Tự động chửi cực gắt + sticker khi ai đó gửi từ khóa nhạy cảm",
  commandCategory: "Tiện ích",
  usages: "[text]",
  cooldowns: 5
};

const BADWORDS = [
  "cc", "cl", "cặc", "lồn", "địt", "đụ", "buồi", "bòi", "loz", "dcm", "dm", "dmm", "đmm", "vkl", "vcc", "vcl",
  "clm", "đm", "mẹ mày", "bố mày", "con đĩ", "óc chó", "thằng ngu", "chó", "đần", "óc lợn", "chó điên", "rảnh háng",
  "clgt", "cccm", "djt", "clmm", "ml", "cmm", "đcm", "ncc", "mml", "đù", "con cặc", "cmm", "cđ", "chó má", "thằng lol",
  "clq", "lol", "loèn", "chịch", "dmml", "chó chết", "mẹ kiếp", "vcl", "vl", "dmvl", "đéo", "éo", "dcmvl", "đú má",
  "vãi loz", "vãi l", "djtme", "cave", "bitch", "fuck", "shit", "bố láo", "mất dạy", "khốn nạn", "ngu như chó",
  "chó săn", "súc vật", "ngu học", "lờ mờ", "óc trâu", "khùng", "tâm thần", "con điên", "ngáo", "thằng đểu",
  "loz mẹ", "đụ mẹ", "dú", "vú", "mẹ kiếp", "cái lồn", "mặt lồn", "não lồn", "cái cc", "lồn to", "dú to", "vếu", "chim to",
  "đù má", "cặc to", "xạo chó", "điêu toa", "lừa đảo", "ăn hại", "hãm l", "hãm lồn", "óc heo", "ăn cứt", "vô học"
];

const STICKER_LIST = [
  "526214684778630", "526220108111421", "526220308111401", "526220484778050", "526220691444696", "526220814778017",
  "526220978111334", "526221104777988", "526221318111300", "526221564777942", "526221711444594", "526221971444568",
  "2041011389459668", "2041011569459650", "2041011726126301", "2041011836126290", "2041011952792945", "2041012109459596",
  "2041012262792914", "2041012406126233", "2041012539459553", "2041012692792871", "2041014432792697", "2041014739459333",
  "2041015016125972", "2041015182792622", "2041015329459274", "2041015422792598", "2041015576125916", "2041017422792398",
  "2041020049458802", "2041020599458747", "2041021119458695", "2041021609458646", "2041022029458604", "2041022286125245"
];

const REPLIES = [
  (name) => `Đừng có láo với tao, ${name}!`,
  (name) => `Đã ngu còn thích thể hiện hả ${name}?`,
  (name) => `Im mẹ mày đi ${name}, đừng làm trò cười nữa.`,
  (name) => `Nói ít thôi ${name}, bớt xàm lại.`,
  (name) => `Đẳng cấp như ${name} thì chó cũng cười.`,
  (name) => `Câm hộ tao cái ${name}!`,
  (name) => `Tao không rảnh nghe mày sủa đâu ${name}!`,
  (name) => `Thích gáy không ${name}?`,
  (name) => `Nghĩ mình hay ho lắm hả ${name}?`,
  (name) => `Đã dốt còn thích thể hiện ${name}!`,
  (name) => `Bình tĩnh đi ${name}, đừng làm trò cười nữa.`,
  (name) => `Sủa tiếp đi ${name}, nghe vui tai phết.`,
  (name) => `Đừng tưởng mình là trung tâm vũ trụ nha ${name}!`,
  (name) => `Cố tỏ ra nguy hiểm làm gì vậy ${name}?`,
  (name) => `Tao thấy ${name} vô dụng vãi.`,
  (name) => `Cái mặt mày như cái bánh đa nhúng nước ấy ${name}!`,
  (name) => `Thấy ${name} nói mà tao muốn ói.`,
  (name) => `Mồm ${name} như nhà vệ sinh công cộng.`,
  (name) => `Thôi đi ${name}, đừng tự nhục nữa.`,
  (name) => `Bớt xàm lại cho xã hội yên ổn đi ${name}.`,
  (name) => `Nhìn ${name} là tao muốn thở oxy.`,
  (name) => `Kiếp trước ${name} ăn ở thất đức à?`,
  (name) => `Đừng giả ngu nữa, không ai tin đâu ${name}.`,
  (name) => `Nhiều chuyện vừa thôi ${name}!`,
  (name) => `Cút đi cho nước nó trong ${name}!`,
  (name) => `Đời ${name} đúng là bi kịch.`,
  (name) => `Tao chưa từng thấy ai nhạt nhẽo như ${name}.`,
  (name) => `Đừng gáy nữa, không ai quan tâm đâu ${name}.`,
  (name) => `Bớt sống ảo đi ${name}!`,
  (name) => `Mày nghĩ mày là ai vậy ${name}?`,
  (name) => `Thích gây sự không ${name}?`,
  (name) => `Hãm như ${name} thì nên im lặng.`,
  (name) => `Chạy về nhà mẹ mà khóc đi ${name}!`,
  (name) => `Đừng cố gồng nữa ${name}, ai cũng biết mà.`,
  (name) => `Chửi mày tốn nước bọt quá ${name}.`,
  (name) => `Mày đúng là thảm họa, ${name}.`,
  (name) => `Chó còn biết nghe lời hơn mày đấy, ${name}.`,
  (name) => `Đầu óc ${name} như cái thùng rỗng.`,
  (name) => `Nói chuyện với mày tao cảm thấy phí thời gian.`,
  (name) => `Cái loại như ${name} nên im lặng.`,
  (name) => `Mày mà khôn thì xã hội không loạn đâu, ${name}.`,
  (name) => `Tao cạn lời với mày luôn ${name}.`,
  (name) => `Nổ vừa thôi ${name}, không ai tin đâu.`,
  (name) => `Về nhà tập nói lại đi ${name}.`,
  (name) => `Tao nghe mày nói là tao muốn block luôn.`,
  (name) => `Ngu mà cứ tỏ ra nguy hiểm.`,
  (name) => `Xàm lắm rồi đấy ${name}!`,
  (name) => `Nghe mày nói mà tao muốn bật cười.`,
  (name) => `Hít drama vừa thôi ${name}!`,
  (name) => `Mày tưởng mày là ai hả ${name}?`,
  (name) => `Mày mà thông minh thì tao là thiên tài.`,
  (name) => `Đừng có ảo tưởng nữa ${name}!`,
  (name) => `Mày nên soi gương lại đi ${name}!`,
  (name) => `Cái mặt mày nhìn phát chán.`,
  (name) => `Tao chửi mà mày vẫn lì nhỉ ${name}.`,
  (name) => `Đừng cố gắng làm màu nữa ${name}!`,
  (name) => `Đầu óc ${name} như cái sọ dừa.`,
  (name) => `Ăn nói như ${name} thì chỉ có đi ăn mày.`,
  (name) => `Tao nói thật, mày nên im lặng.`,
  (name) => `Thôi, bớt bốc phét đi ${name}.`,
  (name) => `Hãm tài vừa thôi ${name}.`,
  (name) => `Mày là cây hài à ${name}?`,
  (name) => `Thấy mày là tao muốn chuyển nhà.`,
  (name) => `Nghe mày xong tao muốn out group.`,
  (name) => `Bớt làm trò đi ${name}, nhìn chán lắm.`,
  (name) => `Có ai rảnh đâu nghe mày than vãn.`,
  (name) => `Tao thấy mày nói chuyện như trẻ con.`,
  (name) => `Bớt sân si lại đi ${name}.`,
  (name) => `Thấy mày là tao muốn té.`,
  (name) => `Nhìn mày mà tao thấy tội cho xã hội.`,
  (name) => `Cái kiểu như mày làm loãng không khí.`,
  (name) => `Tao tưởng tượng mà tao còn thấy ngán.`,
  (name) => `Tao chưa thấy ai lì như mày.`,
  (name) => `Bớt lên mạng thể hiện đi ${name}.`,
  (name) => `Tao nói gì mày cũng không hiểu đâu.`,
  (name) => `Nói chuyện với mày như nói với tường.`,
  (name) => `Chửi nữa chắc tao nghẹn họng.`,
  (name) => `Mày là idol sống ảo à ${name}?`,
  (name) => `Học cách làm người trước đi ${name}!`,
  (name) => `Tao block luôn khỏi nói nhiều.`,
  (name) => `Bớt ngu lại đi ${name}.`,
  (name) => `Sống mà không biết nhục à ${name}?`,
  (name) => `Tao nghe mày xong tao muốn tắt máy.`,
  (name) => `Tao rảnh đâu nghe mày lảm nhảm.`,
  (name) => `Mày học ai nói chuyện vậy ${name}?`,
  (name) => `Văn hóa mày để đâu rồi?`,
  (name) => `Đừng cố làm màu nữa ${name}.`,
  (name) => `Xàm xí quá rồi đấy ${name}.`,
  (name) => `Mày sống thật không vậy ${name}?`,
  (name) => `Nhìn mặt mày là tao muốn đi ngủ.`,
  (name) => `Thôi đi ${name}, nghe mày nhức đầu.`,
  (name) => `Tao không có hứng nghe mày đâu.`,
  (name) => `Đừng nghĩ ai cũng rảnh nghe mày.`,
  (name) => `Thể hiện vừa thôi, đừng quá lố.`,
  (name) => `Nói nữa tao report luôn.`,
  (name) => `Mày là trò cười của group.`,
  (name) => `Đầu óc ${name} như cái máy xay thịt.`,
  (name) => `Chửi mày tốn thời gian quá.`,
  (name) => `Mày đúng là số một về độ vô dụng.`,
  (name) => `Đừng bắt chước ai nữa ${name}.`,
  (name) => `Tao muốn tắt thông báo khi thấy mày nói.`,
  (name) => `Tao nghĩ mày cần đi học lại.`,
  (name) => `Sống sao cho đỡ xàm đi ${name}.`,
  (name) => `Tao nghe mày nói là tao muốn điên.`,
  (name) => `Hãm như mày thì chịu rồi.`,
  (name) => `Mày là ví dụ điển hình của sự thất bại.`,
  (name) => `Chửi mày xong tao hết hứng.`,
  (name) => `Mày sinh ra để gây hài à?`,
  (name) => `Tao không muốn nhìn thấy mày nữa.`,
  (name) => `Mày là lý do tao mất niềm tin vào loài người.`,
  (name) => `Nghe mày nói tao muốn về quê nuôi cá.`,
  (name) => `Nói chuyện với mày mà tao mệt ghê.`,
  (name) => `Đừng có bon chen nữa ${name}.`,
  (name) => `Mày đúng là thảm họa group.`,
  (name) => `Mày là cây hài bất đắc dĩ.`,
  (name) => `Chửi nữa chắc group câm luôn.`,
  (name) => `Mày mà thông minh thì tao là Einstein.`,
  (name) => `Đừng làm phiền mọi người nữa.`,
  (name) => `Tao nghe mày mà tao muốn thoát khỏi trái đất.`,
  (name) => `Mày nên học cách im lặng đi.`,
  (name) => `Bớt xàm lol lại đi ${name}.`
];
module.exports.handleEvent = async ({ event, api, Users }) => {
  let thread = global.data.threadData.get(event.threadID) || {};
  if (!thread["bye"]) return;

  if (BADWORDS.includes(event.body?.toLowerCase() || "")) {
    let sticker = STICKER_LIST[Math.floor(Math.random() * STICKER_LIST.length)];
    let name = await Users.getNameUser(event.senderID);
    let mentions = [{ tag: name, id: event.senderID }];
    let msgText = REPLIES[Math.floor(Math.random() * REPLIES.length)](name);

    let msg = { body: `𝑻𝒉: ${msgText}`, mentions };
    api.sendMessage(msg, event.threadID, (e, info) => {
      setTimeout(() => {
        api.sendMessage({ sticker: sticker }, event.threadID);
      }, 100);
    }, event.messageID);
  }
};

module.exports.languages = {
  "vi": {
    "on": "Đã bật",
    "off": "Đã tắt",
    "successText": "chế độ auto chửi nhạy cảm!"
  },
  "en": {
    "on": "Enabled",
    "off": "Disabled",
    "successText": "auto-insult mode for sensitive words!"
  }
};

module.exports.run = async ({ event, api, Threads, getText }) => {
  let { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data;
  data["bye"] = !data["bye"];
  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);
  return api.sendMessage(`${data["bye"] ? getText("on") : getText("off")} ${getText("successText")}`, threadID, messageID);
};