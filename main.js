const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const gradient = require("gradient-string");
const readlineSync = require("readline-sync");
const moment = require("moment-timezone");
const os = require("os");
const axios = require("axios");
const logger = require("./pdata/utils/log.js");

const con = require("./config.json");

let agent;

// Proxy config
(function setupProxy() {
  let shouldSaveProxy = false;
  if (typeof con.socks5tl === 'undefined' || typeof con.socks5 === 'undefined') {
    con.socks5tl = readlineSync.question('Bật SOCKS5 proxy? (y/n): ').trim().toLowerCase() === 'y';
    con.socks5 = con.socks5tl ? readlineSync.question('Nhập socks5 proxy: ').trim() : '';
    shouldSaveProxy = true;
  }
  if (shouldSaveProxy) {
    fs.writeFileSync('./config.json', JSON.stringify(con, null, 2), 'utf8');
    logger.loader('Đã lưu cấu hình proxy socks5 vào config.json!');
  }
  // Proxy agent
  if (con.socks5tl && con.socks5 && con.socks5.startsWith('socks5://')) {
    try {
      const { SocksProxyAgent } = require('socks-proxy-agent');
      agent = new SocksProxyAgent(con.socks5);
    } catch {
      logger.loader('❌ Không thể tải socks-proxy-agent. Hãy cài: npm i socks-proxy-agent', 'error');
    }
  }
})();

// Axios instance
const axiosInstance = axios.create({
  headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36' },
  ...(agent && { httpAgent: agent, httpsAgent: agent }),
  timeout: 10000
});
global.axios = axiosInstance;

// Kiểm tra proxy thực tế
if (con.socks5tl && agent) {
  (async () => {
    try {
      const res = await global.axios.get('https://api64.ipify.org?format=text');
      logger.loader(`✅ Proxy OK! IP: ${res.data}`);
    } catch {
      logger.loader('❌ SOCKS5 proxy KHÔNG kết nối hoặc sai cấu hình!', 'error');
    }
  })();
}

// ========== THEME ==========
const theme = con.DESIGN?.Theme || 'default';
let co, error;
switch ((theme || '').toLowerCase()) {
  case 'blue':
    co = gradient(["#1affa3", "cyan", "pink", "cyan", "#1affa3"]);
    error = chalk.red.bold;
    break;
  case 'dream2':
    co = gradient("#a200ff", "#21b5ff", "#a200ff");
    break;
  case 'dream':
    co = gradient(["blue", "pink", "gold", "pink", "blue"]);
    error = chalk.red.bold;
    break;
  case 'fiery':
    co = gradient("#fc2803", "#fc6f03", "#fcba03");
    error = chalk.red.bold;
    break;
  case 'rainbow':
    co = gradient.rainbow;
    error = chalk.red.bold;
    break;
  case 'pastel':
    co = gradient.pastel;
    error = chalk.red.bold;
    break;
  case 'red':
    co = gradient("red", "orange");
    error = chalk.red.bold;
    break;
  case 'aqua':
    co = gradient("#0030ff", "#4e6cf2");
    error = chalk.blueBright;
    break;
  case 'retro':
    co = gradient.retro;
    break;
  case 'ghost':
    co = gradient.mind;
    break;
  case 'hacker':
    co = gradient('#47a127', '#0eed19', '#27f231');
    break;
  default:
    co = gradient("#243aff", "#4687f0", "#5800d4");
    error = chalk.red.bold;
    break;
}

// ========== CACHE FOLDER ==========
const cacheDir = path.join(__dirname, "pdata", "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

const restartNotifyPath = path.join(cacheDir, "restart_notify.json");
setTimeout(() => {
  try {
    if (fs.existsSync(restartNotifyPath)) {
      const { threadID, senderID } = JSON.parse(fs.readFileSync(restartNotifyPath, "utf8"));
      const now = moment.tz("Asia/Ho_Chi_Minh");
      const msg = `✅ [BOT ĐÃ KHỞI ĐỘNG LẠI]\n→ Thời gian: ${now.format("HH:mm:ss - DD/MM/YYYY")}\n→ Gửi bởi Admin: https://facebook.com/${senderID}\n→ Uptime: ${Math.floor(process.uptime())} giây`;
      global.client?.api?.sendMessage?.(msg, threadID, (err) => err && console.error(err));
      fs.unlinkSync(restartNotifyPath);
    }
  } catch (e) {
    console.error("Lỗi gửi notify restart:", e);
  }
}, 5000);

// ========== GLOBALS ==========
global.client = {
  commands: new Map(),
  superBan: new Map(),
  events: new Map(),
  allThreadID: [],
  allUsersInfo: new Map(),
  timeStart: { timeStamp: Date.now(), fullTime: "" },
  allThreadsBanned: new Map(),
  allUsersBanned: new Map(),
  cooldowns: new Map(),
  eventRegistered: [],
  handleSchedule: [],
  handleReaction: [],
  handleReply: [],
  mainPath: process.cwd(),
  configPath: "",
  getTime: (option) => {
    const format = {
      seconds: "ss", minutes: "mm", hours: "HH", date: "DD", month: "MM", year: "YYYY",
      fullHour: "HH:mm:ss", fullYear: "DD/MM/YYYY", fullTime: "HH:mm:ss DD/MM/YYYY"
    };
    return format[option] ? moment.tz("Asia/Ho_Chi_Minh").format(format[option]) : "";
  }
};

global.data = {
  threadInfo: new Map(),
  threadData: new Map(),
  userName: new Map(),
  userBanned: new Map(),
  threadBanned: new Map(),
  commandBanned: new Map(),
  threadAllowNSFW: [],
  allUserID: [],
  allCurrenciesID: [],
  allThreadID: []
};
global.utils = require("./pdata/utils");
global.nodemodule = {};
global.config = con;
global.configModule = {};
global.moduleData = [];
global.language = {};
global.account = {};
global.anti = path.resolve(process.cwd(), 'anti.json');

// ========== CONFIG LOAD ==========
(() => {
  try {
    global.client.configPath = path.join(global.client.mainPath, "config.json");
    Object.assign(global.config, require(global.client.configPath));
  } catch {
    const tempPath = global.client.configPath.replace(/\.json$/, "") + ".temp";
    if (fs.existsSync(tempPath)) Object.assign(global.config, JSON.parse(fs.readFileSync(tempPath)));
  }
  fs.writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), 'utf8');
})();

