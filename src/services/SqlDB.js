import mariadb from 'mariadb';
import { Logger } from './Logger.js';
import { sqlDbClientFromEnv } from '../helper/configuration.js';

export class SqlDB {
  constructor() {
    if (SqlDB._instance) {
      return SqlDB._instance;
    }
    SqlDB._instance = this;

    this.logger = new Logger();
    this.logger.info(`---> SqlDB`);

    // https://mariadb.com/docs/server/connect/programming-languages/nodejs/promise/connection-pools/
    this.dbParams = sqlDbClientFromEnv();

    this.pool = null;
  }

  /**
   * Connects to the DB by creating a connection pool and tests by retrieving a connection from the pool.
   * In case of a failure, retries to connect after 1 min.
   * We don't wait here, but instead retry the connection, the server can keep running normally, albeit without the DB connection.
   */
  async connect() {
    this.logger.debug(`---> SqlDB.connect()`);
    if (this.pool) return;

    try {
      let p = mariadb.createPool(this.dbParams);
      let connection = await p.getConnection();
      connection.release();
      this.logger.info("Successfully connected to SqlDB.");
      this.pool = p;
    }
    catch (err) {
      this.logger.error(`SqlDB connection error: ${ JSON.stringify(err) } ... retrying in 1 min`);
      setTimeout(() => {
        this.connect();
      }, 60000);
    }
  }
  /**
   * Establishes a connection from the pool, adds it to the incoming request, and starts it.
   * Throws an error if no connection is available.
   * @param {Request} request
   */
  async beginTransaction(request) {
    this.logger.info(`---> SqlDB.beginTransaction()`);
    this.connect();

    // throw if there the pool is not connected
    if (!this.pool) {
      throw new Error("DB connection pool has not been established yet.");
    }
    // return if the specific request has already established a connection to the db
    if (request.dbConnection) return;

    request.dbConnection = await this.pool.getConnection();
    this.logConnectionPoolStatus();
    await request.dbConnection.beginTransaction();
  }
  /**
   * Commits a successful transaction.
   * @param {Request} request
   */
  async commitTransaction(request) {
    this.logger.debug("---> SqlDB.commitTransaction()");
    if (request.dbConnection) {
      await request.dbConnection.commit();
      await request.dbConnection.release();
    }
  }
  /**
   * Rollbacks the transaction.
   * @param {Request} request
   */
  async rollbackTransaction(request) {
    this.logger.debug("---> SqlDB.rollbackTransaction()");
    if (request.dbConnection) {
      await request.dbConnection.rollback();
      await request.dbConnection.release();
    }
  }
  /**
   * Logs out the current connection pool properties.
   */
  logConnectionPoolStatus() {
    this.logger.debug(`Total/Active/Idle connections: ${this.pool.totalConnections()}/${this.pool.activeConnections()}/${this.pool.idleConnections()}`);
  }

  /**
   * Performs an sql-query and returns the results.
   * @param {String} sqlQuery
   */
  async query(sqlQuery) {
    try {

    }
    catch(err) {
      this.logger.error(err);
      return null;
    }
  }
  /**
   * Performs the query, checks if there is only a single row returned, and returns the row or throws an error otherwise.
   * @param {String} sqlQuery
   */
  async checkOneRow(sqlQuery) {
  }
  /**
   * Performs the query, checks if there is at least one row returned, and returns the results of throws an error otherwise.
   * @param {String} sqlQuery
   */
  async checkAnyRows(sqlQuery) {
  }
}
