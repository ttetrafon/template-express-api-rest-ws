import { randomBytes, scrypt, timingSafeEqual } from "crypto"
import { promisify } from "util"

import { Logger } from "./Logger.js";
import { SqlDB } from './SqlDB.js';
import { jtwSign } from '../helper/jwt.js';

export class User {
  constructor() {
    if (User._instance) {
      return User._instance;
    }
    User._instance = this;

    this.logger = new Logger();
    this.logger.info(`---> FileDB`);

    this.db = new SqlDB();
    this.scryptPromise = promisify(scrypt);
  }

  /**
   * Verifies the user's password against their username, and returns an encrypted jwt token holding the username and expiration date.
   * @param {Request} request
   * @param {Response} response
   */
  async login(request, response) {
    this.logger.info(`--> User.login()`);
    let username = request.body.username;
    let password = request.body.password;

    let previousHash = await this.db.getUserPass(request, username);

    if (await this.verifyPassword(password, previousHash)) {
      let token = jtwSign({username});
      await this.completionServices.sendOkResponse(request, response, { token });
    }
    else {
      await this.completionServices.sendFailResponse(request, response, this.completionServices.completionCodes.SIGN_IN_INCORRECT_CREDENTIALS);
    }
  }

  /**
   * Creates a new user given the given details.
   * @param {Request} request
   * @param {Response} response
   */
  async newUser(request, response) {
    this.logger.info(`--> User.newUser()`);
    let username = request.body.username;
    let tel = request.body.tel;
    let email = request.body.email;
    let password = request.body.password;

    let hiddenPass = await this.hashPassword(password);
    await this.db.createUser(request, username, email, tel, hiddenPass);

    await this.completionServices.sendOkResponse(request, response);
  }

  // ------------------- //
  // ----- HELPERS ----- //
  // ------------------- //
  /**
   * Salts & hashes the user's password for safe storage in the DB.
   * @param {String} password
   * @returns
   */
  async hashPassword (password) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = await this.scryptPromise(password, salt, 64);
    return salt + ":" + derivedKey.toString("hex");
  }

  /**
   * Verifies that the incoming password matches the stored hash.
   * @param {String} password as received from the user
   * @param {String} hash as stored in the DB
   * @returns
   */
  async verifyPassword(password, hash) {
    const [salt, key] = hash.split(":");
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = await this.scryptPromise(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedKey)
  }
}
