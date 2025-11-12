const fs = require('fs-extra');
if (fs.existsSync('.env'))
  require('dotenv').config({ path: __dirname + '/.env' });
const path = require("path");

module.exports = { 
    SESSION_ID: process.env.SESSION_ID || 'gifted~H4sIAAAAAAAAA61V247iOBT8F79CL07IFamlyRUI0AQSCLDaB5M4F3IlcQgw4t9Xge7t1uxOT680ebIcu6p8fKr8HWR5VOEJvoDBd1CU0QkR3A7JpcBgAOTa93EJusBDBIEBqE1qI0TXdTb2RDUXZlJgUDUOG+cw1QzdW8Rmqm5Vq9pr+TO4dUFR75PI/QTQgDvdUonR2zhQPAsBt+5vheXSNejE5yp7VyclxnVur5vgGdxaRBSVURZoRYhTXKJkgi8misqvyZ+Pj9LGPQVQeamriV4nLyjkrvlBOB7QDs7LVbFRwuVJM6DwNfl71qkODpZk1nfYBcqupiPH84XUN+QxdghXiNU+mjIzOpAe8qsoyLA39nBGInL5ct3HhtCE1nXIKM210jCxX3pnF3Y6aiF3dkeeMl2Zai4b36HcrwmfzMupwM52Ky4zDoe1i2opXOoj5FtIWaiHw8vQCpMZfUIJ81G4Wb71Svx/6l6rMxitV+x6FTfNlSLOyj0cVjneL2GYbZfKMaSD2bHkA735mnxEzx17tFgfqCHDjYyQ3zreFC16MreeahukbAR3qFu2kmfBu3xE6vIzlSsFLr0tph1qej5npqNaWb0eVUXcrAJKW64bx8nyzlFQU46JZW7UuaYFjcTheCNoSjZdTun95sCciz4qre1Bn6irUxIEz/cTxfgy9sCAunVBiYOoIiUiUZ7d52iqC5B3srBbYnIvLwg66nnq61iR1Ss9Ei/RtLNcoRj5dqisvSZRrfQqCLEw6THPoAuKMndxVWFvFFUkLy8zXFUowBUY/Hm/qfbQJU5zgo3IAwPQpxme6rMsx8Bv1R9NiEiFiuKPDBPQBX6ZpzMMBqSscRc81ku6KPShzikQ9iGnsTwU21OlDx47SnFFUFqAAcVztEj3+zR36/4malmlWAhZWYYSLwiSoCu/oOZ/GzVFq31e1jWZomhBhFDQf0Et3v7qggyfycMo7fVyVBf4UVmRVVYXSY68Nxe9/USum9cZsS6Zq7QDXILBh2lMSJQFVXuYOkOlG0YnrLTawcBHSYVvXeDhU+TiFg8MceHVMJvYBWeFo3O1jD1nHLQtEubZY4lLix6D9/5T39tzT0zfw097XhSe9q7H+4LIMHuXA20JHhnV7vmpZa7D2gwdTvad3VJT3Gi8NrxVZbH+EN7b/tHruMTeq9ou2CM3rgs7j3H2CTAMFZJRPflaoUK9bCNtBwO78AgRtx+AHyYCg++3f+rVYnqYoCipwAAoY7WOzcVEmxxTOAuGQ0kLJCWQwHt934LhYbymd/RI0LFhzNi2tU83pWyHjcgF50lPKoU5TfGd4nyYk+XdeD+CgAE4IoY1+yYXRR17RMkprqvpYsaxxlyw57uRYh/YlDWXMZlg5siMV8GhUsStTIxrRksdXayXiJsK9Fmumqs/Oy/KE0KK9NyyPe75I9l87gXGcJN5zhkp5T4cU832IknjjVMMJWF7Wb5w1IuhL0RIb14crBtZSfWwEzVoZMLdaKIJJrWIdKQWVT1UKuwPR3WweERWes/KH50z4P/tneS+iII8KzKQYmi+z/b5Af+tne+CDLVIYJbX4C2Ik9cHMHqNqEev+RG+vyevG35B+t708Nb9gPD6Pv2kr2TX5LL91oxFY65BmLIJ16wY18T5zDo1k55KCO4d3e21XGFwa91cJIj4eZmCAYjuJgJdUOZ1a8px5uefcClSPFYXwT2uElQR6d3o/5EdlNgF6UUqCosg8pYPQGq/cZ2A29/Qy3BIqwkAAA==',
    PREFIX: process.env.PREFIX || ".",
    OWNER_NAME: process.env.OWNER_NAME || 'MUZAN SIGMA',
    OWNER_NUMBER : process.env.OWNER_NUMBER || "",  // put only one number
    SUDO_NUMBERS : process.env.SUDO_NUMBERS || "", // can be multiple numbers separated by commas
    BOT_NAME : process.env.BOT_NAME || '💢𝚂𝙸𝙶𝙼𝙰 𝙼𝙳𝚇𝙸💢',
    FOOTER : process.env.FOOTER || 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴜᴢᴀɴ sɪɢᴍᴀ',
    CAPTION : process.env.CAPTION || '©𝟐𝟎𝟐𝟒 𝐒𝐈𝐆𝐌𝐀-𝐌𝐃𝐗𝐈 𝐕𝟐',
    VERSION: process.env.VERSION || '5.0.0',
    BOT_PIC : process.env.BOT_PIC || 'https://files.catbox.moe/iw9ar0.jpg',            
    MODE: process.env.MODE || "private",
    PM_PERMIT: process.env.PM_PERMIT || 'false',
    WARN_COUNT : process.env.WARN_COUNT || '3' ,
    TIME_ZONE: process.env.TIME_ZONE || "Africa/Nairobi",
    DM_PRESENCE : process.env.DM_PRESENCE || 'online', // recording/typing/online/offline
    GC_PRESENCE : process.env.GC_PRESENCE || 'online', // recording/typing/online/offline
    CHATBOT : process.env.CHATBOT || 'false', // can be true/audio/false   
    CHATBOT_MODE : process.env.CHATBOT_MODE || 'inbox', // can be inbox/groups/allchats
    STARTING_MESSAGE : process.env.STARTING_MESSAGE || "true",
    ANTIDELETE : process.env.ANTIDELETE || 'indm', // inchat/indm/false
    GOODBYE_MESSAGE : process.env.GOODBYE_MESSAGE || 'false',
    ANTICALL : process.env.ANTICALL || 'false', // (decline/true)/block/false
    ANTICALL_MSG: process.env.ANTICALL_MSG || "*_📞 Auto Call Reject Mode Active. 📵 No Calls Allowed!_*",
    WELCOME_MESSAGE : process.env.WELCOME_MESSAGE || 'false',
    ANTILINK : process.env.ANTILINK || 'false', // or delete or kick or true
    AUTO_LIKE_STATUS : process.env.AUTO_LIKE_STATUS || 'true',
    AUTO_READ_STATUS : process.env.AUTO_READ_STATUS || 'true',
    STATUS_LIKE_EMOJIS : process.env.STATUS_LIKE_EMOJIS || "💛,❤️,💜,🤍,💙",
    AUTO_REPLY_STATUS: process.env.AUTO_REPLY_STATUS || "false",   
    STATUS_REPLY_TEXT: process.env.STATUS_REPLY_TEXT || "*ʏᴏᴜʀ sᴛᴀᴛᴜs ᴠɪᴇᴡᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ ✅*",             
    AUTO_REACT : process.env.AUTO_REACT || 'false',
    AUTO_REPLY : process.env.AUTO_REPLY || 'false',
    AUTO_READ_MESSAGES : process.env.AUTO_READ_MESSAGES || 'false', // true/commands/false
    AUTO_BIO : process.env.AUTO_BIO || 'false',
    AUTO_BLOCK: process.env.AUTO_BLOCK || '212,233',
    YT: process.env.YT || 'youtube.com/@giftedtechnexus',
    NEWSLETTER_JID: process.env.NEWSLETTER_JID || '120363408839929349@newsletter',
    NEWSLETTER_URL: process.env.NEWSLETTER_URL || 'https://whatsapp.com/channel/0029Vb3hlgX5kg7G0nFggl0Y',
    BOT_REPO: process.env.BOT_REPO || 'mauricegift/SIGMA-MDXI',
    PACK_NAME: process.env.PACK_NAME || '𝐒𝐈𝐆𝐌𝐀-𝐌𝐃𝐗𝐈',
    PACK_AUTHOR: process.env.PACK_AUTHOR || 'ᴍᴜᴢᴀɴ sɪɢᴍᴀ'
};

let fileName = require.resolve(__filename);
fs.watchFile(fileName, () => {
    fs.unwatchFile(fileName);
    console.log(`Writing File: ${__filename}`);
    delete require.cache[fileName];
    require(fileName);
});
