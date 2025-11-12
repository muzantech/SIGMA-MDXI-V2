const express = require('express');
const path = require('path');

function createHttpServer({
    port,
    logger,
    staticDir = path.resolve(process.cwd(), 'gift'),
    entryPoint = path.resolve(process.cwd(), 'gift', 'gifted.html')
} = {}) {
    const app = express();

    app.use(express.static(staticDir));
    app.get('/', (req, res) => {
        res.sendFile(entryPoint);
    });

    const serverPort = port || process.env.PORT || 4420;
    const server = app.listen(serverPort, () => {
        if (logger) {
            logger.info(`HTTP server listening on port ${serverPort}`);
        } else {
            console.log(`HTTP server listening on port ${serverPort}`);
        }
    });

    return { app, server };
}

module.exports = {
    createHttpServer
};
