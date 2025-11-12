const pino = require('pino');

const defaultLevel = process.env.LOG_LEVEL || 'info';

function createLogger(options = {}) {
    const {
        level = defaultLevel,
        name = 'sigma-mdxi',
        transport,
        ...rest
    } = options;

    return pino({
        name,
        level,
        transport,
        ...rest
    });
}

module.exports = {
    createLogger
};
