const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');
const axios = require('axios');
const moment = require('moment-timezone');

// --- CONFIG ---
const backgroundUrls = [
    'https://raw.githubusercontent.com/Kenne400k/commands/main/4k-Windows-11-Wallpaper-scaled.jpg',
    'https://raw.githubusercontent.com/Kenne400k/commands/main/HD-wallpaper-chill-vibes-3440-1440-r-chill-art.jpg',
    'https://raw.githubusercontent.com/Kenne400k/commands/main/hinh-nen-chill-cho-may-tinh-dep_040228906.jpg',
    'https://raw.githubusercontent.com/Kenne400k/commands/main/triangles-1430105_1280.png',
    'https://raw.githubusercontent.com/Kenne400k/commands/main/background-la-gi-1.jpg'
];
const fontUrls = [
    { url: 'https://github.com/Kenne400k/commands/raw/refs/heads/main/Kanit-Regular.ttf', filename: 'Kanit-Regular.ttf' },
    { url: 'https://github.com/Kenne400k/commands/raw/refs/heads/main/Kanit-Bold.ttf', filename: 'Kanit-Bold.ttf' }
];
const randomLeaveContents = [
    "Chúc bạn may mắn ở những hành trình tiếp theo!",
    "Mỗi cuộc chia ly là một lần trưởng thành.",
    "Nhóm sẽ nhớ bạn lắm đó!",
    "Tạm biệt và hẹn gặp lại ở một nơi nào đó ^^",
    "Cửa nhóm luôn rộng mở nếu bạn muốn quay lại!",
    "Mong rằng bạn đã có những kỷ niệm đẹp ở đây!",
    "Nhớ giữ liên lạc nha!",
    "Một thành viên đã rời tổ đội...",
    "Chúc bạn vui vẻ trên con đường mới!",
    "Tạm biệt người anh em thiện lành!",
    "Đã đến lúc nói lời chào tạm biệt rồi...",
    "Hy vọng sẽ gặp lại bạn vào một ngày không xa!",
    "Một người bước ra, nhóm vẫn nhớ về bạn!"
];

// --- AUTO DOWNLOAD FONTS & BACKGROUND ---
(async () => {
    const cacheDir = path.join(__dirname, '../../cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    for (const font of fontUrls) {
        const localPath = path.join(cacheDir, font.filename);
        if (!fs.existsSync(localPath)) {
            try {
                const response = await axios({ method: 'GET', url: font.url, responseType: 'stream' });
                const writer = fs.createWriteStream(localPath);
                response.data.pipe(writer);
                await new Promise((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });
            } catch (error) { console.error(`[DOWNLOADER] Lỗi khi tải ${font.filename}:`, error.message); }
        }
    }
    try {
        registerFont(path.join(cacheDir, 'Kanit-Bold.ttf'), { family: "Kanit", weight: "bold" });
        registerFont(path.join(cacheDir, 'Kanit-Regular.ttf'), { family: "Kanit", weight: "regular" });
    } catch (e) { console.error("[FONT-LOADER] Lỗi đăng ký font.", e); }
    for (let i = 0; i < backgroundUrls.length; i++) {
        const url = backgroundUrls[i];
        const ext = path.extname(url).split('?')[0] || '.png';
        const localPath = path.join(cacheDir, `bg_leave_${i}${ext}`);
        if (!fs.existsSync(localPath)) {
            try {
                const response = await axios({ method: 'GET', url, responseType: 'arraybuffer' });
                fs.writeFileSync(localPath, response.data);
            } catch (error) { console.error(`[DOWNLOADER] Lỗi khi tải background:`, error.message); }
        }
    }
})();

