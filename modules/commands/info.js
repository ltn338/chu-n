const axios = require("axios");
const downloader = require("image-downloader");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports.config = {
    name: "info",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "xxx",
    description: "Lấy thông tin người dùng Facebook qua UID hoặc link",
    usages: "[uid|link|reply]",
    commandCategory: "Tiện ích",
    cooldowns: 5,
};

async function streamURL(url, mime = "jpg") {
    const dest = `${__dirname}/cache/${Date.now()}.${mime}`;
    await downloader.image({ url, dest });
    return { stream: fse.createReadStream(dest), path: dest };
}

async function getUidFromLink(link) {
    try {
        const response = await axios.get(`https://ffb.vn/api/tool/get-id-fb?idfb=${encodeURIComponent(link)}`);
        return response.data.id || null;
    } catch (error) {
        console.error("Error fetching UID from link:", error);
        return null;
    }
}

module.exports.run = async function ({ api, event, args }) {
    let uid = args[0];

    if (event.messageReply) {
        uid = event.messageReply.senderID;
    } else if (uid && uid.startsWith("http")) {
        uid = await getUidFromLink(uid);
    } else if (!uid) {
        uid = event.senderID;
    }

    if (!uid) {
        return api.sendMessage("❌ Vui lòng cung cấp UID, link Facebook hợp lệ hoặc reply tin nhắn người dùng!", event.threadID, event.messageID);
    }

    try {
        api.sendMessage("🔄 Đang lấy thông tin...", event.threadID, event.messageID);

        const [response1, response2] = await Promise.all([
            axios.get(`https://adidaphat.site/facebook/getinfov2?uid=${uid}&apikey=apikeysumi`),
            axios.get(`https://adidaphat.site/facebook/getinfov2?uid=${uid}&apikey=apikeysumi`)
        ]);

        const result1 = response1.data;
        const result2 = response2.data;

        const getData = (data1, data2, field) => {
            return data1 && data1[field] && data1[field] !== "Không có dữ liệu!" ? data1[field] : (data2 && data2[field] ? data2[field] : "❌");
        };

        const user_id = result2.id;
        const name = getData(result1, result2, "name");
        const firstName = getData(result1, result2, "first_name");
        const profileUrl = getData(result1, result2, "link");
        const gender = getData(result1, result2, "gender");
        const locale = getData(result1, result2, "locale");
        const subData = getData(result1, result2, "subscribers");
        const subscribers = subData && subData.summary ? subData.summary.total_count : "❌";
        const timezone = getData(result1, result2, "timezone");
        const username = getData(result1, result2, "username");
        const coverPhotoUrl = getData(result1, result2, "cover")?.source || null;

        let createdTime = getData(result1, result2, "created_time");
        createdTime = createdTime.includes("||") ? createdTime.replace("||", " ") : createdTime;
        createdTime = moment(createdTime, "DD/MM/YYYY HH:mm:ss").tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss");

        let updatedTime = getData(result1, result2, "updated_time");
        updatedTime = updatedTime !== "❌"
            ? moment(updatedTime.replace("||", " "), "DD/MM/YYYY HH:mm:ss").tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss")
            : "❌";

        let relationshipStatus = getData(result1, result2, "relationship_status");
        const birthday = getData(result1, result2, "birthday");
        const hometown = typeof getData(result1, result2, "hometown") === "object" ? getData(result1, result2, "hometown").name : getData(result1, result2, "hometown");
        const location = typeof getData(result1, result2, "location") === "object" ? getData(result1, result2, "location").name : getData(result1, result2, "location");
        const about = getData(result1, result2, "about");
        const quotes = getData(result1, result2, "quotes");
        const verify = result2.is_verified === true ? "Đã xác minh" : "Chưa xác minh";
        const work = getData(result1, result2, "work");
        const love = getData(result2, result1, "love");

        if (love && love.name && love.name !== "❌") {
            relationshipStatus += ` với ${love.name}`;
        }

        const posts2 = result2.posts?.data || [];
        let latestPost = posts2.reduce((latest, post) => {
            return !latest || new Date(post.created_time) > new Date(latest.created_time) ? post : latest;
        }, null);

        let message = `
╭──────────────⭓
│ 👤 Họ tên: ${name}
│ 👤 Tên: ${firstName}
│ 🔗 Username: ${username} (${user_id})
│ 🌐 Profile: ${profileUrl}
│ 🧬 Giới tính: ${gender}
│ 🌍 Ngôn ngữ: ${locale}
│ 🕒 Múi giờ: ${timezone}
│ 📊 Người theo dõi: ${subscribers}
│ 🎉 Tạo lúc: ${createdTime}
│ ⏰ Cập nhật lúc: ${updatedTime}
│ 💖 Quan hệ: ${relationshipStatus}`;

        if (love && love.id) message += `\n│ 💞 Link người yêu: fb.com/${love.id}`;

        message += `
│ 🎂 Ngày sinh: ${birthday}
│ 📍 Quê quán: ${hometown}
│ 🏠 Nơi ở: ${location}
│ 📝 Giới thiệu: ${about}
│ 📌 Trích dẫn: ${quotes}
│ ✅ Xác minh: ${verify}
│ 💼 Công việc:
${Array.isArray(work)
        ? work.map(w => `│ - ${w.position?.name || "❌"} tại ${w.employer?.name || "❌"}, ${w.location?.name || "❌"}, từ ${w.start_date ? moment(w.start_date, "YYYY-MM-DD").format("DD/MM/YYYY") : "❌"}`).join("\n")
        : "❌"}
╰─────────────⭓`;

        if (latestPost) {
            const postTime = moment(latestPost.created_time).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss");
            message += `

╭──────────────⭓
│ 📅 Bài viết gần nhất:
│ 🕒 Thời gian: ${postTime}
│ 📝 Nội dung: ${latestPost.message || "❌"}
│ 📖 Story: ${latestPost.story || "❌"}
│ 🔗 Link: ${latestPost.link || "❌"}
╰─────────────⭓`;
        }

        const { stream: userImage, path: userImagePath } = await streamURL(`https://graph.facebook.com/${uid}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        let attachments = [userImage];

        let coverImagePath = null;
        if (coverPhotoUrl) {
            const { stream: coverImage, path } = await streamURL(coverPhotoUrl);
            attachments.push(coverImage);
            coverImagePath = path;
        }

        api.sendMessage({
            body: message,
            attachment: attachments
        }, event.threadID, (err, info) => {
            if (!err) {
                setTimeout(() => {
                    api.unsendMessage(info.messageID);
                }, 60 * 1000);
            }

            // Xóa file ảnh nếu tồn tại
            if (fs.existsSync(userImagePath)) fs.unlinkSync(userImagePath);
            if (coverImagePath && fs.existsSync(coverImagePath)) fs.unlinkSync(coverImagePath);
        }, event.messageID);

    } catch (error) {
        console.error(error);
        return api.sendMessage("❌ Có lỗi xảy ra khi lấy thông tin người dùng!", event.threadID, event.messageID);
    }
};
