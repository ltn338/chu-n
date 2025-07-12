exports.config = {
    name: 'taixiu',
    version: '2.0.0',
    hasPermssion: 0,
    credits: 'DC-Nam',
    description: 'tài xỉu',
    commandCategory: 'Game',
    usages: '\nDùng -taixiu create để tạo bàn\n> Để tham gia cược hãy chat: tài/xỉu + [số_tiền/allin/%/k/m/b/kb/mb/gb/g]\n> Xem thông tin bàn chat: info\n> Để rời bàn hãy chat: rời\n> bắt đầu xổ chat: xổ\nCông thức:\nĐơn vị sau là số 0\nk 12\nm 15\nb 18\nkb 21\nmb 24\ngb 27\ng 36',
    cooldowns: 3,
};

let path = __dirname + '/data/status-hack.json';
let data = {};
let save = d => require('fs').writeFileSync(path, JSON.stringify(data));

if (require('fs').existsSync(path)) data = JSON.parse(require('fs').readFileSync(path)); else save();

let d = global.data_command_ban_tai_xiu;

if (!d) d = global.data_command_ban_tai_xiu = {};
if (!d.s) d.s = {};
if (!d.t) d.t = setInterval(() => Object.entries(d.s).map($ => $[1] <= Date.now() ? delete d.s[$[0]] : ''), 1000);

let rate = 1;
let bet_money_min = 50;
let diing_s = 10;
let select_values = {
    't': 'tài',
    'x': 'xỉu',
};
let units = {
    'b': 18,
    'kb': 21,
    'mb': 24,
    'gb': 27,
    'k': 12,
    'm': 15,
    'g': 36,
};
let dice_photos = [
    "https://i.imgur.com/Q3QfE4t.jpeg",
    "https://i.imgur.com/M3juJEW.jpeg",
    "https://i.imgur.com/Tn6tZeG.jpeg",
    "https://i.imgur.com/ZhOA9Ie.jpeg",
    "https://i.imgur.com/eQMdRmd.jpeg",
    "https://i.imgur.com/2GHAR0f.jpeg"
];
let dice_stream_photo = {};
let stream_url = url => require('axios').get(url, {
    responseType: 'stream',
}).then(res => res.data).catch(e => null);
let dices_sum_min_max = (sMin, sMax) => {
    while (true) {
        let i = [0, 0, 0].map($ => Math.random() * 6 + 1 << 0);
        let s = i[0] + i[1] + i[2];
        if (s >= sMin && s <= sMax) return i;
    };
};
let admin_tx = [`${global.config.ADMINBOT[0]}`];
let id_box = global.config.BOXNOTI;

exports.run = o => {
    let { args, senderID: sid, threadID: tid, messageID: mid } = o.event;
    let send = (msg, mid) => o.api.sendMessage(msg, tid, mid, typeof mid == 'function' ? mid : undefined, mid == null ? undefined : messageID);
    let p = (d[tid] || {}).players;

    if (/^hack$/.test(o.args[0]) && admin_tx.includes(sid))
        return o.api.getThreadList(100, null, ['INBOX'], (err, res) => (
            thread_list = res.filter($ => $.isSubscribed && $.isGroup),
            send(`${thread_list.map(($, i) => `${i + 1}. ${data[$.threadID] == true ? 'on' : 'off'} - ${$.name}`).join('\n')}\n\n-> Reply (phản hồi) theo stt để on/off`, (err, res) => (
                res.name = exports.config.name,
                res.type = 'status.hack',
                res.o = o,
                res.thread_list = thread_list,
                global.client.handleReply.push(res)
            ))
        ));

    if (/^(create|c|-c)$/.test(o.args[0])) {
        if (tid in d) return send('❎ Nhóm đã tạo bàn tài xỉu rồi!');
        d.s[sid] = Date.now() + (1000 * 60 * 5);
        d[tid] = {
            author: sid,
            players: [],
            set_timeout: setTimeout(() => (delete d[tid], send('⛔ Đã trôi qua 5p không có ai xổ, tiến hành hủy bàn', null)), 1000 * 60 * 5),
        };
        send('✅ 𝗧𝗔̣𝗢 𝗕𝗔̀𝗡 𝗧𝗔̀𝗜 𝗫𝗜̉𝗨 𝗧𝗛𝗔̀𝗡𝗛 𝗖𝗢̂𝗡𝗚 🎲\n📌 𝗚𝗛𝗜 𝗧𝗔̀𝗜/𝗫𝗜̉𝗨 + 𝗦𝗢̂́ 𝗧𝗜𝗘̂̀𝗡 Đ𝗘̂̉ 𝗖𝗨̛𝗢̛̣𝗖');
    } else if (/^end$/.test(o.args[0])) {
        if (!p) return send(`❎ Nhóm chưa tạo bàn tài xỉu để tạo hãy dùng lệnh: ${args[0]} create`);
        if (global.data.threadInfo.get(tid).adminIDs.some($ => $.id == sid))
            return send(`📌 QTV đã yêu cầu kết thúc bàn tài xỉu những người đặt cược sau đây thả cảm xúc để xác nhận.\n\n${p.map(($, i) => `${i + 1}. ${global.data.userName.get($.id)}`).join('\n')}\n\nTổng cảm xúc đạt ${Math.ceil(p.length * 50 / 100)}/${p.length} người bàn tài xỉu sẽ kết thúc.`, (err, res) => (
                res.name = exports.config.name,
                res.p = p,
                res.r = 0,
                global.client.handleReaction.push(res)
            ));
    } else send(exports.config.usages);
};