// ========== LANGUAGE ==========
(() => {
  const langFile = fs.readFileSync(`${__dirname}/pdata/languages/${global.config.language || "en"}.lang`, 'utf-8').split(/\r?\n|\r/);
  langFile.filter(item => item[0] !== '#' && item).forEach(line => {
    const idx = line.indexOf('=');
    if (idx === -1) return;
    const [itemKey, itemValue] = [line.slice(0, idx), line.slice(idx + 1)];
    const [head, ...rest] = itemKey.split('.');
    if (!global.language[head]) global.language[head] = {};
    global.language[head][rest.join('.')] = itemValue.replace(/\\n/gi, '\n');
  });
  global.getText = function (...args) {
    const [cat, key, ...params] = args;
    let text = global.language?.[cat]?.[key];
    params.forEach((v, i) => text = text.replace(RegExp(`%${i + 1}`, 'g'), v));
    return text;
  };
})();

// ========== AUTO CLEAN CACHE ==========
if (con.autoCleanCache?.Enable) {
  const { CachePath, AllowFileExtension } = con.autoCleanCache;
  fs.readdir(CachePath, (err, files) => {
    if (!err) {
      files.forEach(file => {
        if (AllowFileExtension.includes(path.extname(file).toLowerCase()))
          fs.unlink(path.join(CachePath, file), () => {});
      });
      logger('Đã xoá các file cache', "[ AUTO - CLEAN ]");
    } else {
      console.error('Lỗi khi đọc thư mục:', err);
    }
  });
} else {
  logger('Auto Clean Cache Đã Bị Tắt', "[ AUTO - CLEAN ]");
}

// ========== MODULE FAIL ==========
const failModules = [];
const failModulesPath = path.join(__dirname, "failmodules.txt");

