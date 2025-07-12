const { createCanvas, registerFont, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');

const MENU_ITEMS_PER_PAGE = 10;
const ALL_CMD_ITEMS_PER_PAGE = 50;
const backgroundUrls = [
    'https://i.imgur.com/vOqjT0U.jpeg', 'https://i.imgur.com/3jmDqlf.png',
    'https://i.imgur.com/5ARMIYR.jpeg', 'https://i.imgur.com/OPhg353.jpeg',
    'https://i.imgur.com/lQBJTi4.jpeg'
];
const fontUrls = [
    { url: 'https://github.com/Kenne400k/commands/raw/refs/heads/main/Kanit-Regular.ttf', filename: 'Kanit-Regular.ttf' },
    { url: 'https://github.com/Kenne400k/commands/raw/refs/heads/main/Kanit-Bold.ttf', filename: 'Kanit-Bold.ttf' }
];

(async () => {
    const fontDir = path.join(__dirname, '../../cache');
    if (!fs.existsSync(fontDir)) fs.mkdirSync(fontDir, { recursive: true });
    for (const font of fontUrls) {
        const localPath = path.join(fontDir, font.filename);
        if (!fs.existsSync(localPath)) {
            console.log(`[FONT-LOADER] Tải font ${font.filename}...`);
            try {
                const response = await axios({ method: 'GET', url: font.url, responseType: 'stream' });
                response.data.pipe(fs.createWriteStream(localPath));
            } catch (error) { console.error(`[FONT-LOADER] Lỗi khi tải ${font.filename}:`, error.message); }
        }
    }
    try {
        registerFont(path.join(fontDir, 'Kanit-Bold.ttf'), { family: "Kanit", weight: "bold" });
        registerFont(path.join(fontDir, 'Kanit-Regular.ttf'), { family: "Kanit", weight: "regular" });
    } catch (e) { console.error("[FONT-LOADER] Lỗi đăng ký font.", e); }
})();

module.exports.config = {
    name: "menu2",
    version: "12.0.0",
    hasPermssion: 0,
    credits: "Pcoder",
    description: "Menu canvas",
    commandCategory: "Người dùng",
    usages: "[all] | [trang số]",
    cooldowns: 5
};

function TextPr(permission) { return permission == 0 ? "Thành viên" : permission == 1 ? "Quản trị viên" : permission == 2 ? "Admin bot" : "Toàn quyền"; }
function drawBackgroundCover(ctx, image) {
    const canvas = ctx.canvas; const imgRatio = image.width / image.height; const canvasRatio = canvas.width / canvas.height;
    let sx, sy, sWidth, sHeight;
    if (imgRatio > canvasRatio) { sHeight = image.height; sWidth = sHeight * canvasRatio; sx = (image.width - sWidth) / 2; sy = 0; }
    else { sWidth = image.width; sHeight = sWidth / canvasRatio; sx = 0; sy = (image.height - sHeight) / 2; }
    ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight) { const words = text.split(' '); let line = ''; let currentY = y; for (let n = 0; n < words.length; n++) { let testLine = line + words[n] + ' '; let metrics = ctx.measureText(testLine); if (metrics.width > maxWidth && n > 0) { ctx.fillText(line, x, currentY); line = words[n] + ' '; currentY += lineHeight; } else { line = testLine; } } ctx.fillText(line, x, currentY); return currentY; }

async function drawMenuCanvas({ categoriesOnPage, byCategory, currentPage, totalPages, prefix }) { return "giữ nguyên"; }
async function drawCommandList({ catName, cmds, prefix }) { return "giữ nguyên"; }

async function drawAllCommandsPage({ commandsOnPage, prefix, page, totalPages }) {
    const COLUMN_COUNT = 3;
    const PADDING = 50;
    const LINE_HEIGHT = 45;
    const HEADER_HEIGHT = 120;
    const FOOTER_HEIGHT = 70;
    const WIDTH = 1280;
    
    const rowCount = Math.ceil(commandsOnPage.length / COLUMN_COUNT);
    const HEIGHT = HEADER_HEIGHT + (rowCount * LINE_HEIGHT) + FOOTER_HEIGHT;

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    
    try {
        const backgroundImage = await loadImage(backgroundUrls[Math.floor(Math.random() * backgroundUrls.length)]);
        drawBackgroundCover(ctx, backgroundImage);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    } catch (error) { ctx.fillStyle = '#18191A'; ctx.fillRect(0, 0, WIDTH, HEIGHT); }

    ctx.font = "bold 40px Kanit"; ctx.fillStyle = "#ffffff"; ctx.textAlign = "center";
    ctx.fillText("DANH SÁCH TẤT CẢ LỆNH", WIDTH / 2, 70);

    ctx.font = "regular 26px Kanit"; ctx.fillStyle = "#ffffff"; ctx.textAlign = "left";
    const columnWidth = (WIDTH - PADDING * 2) / COLUMN_COUNT;
    commandsOnPage.forEach((cmd, i) => {
        const col = i % COLUMN_COUNT;
        const row = Math.floor(i / COLUMN_COUNT);
        const x = PADDING + (col * columnWidth);
        const y = HEADER_HEIGHT + (row * LINE_HEIGHT);
        ctx.fillText(`${prefix}${cmd.config.name}`, x, y);
    });

    ctx.font = "bold 24px Kanit"; ctx.fillStyle = "#ffffff"; ctx.textAlign = "center";
    ctx.fillText(`Trang ${page}/${totalPages}`, WIDTH / 2, HEIGHT - FOOTER_HEIGHT / 2);
    
    const filePath = path.join(__dirname, '../../cache', `menu_all_page_${page}_${Date.now()}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer('image/png'));
    return filePath;
}

module.exports.run = async function({ api, event, args }) {
    const prefix = global.config.PREFIX || require(path.join(__dirname, '../../config.json')).PREFIX || '#';
    const { commands } = global.client;
    const { threadID, messageID } = event;

    if (args[0]?.toLowerCase() === 'all') {
        api.sendMessage("🔍 Đang tổng hợp tất cả các lệnh, việc này có thể mất một lúc...", threadID, messageID);
        
        const allCommands = Array.from(commands.values())
            .filter(cmd => cmd.config.commandCategory.toLowerCase() !== "hệ thống" && cmd.config.commandCategory.toLowerCase() !== "no prefix")
            .sort((a, b) => a.config.name.localeCompare(b.config.name));

        const totalPages = Math.ceil(allCommands.length / ALL_CMD_ITEMS_PER_PAGE);
        const pages = [];
        for (let i = 0; i < allCommands.length; i += ALL_CMD_ITEMS_PER_PAGE) {
            pages.push(allCommands.slice(i, i + ALL_CMD_ITEMS_PER_PAGE));
        }

        const imagePromises = pages.map((pageCmds, index) => 
            drawAllCommandsPage({
                commandsOnPage: pageCmds,
                prefix,
                page: index + 1,
                totalPages
            })
        );

        try {
            const imagePaths = await Promise.all(imagePromises);
            const attachments = imagePaths.map(path => fs.createReadStream(path));

            api.sendMessage({
                body: `✨ **TẤT CẢ LỆNH CỦA BOT** ✨\nTổng cộng có ${allCommands.length} lệnh khả dụng:`,
                attachment: attachments
            }, threadID, () => {
                imagePaths.forEach(path => fs.unlinkSync(path));
            }, messageID);
        } catch (e) {
            console.error(e);
            api.sendMessage("❌ Đã xảy ra lỗi khi tạo ảnh tổng hợp lệnh.", threadID, messageID);
        }
        return;
    }
    
    let byCategory = {};
    for (const cmd of commands.values()) {
        const cat = cmd.config.commandCategory || "Khác";
        if (cat.toLowerCase() === "hệ thống" || cat.toLowerCase() === "no prefix") continue;
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(cmd);
    }
    const categories = Object.keys(byCategory).sort((a, b) => byCategory[b].length - byCategory[a].length);
    const totalPages = Math.ceil(categories.length / MENU_ITEMS_PER_PAGE);
    const categoriesOnPage = categories.slice(0, MENU_ITEMS_PER_PAGE);
    
    let imgPath;
    try {
        imgPath = await drawMenuCanvas({ categoriesOnPage, byCategory, currentPage: 1, totalPages, prefix });
    } catch (e) { console.error(e); return api.sendMessage("❌ Lỗi khi tạo canvas menu.", threadID, messageID); }
    
    api.sendMessage({
        body: `✨ **MENU BOT** ✨\nTổng cộng có **${commands.size}** lệnh đang hoạt động.`,
        attachment: fs.createReadStream(imgPath)
    }, threadID, (err, info) => {
        if (imgPath) setTimeout(() => { try { fs.unlinkSync(imgPath) } catch (e) {} }, 20000);
        if (!err && info) {
            global.client.handleReply.push({
                name: module.exports.config.name, author: event.senderID, messageID: info.messageID,
                allCategories: categories, byCategory, currentPage: 1, totalPages, prefix
            });
        }
    }, messageID);
};

module.exports.handleReply = async function({ api, event, handleReply }) {
    const { author, allCategories, byCategory, currentPage, totalPages, prefix } = handleReply;
    if (event.senderID != author) return;
    const reply = event.body.trim().toLowerCase();
    
    let newPage = currentPage;
    if (reply === 'next' || reply === 'n') {
        newPage = currentPage + 1 > totalPages ? 1 : currentPage + 1;
    } else if (reply === 'prev' || reply === 'p') {
        newPage = currentPage - 1 < 1 ? totalPages : currentPage - 1;
    } else if (/^\d+$/.test(reply)) {
        api.unsendMessage(handleReply.messageID).catch(e => {});
        const chosenIndex = parseInt(reply) - 1;
        if (chosenIndex < 0 || chosenIndex >= allCategories.length) return api.sendMessage("⛔ Số thứ tự không hợp lệ.", event.threadID);
        
        const catName = allCategories[chosenIndex];
        const cmds = byCategory[catName].sort((a, b) => a.config.name.localeCompare(b.config.name));
        
        let cmdImgPath;
        try {
            cmdImgPath = await drawCommandList({ catName, cmds, prefix });
        } catch(e) { console.error(e); return api.sendMessage(`❌ Lỗi khi tạo canvas cho nhóm '${catName}'.`, event.threadID); }
        
        return api.sendMessage({
            body: `Tổng hợp các lệnh thuộc nhóm **${catName}**`,
            attachment: fs.createReadStream(cmdImgPath)
        }, event.threadID, () => { if (cmdImgPath) setTimeout(() => { try { fs.unlinkSync(cmdImgPath) } catch(e) {} }, 20000); });

    } else { return; }

    api.unsendMessage(handleReply.messageID).catch(e => {});
    const start = (newPage - 1) * MENU_ITEMS_PER_PAGE;
    const categoriesOnPage = allCategories.slice(start, start + MENU_ITEMS_PER_PAGE);
    
    let imgPath;
    try { 
        imgPath = await drawMenuCanvas({ categoriesOnPage, byCategory, currentPage: newPage, totalPages, prefix });
    } catch (e) { console.error(e); return api.sendMessage("❌ Lỗi khi tạo trang menu mới.", event.threadID); }

    return api.sendMessage({
        body: `✨ **MENU BOT** ✨\nTrang ${newPage}/${totalPages}.`,
        attachment: fs.createReadStream(imgPath)
    }, event.threadID, (err, info) => {
        if (imgPath) setTimeout(() => { try { fs.unlinkSync(imgPath) } catch (e) {} }, 20000);
        if (!err && info) { 
            global.client.handleReply.push({ ...handleReply, messageID: info.messageID, currentPage: newPage }); 
        }
    });
};