exports.handleEvent = async o => {
    let { args = [], senderID: sid, threadID: tid, messageID: mid } = o.event;
    let send = (msg, mid, t) => new Promise(r => o.api.sendMessage(msg, t || tid, (...pa) => r(pa), mid == null ? undefined : typeof mid == 'string' ? mid : messageID));
    let select = (t => /^(tài|tai|t)$/.test(t) ? 't' : /^(xỉu|xiu|x)$/.test(t) ? 'x' : /^(rời|leave)$/.test(t) ? 'l' : /^info$/.test(t) ? 'i' : /^xổ$/.test(t) ? 'o' : /^(end|remove|xóa)$/.test(t) ? 'r' : null)((args[0] || '').toLowerCase());
    let money = async id => (await o.Currencies.getData(id))?.money;
    let bet_money = args[1];
    let p;

    if (tid in d == false || args.length == 0 || select == null) return; else p = d[tid].players;
    if (d[tid]?.playing == true) return send('❎ Bàn đang xổ không thể thực hiện hành động');
    if (['t', 'x'].includes(select)) {
        if (/^(allin|all)$/.test(bet_money)) bet_money = BigInt(await money(sid));
        else if (/^[0-9]+%$/.test(bet_money)) bet_money = BigInt((await money(sid)) + '') * BigInt(bet_money.match(/^[0-9]+/)[0] + '') / BigInt('100');
        else if (unit = Object.entries(units).find($ => RegExp(`^[0-9]+${$[0]}$`).test(bet_money))) bet_money = BigInt(bet_money.replace(unit[0], '0'.repeat(unit[1])));
        else bet_money = !isNaN(bet_money) ? BigInt(bet_money) : false;
        if (!bet_money) return send("❎ Số tiền phải là 1 số or allin/all");
        if (isNaN(bet_money.toString())) return send('❎ Tiền cược không hợp lệ');
        if (bet_money < BigInt(bet_money_min)) return send(`❎ Vui lòng đặt ít nhất ${BigInt(bet_money_min).toLocaleString()}$`);
        if (bet_money > BigInt(await money(sid))) return send('❎ Bạn không đủ tiền');
        if (player = p.find($ => $.id == sid))
            return (send(`✅ 𝗗𝗔̃ 𝗧𝗛𝗔𝗬 Đ𝗢̂̉𝗜 𝗖𝗨̛𝗢̛̣𝗖 📝\n👉 𝗧𝗨̛̀: ${select_values[player.select].toUpperCase()} ${player.bet_money.toLocaleString()}$\n👉 𝗦𝗔𝗡𝗚: ${select_values[select].toUpperCase()} ${bet_money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}$`), player.select = select, player.bet_money = bet_money);
        else return (p.push({id: sid, select, bet_money}), send(`✅ 𝗕𝗔̣𝗡 Đ𝗔̃ 𝗖𝗨̛𝗢̛̣𝗖 🎯\n👉 ${select_values[select].toUpperCase()} 𝗩𝗢̛́𝗜 ${bet_money.toLocaleString()}$`));
    };
    if (select == 'l') {
        if (sid == d[tid].author) return (clearTimeout(d[tid].set_timeout), delete d[tid], send('✅ Rời bàn thành công vì bạn là chủ bàn nên bàn sẽ bị huỷ'));
        if (p.some($ => $.id == sid)) return (p.splice(p.findIndex($ => $.id == sid), 1)[0], send('✅ Rời bàn thành công')); else return send('❎ Bạn không có trong bàn tài xỉu');
    };
    if (select == 'i') return send(`🎰 Tỉ lệ ăn 1:${rate}\n👤 Tổng ${p.length} người tham gia gồm:\n${p.map(($, i) => ` ${i + 1}. ${global.data.userName.get($.id)} cược ${$.bet_money.toLocaleString()}$ vào (${select_values[$.select]})\n`).join('\n')}\n📌 Chủ bàn: ${global.data.userName.get(d[tid].author)}`);
    if (select == 'o') {
        if (sid != d[tid].author) return send('❎ Bạn không phải chủ bàn nên không thể bắt đầu xổ');
        if (p.length == 0) return send('❎ Chưa có ai tham gia đạt cược nên không thể bắt đầu xổ');
        d[tid].playing = true;
        let diing = await send(`🎲 𝗗𝗔𝗡𝗚 𝗟𝗔̆́𝗖 𝗫𝗨́𝗖 𝗫𝗔̆́𝗖... 𝗫𝗜𝗡 𝗖𝗛𝗢̛̀𝗜 🔄`);
        let dices = ([0, 0, 0]).map(() => Math.random() * 6 + 1 << 0);
        let sum = dices.reduce((s, $) => (s += $, s), 0);
        let winner = sum > 10 ? 't' : 'x';
        let winner_players = p.filter($ => $.select == winner);
        let lose_players = p.filter($ => $.select != winner);

        await new Promise(r => setTimeout(r, 1000 * diing_s)).then(() => o.api.unsendMessage(diing[1].messageID));

        let dice_images = {
            1: "https://files.catbox.moe/djucsp.jpg",
            2: "https://files.catbox.moe/5mbw55.jpg",
            3: "https://files.catbox.moe/r826sl.jpg",
            4: "https://files.catbox.moe/7w2dc3.jpg",
            5: "https://files.catbox.moe/1n2cup.jpg",
            6: "https://files.catbox.moe/cfozie.jpg"
        };

        await send({
            body: `🎲 𝗞𝗘̂́𝗧 𝗤𝗨𝗔̉: ${dices.join('|')} - ${sum} Đ𝗜𝗘̂̉𝗠 (${select_values[winner].toUpperCase()})\n👑 𝗡𝗛𝗨̛̃𝗡𝗚 𝗡𝗚𝗨̛𝗢̛̀𝗜 𝗧𝗛𝗔̆́𝗡𝗚:\n${winner_players.map(($, i) => (
                crease_money = $.bet_money * BigInt(String(rate)),
                o.Currencies.increaseMoney($.id, Number(crease_money.toString())),
                `${i + 1}. ${global.data.userName.get($.id)} chọn (${select_values[$.select].toUpperCase()})\n+${crease_money.toLocaleString()}$`
            )).join('\n')}\n\n💸 𝗡𝗛𝗨̛̃𝗡𝗚 𝗡𝗚𝗨̛𝗢̛̀𝗜 𝗧𝗛𝗨𝗔:\n${lose_players.map(($, i) => (
                o.Currencies.decreaseMoney($.id, Number($.bet_money.toString())),
                `${i + 1}. ${global.data.userName.get($.id)} chọn (${select_values[$.select].toUpperCase()})\n-${$.bet_money.toLocaleString()}$`
            )).join('\n')}\n\n👤 𝗖𝗛𝗨̉ 𝗕𝗔̀𝗡: ${global.data.userName.get(d[tid].author)}`,
            attachment: await Promise.all(dices.map(num => stream_url(dice_images[num])))
        });

        clearTimeout(d[tid].set_timeout);
        delete d[tid];
    };
};

exports.handleReply = async o => {
    let _ = o.handleReply;
    let { args, senderID: sid, threadID: tid, messageID: mid } = o.event;
    let send = (msg, mid) => new Promise(r => o.api.sendMessage(msg, tid, r, mid == null ? undefined : messageID));

    if (sid == o.api.getCurrentUserID()) return;

    if (_.type == 'status.hack' && admin_tx.includes(sid))
        return (send(`${args.filter($ => isFinite($) && !!_.thread_list[$ - 1]).map($ => (
            $$ = _.thread_list[$ - 1],
            s = data[$$.threadID] = !data[$$.threadID] ? true : false,
            `${$}. ${$$.name} - ${s ? 'on' : 'off'}`
        )).join('\n')}`).catch(() => { }), save());
};
