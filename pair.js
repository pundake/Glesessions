const express = require('express');
const fs = require('fs-extra');
let router = express.Router();
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const MESSAGE = process.env.MESSAGE || `
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
╰─────✨─────*`;

const { upload } = require('./mega');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    DisconnectReason
} = require("@whiskeysockets/baileys");

// Ensure the directory is empty when the app starts
if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    let num = req.query.number;

    async function SUHAIL() {
        const { state, saveCreds } = await useMultiFileAuthState(`./auth_info_baileys`);
        try {
            let Smd = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!Smd.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Smd.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Smd.ev.on('creds.update', saveCreds);
            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    try {
                        await delay(10000);
                        if (fs.existsSync('./auth_info_baileys/creds.json'));

                        const auth_path = './auth_info_baileys/';
                        let user = Smd.user.id;

                        // Define randomMegaId function to generate random IDs
                        function randomMegaId(length = 6, numberLength = 4) {
                            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            let result = '';
                            for (let i = 0; i < length; i++) {
                                result += characters.charAt(Math.floor(Math.random() * characters.length));
                            }
                            const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                            return `${result}${number}`;
                        }

                        // Upload credentials to Mega
                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                        const Id_session = mega_url.replace('https://mega.nz/file/', '');

                        const Scan_Id = Id_session;

                        let msgsss = await Smd.sendMessage(user, { text: "POPKID;;;" + Scan_Id });
                        await Smd.sendMessage(user, { text: MESSAGE }, { quoted: msgsss });
                        await delay(1000);
                        try { await fs.emptyDirSync(__dirname + '/auth_info_baileys'); } catch (e) {}

                    } catch (e) {
                        console.log("Error during file upload or message send: ", e);
                    }

                    await delay(100);
                    await fs.emptyDirSync(__dirname + '/auth_info_baileys');
                }

                // Handle connection closures
                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed!");
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log("Connection Lost from Server!");
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...");
                        SUHAIL().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.timedOut) {
                        console.log("Connection TimedOut!");
                    } else {
                        console.log('Connection closed with bot. Please run again.');
                        console.log(reason);
                        await delay(5000);
                        exec('pm2 restart qasim');
                    }
                }
            });

        } catch (err) {
            console.log("Error in SUHAIL function: ", err);
            exec('pm2 restart qasim');
            console.log("Service restarted due to error");
            SUHAIL();
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
            if (!res.headersSent) {
                await res.send({ code: "Try After Few Minutes" });
            }
        }
    }

    await SUHAIL();
});

module.exports = router;
