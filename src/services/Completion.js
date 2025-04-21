import { Logger } from "./Logger.js";

export class CompletionServices {
  constructor() {
    if (CompletionServices._instance) {
      return CompletionServices._instance;
    }
    CompletionServices._instance = this;

    this.logger = new Logger();
    this.logger.info(`---> CompletionServices`);

    this.completionCodes = {
      OK: {code: 0, message: "Ok"},
      UNKNOWN_ERROR: {code: 9999, message: "Unknown error!"}
    };

    // If any of these properties is found in a response, it will be blocked and an error will be thrown.
    this.PROTECTED_PROPERTIES = [
    ];

    // If any of the following properties is found in a response, it will be removed.
    this.REDACTED_PROPERTIES = [
      '_id',
      'schemaVersion'
    ];
  }

  /**
   *
   * @param {Request} request
   * @param {Response} response
   * @param {Object} additionalProperties
   */
  async sendOkResponse(request, response, additionalProperties) {
    this.logger.info('---> sendOkResponse()');
    let responseObj = await this.buildResponseObj(request, this.completionCodes.OK, additionalProperties);
    response.json(responseObj);
  }

  /**
   *
   * @param {Request} request
   * @param {Response} response
   * @param {Object} completionCode
   * @param {Object} additionalProperties
   */
  async sendFailResponse(request, response, completionCode, additionalProperties) {
    this.logger.info('---> sendFailResponse()');
    let responseObj = await this.buildResponseObj(request, completionCode, additionalProperties);
    // TODO: map internal errors to actual html error codes
    let status = 500;
    response.status(status).json(responseObj);
  }

  /**
   *
   * @param {Request} request
   * @param {Object} completionCode
   * @param {Object} additionalProperties
   * @returns
   */
  async buildResponseObj(request, completionCode, additionalProperties) {
    this.logger.info("Building response object");

    var responseObj = {};
    // Add these first. This allows additionalProperties param to be used to change them.
    // For example to change the 'Ok' message to something more meaningful.
    responseObj.completionCode = completionCode.code;
    responseObj.completionMessage = completionCode.message;
    if (request.body.hasOwnProperty("UUID")) {
      responseObj.UUID = request.body.UUID;
    }
    if (additionalProperties) {
      await this.checkProperties(additionalProperties);
      Object.assign(responseObj, additionalProperties);
    }
    this.logger.info(`request responseObj: ${JSON.stringify(responseObj)}`);
    return responseObj;
  }

  /**
   * Sanitise outgoing data based on property names
   * @param {Object} responseObj
   */
  async checkProperties(obj) {
    if ((typeof obj != 'object') || (obj === null) || (obj instanceof Array)) {
      return;
    }
    var properties = Object.keys(obj);
    properties.forEach((prop) => {
      if (this.PROTECTED_PROPERTIES.includes(prop)) {
        throw new Error('Protected property ' + prop + ' found in response!');
      }
      else if (this.REDACTED_PROPERTIES.includes(prop)) {
        delete obj[prop];
      }
      else {
        if (typeof obj[prop] === 'object') {
          this.checkProperties(obj[prop]);
        }
      }
    });
  }
}
