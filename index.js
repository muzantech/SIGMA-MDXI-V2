const { createLogger } = require('./src/utils/logger');
const { createHttpServer } = require('./src/server/httpServer');
const { GiftedBotRuntime } = require('./src/bot/runtime');
const config = require('./config');

const logger = createLogger({ name: 'sigma-mdxi-app' });

function bootstrapServer() {
    const port = process.env.PORT || 4420;
    return createHttpServer({
        port,
        logger: logger.child({ module: 'http' })
    });
}

async function bootstrapBot() {
    const botLogger = logger.child({ module: 'bot' });
    const runtime = new GiftedBotRuntime({
        logger: botLogger,
        maxReconnectAttempts: Number(process.env.MAX_RECONNECT_ATTEMPTS || 50),
        reconnectDelayMs: Number(process.env.RECONNECT_DELAY_MS || 5000)
    });

    await runtime.start();
    return runtime;
}

function registerProcessHandlers() {
    process.on('unhandledRejection', (reason) => {
        logger.error({ err: reason }, 'Unhandled promise rejection');
    });

    process.on('uncaughtException', (error) => {
        logger.error({ err: error }, 'Uncaught exception');
    });
}

async function main() {
    registerProcessHandlers();
    bootstrapServer();
    await bootstrapBot();
    logger.info(`SIGMA-MDXI v${config.VERSION} ready.`);
}

main().catch((error) => {
    logger.error({ err: error }, 'Fatal error during startup');
    process.exit(1);
});
