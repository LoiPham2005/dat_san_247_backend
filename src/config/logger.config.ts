import { registerAs } from '@nestjs/config';
import * as winston from 'winston';
import * as path from 'path';

export default registerAs('logger', () => ({
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'pretty', // 'json' for production
    enableFile: process.env.LOG_FILE_ENABLED === 'true',
    filePath: process.env.LOG_FILE_PATH || 'logs',
}));

// Winston format configurations
export const createWinstonFormat = (isPretty = true) => {
    const { combine, timestamp, printf, colorize, errors, json, align } = winston.format;

    const prettyFormat = printf(({ level, message, timestamp, context, trace, ...meta }) => {
        const contextStr = context ? `[${context}]` : '';
        const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        const traceStr = trace ? `\n${trace}` : '';
        return `${timestamp} ${level} ${contextStr} ${message}${metaStr}${traceStr}`;
    });

    if (isPretty) {
        return combine(
            colorize({ all: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            align(),
            prettyFormat,
        );
    }

    // JSON format for production (easier to parse by log aggregators)
    return combine(
        timestamp(),
        errors({ stack: true }),
        json(),
    );
};

// Winston transports (where logs go)
export const createWinstonTransports = (config: {
    enableFile: boolean;
    filePath: string;
    level: string;
}) => {
    const transports: winston.transport[] = [
        new winston.transports.Console({
            level: config.level,
        }),
    ];

    if (config.enableFile) {
        // Log all levels to combined.log
        transports.push(
            new winston.transports.File({
                filename: path.join(config.filePath, 'combined.log'),
                level: config.level,
                maxsize: 10 * 1024 * 1024, // 10MB
                maxFiles: 5,
            }),
        );

        // Log errors to separate file
        transports.push(
            new winston.transports.File({
                filename: path.join(config.filePath, 'error.log'),
                level: 'error',
                maxsize: 10 * 1024 * 1024,
                maxFiles: 5,
            }),
        );
    }

    return transports;
};