// ========== ONBOT ==========
function onBot({ models }) {
  const login = require(con.NPM_FCA);
  const appStatePath = path.resolve(global.client.mainPath, global.config.APPSTATEPATH || 'appstate.json');

  // Ưu tiên đọc appState từ file, fallback sang cookie
  let loginData;
  try {
    let appStateRaw = fs.readFileSync(appStatePath, 'utf8');
    let appState = (process.env.KEY && global.config.encryptSt && appStateRaw[0] !== '[')
      ? JSON.parse(decryptState(appStateRaw, process.env.KEY))
      : JSON.parse(appStateRaw);
    loginData = { appState };
    logger.loader("Đã tìm thấy appState, đang đăng nhập...");
  } catch {
    logger.loader("Không tìm thấy appState, đang thử login bằng cookie...", "warn");
    const cookies = global.utils.parseCookies(fs.readFileSync('./pcookie.txt', 'utf8'));
    loginData = { appState: cookies };
  }

  const loginOptions = {
    logLevel: "silent",
    forceLogin: true,
    userAgent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
  };

  if (con.socks5tl && agent) loginOptions.agent = agent;

  login(loginData, loginOptions, async (err, api) => {
    if (err) {
      logger("Không thể đăng nhập. Kiểm tra lại appState hoặc cookie.", "[ LOGIN-ERROR ]");
      process.exit(1);
    }

    api.setOptions(global.config.FCAOption);
    global.client.api = api;

    // Lưu lại appState mới
    let newAppState = JSON.stringify(api.getAppState(), null, 2);
    if (process.env.KEY && global.config.encryptSt) {
      newAppState = await encryptState(newAppState, process.env.KEY);
    }
    fs.writeFileSync(appStatePath, newAppState);

    const userId = api.getCurrentUserID();
    const userInfo = await api.getUserInfo([userId]);
    const userName = userInfo[userId]?.name || "Unknown";
    logger(`Đăng nhập thành công với ${userName}`, "[ LOGIN ]");

    // ========== LOAD MODULES ==========
    global.client.version = '4.6.9';
    global.client.timeStart = Date.now();

    const startTime = Date.now();

    // Load commands
    loadModules('commands', global.client.commands, models, failModules, file => !file.includes('example') && !global.config.commandDisabled.includes(file.replace(/\.js$/, '')));
    // Load events
    loadModules('events', global.client.events, models, failModules, file => !global.config.eventDisabled.includes(file.replace(/\.js$/, '')));

    // Write failmodules.txt
    if (failModules.length) fs.writeFileSync(failModulesPath, failModules.join('\n\n'), 'utf8');
    else if (fs.existsSync(failModulesPath)) fs.unlinkSync(failModulesPath);

    // In thông tin
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(co(`──────────────────────────────────────────────`));
    logger.loader(`📢 Bot Facebook Mirai đã khởi động.`);
    logger.loader(`⏰ Thời gian: ${chalk.yellow(moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss - DD/MM/YYYY'))}`);
    logger.loader(`✅ Thời gian load Modules: ${duration}s`);
    logger.loader(`⚙️ Lệnh: ${chalk.green(global.client.commands.size)} | Sự kiện: ${chalk.green(global.client.events.size)}`);
    logger.loader(`👤 User: ${chalk.cyan(global.data.allUserID?.length || 0)} | 💬 Threads: ${chalk.cyan(global.data.allThreadID?.length || 0)}`);
    logger.loader(`🕓 Uptime: ${chalk.blue(((Date.now() - global.client.timeStart) / 1000).toFixed(2) + 's')}`);
    logger.loader(`💻 NodeJS: ${chalk.bold(process.version)} | OS: ${os.type()} ${os.release()}`);
    logger.loader(`📦 Packages: ${chalk.yellow(Object.keys(require('./package.json').dependencies).length)}`);
    console.log(co(`──────────────────────────────────────────────`));
    require('chalkercli').rainbow('🚀 Đã sẵn sàng nhận lệnh! 🚀').start();

    fs.writeFileSync(global.client.configPath, JSON.stringify(global.config, null, 4), 'utf8');

    // Listen FB events
    const listener = require('./pdata/data_dongdev/listen')({ api, models });
    global.handleListen = api.listenMqtt(async (error, message) => {
      if (error) {
        logger('Acc bị logout, đăng nhập lại!', '[ LOGIN-ACCOUNT ]');
        await new Promise(r => setTimeout(r, 7000));
      }
      if (['presence', 'typ', 'read_receipt'].includes(message.type)) return;
      return listener(message);
    });
  });
}

// Helper: Load modules
function loadModules(type, collection, models, failModules, filter) {
  const dir = path.join(global.client.mainPath, `modules/${type}`);
  const list = fs.readdirSync(dir).filter(f => f.endsWith('.js') && filter(f));
  const listPackage = require('./package.json').dependencies;
  const builtins = require("module").builtinModules;
  for (const file of list) {
    try {
      const module = require(path.join(dir, file));
      if (!module.config || !module.run || (type === 'commands' && !module.config.commandCategory)) throw new Error(global.getText('mirai', 'errorFormat'));
      if (collection.has(module.config.name || '')) throw new Error(global.getText('mirai', 'nameExist'));
      // Require dependencies
      if (module.config.dependencies) for (const dep in module.config.dependencies) {
        if (!global.nodemodule[dep]) {
          if (listPackage[dep] || builtins.includes(dep)) global.nodemodule[dep] = require(dep);
          else global.nodemodule[dep] = require(path.join(__dirname, 'nodemodules', 'node_modules', dep));
        }
      }
      // Env config
      if (module.config.envConfig) for (const env in module.config.envConfig) {
        global.configModule[module.config.name] = global.configModule[module.config.name] || {};
        global.config[module.config.name] = global.config[module.config.name] || {};
        global.configModule[module.config.name][env] = global.configModule[module.config.name][env] ?? module.config.envConfig[env];
        global.config[module.config.name][env] = global.config[module.config.name][env] ?? module.config.envConfig[env];
      }
      // onLoad
      module.onLoad?.({ api: global.client.api, models });
      if (module.handleEvent) global.client.eventRegistered.push(module.config.name);
      collection.set(module.config.name, module);
    } catch (err) {
      failModules.push(`✖ [ PCODER ]  𝐅𝐚𝐢𝐥 ${file.replace(/\.js$/, '')}\n    → ${err?.stack || err}`);
    }
  }
}

// ========== DB + START ==========
(async () => {
  try {
    const { Sequelize, sequelize } = require("./pdata/data_dongdev/database");
    await sequelize.authenticate();
    const models = require('./pdata/data_dongdev/database/model')({ Sequelize, sequelize });
    logger(global.getText('mirai', 'successConnectDatabase'), '[ DATABASE ]');
    onBot({ models });
  } catch (error) {
    logger(global.getText('mirai', 'successConnectDatabase', JSON.stringify(error)), '[ DATABASE ]');
  }
})();

process.on('unhandledRejection', () => { }).on('uncaughtException', err => { console.log(err); });