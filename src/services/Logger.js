import winston from 'winston';
import 'winston-daily-rotate-file';
import { isDev } from '../helper/configuration.js';

export class Logger {
  constructor() {
    if (Logger._instance) {
      return Logger._instance;
    }
    Logger._instance = this;

    let logPath = isDev() ? './logs/ergaliothiki-%DATE%.log' : '/home/ergaliothiki/webapps/ergaliothiki/logs/ergaliothiki-%DATE%.log';
    var transport = new winston.transports.DailyRotateFile({
      level: 'debug',
      filename: logPath,
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '365d'
    });

    this.winstonLogger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'user-service' },
      transports: transport
    });

    this.info("---> Logger");
  }

  /**
   *
   * @param {String} msg
   */
  async debug(msg) {
    let sanitised = this.sanitiseMsg(msg);
    console.log(sanitised);
    this.winstonLogger.debug(sanitised);
  }
  /**
   *
   * @param {String} msg
   */
  async info(msg) {
    let sanitised = this.sanitiseMsg(msg);
    console.info(sanitised);
    this.winstonLogger.info(sanitised);
  }
  /**
   *
   * @param {String} msg
   */
  async warn(msg) {
    let sanitised = this.sanitiseMsg(msg);
    console.warn(sanitised);
    this.winstonLogger.warn(sanitised);
  }
  /**
   *
   * @param {String} msg
   */
  async error(msg) {
    let sanitised = this.sanitiseMsg(msg);
    console.error(sanitised);
    this.winstonLogger.error(sanitised);
  }

  /**
   * Cleans the logged message from any sensitive information.
   * @param {*} msg
   * @returns
   */
  sanitiseMsg(msg) {
    return msg;
  }
}
