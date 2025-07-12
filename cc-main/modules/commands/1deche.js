const path = require('path');

module.exports.config = {
  name: 'deche',
  version: '1.0.0',
  hasPermssion: 0,
  credits: 'Lương Trường Khôi, Pcoder',
  description: 'Game Đế Chế nhỏ - chiến lược nhóm',
  commandCategory: 'Game',
  usages: '/deche [join|shop|map|attack XY|repair|info]',
  cooldowns: 5,
  usePrefix: false
};

module.exports.run = async function ({ api, event, args, Currencies }) {
  const threadSetting = global.data.threadData.get(event.threadID) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;
  const sub = args[0]?.toLowerCase();
  const handlers = {
    join: './deche/join.js', // <-- Thêm join handler
    shop: './deche/shop.js',
    map: './deche/canvasMap.js',
    attack: './deche/attack.js',
    info: './deche/info.js',
    ally: './deche/ally.js'
  };

  if (handlers[sub]) {
    const filePath = path.join(__dirname, handlers[sub]);
    delete require.cache[require.resolve(filePath)];
    return require(filePath)(api, event, args, Currencies);
  }

  api.sendMessage(
    `🛡️ Game Đế Chế - Hướng dẫn:\n\n` +
    `📝 ${prefix}deche join → Tham gia game (chiếm lãnh thổ)\n` +
    `📦 ${prefix}deche shop → Mua vật phẩm\n` +
    `🗺️ ${prefix}deche map → Xem bản đồ\n` +
    `⚔️ ${prefix}deche attack XY → Tấn công toạ độ XY\n` +
    `🤝 ${prefix}deche ally → Thiết lập liên minh\n` +
    `ℹ️ ${prefix}deche info → Thông tin nhóm bạn\n\n` +
    `💬 Có thể reply: join, shop, map, attack [tọa độ], info, ally vào tin nhắn này để thao tác nhanh!`,
    event.threadID,
    (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: "deche",
          messageID: info.messageID,
          author: event.senderID,
          type: "help"
        });
      }
    }
  );
};

module.exports.handleReply = async function({ api, event, handleReply, Currencies }) {
  const input = (event.body || '').trim();
  const split = input.split(/\s+/);
  const cmd = split[0]?.toLowerCase();

  const handlers = {
    join: './deche/join.js', // <-- Thêm join handler vào reply
    shop: './deche/shop.js',
    map: './deche/canvasMap.js',
    attack: './deche/attack.js',
    info: './deche/info.js',
    ally: './deche/ally.js',
    help: null
  };

  if (handleReply.type === "help") {
    if (cmd === "attack") {
      if (!split[1]) {
        return api.sendMessage(
          "⚠️ Bạn cần nhập tọa độ khi tấn công!\nVí dụ: attack A2",
          event.threadID, event.messageID
        );
      }
      const args = split;
      const filePath = path.join(__dirname, handlers.attack);
      delete require.cache[require.resolve(filePath)];
      return require(filePath)(api, event, args, Currencies);
    }

    if (cmd in handlers && cmd !== "help" && cmd !== "attack") {
      const args = split;
      const filePath = path.join(__dirname, handlers[cmd]);
      delete require.cache[require.resolve(filePath)];
      return require(filePath)(api, event, args, Currencies);
    }

    return api.sendMessage(
      `⚠️ Vui lòng reply: join, shop, map, attack [tọa độ], info, ally để thao tác nhanh!`,
      event.threadID, event.messageID
    );
  }

  if (handlers[handleReply.type]) {
    const filePath = path.join(__dirname, handlers[handleReply.type]);
    delete require.cache[require.resolve(filePath)];
    if (typeof require(filePath).handleReply === 'function') {
      return require(filePath).handleReply({ api, event, handleReply, Currencies });
    }
  }
};