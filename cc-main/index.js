const { spawn } = require("child_process");
const { readFileSync } = require("fs-extra");
const express = require("express");
const path = require('path');
const logger = require("./pdata/utils/log");

const PORT = process.env.PORT || 2025;
const OWNER_FB = "fb.com/pcoder090";
const OWNER_NAME = "Nguyễn Trương Thiện Phát";
const app = express();

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>FileBot1 - Uptime</title>
                <style>
                    body { font-family: Arial; background: #181c23; color: #e2e2e2; display:flex; align-items:center; justify-content:center; height:100vh; }
                    .box { background: #232a34; border-radius: 12px; padding: 32px 40px; text-align:center; box-shadow: 0 4px 32px #0007; }
                    a { color: #48aaff; text-decoration:none; }
                    .fb { margin-top: 8px; font-size: 0.95em; color: #aaa }
                </style>
            </head>
            <body>
                <div class="box">
                    <h2>🤖 FileBot1 Đang Hoạt Động</h2>
                    <div>Nhớ ib Facebook <b>${OWNER_NAME}</b> để cập nhật file miễn phí!</div>
                    <div class="fb">Facebook: <a href="${OWNER_FB}" target="_blank">${OWNER_FB}</a></div>
                    <div style="margin-top:12px;font-size:12px;color:#666">© ${new Date().getFullYear()} - FileBot1 Dashboard</div>
                </div>
            </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`[ SECURITY ] -> Máy chủ đã khởi động tại port: ${PORT}`);
});

function startBot(message) {
    if (message) logger(message, "BOT STARTING");

    const child = spawn("node", [
        "--trace-warnings",
        "--async-stack-traces",
        "main.js"
    ], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", async (codeExit) => {
        // Nếu exit code là 1 thì restart ngay lập tức
        if (codeExit == 1) {
            logger("Đang khởi động lại, vui lòng chờ ...", "RESTART");
            return startBot();
        }
        // Nếu exit code là 2xxx thì delay xxx giây rồi mới restart
        else if (String(codeExit).startsWith("2")) {
            let delaySec = parseInt(String(codeExit).substring(1)) || 5;
            logger(`Bot sẽ khởi động sau ${delaySec} giây ...`, "RESTART");
            await new Promise(resolve => setTimeout(resolve, delaySec * 1000));
            return startBot("Bot has been activated, please wait a moment!!!");
        }
        // Các trường hợp khác thì không restart
    });

    child.on("error", function (error) {
        logger("An error occurred: " + JSON.stringify(error), "[ Starting ]");
    });
}

// Bắt các lỗi không mong muốn và không để bot chết
process.on('uncaughtException', (err) => {
    logger("Uncaught Exception: " + err.stack, "[ BOT ERROR ]");
});
process.on('unhandledRejection', (reason, p) => {
    logger("Unhandled Rejection: " + reason, "[ BOT ERROR ]");
});

startBot();