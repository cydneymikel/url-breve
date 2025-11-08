import pino from 'pino';
import config from './env.js';

let level;
let transport;

switch (config.nodeEnv) {
    case 'test':
        level = 'silent';
        break;
    case 'production':
        level = 'info';
        break;
    case 'development':
        level = 'debug';
        transport = {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname'
            }
        };
        break;
    default:
        level = 'debug';
}

const logger = pino({ level, transport });

export default logger;