async function getAvatarBuffer(url) {
    try {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(res.data, 'binary');
    } catch (e) {
        const canvas = createCanvas(200, 200);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "#2E2E2E";
        ctx.fillRect(0, 0, 200, 200);
        return canvas.toBuffer();
    }
}
function getAvatarUrl(userId) {
    return `https://graph.facebook.com/${userId}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
}

function getFittingFontSize(ctx, text, maxWidth, initialSize, minSize, fontWeight = "bold") {
    let fontSize = initialSize;
    ctx.font = `${fontWeight} ${fontSize}px "Kanit", Arial, sans-serif`;
    while (ctx.measureText(text).width > maxWidth && fontSize > minSize) {
        fontSize--;
        ctx.font = `${fontWeight} ${fontSize}px "Kanit", Arial, sans-serif`;
    }
    return `${fontWeight} ${fontSize}px "Kanit", Arial, sans-serif`;
}

async function makeLeaveImage({ avatarUrl, name, groupName, memberCount, leaveOrder, kickedBy }) {
    const width = 1200, height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const cacheDir = path.join(__dirname, '../../cache');
    try {
        const bgFiles = fs.readdirSync(cacheDir).filter(f => f.startsWith('bg_leave_'));
        let bgImage;
        if (bgFiles.length > 0) {
            const randomBgPath = path.join(cacheDir, bgFiles[Math.floor(Math.random() * bgFiles.length)]);
            bgImage = await loadImage(randomBgPath);
        }
        const imgRatio = bgImage.width / bgImage.height;
        const canvasRatio = width / height;
        let sx = 0, sy = 0, sWidth = bgImage.width, sHeight = bgImage.height;
        if (imgRatio > canvasRatio) { sWidth = sHeight * canvasRatio; sx = (bgImage.width - sWidth) / 2; }
        else { sHeight = sWidth / canvasRatio; sy = (bgImage.height - sHeight) / 2; }
        ctx.drawImage(bgImage, sx, sy, sWidth, sHeight, 0, 0, width, height);
    } catch (e) {
        ctx.fillStyle = '#23272f';
        ctx.fillRect(0, 0, width, height);
    }

    // Glass Box
    const boxX = 32, boxY = 32, boxW = width-64, boxH = height-64;
    ctx.save();
    let glassGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY+boxH);
    glassGrad.addColorStop(0, "rgba(36,24,32,0.93)");
    glassGrad.addColorStop(1, "rgba(24,25,34,0.88)");
    ctx.globalAlpha = 0.92;
    ctx.filter = "blur(0.5px)";
    ctx.fillStyle = glassGrad;
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.globalAlpha = 1;
    ctx.filter = "none";
    ctx.restore();

    // Glass border gradient
    let borderGrad = ctx.createLinearGradient(boxX, boxY, boxX+boxW, boxY+boxH);
    borderGrad.addColorStop(0, "#ff3278");
    borderGrad.addColorStop(0.7, "#b6ff44");
    borderGrad.addColorStop(1, "#08ffe6");
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = borderGrad;
    ctx.shadowColor = "rgba(255,50,120,0.19)";
    ctx.shadowBlur = 14;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.restore();

    // highlight line trên
    ctx.save();
    let hiGrad = ctx.createLinearGradient(boxX, boxY + 16, boxX+boxW, boxY + 16);
    hiGrad.addColorStop(0, "#ff3278");
    hiGrad.addColorStop(0.3, "#b6ff44");
    hiGrad.addColorStop(0.7, "#08ffe6");
    hiGrad.addColorStop(1, "#fff");
    ctx.globalAlpha = 0.20;
    ctx.fillStyle = hiGrad;
    ctx.fillRect(boxX + 44, boxY + 16, boxW - 88, 6);
    ctx.restore();

    // Avatar (hiệu ứng ánh sáng phía sau, glow nhiều lớp)
    const avatarSize = 150;
    const avatarX = boxX + 70;
    const avatarY = height/2 - avatarSize/2;
    // Ánh sáng phía sau
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 38, 0, Math.PI*2);
    let behindLight = ctx.createRadialGradient(
        avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2,
        avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize
    );
    behindLight.addColorStop(0, "rgba(255,50,120,0.26)");
    behindLight.addColorStop(0.25, "rgba(182,255,68,0.10)");
    behindLight.addColorStop(1, "rgba(24,25,34,0.01)");
    ctx.globalAlpha = 0.87;
    ctx.fillStyle = behindLight;
    ctx.shadowColor = "#ff3278";
    ctx.shadowBlur = 60;
    ctx.fill();
    ctx.restore();
    // Glow viền hồng
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 12, 0, Math.PI*2);
    ctx.shadowColor = "#ff3278";
    ctx.shadowBlur = 36;
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = "#ff3278";
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
    // Glow xanh nhẹ
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 2, 0, Math.PI*2);
    ctx.strokeStyle = "#08ffe6";
    ctx.globalAlpha = 0.13;
    ctx.shadowColor = "#08ffe6";
    ctx.shadowBlur = 9;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
    // Avatar circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI*2);
    ctx.closePath();
    ctx.clip();
    const avatarBuffer = await getAvatarBuffer(avatarUrl);
    let avatar;
    try {
        avatar = await loadImage(avatarBuffer);
    } catch (e) {
        avatar = await loadImage(await getAvatarBuffer('https://i.imgur.com/0y0y0y0.png'));
    }
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Content Area (right of avatar)
    const textAreaX = avatarX + avatarSize + 55;
    const textAreaY = avatarY + 12;
    let leaveText = "GOODBYE,";
    let fontSize = 44;
    ctx.font = `bold ${fontSize}px "Kanit", Arial, sans-serif`;
    let maxNameWidth = width - textAreaX - 60 - ctx.measureText(leaveText + " ").width;
    let nameFontSize = fontSize;
    ctx.font = `bold ${fontSize}px "Kanit", Arial, sans-serif`;
    while (ctx.measureText(name).width > maxNameWidth && nameFontSize > 28) {
        nameFontSize--;
        ctx.font = `bold ${nameFontSize}px "Kanit", Arial, sans-serif`;
    }
    // Text chính: Goodbye + Name (cùng font, cùng dòng, bóng mờ)
    ctx.save();
    ctx.font = `bold ${nameFontSize}px "Kanit", Arial, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.shadowColor = "#ff3278";
    ctx.shadowBlur = 17;
    ctx.fillStyle = "#ff3278";
    ctx.fillText(leaveText, textAreaX, textAreaY);
    ctx.restore();

    ctx.save();
    ctx.font = `bold ${nameFontSize}px "Kanit", Arial, sans-serif`;
    let grad = ctx.createLinearGradient(textAreaX, textAreaY, textAreaX+600, textAreaY+95);
    grad.addColorStop(0, "#ff3278");
    grad.addColorStop(0.5, "#b6ff44");
    grad.addColorStop(1, "#08ffe6");
    ctx.fillStyle = grad;
    ctx.shadowColor = "#08ffe6";
    ctx.shadowBlur = 13;
    ctx.fillText(name, textAreaX + ctx.measureText(leaveText + " ").width, textAreaY);
    ctx.restore();

    // Dòng thành viên (to, trắng, shadow đen)
    ctx.save();
    ctx.font = 'bold 34px "Kanit", Arial, sans-serif';
    ctx.shadowColor = "rgba(0,0,0,0.20)";
    ctx.shadowBlur = 4;
    ctx.fillStyle = "#fff";
    ctx.fillText(`Đã rời khỏi nhóm ${groupName}.`, textAreaX, textAreaY+nameFontSize+10);
    ctx.restore();

    // Nếu bị qtv kick, thêm dòng kick
    if (kickedBy) {
        ctx.save();
        ctx.font = 'italic 25px "Kanit", Arial, sans-serif';
        ctx.fillStyle = "#ff3278";
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 2;
        ctx.fillText(`Quản trị viên ${kickedBy} đã kích thành viên này ra khỏi nhóm.`, textAreaX, textAreaY+nameFontSize+10+34);
        ctx.restore();
    }

    // Dòng phụ random nội dung nhỏ hơn, nhạt, bóng nhẹ hồng
    ctx.save();
    ctx.font = 'italic 23px "Kanit", Arial, sans-serif';
    ctx.fillStyle = "#e7b3d8";
    ctx.shadowColor = "#ff3278";
    ctx.shadowBlur = 2;
    let yDelta = (kickedBy ? 34 : 0);
    let randomContent = randomLeaveContents[Math.floor(Math.random()*randomLeaveContents.length)];
    ctx.fillText(randomContent, textAreaX, textAreaY+nameFontSize+10+38+yDelta);
    ctx.restore();

    // Footer
    ctx.font = 'bold 22px "Kanit", Arial, sans-serif';
    ctx.fillStyle = "rgba(255,255,255,0.29)";
    ctx.textAlign = "left";
    ctx.fillText(moment().tz("Asia/Ho_Chi_Minh").format('HH:mm:ss - DD/MM/YYYY'), boxX + 15, height - 35);

    ctx.font = 'italic 22px "Kanit", Arial, sans-serif';
    ctx.textAlign = "right";
    ctx.fillText("Author: Kenne400k", width - boxX - 15, height - 35);

    ctx.restore();
    return canvas.toBuffer('image/png');
}

