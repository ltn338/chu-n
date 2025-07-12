const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "xvideos",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Pcoder",
    description: "Tìm kiếm và tải video trên xvideos (mod xịn by Pcoder)",
    commandCategory: "Tiện ích",
    usages: "xvideos <từ khoá>",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs": ""
    }
};

function formatDuration(duration) {
    // Format duration "10 min 9 sec" => "10:09"
    const match = duration.match(/(\d+)\s*min(?:ute)?s?[\s,]*(\d+)?\s*sec(?:ond)?s?/i);
    if (match) {
        const min = match[1].padStart(2, "0");
        const sec = match[2] ? match[2].padStart(2, "0") : "00";
        return `${min}:${sec}`;
    }
    return duration;
}

module.exports.run = async function ({ api, event, args, Currencies, Users }) {
    const { threadID, senderID, messageID } = event;
    const out = msg => api.sendMessage(msg, threadID, messageID);

    if (!args[0]) return out("❌ Bạn cần nhập từ khoá để tìm kiếm video trên Xvideos!");

    const search = args.join(" ");
    const attachments = [];
    const messages = [];

    try {
        const res = (await axios.get(`https://joshweb.click/prn/search/${encodeURIComponent(search)}`)).data;
        const data = res.result;

        if (!data || data.length === 0) return out("❎ Không tìm thấy kết quả nào phù hợp.");

        for (let i = 0; i < Math.min(10, data.length); i++) {
            const video = data[i];
            messages.push(
                `ID: ${i + 1}\n📝 Tiêu đề: ${video.title}\n⏰ Thời lượng: ${formatDuration(video.duration)}\n🔗 Link: ${video.video}\n👤 Người đăng: ${video.uploaderName}\n📥 Profile: ${video.uploaderProfile}`
            );

            if (video.thumbnail) {
                const thumbPath = path.join(__dirname, `cache/xvthumb_${i + 1}.jpg`);
                try {
                    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
                    fs.writeFileSync(thumbPath, Buffer.from(thumbRes.data));
                    attachments.push(fs.createReadStream(thumbPath));
                } catch {}
            }
        }

        api.sendMessage(
            {
                body: `🔎 [XVIDEOS SEARCH]\n${messages.join("\n\n")}\n\n» Reply số thứ tự để tải video (chỉ video dưới 24MB và dưới 10 phút).`,
                attachment: attachments
            },
            threadID,
            (error, info) => {
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    author: senderID,
                    messageID: info.messageID,
                    result: data,
                    search,
                    attachment: attachments
                });
            }
        );
    } catch (error) {
        out("⚠️ Lỗi khi tìm kiếm video: " + error.message);
        console.error("Search error:", error);
    }
};

module.exports.handleReply = async function ({ event, api, Currencies, Users, handleReply }) {
    const { threadID, messageID, body, senderID } = event;
    if (senderID !== handleReply.author) return api.sendMessage("⚠️ Bạn không phải là người dùng lệnh!", threadID, messageID);

    const choose = parseInt(body.trim());
    api.unsendMessage(handleReply.messageID);

    if (isNaN(choose)) return api.sendMessage("⚠️ Vui lòng nhập số thứ tự!", threadID, messageID);
    if (choose > handleReply.result.length || choose < 1) return api.sendMessage("❎ Lựa chọn không hợp lệ.", threadID, messageID);

    const chosenVideo = handleReply.result[choose - 1];
    api.sendMessage(`⏳ Đang tải video, vui lòng đợi (tối đa 5 phút)...`, threadID, (err, info) =>
        setTimeout(() => api.unsendMessage(info.messageID), 10000)
    );

    try {
        const res = await axios.get(`https://joshweb.click/prn/download?url=${encodeURIComponent(chosenVideo.video)}`);
        const response = res.data.result;
        const { description, uploadDate, name: title, contentUrl } = response;
        const videoUrl = contentUrl?.HD_Quality;

        if (!videoUrl) return api.sendMessage("❎ Không tìm thấy link video HD.", threadID, messageID);

        // Kiểm tra dung lượng
        const headRes = await axios.head(videoUrl);
        const size = parseInt(headRes.headers['content-length'] || "0");
        if (size > 24 * 1024 * 1024) return api.sendMessage("❎ Video lớn hơn 24MB, không thể gửi lên Messenger.", threadID, messageID);

        const safeFileName = title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').slice(0, 32).trim() || "xvideos_video";
        const filePath = path.join(__dirname, `cache/${safeFileName}.mp4`);

        const videoRes = await axios.get(videoUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(videoRes.data));

        api.sendMessage(
            {
                body: `🎬 [XVIDEOS DOWNLOAD]\nTiêu đề: ${title}\nMô tả: ${description || "Không có"}\n🗓 Ngày đăng: ${uploadDate || "Không rõ"}\n\n⏳ Video sẽ tự động xoá sau 10 giây!`,
                attachment: fs.createReadStream(filePath)
            },
            threadID,
            (error, info) => {
                if (!error) setTimeout(() => { api.unsendMessage(info.messageID); }, 10000);
                fs.unlinkSync(filePath);
            },
            messageID
        );
    } catch (error) {
        console.error("Download error:", error.message || error);
        api.sendMessage("❎ Lỗi khi tải video, thử lại sau!", threadID, messageID);
    }
};