const fs = require('fs');
const path = require('path');
const axios = require("axios");

module.exports.config = {
  name: "taixiu",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "DungUwU mod by Claude, improved by Copilot",
  description: "Tài Xỉu nhiều người, có ảnh, lịch sử, nổ hũ, xác nhận cược, chống spam, phản hồi chi tiết hơn",
  commandCategory: "Game",
  usages: "[create/leave/start/info/end]",
  cooldowns: 5
};

const dice_images = [
  "https://i.imgur.com/cmdORaJ.jpg",
  "https://i.imgur.com/WNFbw4O.jpg",
  "https://i.imgur.com/Xo6xIX2.jpg", 
  "https://i.imgur.com/NJJjlRK.jpg",
  "https://i.imgur.com/QLixtBe.jpg",
  "https://i.imgur.com/y8gyJYG.jpg"
];

const jackpotPath = path.join(__dirname, 'game', 'taixiu_jackpot.json');
const historyPath = path.join(__dirname, 'game', 'taixiu_history.json');

function formatMoney(money) {
  return money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function randomEmoji(result) {
  return result === "tài" ? "⚫" : "⚪";
}

function ensureDirAndFile(filePath, defaultValue) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
}

module.exports.run = async function({ api, event, args, Users, Threads, Currencies }) {
  const { threadID, messageID, senderID } = event;
  if (!global.client.taixiu_ca) global.client.taixiu_ca = {};

  // Chống spam
  if (!global.client.txs_last) global.client.txs_last = {};
  if (global.client.txs_last[threadID] && Date.now() - global.client.txs_last[threadID] < 500) return;
  global.client.txs_last[threadID] = Date.now();

  const moneyUser = (await Currencies.getData(senderID)).money;
  const send = (msg, cb) => api.sendMessage(msg, threadID, cb, messageID);
  const threadSetting = (await Threads.getData(String(threadID))).data || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  if (!args[0]) {
    return send(
      `🎲 GAME LẮC TÀI XỈU 🎲\n────────────────\n` +
      `${prefix}${this.config.name} create → Tạo bàn\n` +
      `${prefix}${this.config.name} leave → Rời bàn\n` +
      `${prefix}${this.config.name} xổ → Bắt đầu\n` +
      `${prefix}${this.config.name} info → Thông tin bàn\n` +
      `${prefix}${this.config.name} end → Kết thúc bàn\n` +
      `────────────────\n` +
      `Đặt: tài/xỉu <số tiền hoặc all> để cược!`
    );
  }

  const moneyBetArg = args[1]?.toLowerCase().replace(/k/g, "000").replace(/m/g, "000000").replace(/b/g, "000000000");
  const moneyBet = moneyBetArg && moneyBetArg.match(/\d+/) ? parseInt(moneyBetArg) : null;

  switch (args[0].toLowerCase()) {
    case "create": {
      if (global.client.taixiu_ca[threadID]?.play) return send("❎ Đang có 1 ván tài xỉu diễn ra ở nhóm này!");
      if (global.client.taixiu_ca[threadID]?.create === false) {
        return send(
          "Bàn cũ vừa kết thúc, hãy đợi 2 phút để tạo bàn mới.\n" +
          "Bạn có thể thả ❤️ tin nhắn này để dùng 10% số tiền để tạo bàn nhanh (cần >1.000.000 VND).",
          (e, info) => {
            global.client.handleReaction.push({
              type: "create",
              name: this.config.name,
              author: senderID,
              messageID: info.messageID,
              moneyUser
            });
          }
        );
      }
      send("✅ Tạo thành công bàn tài xỉu!\n\n📌 Để tham gia cược, hãy ghi: tài/xỉu + số tiền cược.\nBàn sẽ tự động hủy nếu không xổ trong 4 phút.", () => {
        global.client.taixiu_ca[threadID] = {
          players: 0,
          data: {},
          play: true,
          status: "pending",
          author: senderID
        };
      });
      setTimeout(async () => {
        const table = global.client.taixiu_ca[threadID];
        if (!table?.data) return;
        let total = 0, msg = 'Thông tin hoàn tiền:\n';
        for (const id in table.data) {
          const name = await Users.getNameUser(id) || "Player";
          const bet = table.data[id].bet;
          await Currencies.increaseMoney(id, bet * 2);
          msg += `👤 ${name}: Hoàn ${formatMoney(bet * 2)} VND\n`;
          total += bet;
        }
        await Currencies.decreaseMoney(table.author, total);
        msg += `\nChủ bàn đã bị trừ ${formatMoney(total)} VND`;
        api.sendMessage(msg, threadID);
        delete global.client.taixiu_ca[threadID];
      }, 240000);
      return;
    }

    case "leave": {
      const table = global.client.taixiu_ca[threadID];
      if (!table?.play) return send("❎ Nhóm bạn không có ván tài xỉu nào đang diễn ra!");
      if (!table.data[senderID]) return send("❎ Bạn chưa tham gia tài xỉu ở nhóm này!");
      table.players--;
      const refund = table.data[senderID].bet;
      await Currencies.increaseMoney(senderID, refund);
      delete table.data[senderID];
      send(`✅ Đã rời ván tài xỉu!\n💸 Hoàn tiền: ${formatMoney(refund)} VND`);
      return;
    }

    case "end": {
      const table = global.client.taixiu_ca[threadID];
      if (!table || table.author !== senderID) return send("❎ Bạn không phải chủ phòng!");
      delete global.client.taixiu_ca[threadID];
      global.client.taixiu_ca[threadID] = { create: false };
      send("🏁 Đã kết thúc bàn.");
      setTimeout(() => {
        global.client.taixiu_ca[threadID] = { create: true };
      }, 120000);
      return;
    }

    case "info": {
      const table = global.client.taixiu_ca[threadID];
      if (!table?.play) return send("❎ Nhóm bạn không có ván tài xỉu nào đang diễn ra!");
      if (table.players === 0) return send("❎ Hiện không có người đặt cược.");
      const authorName = await Users.getNameUser(table.author) || "Player";
      const playerList = [];
      for (const id in table.data) {
        const name = await Users.getNameUser(id) || "Player";
        const player = table.data[id];
        playerList.push(`👤 ${name}: ${player.name} - ${formatMoney(player.bet)} VND`);
      }
      send(`📊 [ THÔNG TIN BÀN TÀI XỈU ]\n👑 Chủ phòng: ${authorName}\n\n👥 Người tham gia:\n${playerList.join("\n")}`);
      return;
    }

    default: {
      return send(`❌ Lệnh không hợp lệ! Sử dụng: ${prefix}help ${this.config.name}`);
    }
  }
};