module.exports.config = {
    name: "leaveNoti",
    eventType: ["log:unsubscribe"],
    version: "2.1.0",
    credits: "Kenne400k, Khôi, Pcoder",
    description: "Thông báo người rời nhóm bằng canvas leave card đẹp như joinNoti, có dòng qtv kick nếu bị kick",
    dependencies: {
        "canvas": "", "axios": "", "fs-extra": "", "path": "", "moment-timezone": ""
    }
};

module.exports.run = async function({ api, event, Users, Threads }) {
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
    const { threadID } = event;
    try {
        const threadInfo = await api.getThreadInfo(threadID);
        const groupName = threadInfo.threadName || "chúng ta";
        const userId = event.logMessageData.leftParticipantFbId;
        const name = global.data.userName.get(userId) || await Users.getNameUser(userId);
        const memberCount = threadInfo.participantIDs.length; // Số còn lại
        const leaveOrder = memberCount + 1; // Trước khi rời
        const avatarUrl = getAvatarUrl(userId);
        // Xác định bị kick hay tự rời
        let kickedBy = null;
        if (event.author && event.author != userId) {
            // Bị kick, lấy tên qtv
            kickedBy = global.data.userName.get(event.author) || await Users.getNameUser(event.author) || "QTV";
        }
        const imgBuffer = await makeLeaveImage({
            avatarUrl, name, groupName, memberCount, leaveOrder, kickedBy
        });
        const imgPath = path.join(__dirname, `../../cache/leave_${userId}.png`);
        await fs.writeFile(imgPath, imgBuffer);
        let bodyMsg;
        if (kickedBy) {
            bodyMsg = `🔨 ${name} đã bị quản trị viên ${kickedBy} kích khỏi nhóm!`;
        } else {
            bodyMsg = `😢 ${name} đã rời khỏi nhóm. Mọi người tạm biệt nhé!`;
        }
        await api.sendMessage({
            body: bodyMsg,
            mentions: [{ tag: name, id: userId }],
            attachment: fs.createReadStream(imgPath)
        }, threadID, () => fs.unlink(imgPath, () => {}));
    } catch (err) {
        console.error("Error in leaveNoti (Leave Card):", err);
    }
};