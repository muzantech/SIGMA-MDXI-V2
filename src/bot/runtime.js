const {
    default: giftedConnect,
    jidNormalizedUser,
    isJidBroadcast,
    downloadContentFromMessage,
    DisconnectReason,
    getContentType,
    fetchLatestWaWebVersion,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore
} = require('gifted-baileys');

const {
    logger: giftedLogger,
    emojis,
    gmdStore,
    commands,
    setSudo,
    delSudo,
    GiftedTechApi,
    GiftedApiKey,
    GiftedAutoReact,
    GiftedAntiLink,
    GiftedAutoBio,
    GiftedChatBot,
    loadSession,
    getMediaBuffer,
    getSudoNumbers,
    getFileContentType,
    bufferToStream,
    uploadToPixhost,
    uploadToImgBB,
    setCommitHash,
    getCommitHash,
    gmdBuffer,
    gmdJson,
    formatAudio,
    formatVideo,
    uploadToGithubCdn,
    uploadToGiftedCdn,
    uploadToPasteboard,
    uploadToCatbox,
    GiftedAnticall,
    createContext,
    createContext2,
    GiftedPresence,
    GiftedAntiDelete
} = require('../../gift');
const config = require('../../config');
const googleTTS = require('google-tts-api');
const fs = require('fs-extra');
const path = require('path');
const { Boom } = require('@hapi/boom');

const sessionDir = path.resolve(process.cwd(), 'gift', 'session');

class GiftedBotRuntime {
    constructor({ logger, maxReconnectAttempts = 50, reconnectDelayMs = 5000 } = {}) {
        this.logger = logger || console;
        this.maxReconnectAttempts = maxReconnectAttempts;
        this.reconnectDelayMs = reconnectDelayMs;
        this.reconnectAttempts = 0;
        this.store = null;
        this.client = null;
        this.isShuttingDown = false;
        this.chatHistory = { chats: {} };
        this.connectionPromise = null;

        loadSession();
        giftedLogger.level = 'silent';
    }

    async start() {
        if (this.isShuttingDown) {
            this.logger.warn('Bot runtime is shutting down. Start request ignored.');
            return;
        }

        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this.initializeConnection().finally(() => {
            this.connectionPromise = null;
        });

        return this.connectionPromise;
    }

    async initializeConnection() {
        try {
            const { version } = await fetchLatestWaWebVersion();
            const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

            if (this.store) {
                this.store.destroy();
            }
            this.store = new gmdStore();

            const socketConfig = {
                version,
                logger: giftedLogger.child({ level: 'silent' }),
                browser: ['SIGMA-MDXI', 'safari', '1.0.0'],
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, giftedLogger)
                },
                getMessage: async (key) => this.getStoredMessage(key),
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 60000,
                keepAliveIntervalMs: 10000,
                markOnlineOnConnect: true,
                syncFullHistory: false,
                generateHighQualityLinkPreview: false,
                patchMessageBeforeSending: (message) => this.patchOutgoingMessage(message)
            };

            this.client = giftedConnect(socketConfig);
            this.store.bind(this.client.ev);
            this.registerCredentialWatcher(saveCreds);
            this.registerAutomationHandlers();
            this.registerCommandProcessor();
            this.registerConnectionLifecycle();
            this.registerCleanupHandlers();

