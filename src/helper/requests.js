export function getRequestHeaders(extraHeaders) {
  let headers = {
    "Accept": "*/*",
    "Connection": "keep-alive",
    "Content-Type": "application/json"
  };
  if (extraHeaders) Object.assign(headers, extraHeaders);
  return headers;
}

/**
 * Makes a post request and returns the response body or null.
 * @param {String} url
 * @param {Object} headers
 * @param {JSON} body json body to include in the request
 * @returns
 */
export async function requestPost(url, headers, body) {
  let resp = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: headers
  });
  if (!resp.ok) return null;

  let data = await resp.json();
  return data;
}
