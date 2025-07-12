const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');
const axios = require('axios');
const moment = require('moment-timezone');

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
const randomContents = [
  "Hãy cùng nhau xây dựng cộng đồng vui vẻ nhé!",
  "Chúc bạn có những phút giây tuyệt vời trong nhóm!",
  "Nhớ tương tác để không bị kick nha :D",
  "Chào mừng bạn đến với đại gia đình của chúng mình!",
  "Cùng chém gió với mọi người nha!",
  "Hãy cùng nhau chia sẻ và học hỏi!",
  "Thành viên mới đã gia nhập rồi mọi người ơi!",
  "Hi vọng bạn sẽ tìm thấy niềm vui ở đây ^^",
  "Bạn là mảnh ghép quan trọng còn thiếu!",
  "Cùng lan tỏa những điều tích cực nhé!",
  "Chúc bạn kết nối thật nhiều bạn mới!",
  "Đồng hành cùng nhóm, bạn sẽ không cô đơn!",
  "Một chương mới bắt đầu với sự xuất hiện của bạn!",
  "Chào mừng bạn – nguồn năng lượng mới của nhóm!",
  "Thêm một người bạn, thêm một niềm vui!",
  "Nhóm chào đón bạn bằng cả trái tim!",
  "Bạn đến rồi, tiệc chào mừng bắt đầu thôi!",
  "Chúc bạn cười nhiều hơn khi ở đây!",
  "Cùng nhau tạo nên những kỷ niệm đáng nhớ!",
  "Cảm ơn vì đã chọn gia nhập nhóm này!",
  "Bạn là lý do hôm nay chúng mình vui hơn!",
  "Chúng mình rất vui khi có bạn ở đây!",
  "Một khởi đầu mới, một người bạn mới!",
  "Hy vọng bạn sẽ thấy thân thuộc nơi đây!",
  "Cùng nhau phát triển và vững mạnh nhé!",
  "Đã kết nạp thêm một thành viên siêu xịn!",
  "Bạn đã chính thức là một phần của chúng mình!",
  "Mọi người đều đang chờ để làm quen với bạn đó!",
  "Cảm ơn vì đã đồng hành cùng chúng mình!",
  "Thêm một ngôi sao gia nhập vũ trụ nhóm!",
  "Bạn là VIP mới của nhóm rồi đó!",
  "Thêm bạn bớt buồn, nhóm có bạn là vui liền!",
  "Mỗi người một màu sắc – bạn là sắc màu mới!",
  "Nhiệt liệt hoan nghênh bạn đã tham gia!",
  "Bắt đầu hành trình đầy niềm vui cùng nhóm nhé!",
  "Chúng mình có chung một mái nhà rồi!",
  "Bạn là người đặc biệt và luôn được chào đón!",
  "Ngồi xuống, thư giãn, và bắt đầu trò chuyện thôi!",
  "Chúng ta cùng nhau tạo nên điều tuyệt vời!",
  "Nhóm là của bạn, hãy làm điều bạn muốn!",
  "Không ai bị bỏ lại phía sau – kể cả bạn!",
  "Tới giờ giao lưu làm quen rồi đó nha!",
  "Chúc bạn có một hành trình thật chill cùng nhóm!",
  "Bạn đã unlock level 1 – Thành viên nhóm!",
  "Mỗi thành viên mới là một món quà!",
  "Gửi lời chào đến bạn – thành viên thứ [joinOrder]!",
  "Hôm nay nhóm có hương vị mới rồi!",
  "Chúng ta là một – và bạn cũng thế!",
  "Hãy là chính bạn – nơi đây luôn chào đón!",
  "Tất cả đều là bạn bè – bạn không ngoại lệ!",
  "Ghé chơi rồi thì nhớ ở lại lâu lâu đó nha!",
  "Nạp thêm năng lượng tích cực từ bạn!",
  "Cảm ơn bạn đã làm nhóm thêm đặc biệt!",
  "Chúng ta cùng tạo nên điều phi thường!",
  "Bạn là cú click định mệnh của nhóm!",
  "Tất cả chỉ vừa mới bắt đầu thôi!",
  "Chào mừng bạn đến với nơi tâm sự và chill!",
  "Không còn là người lạ, bạn là thành viên rồi!",
  "Bắt đầu cuộc phiêu lưu nhóm ngay bây giờ!",
  "Bạn là phần không thể thiếu của hành trình này!",
  "Tự nhiên như ở nhà – vì bạn là một phần ở đây!",
  "Làm quen nhau đi nào!",
  "Nơi đây là của chúng ta – và giờ có bạn!",
  "Bạn chính là niềm vui mới của nhóm!",
  "Chúng mình chờ bạn mãi đó!",
  "Welcome! Chỗ ngồi đẹp nhất dành cho bạn!",
  "Từ hôm nay, bạn đã là một phần của câu chuyện này!",
  "Bạn đến đúng lúc lắm luôn đó!",
  "Cùng nhau bung xõa hết mình nhé!",
  "Bạn là ánh sáng mới của cộng đồng này!",
  "Đã vào rồi thì nhớ hoạt động sôi nổi nha!",
  "Nhóm sẽ tuyệt hơn mỗi khi có người như bạn!",
  "Bạn là thành viên xịn xò mới nhất!",
  "Tới chơi đừng về – ở lại chơi luôn!",
  "Cộng đồng này sống là nhờ bạn đó!",
  "Giơ tay chào đón người anh em mới nào!",
  "Người anh em thiện lành mới gia nhập!",
  "Xin chào chiến hữu mới của nhóm!",
  "Bạn vừa mở cánh cửa bước vào đại gia đình!",
  "Cảm ơn bạn vì đã tham gia – tụi mình vui lắm luôn!",
  "Nơi này là để bạn thể hiện chính mình!",
  "Đồng đội mới đã có mặt!",
  "Người mới nhưng vibe rất hợp rồi đó nha!",
  "Người bạn mà nhóm còn thiếu nay đã đến!",
  "Hành trình thú vị đang chờ đón bạn!",
  "Giới thiệu bạn – nhân tố bí ẩn của nhóm!",
  "Chúng ta là một team – và bạn là đồng đội mới!",
  "Giờ là lúc bạn tỏa sáng cùng mọi người!",
  "Bạn có biết nhóm đã tốt hơn nhờ bạn không?",
  "Gia đình nhỏ chào đón bạn bằng cả trái tim!",
  "Hãy coi nơi đây là chốn thân quen của bạn!",
  "Chúng ta là một cộng đồng, không chỉ là nhóm!",
  "Bạn làm cả cộng đồng hân hoan đấy!",
  "Bạn là thành phần giúp nhóm cân bằng hơn!",
  "Có bạn rồi, nhóm đủ vị luôn!",
  "Bạn có thể ngồi đâu cũng được – vì bạn thuộc về đây!",
  "Mọi lời chào đều là dành cho bạn!",
  "Hãy là người tạo nên thay đổi tích cực!",
  "Bạn mang đến làn gió mới rồi đó!",
  "Bấm tham gia là quyết định sáng suốt nhất!",
  "Sự hiện diện của bạn là món quà!",
  "Được gặp bạn là may mắn của nhóm!",
  "Không chỉ là nhóm – đây là gia đình!",
  "Bây giờ thì nhóm đã hoàn thiện hơn rồi!",
  "Chào bạn, người mang lại nụ cười mới!",
  "Tới lượt bạn kể câu chuyện rồi đó!",
  "Cùng nhau viết nên kỷ niệm đáng nhớ nhé!",
  "Bạn đến, niềm vui cũng đến!",
  "Tất cả đều đã sẵn sàng – chờ mỗi bạn thôi!",
  "Cùng nhau làm nên những điều tuyệt vời!",
];

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
        const localPath = path.join(cacheDir, `bg_welcome_${i}${ext}`);
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

