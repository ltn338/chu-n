module.exports.config = {
  name: "help",
  version: "1.2.0",
  hasPermission: 0,
  credits: "Le Thanh Nghia",
  description: "Xem danh sách nhóm lệnh hoặc chi tiết lệnh",
  commandCategory: "Hệ thống",
  usages: "[số_trang | tên_lệnh]",
  cooldowns: 5
};

const ICONS = {
  "Trò Chơi": "🎮",
  "Tiện ích": "🧰",
  "Ảnh": "🖼️",
  "Admin": "🛠️",
  "Quản Trị Viên": "🧑‍💼",
  "Không cần dấu lệnh": "♻️",
  "Thành Viên": "👥",
  "Tài chính": "💰",
  "group": "👥",
  "Random-img": "🖼️",
  "Tình yêu": "❤️",
  "Tìm kiếm": "🔍",
  "Giải trí": "🎭",
  "Kiếm Tiền": "💸",
  "Hệ Thống": "⚙️",
  "War": "⚔️",
  "Video": "🎬",
  "Spam": "📢",
  "Người dùng": "👤",
  "Công cụ": "🧪",
  "Gọi Hồn": "📣",
  "Media": "🎞️",
  "AdminBot": "🤖",
  "nsfw": "🔞",
  "Tạo ảnh": "🖌️",
  "Khác": "📁"
};

const paginate = (arr, pageSize) => {
  const pages = [];
  for (let i = 0; i < arr.length; i += pageSize)
    pages.push(arr.slice(i, i + pageSize));
  return pages;
};

module.exports.run = async ({ api, event, args }) => {
  const { commands } = global.client;
  const allCommands = Array.from(commands.values());
  const groupMap = {};

  for (const cmd of allCommands) {
    const group = cmd.config.commandCategory || "Khác";
    if (!groupMap[group]) groupMap[group] = [];
    groupMap[group].push(cmd);
  }

  const listGroups = Object.entries(groupMap).map(([name, arr]) => ({
    name,
    icon: ICONS[name] || "📁",
    commands: arr
  }));

  const pages = paginate(listGroups, 8);
  let page = 1;

  if (args[0]) {
    if (!isNaN(args[0])) {
      page = parseInt(args[0]);
      if (page < 1 || page > pages.length)
        return api.sendMessage(`❌ Trang ${page} không tồn tại.`, event.threadID, event.messageID);
    } else {
      const name = args[0].toLowerCase();
      const cmd = allCommands.find(c => c.config.name === name);
      if (!cmd) return api.sendMessage(`❌ Không tìm thấy lệnh "${name}"`, event.threadID, event.messageID);

      const cfg = cmd.config;
      return api.sendMessage(
        `╭─── ${cfg.name} ───╮\n` +
        `📄 Mô tả: ${cfg.description || "Không có"}\n` +
        `🛠 Cách dùng: /${cfg.name} ${cfg.usages || ""}\n` +
        `👑 Quyền: ${cfg.hasPermission === 0 ? "Người dùng" : cfg.hasPermission === 1 ? "QTV" : "Admin"}\n` +
        `⏱ Delay: ${cfg.cooldowns || 5}s\n` +
        `📂 Nhóm: ${cfg.commandCategory}\n` +
        `🤝 Credit: ${cfg.credits}\n` +
        `╰──────────────╯`,
        event.threadID, event.messageID
      );
    }
  }

  const list = pages[page - 1];
  const msg = [
    `📘 Danh sách nhóm lệnh (Trang ${page}/${pages.length}):`,
    ...list.map((g, i) => `${i + 1}. ${g.icon} ${g.name}: ${g.commands.length} lệnh`),
    ``,
    `📌 Reply số (1-${list.length}) để xem lệnh trong nhóm.`,
    `➡️ /help [số_trang] để chuyển trang`,
    `🔍 /help [tên_lệnh] để xem chi tiết`,
    `🔢 Tổng có: ${allCommands.length} lệnh`
  ].join("\n");

  return api.sendMessage(msg, event.threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      type: "group_detail",
      author: event.senderID,
      messageID: info.messageID,
      page,
      data: list
    });
  });
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  if (handleReply.type !== "group_detail" || event.senderID !== handleReply.author) return;

  const idx = parseInt(event.body);
  if (isNaN(idx) || idx < 1 || idx > handleReply.data.length)
    return api.sendMessage(`❌ Vui lòng reply số từ 1 đến ${handleReply.data.length}`, event.threadID, event.messageID);

  const group = handleReply.data[idx - 1];
  const details = group.commands.map(cmd =>
    `📌 /${cmd.config.name} ${cmd.config.usages || ""} — ${cmd.config.description}`
  ).join("\n");

  return api.sendMessage(
    `📂 Nhóm: ${group.icon} ${group.name} có ${group.commands.length} lệnh:\n${details}`,
    event.threadID,
    event.messageID
  );
};
