const { exec } = require("child_process");
const { upload } = require('./mega');
const express = require('express');
let router = express.Router()
const pino = require("pino");
let { toBuffer } = require("qrcode");
const path = require('path');
const fs = require("fs-extra");
const { Boom } = require("@hapi/boom");

const MESSAGE = process.env.MESSAGE ||  `
╔═════🌙༻༺🌸═════╗
     𝐆ᴇᴛ 𝐑ɪɢʜᴛ 𝐖ɪᴛ𝐜ʜ𝐀 🩷✨
╚═════🌸༻༺🌙═════╝

🌐 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 𝘁𝗼:
» 🎀 𝙋𝙊𝙋𝙆𝙄𝘿 𝙂𝙇𝙀 

📁 𝗕𝗼𝘁 𝗥𝗲𝗽𝗼:
» 🔗 [𝗢𝗽𝗲𝗻 𝗛𝗲𝗿𝗲](https://github.com/devpopkid/POPKID-GLE)

📣 𝗝𝗼𝗶𝗻 𝗢𝘂𝗿 𝗖𝗵𝗮𝗻𝗻𝗲𝗹:
» 💬 [𝗧𝗮𝗽 𝘁𝗼 𝗝𝗼𝗶𝗻](https://whatsapp.com/channel/0029VbB6d0KKAwEdvcgqrH26)

👑 𝗢𝘄𝗻𝗲𝗿:
» ☎️ +254111385747

⚙️ 𝗦𝘆𝘀𝘁𝗲𝗺 𝗦𝘁𝗮𝘁𝘂𝘀:
» 🔮 𝟏𝟎𝟎% 𝗠𝗮𝗴𝗶𝗰𝗮𝗹𝗹𝘆 𝗔𝗰𝘁𝗶𝘃𝗲 🪄

🤖 𝗔𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗼𝗻 𝗘𝗻𝗴𝗶𝗻𝗲:
» 🌟 Powered by *𝐆𝐥𝐞 𝐌𝐨𝐭𝐢𝐯𝐞𝐬*

╭─────✨─────╮
💖 𝑺𝒑𝒓𝒆𝒂𝒅 𝒕𝒉𝒆 𝑮𝒍𝒊𝒕𝒄𝒉𝒀 𝑳𝒐𝒗𝒆 🌸
╰─────✨─────╯`;

if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, DisconnectReason } = require("@whiskeysockets/baileys");

    async function SUHAIL() {
        const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys')
        try {
            let Smd = makeWASocket({
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
                auth: state
            });

            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr) {
                    if (!res.headersSent) {
                        res.setHeader('Content-Type', 'image/png');
                        try {
                            const qrBuffer = await toBuffer(qr);
                            res.end(qrBuffer);
                            return;
                        } catch (error) {
                            console.error("Error generating QR Code buffer:", error);
                            return;
                        }
                    }
                }

                if (connection === "open") {
                    await delay(3000);
                    let user = Smd.user.id;

                    function randomMegaId(length = 6, numberLength = 4) {
                        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        let result = '';
                        for (let i = 0; i < length; i++) {
                            result += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                        const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                        return `${result}${number}`;
                    }

                    const auth_path = './auth_info_baileys/';
                    const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                    const string_session = mega_url.replace('https://mega.nz/file/', '');
                    const Scan_Id = string_session;

                    let msgsss = await Smd.sendMessage(user, { text: Scan_Id });
                    await Smd.sendMessage(user, { text: MESSAGE }, { quoted: msgsss });
                    await delay(1000);
                    try { 
                        await fs.emptyDirSync(__dirname + '/auth_info_baileys'); 
                    } catch(e) {}
                }

                Smd.ev.on('creds.update', saveCreds)

                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode
                    if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...")
                        SUHAIL().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.loggedOut) {
                        console.log("Device Logged Out, Please Delete Session and Scan Again.");
                        process.exit();
                    } else {
                        console.log('Connection closed:', reason);
                        exec('pm2 restart qasim');
                        process.exit(0);
                    }
                }
            });
        } catch (err) {
            console.log(err);
            exec('pm2 restart qasim');
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
        }
    }
    return await SUHAIL();
});

module.exports = router;
