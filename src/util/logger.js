import pino from 'pino';
import config from './env.js';

const logger =
    config.nodeEnv === 'test'
        ? pino({ level: 'silent' })
        : pino({
              level: config.nodeEnv === 'production' ? 'info' : 'debug',
              transport:
                  config.nodeEnv === 'development'
                      ? {
                            target: 'pino-pretty',
                            options: {
                                colorize: true,
                                translateTime: 'HH:MM:ss',
                                ignore: 'pid,hostname'
                            }
                        }
                      : undefined
          });

export default logger;