            this.logger.info('Gifted bot runtime initialized.');
            this.reconnectAttempts = 0;
        } catch (error) {
            this.logger.error({ err: error }, 'Socket initialization error');
            this.scheduleReconnect();
        }
    }

    getStoredMessage(key) {
        if (!this.store) {
            return { conversation: 'Error occurred' };
        }

        const message = this.store.loadMessage(key.remoteJid, key.id);
        return message?.message || { conversation: 'Error occurred' };
    }

    patchOutgoingMessage(message) {
        const requiresPatch = !!(
            message.buttonsMessage ||
            message.templateMessage ||
            message.listMessage
        );
        if (!requiresPatch) {
            return message;
        }
        return {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadataVersion: 2,
                        deviceListMetadata: {}
                    },
                    ...message
                }
            }
        };
    }

    registerCredentialWatcher(saveCreds) {
        this.client.ev.process(async (events) => {
            if (events['creds.update']) {
                await saveCreds();
            }
        });
    }

    registerAutomationHandlers() {
        const {
            AUTO_REACT: autoReact,
            AUTO_BIO: autoBio,
            AUTO_READ_STATUS: autoReadStatus,
            AUTO_LIKE_STATUS: autoLikeStatus,
            STATUS_LIKE_EMOJIS: statusLikeEmojis,
            AUTO_REPLY_STATUS: autoReplyStatus,
            STATUS_REPLY_TEXT: statusReplyText,
            ANTILINK: antiLink,
            CHATBOT: chatBot,
            CHATBOT_MODE: chatBotMode
        } = config;

        if (autoReact === 'true') {
            this.client.ev.on('messages.upsert', async (mek) => {
                const ms = mek.messages?.[0];
                if (!ms || ms.key.fromMe || !ms.message) {
                    return;
                }
                try {
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    await GiftedAutoReact(randomEmoji, ms, this.client);
                } catch (error) {
                    this.logger.error({ err: error }, 'Auto reaction failed');
                }
            });
        }

        if (autoBio === 'true') {
            setTimeout(() => GiftedAutoBio(this.client), 1000);
            setInterval(() => GiftedAutoBio(this.client), 60000);
        }

        this.client.ev.on('call', async (json) => {
            await GiftedAnticall(json, this.client);
        });

        this.client.ev.on('messages.upsert', async ({ messages }) => {
            if (!messages || messages.length === 0) {
                return;
            }
            await GiftedPresence(this.client, messages[0].key.remoteJid);
        });

        this.client.ev.on('connection.update', ({ connection }) => {
            if (connection === 'open') {
                GiftedPresence(this.client, 'status@broadcast');
            }
        });

        if (chatBot === 'true' || chatBot === 'audio') {
            GiftedChatBot(this.client, chatBot, chatBotMode, createContext, createContext2, googleTTS);
        }

        this.client.ev.on('messages.upsert', async ({ messages }) => {
            const message = messages?.[0];
            if (!message?.message || message.key.fromMe) {
                return;
            }
            if (antiLink !== 'false') {
                await GiftedAntiLink(this.client, message, antiLink);
            }
        });

        this.client.ev.on('messages.upsert', async (mek) => {
            const message = mek.messages?.[0];
            if (!message || !message.message) {
                return;
            }

            const fromJid = message.key.participant || message.key.remoteJid;
            message.message = (getContentType(message.message) === 'ephemeralMessage')
                ? message.message.ephemeralMessage.message
                : message.message;

            if (message.key?.remoteJid === 'status@broadcast' && isJidBroadcast(message.key.remoteJid)) {
                const giftedtech = jidNormalizedUser(this.client.user.id);

                if (autoReadStatus === 'true') {
                    await this.client.readMessages([message.key, giftedtech]);
                }

                if (autoLikeStatus === 'true' && message.key.participant) {
                    const likeEmojis = statusLikeEmojis?.split(',') || '💛,❤️,💜,🤍,💙';
                    const randomEmoji = likeEmojis[Math.floor(Math.random() * likeEmojis.length)];
                    await this.client.sendMessage(
                        message.key.remoteJid,
                        { react: { key: message.key, text: randomEmoji } },
                        { statusJidList: [message.key.participant, giftedtech] }
                    );
                }

                if (autoReplyStatus === 'true' && !message.key.fromMe) {
                    const customMessage = statusReplyText || '✅ Status Viewed By SIGMA-MDXI';
                    await this.client.sendMessage(
                        fromJid,
                        { text: customMessage },
                        { quoted: message }
                    );
                }
            }
        });

        this.registerAntiDeleteHandler();
    }

    registerAntiDeleteHandler() {
        this.client.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const ms = messages?.[0];
                if (!ms?.message) {
                    return;
                }

                const { key } = ms;
                if (!key?.remoteJid || key.fromMe || key.remoteJid === 'status@broadcast') {
                    return;
                }

                const sender = key.senderPn || key.participantPn || key.participant || key.remoteJid;
                const senderPushName = key.pushName || ms.pushName;
                const botJid = `${this.client.user?.id.split(':')[0]}@s.whatsapp.net`;

                if (sender === botJid || key.fromMe) {
                    return;
                }

                if (!this.chatHistory.chats[key.remoteJid]) {
                    this.chatHistory.chats[key.remoteJid] = [];
                }

                this.chatHistory.chats[key.remoteJid].push({
                    ...ms,
                    originalSender: sender,
                    originalPushName: senderPushName,
                    timestamp: Date.now()
                });

                if (this.chatHistory.chats[key.remoteJid].length > 50) {
                    this.chatHistory.chats[key.remoteJid] = this.chatHistory.chats[key.remoteJid].slice(-50);
                }

                if (ms.message?.protocolMessage?.type === 0) {
                    const deletedId = ms.message.protocolMessage.key.id;
                    const deletedMsg = this.chatHistory.chats[key.remoteJid].find(m => m.key.id === deletedId);
                    if (!deletedMsg?.message) {
                        return;
                    }

                    const deleter = key.participantPn || key.participant || key.remoteJid;
                    const deleterPushName = key.pushName || ms.pushName;

                    if (deleter === botJid) {
                        return;
                    }

                    await GiftedAntiDelete(
                        this.client,
                        deletedMsg,
                        key,
                        deleter,
                        deletedMsg.originalSender,
                        botJid,
                        deleterPushName,
                        deletedMsg.originalPushName
                    );

                    this.chatHistory.chats[key.remoteJid] = this.chatHistory.chats[key.remoteJid].filter(m => m.key.id !== deletedId);
                }
            } catch (error) {
                this.logger.error({ err: error }, 'Anti-delete handler failed');
            }
        });
    }

    registerCommandProcessor() {
        const {
            PREFIX: botPrefix,
            BOT_NAME: botName,
            MODE: botMode,
            OWNER_NUMBER: ownerNumber,
            STARTING_MESSAGE: startMess,
            BOT_PIC: botPic,
            FOOTER: botFooter,
            CAPTION: botCaption,
            VERSION: botVersion,
            OWNER_NAME: ownerName,
            BOT_REPO: giftedRepo,
            NEWSLETTER_URL: newsletterUrl,
            NEWSLETTER_JID: newsletterJid,
            TIME_ZONE: timeZone
        } = config;

        this.client.ev.on('messages.upsert', async ({ messages }) => {
            const ms = messages?.[0];
            if (!ms?.message || !ms?.key) {
                return;
            }

            const standardizeJid = (jid) => {
                if (!jid) return '';
                try {
                    let normalized = typeof jid === 'string'
                        ? jid
                        : (jid.decodeJid ? jid.decodeJid() : String(jid));
                    normalized = normalized.split(':')[0].split('/')[0];
                    if (!normalized.includes('@')) {
                        normalized += '@s.whatsapp.net';
                    } else if (normalized.endsWith('@lid')) {
                        return normalized.toLowerCase();
                    }
                    return normalized.toLowerCase();
                } catch (error) {
                    this.logger.error({ err: error }, 'Failed to standardize JID');
                    return '';
                }
            };

            const from = standardizeJid(ms.key.remoteJid);
            const botId = standardizeJid(this.client.user?.id);
            const isGroup = from.endsWith('@g.us');
            let groupInfo = null;
            let groupName = '';

            if (isGroup) {
                try {
                    groupInfo = await this.client.groupMetadata(from).catch(() => null);
                    groupName = groupInfo?.subject || '';
                } catch (error) {
                    this.logger.error({ err: error }, 'Failed to fetch group metadata');
                }
            }

            const sendr = ms.key.fromMe
                ? `${this.client.user.id.split(':')[0]}@s.whatsapp.net`
                : (ms.key.participant || ms.key.remoteJid);
            let participants = [];
            let groupAdmins = [];
            let groupSuperAdmins = [];
            let sender = sendr;
            let isBotAdmin = false;
            let isAdmin = false;
            let isSuperAdmin = false;

            if (groupInfo && groupInfo.participants) {
                participants = groupInfo.participants.map(p => p.pn || p.id);
                groupAdmins = groupInfo.participants.filter(p => p.admin === 'admin').map(p => p.pn || p.id);
                groupSuperAdmins = groupInfo.participants.filter(p => p.admin === 'superadmin').map(p => p.pn || p.id);
                const senderLid = standardizeJid(sendr);
                const found = groupInfo.participants.find(p => p.id === senderLid || p.pn === senderLid);
                sender = found?.pn || found?.id || sendr;
                isBotAdmin = groupAdmins.includes(standardizeJid(botId)) || groupSuperAdmins.includes(standardizeJid(botId));
                isAdmin = groupAdmins.includes(sender);
                isSuperAdmin = groupSuperAdmins.includes(sender);
            }

            const repliedMessage = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
            const type = getContentType(ms.message);
            const pushName = ms.pushName || 'SIGMA-MDXI User';
            const quoted =
                type === 'extendedTextMessage' &&
                ms.message.extendedTextMessage.contextInfo != null
                    ? ms.message.extendedTextMessage.contextInfo.quotedMessage || []
                    : [];
            const body =
                type === 'conversation' ? ms.message.conversation
                    : type === 'extendedTextMessage' ? ms.message.extendedTextMessage.text
                        : type === 'imageMessage' && ms.message.imageMessage.caption ? ms.message.imageMessage.caption
                            : type === 'videoMessage' && ms.message.videoMessage.caption ? ms.message.videoMessage.caption
                                : '';
            const isCommand = body.startsWith(botPrefix);
            const command = isCommand ? body.slice(botPrefix.length).trim().split(' ').shift().toLowerCase() : '';
            const args = isCommand ? body.slice(botPrefix.length + command.length).trim().split(/\s+/).filter(Boolean) : [];

            const mentionedJid = (ms.message?.extendedTextMessage?.contextInfo?.mentionedJid || []).map(standardizeJid);
            const tagged = ms.mtype === 'extendedTextMessage' && ms.message.extendedTextMessage.contextInfo != null
                ? ms.message.extendedTextMessage.contextInfo.mentionedJid
                : [];
            const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedUser = ms.message?.extendedTextMessage?.contextInfo?.participant
                || ms.message?.extendedTextMessage?.contextInfo?.remoteJid;
            const repliedMessageAuthor = standardizeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
            const messageAuthor = repliedMessageAuthor || standardizeJid(ms.key.participant || ms.key.remoteJid);
            const isSuperUser = getSudoNumbers().includes(messageAuthor);
            const superUser = getSudoNumbers();

            if (!isCommand) {
                return;
            }

            for (const cmd of commands) {
                const gmd = cmd;
                if (!gmd || !gmd.pattern) {
                    continue;
                }
                const matcher = new RegExp(`^${gmd.pattern}$`, gmd.flags || 'i');
                const match = command.match(matcher);
                if (!match) {
                    continue;
                }
                const argsFromMatch = match.slice(1).filter(Boolean);
                const finalArgs = argsFromMatch.length ? argsFromMatch : args;

                try {
                    const reply = (text) => {
                        this.client.sendMessage(from, { text }, { quoted: ms });
                    };

                    const react = async (emoji) => {
                        if (typeof emoji !== 'string') return;
                        try {
                            await this.client.sendMessage(from, {
                                react: {
                                    key: ms.key,
                                    text: emoji
                                }
                            });
                        } catch (error) {
                            this.logger.error({ err: error }, 'Reaction failed');
                        }
                    };

                    const edit = async (text, message) => {
                        if (typeof text !== 'string' || !message?.key) return;
                        try {
                            await this.client.sendMessage(from, {
                                text,
                                edit: message.key
                            }, {
                                quoted: ms
                            });
                        } catch (error) {
                            this.logger.error({ err: error }, 'Edit failed');
                        }
                    };

                    const del = async (message) => {
                        if (!message?.key) return;
                        try {
                            await this.client.sendMessage(from, {
                                delete: message.key
                            }, { quoted: ms });
                        } catch (error) {
                            this.logger.error({ err: error }, 'Delete failed');
                        }
                    };

                    if (gmd.react) {
                        try {
                            await this.client.sendMessage(from, {
                                react: {
                                    key: ms.key,
                                    text: gmd.react
                                }
                            });
                        } catch (error) {
                            this.logger.error({ err: error }, 'Command reaction failed');
                        }
                    }

                    this.client.getJidFromLid = async (lid) => {
                        const groupMetadata = await this.client.groupMetadata(from);
                        const matchParticipant = groupMetadata.participants.find(p => p.lid === lid || p.id === lid);
                        return matchParticipant?.pn || null;
                    };

                    this.client.getLidFromJid = async (jid) => {
                        const groupMetadata = await this.client.groupMetadata(from);
                        const matchParticipant = groupMetadata.participants.find(p => p.jid === jid || p.id === jid);
                        return matchParticipant?.lid || null;
                    };

                    let fileType;
                    (async () => {
                        fileType = await import('file-type');
                    })();

                    this.client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
                        try {
                            const quotedMessage = message.msg ? message.msg : message;
                            const mime = (message.msg || message).mimetype || '';
                            const messageType = message.mtype
                                ? message.mtype.replace(/Message/gi, '')
                                : mime.split('/')[0];

                            const stream = await downloadContentFromMessage(quotedMessage, messageType);
                            let buffer = Buffer.from([]);

                            for await (const chunk of stream) {
                                buffer = Buffer.concat([buffer, chunk]);
                            }

                            let fileTypeResult;
                            try {
                                fileTypeResult = await fileType.fileTypeFromBuffer(buffer);
                            } catch (error) {
                                this.logger.warn({ err: error }, 'File type detection failed, falling back to MIME type');
                            }

                            const extension = fileTypeResult?.ext
                                || mime.split('/')[1]
                                || (messageType === 'image' ? 'jpg'
                                    : messageType === 'video' ? 'mp4'
                                        : messageType === 'audio' ? 'mp3'
                                            : 'bin');

                            const trueFileName = attachExtension ? `${filename}.${extension}` : filename;
                            await fs.writeFile(trueFileName, buffer);
                            return trueFileName;
                        } catch (error) {
                            this.logger.error({ err: error }, 'downloadAndSaveMediaMessage failed');
                            throw error;
                        }
                    };

                    const context = {
                        m: ms,
                        mek: ms,
                        edit,
                        react,
                        del,
                        arg: finalArgs,
                        quoted,
                        isCmd: isCommand,
                        command,
                        isAdmin,
                        isBotAdmin,
                        sender,
                        pushName,
                        setSudo,
                        delSudo,
                        q: finalArgs.join(' '),
                        reply,
                        config,
                        superUser,
                        tagged,
                        mentionedJid,
                        isGroup,
                        groupInfo,
                        groupName,
                        getSudoNumbers,
                        authorMessage: messageAuthor,
                        user: messageAuthor || '',
                        gmdBuffer,
                        gmdJson,
                        formatAudio,
                        formatVideo,
                        groupMember: isGroup ? messageAuthor : '',
                        from,
                        groupAdmins,
                        participants,
                        repliedMessage,
                        quotedMsg,
                        quotedUser,
                        isSuperUser,
                        botMode,
                        botPic,
                        botFooter,
                        botCaption,
                        botVersion,
                        ownerNumber,
                        ownerName,
                        botName,
                        giftedRepo,
                        isSuperAdmin,
                        getMediaBuffer,
                        getFileContentType,
                        bufferToStream,
                        uploadToPixhost,
                        uploadToImgBB,
                        setCommitHash,
                        getCommitHash,
                        uploadToGithubCdn,
                        uploadToGiftedCdn,
                        uploadToPasteboard,
                        uploadToCatbox,
                        newsletterUrl,
                        newsletterJid,
                        GiftedTechApi,
                        GiftedApiKey,
                        botPrefix,
                        timeZone
                    };

                    await gmd.function(from, this.client, context);
                } catch (error) {
                    this.logger.error({ err: error, command: gmd.pattern }, 'Command execution failed');
                    try {
                        await this.client.sendMessage(from, {
                            text: `🚨 Command failed: ${error.message}`,
                            ...createContext(messageAuthor, {
                                title: 'Error',
                                body: 'Command execution failed'
                            })
                        }, { quoted: ms });
                    } catch (sendError) {
                        this.logger.error({ err: sendError }, 'Failed to send error message');
                    }
                }
            }
        });
    }

    registerConnectionLifecycle() {
        const {
            STARTING_MESSAGE: startMess,
            MODE: botMode,
            BOT_NAME: botName,
            PREFIX: botPrefix,
            OWNER_NUMBER: ownerNumber,
            FOOTER: botFooter,
            CAPTION: botCaption,
            NEWSLETTER_URL: newsletterUrl
        } = config;

        this.client.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'connecting') {
                this.logger.info('Connecting to WhatsApp...');
                this.reconnectAttempts = 0;
            }

            if (connection === 'open') {
                this.logger.info('WhatsApp connection established.');
                this.reconnectAttempts = 0;

                setTimeout(async () => {
                    try {
                        const totalCommands = commands.filter((command) => command.pattern).length;
                        if (startMess === 'true') {
                            const mode = botMode === 'public' ? 'public' : 'private';
                            const connectionMsg = `*${botName} 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃*\n\n𝐏𝐫𝐞𝐟𝐢𝐱       : *[ ${botPrefix} ]*\n𝐏𝐥𝐮𝐠𝐢𝐧𝐬      : *${totalCommands.toString()}*\n𝐌𝐨𝐝𝐞        : *${mode}*\n𝐎𝐰𝐧𝐞𝐫       : *${ownerNumber}*\n𝐓𝐮𝐭𝐨𝐫𝐢𝐚𝐥𝐬     : *${config.YT}*\n𝐔𝐩𝐝𝐚𝐭𝐞𝐬      : *${newsletterUrl}*\n\n> *${botCaption}*`;

                            await this.client.sendMessage(
                                this.client.user.id,
                                {
                                    text: connectionMsg,
                                    ...createContext(botName, {
                                        title: 'BOT INTEGRATED',
                                        body: 'Status: Ready for Use'
                                    })
                                },
                                {
                                    disappearingMessagesInChat: true,
                                    ephemeralExpiration: 300
                                }
                            );
                        }
                    } catch (error) {
                        this.logger.error({ err: error }, 'Post connection setup failed');
                    }
                }, 5000);
            }

            if (connection === 'close') {
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                this.logger.warn({ reason }, 'Connection closed');

                if (reason === DisconnectReason.badSession) {
                    this.logger.error('Bad session file detected. Deleting session directory.');
                    try {
                        await fs.remove(sessionDir);
                    } catch (error) {
                        this.logger.error({ err: error }, 'Failed to remove session directory');
                    }
                    process.exit(1);
                } else if (
                    [
                        DisconnectReason.connectionClosed,
                        DisconnectReason.connectionLost,
                        DisconnectReason.restartRequired,
                        DisconnectReason.timedOut
                    ].includes(reason)
                ) {
                    this.logger.warn({ reason }, 'Connection lost. Scheduling reconnect.');
                    this.scheduleReconnect(reason === DisconnectReason.timedOut ? this.reconnectDelayMs * 2 : undefined);
                } else if (reason === DisconnectReason.connectionReplaced) {
                    this.logger.error('Connection replaced by another session. Exiting.');
                    process.exit(1);
                } else if (reason === DisconnectReason.loggedOut) {
                    this.logger.error('Logged out from device. Removing session and exiting.');
                    try {
                        await fs.remove(sessionDir);
                    } catch (error) {
                        this.logger.error({ err: error }, 'Failed to remove session directory');
                    }
                    process.exit(1);
                } else {
                    this.logger.warn({ reason }, 'Unknown disconnect reason. Scheduling reconnect.');
                    this.scheduleReconnect();
                }
            }
        });
    }

    registerCleanupHandlers() {
        const cleanup = () => {
            this.isShuttingDown = true;
            if (this.store) {
                this.store.destroy();
            }
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
    }

    scheduleReconnect(customDelay) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.logger.error('Maximum reconnection attempts reached. Exiting process.');
            process.exit(1);
            return;
        }

        this.reconnectAttempts += 1;
        const delay = customDelay || Math.min(this.reconnectDelayMs * Math.pow(2, this.reconnectAttempts - 1), 300000);
        this.logger.warn(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

        setTimeout(async () => {
            try {
                await this.start();
            } catch (error) {
                this.logger.error({ err: error }, 'Reconnection attempt failed');
                this.scheduleReconnect();
            }
        }, delay);
    }
}

module.exports = {
    GiftedBotRuntime
};
