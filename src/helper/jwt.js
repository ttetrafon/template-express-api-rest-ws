import pkg from "jsonwebtoken";
import { jtwSecretKey, requestPermissionMappings } from './configuration.js';
import { getPowersOfTwo } from "./numbers.js";

/**
 *
 * @param {Object} payload
 * @returns
 */
export function jtwSign(payload) {
  return pkg.sign(payload, jtwSecretKey, { expiresIn: '4h' });
}

/**
 *
 * @param {String} token
 * @returns
 */
export function jwtVerify(token) {
  let res = false;
  try {
    res = pkg.verify(token, jtwSecretKey);
  }
  catch(exc) {
    res = false;
  }
  return res;
}

/**
 *
 * @param {String} requestType
 * @param {number} accessLevel An integer denoting the permission boundary for the user as stored in the DB (USER.AccessLevel)
 */
export function authoriseUser(requestType, accessLevel) {
  let requestLevel = requestPermissionMappings[requestType];
  let requestLevelList = getPowersOfTwo(requestLevel);
  let accessLevelList = getPowersOfTwo(accessLevel);
  return accessLevelList.some(r => requestLevelList.includes(r));
}
