const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "del",
  version: "1.0.0",
  hasPermission: 2, // chỉ admin bot mới được dùng
  credits: "HÌNH ẢNH THÀNH VĂN BẢN + ChatGPT",
  description: "Xoá file module bất kỳ trong thư mục modules/commands",
  commandCategory: "Quản trị",
  usages: "[tên_module].js (không cần viết .js cũng được)",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const fileName = args[0];
  if (!fileName)
    return api.sendMessage("⚠️ Bạn phải nhập tên module cần xoá!", event.threadID, event.messageID);

  // Chuẩn hóa tên file
  const file = fileName.endsWith(".js") ? fileName : `${fileName}.js`;
  const filePath = path.join(__dirname, file);

  // Kiểm tra tồn tại và xoá
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      return api.sendMessage(`🗑️ Đã xoá thành công file: ${file}`, event.threadID, event.messageID);
    } catch (err) {
      return api.sendMessage("❌ Xoá thất bại: " + err.message, event.threadID, event.messageID);
    }
  } else {
    return api.sendMessage(`❌ Không tìm thấy file: ${file}`, event.threadID, event.messageID);
  }
};