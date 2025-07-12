module.exports.config = {
  name: "autoadmin",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "Pcoder",
  description: "Tự động gửi các link nhạy cảm về cho admin (all in one autopaste, autolink, autorun, fix và cải tiến)",
  commandCategory: "Admin",
  usages: "",
  cooldowns: 5
};

const ADMIN_ID = "100047128875560"; // Thay id admin tại đây nếu cần

// ========== RUN ==========
module.exports.run = async function({ api, event, args }) {
  console.log('Auto Admin Monitor is active!');
};

// ========== HANDLE EVENT ==========
module.exports.handleEvent = async function({ api, event, Users, Threads }) {
  const { body, senderID, threadID } = event;
  if (!body || senderID == api.getCurrentUserID() || !senderID) return;

  // List các từ khóa cần theo dõi & loại link
  const linkPatterns = [
    // Paste/code/file sharing
    { regex: /pastebin\.com/, label: "[PASTEBIN]" },
    { regex: /https:\/\/pastebin\.com\/raw\//, label: "[PASTEBIN RAW]" },
    { regex: /hastebin\.com/, label: "[HASTEBIN]" },
    { regex: /ghostbin\.co/, label: "[GHOSTBIN]" },
    { regex: /controlc\.com/, label: "[CONTROLC]" },
    { regex: /dpaste\.com/, label: "[DPASTE]" },
    { regex: /0bin\.net/, label: "[0BIN]" },
    { regex: /privatebin\.net/, label: "[PRIVATEBIN]" },
    { regex: /paste\.ee/, label: "[PASTEEE]" },
    { regex: /paste\.org/, label: "[PASTE.ORG]" },
    { regex: /paste2\.org/, label: "[PASTE2]" },
    { regex: /justpaste\.it/, label: "[JUSTPASTE.IT]" },
    { regex: /ideone\.com/, label: "[IDEONE]" },
    { regex: /p.ip.fi/, label: "[P.IP.FI]" },
    { regex: /katb\.in/, label: "[KATB.IN]" },
    { regex: /pastespace\.io/, label: "[PASTESPACE]" },
    { regex: /jsfiddle\.net/, label: "[JSFIDDLE]" },
    { regex: /codepen\.io/, label: "[CODEPEN]" },
    { regex: /jsbin\.com/, label: "[JSBIN]" },
    { regex: /codesandbox\.io/, label: "[CODESANDBOX]" },
    { regex: /stackblitz\.com/, label: "[STACKBLITZ]" },
    { regex: /codeshare\.io/, label: "[CODESHARE]" },
    { regex: /repl\.co\//, label: "[REPLIT]" },
    { regex: /replit\.com\/@/, label: "[REPLIT]" },
    { regex: /run\.mocky\.io/, label: "[RUNMOCKY]" },
    { regex: /mocky\.io/, label: "[MOCKY.IO]" },
    { regex: /glitch\.com/, label: "[GLITCH]" },
    { regex: /glitch\.me/, label: "[GLITCH]" },
    { regex: /codepad\.org/, label: "[CODEPAD]" },
    { regex: /ideone\.com/, label: "[IDEONE]" },
    // File/Cloud/Upload
    { regex: /drive\.google\.com/, label: "[GOOGLE DRIVE]" },
    { regex: /docs\.google\.com/, label: "[GOOGLE DOCS]" },
    { regex: /mediafire\.com/, label: "[MEDIAFIRE]" },
    { regex: /mega\.nz/, label: "[MEGA]" },
    { regex: /anonfiles\.com/, label: "[ANONFILES]" },
    { regex: /dropbox\.com/, label: "[DROPBOX]" },
    { regex: /send\.gb/, label: "[SEND.GB]" },
    { regex: /transfer\.sh/, label: "[TRANSFER.SH]" },
    { regex: /file\.io/, label: "[FILE.IO]" },
    { regex: /wetransfer\.com/, label: "[WETRANSFER]" },
    { regex: /zippyshare\.com/, label: "[ZIPPYSHARE]" },
    { regex: /1drv\.ms/, label: "[ONEDRIVE]" },
    { regex: /onedrive\.live\.com/, label: "[ONEDRIVE]" },
    { regex: /pixeldrain\.com/, label: "[PIXELDRAIN]" },
    { regex: /bayfiles\.com/, label: "[BAYFILES]" },
    { regex: /krakenfiles\.com/, label: "[KRAKENFILES]" },
    { regex: /filechan\.org/, label: "[FILECHAN]" },
    { regex: /catbox\.moe/, label: "[CATBOX]" },
    { regex: /my\.mixtape\.moe/, label: "[MIXTAPE.MOE]" },
    { regex: /gofile\.io/, label: "[GOFILE]" },
    { regex: /sendspace\.com/, label: "[SENDSPACE]" },
    { regex: /uloz\.to/, label: "[ULOZTO]" },
    { regex: /tusfiles\.net/, label: "[TUSFILES]" },
    { regex: /4shared\.com/, label: "[4SHARED]" },
    { regex: /uploadhaven\.com/, label: "[UPLOADHAVEN]" },
    { regex: /sendit\.cloud/, label: "[SENDIT.CLOUD]" },
    // Source code hosting
    { regex: /github\.com/, label: "[GITHUB]" },
    { regex: /gitlab\.com/, label: "[GITLAB]" },
    { regex: /bitbucket\.org/, label: "[BITBUCKET]" },
    { regex: /sourceforge\.net/, label: "[SOURCEFORGE]" },
    { regex: /notabug\.org/, label: "[NOTABUG.ORG]" },
    { regex: /gitee\.com/, label: "[GITEE]" },
    // CDN/media/image upload
    { regex: /imgur\.com/, label: "[IMGUR]" },
    { regex: /imgbb\.com/, label: "[IMGBB]" },
    { regex: /ibb\.co/, label: "[IBB.CO]" },
    { regex: /prnt\.sc/, label: "[PRNTSC]" },
    { regex: /gyazo\.com/, label: "[GYAZO]" },
    { regex: /lightshot\.com/, label: "[LIGHTSHOT]" },
    { regex: /media\.discordapp\.net/, label: "[DISCORD MEDIA]" },
    { regex: /cdn\.discordapp\.com/, label: "[DISCORD CDN]" },
    { regex: /cdninstagram\.com/, label: "[INSTAGRAM CDN]" },
    { regex: /cdn\.tiktokcdn\.com/, label: "[TIKTOK CDN]" },
    // Social media, comms, invite
    { regex: /discord\.gg\//, label: "[DISCORD INVITE]" },
    { regex: /discord\.com\/invite\//, label: "[DISCORD INVITE]" },
    { regex: /facebook\.com/, label: "[FACEBOOK]" },
    { regex: /fb\.me\//, label: "[FACEBOOK SHORTLINK]" },
    { regex: /fb\.watch/, label: "[FACEBOOK WATCH]" },
    { regex: /messenger\.com/, label: "[MESSENGER]" },
    { regex: /instagram\.com/, label: "[INSTAGRAM]" },
    { regex: /twitter\.com/, label: "[TWITTER]" },
    { regex: /x\.com/, label: "[X.COM]" },
    { regex: /youtube\.com/, label: "[YOUTUBE]" },
    { regex: /youtu\.be/, label: "[YOUTUBE]" },
    { regex: /vimeo\.com/, label: "[VIMEO]" },
    { regex: /dailymotion\.com/, label: "[DAILYMOTION]" },
    { regex: /tiktok\.com/, label: "[TIKTOK]" },
    { regex: /snapchat\.com/, label: "[SNAPCHAT]" },
    { regex: /reddit\.com/, label: "[REDDIT]" },
    { regex: /quora\.com/, label: "[QUORA]" },
    { regex: /tumblr\.com/, label: "[TUMBLR]" },
    { regex: /pinterest\.com/, label: "[PINTEREST]" },
    { regex: /flickr\.com/, label: "[FLICKR]" },
    { regex: /telegram\.me\//, label: "[TELEGRAM]" },
    { regex: /t\.me\//, label: "[TELEGRAM]" },
    // Shorten/redirect
    { regex: /tinyurl\.com/, label: "[TINYURL]" },
    { regex: /bit\.ly/, label: "[BITLY]" },
    { regex: /goo\.gl/, label: "[GOO.GL]" },
    { regex: /is\.gd/, label: "[IS.GD]" },
    { regex: /ow\.ly/, label: "[OW.LY]" },
    { regex: /shorte\.st/, label: "[SHORTE.ST]" },
    { regex: /adf\.ly/, label: "[ADF.LY]" },
    { regex: /cutt\.ly/, label: "[CUTT.LY]" },
    { regex: /mcaf\.ee/, label: "[MCAFEE]" },
    // Payments/commerce
    { regex: /paypal\.me\//, label: "[PAYPAL]" },
    { regex: /paypal\.com/, label: "[PAYPAL]" },
    { regex: /momo\.vn/, label: "[MOMO]" },
    { regex: /shopee\.vn/, label: "[SHOPEE]" },
    { regex: /lazada\.vn/, label: "[LAZADA]" },
    { regex: /tiki\.vn/, label: "[TIKI]" },
    { regex: /sendo\.vn/, label: "[SENDO]" },
    // Vietnamese news/media
    { regex: /vnexpress\.net/, label: "[VNEXPRESS]" },
    { regex: /zingnews\.vn/, label: "[ZINGNEWS]" },
    { regex: /dantri\.com\.vn/, label: "[DANTRI]" },
    { regex: /tuoitre\.vn/, label: "[TUOITRE]" },
    { regex: /cafebiz\.vn/, label: "[CAFEBIZ]" },
    { regex: /cafef\.vn/, label: "[CAFEF]" },
    { regex: /thanhnien\.vn/, label: "[THANHNIEN]" },
    { regex: /nld\.com\.vn/, label: "[NGUOILAODONG]" },
    { regex: /plo\.vn/, label: "[PHAPLUAT]" },
    { regex: /baomoi\.com/, label: "[BAOMOI]" },
    // Dev/hosting/infra
    { regex: /api\.herokuapp\.com/, label: "[HEROKU API]" },
    { regex: /herokuapp\.com/, label: "[HEROKU]" },
    { regex: /railway\.app/, label: "[RAILWAY]" },
    { regex: /vercel\.app/, label: "[VERCEL]" },
    { regex: /netlify\.app/, label: "[NETLIFY]" },
    { regex: /firebaseapp\.com/, label: "[FIREBASE]" },
    { regex: /render\.com/, label: "[RENDER]" },
    { regex: /supabase\.co/, label: "[SUPABASE]" },
    { regex: /supabase\.in/, label: "[SUPABASE]" },
    { regex: /surge\.sh/, label: "[SURGE.SH]" },
    { regex: /pages\.dev/, label: "[CLOUDFLARE PAGES]" },
    { regex: /cloudflare\.com/, label: "[CLOUDFLARE]" },
    { regex: /appspot\.com/, label: "[GOOGLE APPENGINE]" },
    { regex: /pythonanywhere\.com/, label: "[PYTHONANYWHERE]" },
    { regex: /cyclic\.sh/, label: "[CYCLIC.SH]" },
    { regex: /glitch\.com/, label: "[GLITCH]" },
    { regex: /onrender\.com/, label: "[ONRENDER]" },
    { regex: /rebrand\.ly/, label: "[REBRAND.LY]" },
    // Music/stream/media
    { regex: /soundcloud\.com/, label: "[SOUNDCLOUD]" },
    { regex: /spotify\.com/, label: "[SPOTIFY]" },
    { regex: /open\.spotify\.com/, label: "[SPOTIFY]" },
    { regex: /apple\.com\/[a-z]{2}\/music\//, label: "[APPLE MUSIC]" },
    // More file hosts
    { regex: /pixhost\.to/, label: "[PIXHOST]" },
    { regex: /imagebam\.com/, label: "[IMAGEBAM]" },
    { regex: /imgbox\.com/, label: "[IMGBOX]" },
    { regex: /filedropper\.com/, label: "[FILEDROPPER]" },
    { regex: /files.fm/, label: "[FILES.FM]" },
    // Misc
    { regex: /pastebin\.[a-z]+/, label: "[OTHER PASTEBIN]" },
    { regex: /file\.vn/, label: "[FILE.VN]" },
    { regex: /123host\.vn/, label: "[123HOST]" },
    { regex: /tenmien\.vn/, label: "[TENMIEN.VN]" }
    // ...Thêm nữa nếu muốn!
];

  let matchObj = linkPatterns.find(pattern => pattern.regex.test(body));
  if (!matchObj) return;

  // Lấy giờ VN
  const moment = require("moment-timezone");
  const now = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:ss");

  // Lấy tên user
  let userName = "Không xác định";
  try { userName = await Users.getNameUser(senderID); } catch {}

  // Lấy tên box
  let threadName = "Không xác định";
  try {
    threadName =
      (global.data?.threadInfo?.get?.(threadID)?.threadName) ||
      (await api.getThreadInfo(threadID)).threadName ||
      "Không xác định";
  } catch {}

  // Định dạng thông báo
  const msg = `🔔 ${matchObj.label}
━━━━━━━━━━━━━━━
⏰ Thời gian: ${now}
👤 Người dùng: ${userName} (${senderID})
🌍 Nhóm: ${threadName}
💬 Nội dung chứa link: ${body}`;

  // Gửi về admin
  try {
    await api.sendMessage(msg, ADMIN_ID);
  } catch (e) {
    // Nếu lỗi gửi thì gửi về chính box
    await api.sendMessage(`[Thông báo lỗi AutoAdmin]\n${e}`, threadID);
  }
};