async function makeWelcomeImage({ avatarUrl, name, groupName, memberCount, joinOrder }) {
    const width = 1200, height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const cacheDir = path.join(__dirname, '../../cache');
    try {
        const bgFiles = fs.readdirSync(cacheDir).filter(f => f.startsWith('bg_welcome_'));
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

    const boxX = 32, boxY = 32, boxW = width-64, boxH = height-64;
    ctx.save();
    ctx.globalAlpha = 0.81;
    ctx.fillStyle = "#14151b";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.globalAlpha = 1;
    ctx.restore();
    ctx.save();
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = "rgba(255,255,255,0.13)";
    ctx.shadowColor = "rgba(0,0,0,0.12)";
    ctx.shadowBlur = 12;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.restore();

    const avatarSize = 150;
    const avatarX = boxX + 70;
    const avatarY = height/2 - avatarSize/2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 9, 0, Math.PI*2);
    ctx.shadowColor = "#08ffe6";
    ctx.shadowBlur = 33;
    ctx.globalAlpha = 0.65;
    ctx.strokeStyle = "#08ffe6";
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
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

    const textAreaX = avatarX + avatarSize + 55;
    const textAreaY = avatarY + 12;
    let welcomeText = "Welcome,";
    let fontSize = 44;
    ctx.font = `bold ${fontSize}px "Kanit", Arial, sans-serif`;
    let maxNameWidth = width - textAreaX - 60 - ctx.measureText(welcomeText + " ").width;
    let nameFontSize = fontSize;
    ctx.font = `bold ${fontSize}px "Kanit", Arial, sans-serif`;
    while (ctx.measureText(name).width > maxNameWidth && nameFontSize > 28) {
        nameFontSize--;
        ctx.font = `bold ${nameFontSize}px "Kanit", Arial, sans-serif`;
    }
    ctx.font = `bold ${nameFontSize}px "Kanit", Arial, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#20ffe6";
    ctx.shadowColor = "rgba(0,0,0,0.10)";
    ctx.shadowBlur = 2;
    ctx.fillText(welcomeText, textAreaX, textAreaY);

    ctx.font = `bold ${nameFontSize}px "Kanit", Arial, sans-serif`;
    const grad = ctx.createLinearGradient(textAreaX, textAreaY, textAreaX+600, textAreaY+95);
    grad.addColorStop(0, "#b6ff44");
    grad.addColorStop(0.6, "#ff7b00");
    ctx.fillStyle = grad;
    ctx.shadowBlur = 0;
    ctx.fillText(name, textAreaX + ctx.measureText(welcomeText + " ").width, textAreaY);

    ctx.font = 'bold 34px "Kanit", Arial, sans-serif';
    ctx.fillStyle = "#fff";
    ctx.fillText(`Bạn là thành viên thứ #${joinOrder} của nhóm ${groupName}!`, textAreaX, textAreaY+nameFontSize+10);

    ctx.font = 'italic 23px "Kanit", Arial, sans-serif';
    ctx.fillStyle = "#b1e3d8";
    let randomContent = randomContents[Math.floor(Math.random()*randomContents.length)];
    ctx.fillText(randomContent, textAreaX, textAreaY+nameFontSize+10+38);

    ctx.font = 'bold 22px "Kanit", Arial, sans-serif';
    ctx.fillStyle = "rgba(255,255,255,0.29)";
    ctx.textAlign = "left";
    ctx.fillText(moment().tz("Asia/Ho_Chi_Minh").format('HH:mm:ss - DD/MM/YYYY'), boxX + 15, height - 35);

    ctx.font = 'italic 22px "Kanit", Arial, sans-serif';
    ctx.textAlign = "right";
    ctx.fillText("Author: Nguyen Truong Thien Phat", width - boxX - 15, height - 35);

    ctx.restore();
    return canvas.toBuffer('image/png');
}

