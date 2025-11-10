const fs = require('fs-extra');
if (fs.existsSync('.env'))
  require('dotenv').config({ path: __dirname + '/.env' });
const path = require("path");

module.exports = { 
    SESSION_ID: process.env.SESSION_ID || 'SIGMA-MDXi~H4sIAAAAAAAAA61Va4+qyBb9Kzf1tT0jb8SkkylBURFfoKKTyU0JBRZvoUDxxP8+QU9Pd+bR05MMnypF1Vpr7732ru8gzUiJDdyA/neQF6RGFLdL2uQY9MGg8n1cgA7wEEWgDxgVG3FdnQOV1efUn9kRWRj74VrE0WB4s8ruNBZ3x7V+48tXcO+AvDrGxP0E0LP4heiXzPagjwIcm2G4XJG9yqUb27tOoRrzJt87iTtbz17BvUVEpCBpMMxPOMEFig3cLBEpvib/ZR6uyPS2vkmCKpgjz9ocLdHlhGh6dcj2ulqsJwrrzZspm31N/rV3mjXrHIdCfJoYes1eass/3Ky6yoNz9zKwgiTzXG591qKn/JIEKfYmHk4poc2X8+4awrBJy/h29qceF/qeo7O9wbUb8nHuDnUGj11/NXuBQrL6mnB2O5ypL6ZGR5eJNtBsexO69a6WeDvTNlmy0rrKkdEhMW6bj8KXxZtXon+Td3OpX4NqYiA2GssS48hpj2XDyFusD9oko046PSc4KvWajb4mn8lMh11omxm0QnOY7W7zZWIwlTdJFpM9e5xGSCKD7sTm4f5dPqJV8WmSX048XKnXURX7V0xL39qZuedz0Dyka4yWA/G4ZgPDdo8zGOZCzQpG1JvCIicLBiPBDhJCm0ye709dbRyEl6l7seDl9RFRhJuJB/rsvQMKHJCSFoiSLG33FKEDkFdb2C0wfWQXqHOL28m4Mf2N4x4nB8uOZyMeqiy02YMSMmGxsrbIiURp/wo6IC8yF5cl9sakpFnRmLgsUYBL0P/lUag25gInGcVT4oE+4DlBZnlRlATm5/KnywnREuX5TymmoAP8IktMDPq0qHAHPM5zkFd5QVYlThI1dqgJijhqg0qePDZJcElRkoM+K0ucLEk9Rbp3/iPqwUAaMj2GkzSG5UReUXr/QC3/Z9QyZOFIkCHk4JARxd7wc2qFYe+/dkCKr/TZJ211ebYDfFKUdJNWeZwh762J3n4i182qlFpN6qrtAheg/2EbU0rSoGyDqVJUuCdSY7XVDvo+ikt87wAP18TFLR6wB7XcZBK2/3+Geryfhdy1dFetRU5Z+jwiYBf76Mh/cxErfBMYSfmmcAL+xnO+zzCMIDAIgTYFzxHV3vnbjqFwv3cOpbOkSGT08w7dFtLijJWtCR+uf1odF9h7y+wRuVGV21mE009wOZkpJ/pWXA8OM3MWEXt+6cGDhZr0I+6zhUD/+/uzoGZeizeEy5l0MEXQVqvl+aMB+vyfLZCi9ixQTwUp6f/sMqMEgw6IH3dZRhYVgWEFTuZFXu7zP7f799/r1JJ4mCISly3GkohCzSyGxjG4loGuQzOAagDBe13f5tGz4YfQqaYv4XY7rs0Ax2gm545iMq6qXc6xttvvX24sgzkoqb3XvwABfXAiRNs6h9FqgJuGzY5QboxL91b5I7fcKipCWy0eu1pKjKAOuavKTSw/dDbubHHavBjDtbLD8onVDFSGKD1RRwtCTwteW7anvz6SecLiQh1H0If79XwnmeVhK6h4nkxRPVeXOTYzypy660VVeTyTMYdmu5x7N9Hk12SLbkiXWOww02UlHhe7LV1b+BrFGnxOysekjn+8kOTHEHu60Sf48eD8qNQ/1PO9LZh75wPCjwfsb6w3WMORTPyM3a7l22Sc78iLtO3a8zEMeka+YhN9WSremAaLoAb3tt/zGFE/KxLQB2VyJKADiqxqm3aS+tknTCqMJtoqUNugY1RS+D4I/mqsiR2QNDDPLYro2/wA8PEt9+D+GxG+o1HKCQAA',
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