module.exports.handleEvent = async function ({ api, event, Currencies, Users }) {
  const { threadID, messageID, body, senderID } = event;
  if (!global.client.taixiu_ca?.[threadID]?.play || !body || typeof body !== "string") return;

  // Chống spam
  if (!global.client.txs_last) global.client.txs_last = {};
  if (global.client.txs_last[threadID] && Date.now() - global.client.txs_last[threadID] < 500) return;
  global.client.txs_last[threadID] = Date.now();

  const table = global.client.taixiu_ca[threadID];
  const moneyUser = (await Currencies.getData(senderID)).money;
  const send = (msg, cb) => api.sendMessage(msg, threadID, cb, messageID);

  // Nhận: tài/xỉu <tiền>
  const [command, betAmount] = body.trim().toLowerCase().split(/\s+/);
  if (!["tài", "tai", "xỉu", "xiu", "xổ", "xo"].includes(command)) return;

  // Chuyển số tiền cược
  let moneyBet = betAmount;
  if (betAmount?.toLowerCase() === "all") moneyBet = moneyUser;
  else if (betAmount) {
    moneyBet = betAmount.toLowerCase().replace(/k/g, "000").replace(/m/g, "000000").replace(/b/g, "000000000");
    moneyBet = parseInt(moneyBet);
    if (isNaN(moneyBet)) moneyBet = 0;
  }

  switch (command) {
    case "tài":
    case "tai":
    case "xỉu":
    case "xiu": {
      if (!moneyBet) return send("❎ Vui lòng nhập số tiền cược hợp lệ!");
      if (moneyBet <= 0) return send("❎ Số tiền cược phải lớn hơn 0!");
      if (moneyBet > moneyUser) return send("❎ Số dư không đủ!");
      if (moneyBet < 50) return send("❎ Số tiền cược tối thiểu là 50 VND!");

      if (table.status === "pending") {
        const betChoice = (command === "tài" || command === "tai") ? "tài" : "xỉu";
        const formattedBet = formatMoney(moneyBet);

        if (table.data[senderID]) {
          return send(
            `Bạn đã đặt cược ${table.data[senderID].name} rồi.\nBạn có muốn đổi thành ${betChoice} với số tiền ${formattedBet} VND không?\nThả ❤️ để xác nhận.`,
            (e, info) => {
              global.client.handleReaction.push({
                type: "confirm",
                name: module.exports.config.name,
                author: senderID,
                messageID: info.messageID,
                betChoice,
                moneyBet,
              });
            }
          );
        }

        return send(
          `✅ Đặt cược thành công ${formattedBet} VND vào ${betChoice} 🎰`,
          async () => {
            await Currencies.decreaseMoney(senderID, moneyBet);
            table.data[senderID] = { name: betChoice, bet: moneyBet };
            table.players++;
          }
        );
      }
      return;
    }
    case "xổ":
    case "xo": {
      if (table.author != senderID) return send("❎ Bạn không phải chủ phòng!");
      if (table.players == 0) return send("❎ Chưa có người đặt cược!");

      send("⏳ Đang lắc xúc xắc...");

      // Roll dice
      const rolls = [
        Math.ceil(Math.random() * 6),
        Math.ceil(Math.random() * 6),
        Math.ceil(Math.random() * 6)
      ];
      const totalDice = rolls.reduce((a, b) => a + b, 0);
      const gameResult = totalDice > 10 ? "tài" : "xỉu";

      // Lấy hình xúc xắc
      const diceImages = await Promise.all(
        rolls.map(roll => axios.get(dice_images[roll - 1], { responseType: "stream" }).then(res => res.data))
      );

      // Jackpot & lịch sử
      ensureDirAndFile(jackpotPath, { amount: 10000, lastWin: null });
      ensureDirAndFile(historyPath, []);

      let jackpotInfo = JSON.parse(fs.readFileSync(jackpotPath, 'utf8'));
      let history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));

      const tai = [], xiu = [], winners = [], contributionInfo = [], jackpotMessages = [];

      // Xử lý thắng/thua
      for (const id in table.data) {
        const name = await Users.getNameUser(id);
        const player = table.data[id];
        const bet = player.bet;
        const pick = player.name;
        const win = (pick === gameResult);
        if (win) {
          const winAmount = Math.floor(bet * 1.97);
          await Currencies.increaseMoney(id, winAmount);
          winners.push({ id, bet });
          (gameResult === "tài" ? tai : xiu).push(`👤 ${name}: +${formatMoney(winAmount)} VND`);
          const contribution = Math.floor(bet * 0.03);
          jackpotInfo.amount += contribution;
          contributionInfo.push(`👤 ${name}: góp ${formatMoney(contribution)} VND`);
        } else {
          (pick === "tài" ? tai : xiu).push(`👤 ${name}: -${formatMoney(bet)} VND`);
          jackpotInfo.amount += bet;
          contributionInfo.push(`👤 ${name}: góp ${formatMoney(bet)} VND`);
        }
      }

      // Nổ hũ (0.5% xác suất)
      if (Math.random() < 0.005 && winners.length) {
        const totalBet = winners.reduce((sum, w) => sum + w.bet, 0);
        for (const w of winners) {
          const part = w.bet / totalBet;
          const jackpotWin = Math.floor(jackpotInfo.amount * part);
          await Currencies.increaseMoney(w.id, jackpotWin);
          const winnerName = await Users.getNameUser(w.id);
          jackpotMessages.push(`🏆 ${winnerName}: +${formatMoney(jackpotWin)} VND`);
        }
        jackpotInfo.lastWin = {
          winners: jackpotMessages,
          amount: jackpotInfo.amount,
          time: new Date().toISOString()
        };
        jackpotInfo.amount = 10000;
      }

      // Lịch sử
      history.push(gameResult);
      if (history.length > 100) history.shift();
      fs.writeFileSync(jackpotPath, JSON.stringify(jackpotInfo, null, 2));
      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
      const lastResults = history.slice(-9).map(randomEmoji).join(' ');

      let msg = "🎉 KẾT QUẢ TÀI XỈU 🎉\n";
      msg += `\n🎲 Kết quả: ${gameResult.toUpperCase()} (${totalDice})`;
      msg += `\n📊 Phiên gần đây: ${lastResults}\n`;
      msg += `\n💰 [ TÀI ]\n${tai.length ? tai.join('\n') : 'Không ai'}\n──────────────\n💰 [ XỈU ]\n${xiu.length ? xiu.join('\n') : 'Không ai'}\n`;
      msg += `\n🏆 Hũ hiện tại: ${formatMoney(jackpotInfo.amount)} VND\n💰 Đóng góp:\n${contributionInfo.join('\n')}`;
      if (jackpotInfo.lastWin) {
        msg += `\n🎉 Lần nổ hũ gần nhất:\n${jackpotInfo.lastWin.winners.join('\n')}\nVào: ${new Date(jackpotInfo.lastWin.time).toLocaleString("vi-VN")}`;
      }
      if (jackpotMessages.length) {
        msg += `\n\n🎉🎉🎉 JACKPOT NỔ! 🎉🎉🎉\n${jackpotMessages.join('\n')}`;
      }

      send(
        { body: msg, attachment: diceImages },
        () => {
          delete global.client.taixiu_ca[threadID];
          global.client.taixiu_ca[threadID] = { create: false };
          setTimeout(() => {
            global.client.taixiu_ca[threadID] = { create: true };
          }, 120000);
        }
      );
      return;
    }
  }
};

module.exports.handleReaction = async function({ api, event, handleReaction, Currencies, Users }) {
  const { threadID, userID, reaction } = event;
  if (reaction != "❤") return;
  if (userID != handleReaction.author) return;
  const { moneyBet, betChoice } = handleReaction;
  const moneyUser = (await Currencies.getData(userID)).money;
  if (moneyBet > moneyUser)
    return api.sendMessage("Số tiền đặt lớn hơn số dư!", threadID, event.messageID);

  await Currencies.decreaseMoney(userID, moneyBet);
  if (!global.client.taixiu_ca[threadID]) return;
  global.client.taixiu_ca[threadID].data[userID] = { name: betChoice, bet: moneyBet };
  global.client.taixiu_ca[threadID].players++;
  return api.sendMessage(
    `Đặt cược thành công!\nLựa chọn: ${betChoice}\nSố tiền: ${formatMoney(moneyBet)} VND`,
    threadID,
    event.messageID
  );
};