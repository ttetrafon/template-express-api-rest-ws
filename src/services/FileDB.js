import { MongoClient } from 'mongodb';
import { Logger } from './Logger.js';
import { templateFileDbData } from '../data/db-seed.js';
import { fileDbNames } from '../data/enums.js';
import { fileDbClientFromEnv } from '../helper/configuration.js';

export class FileDB {
  constructor() {
    if (FileDB._instance) {
      return FileDB._instance;
    }
    FileDB._instance = this;

    this.logger = new Logger();
    this.logger.info(`---> FileDB`);

    this.fileDbClient;
  }

  async connectToFileDb() {
    this.logger.debug(`---> connectToFileDb()`);
    if (this.fileDbClient && this.fileDbClient.topology.isConnected()) {
      this.logger.debug('... FileDB is already connected');
      return
    };

    try {
      this.client();
      await this.fileDbClient.connect();

      // this.testDb = this.fileDbClient.db('test-db');
      // this.testCollection = this.testDb.collection('test-collection');

      this.logger.debug("... connected to FileDB");
      this.getAppDataDb();
      this.getGameplayDb();
    }
    catch (err) {
      this.logger.error(err);
    }
  }
  client() {
    if (!this.fileDbClient) {
      this.fileDbClient = new MongoClient(fileDbClientFromEnv());
    }
  }

  /**
   *
   * @param {Symbol} db: The name of the DB.
   * @param {Array[Symbol]} collections: The names of the collections in the given DB.
   */
  async getDbAndCollections(db, collections) {
    this.logger.debug(`---> getDbAndCollections()`);
    if (this[db] && collections.every(col => this[col.description] != null && this[col.description] != undefined)) {
      this.logger.debug(`... ${ db.description } is already accessible`);
    }

    try {
      this[db] = this.fileDbClient.db(db.description);
      collections.forEach(col => {
        this[col] = this[db].collection(col.description);
      });
      this.logger.debug(`... successfully established access to ${ db.description }`);
    }
    catch (err) {
      this.logger.error(err);
    }
  }
  /**
   *
   */
  async getAppDataDb() {
    this.logger.debug(`---> getAppDataDb()`);
    await this.getDbAndCollections(
      fileDbNames.DB_APP_DATA,
      [
        fileDbNames.COL_APP_STRUCTURE
      ]
    );
  }
  /**
   *
   */
  async getGameplayDb() {
    this.logger.debug(`---> getGameplayDb()`);
    await this.getDbAndCollections(
      fileDbNames.DB_GAME_DATA,
      [
        fileDbNames.COL_GENERAL_GAMEPLAY
      ]
    );
  }

  /**
   *
   * @param {Symbol} db
   * @param {Symbol} collection
   * @param {Symbol} key
   * @returns {JSON}
   */
  async retrieveDataFile(collection, key) {
    this.logger.debug(`--> retrieveDataFile(${ collection.description }, ${ key.description })`);
    const query = { _id: key.description };
    let document = await this[collection].findOne(query);

    if (!document) {
      this.logger.warn("document non-existent: creating from template");
      document = templateFileDbData[collection][key];
      await this.storeDataFile(collection, key, document);
    }

    this.logger.debug(`retrieved document: ${ JSON.stringify(document) }`);
    return document;
  }

  /**
   *
   * @param {String} collection
   * @param {String} key
   * @param {JSON} json
   * @returns {String}
   */
  async storeDataFile(collection, key, json) {
    this.logger.debug(`--> storeDataFile(${ collection.description }, ${ key.description }, ${ JSON.stringify(json) })`);
    let document = {
      _id: key.description,
      ...json
    };
    let result = await this[collection].insertOne(document);
    this.logger.debug(`Data inserted with key (_id): ${ result.insertedId }`);
    return result;
  }
}
