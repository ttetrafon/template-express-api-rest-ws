export const requestPermissionMappings = {
};

export const userRolesPermissions = {
};

export function isDev() {
  // Determine if this is running locally
  // TODO: currently working on windows, better use something on the server - specific env variable?
  let operatingSystem = process.platform;
  return operatingSystem.startsWith("win");
}

export function fileDbClientFromEnv() {
  return getEnvParam("FILES_DB");
}

export function sqlDbClientFromEnv() {
  return {
    host: getEnvParam("SQL_HOST"),
    port: parseInt(getEnvParam("SQL_PORT")),
    user: getEnvParam("SQL_USER"),
    password: getEnvParam("SQL_PASSWORD"),
    database: getEnvParam("SQL_DATABASE"),
    connectionLimit: parseInt(getEnvParam("SQL_CONNECTION_LIMIT"))
  };
}

/**
 *
 * @param {String} key
 * @param {String} defaultValue
 * @returns
 */
function getEnvParam(key, defaultValue) {
  let value = process.env[key];
  return value == null || value == undefined ? defaultValue : value;
}