module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "5.4.0",
    credits: "Pcoder", // idea Khôi Gay
    description: "chào mừng thành viên mới , canvas",
    dependencies: {
        "canvas": "", "axios": "", "fs-extra": "", "path": "", "moment-timezone": ""
    }
};

module.exports.run = async function({ api, event, Users, Threads }) {
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) return;
    const { threadID, logMessageData } = event;
    try {
        const threadInfo = await api.getThreadInfo(threadID);
        const groupName = threadInfo.threadName || "chúng ta";
        for (const participant of logMessageData.addedParticipants) {
            const userId = participant.userFbId;
            const name = participant.fullName;
            const memberCount = threadInfo.participantIDs.length;
            const joinOrder = threadInfo.participantIDs.indexOf(userId) + 1 || memberCount;
            const avatarUrl = getAvatarUrl(userId);
            const imgBuffer = await makeWelcomeImage({
                avatarUrl, name, groupName, memberCount, joinOrder
            });
            const imgPath = path.join(__dirname, `../../cache/welcome_${userId}.png`);
            await fs.writeFile(imgPath, imgBuffer);
            api.sendMessage({
                body: `🐧 ${name} vừa nhảy dù vào nhóm, ai cứu với?`,
                mentions: [{ tag: name, id: userId }],
                attachment: fs.createReadStream(imgPath)
            }, threadID, () => fs.unlink(imgPath, () => {}));
        }
    } catch (err) {
        console.error("Error in joinNoti (Profile Card):", err);
    }
}