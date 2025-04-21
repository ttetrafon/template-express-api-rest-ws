/**
 * Returns the powers of 2 that are added to get the input number.
 * @param {number} num Integer to be split into powers of 2.
 * @returns
 */
export function getPowersOfTwo(num) {
  var i = 1;
  var powers = [];
  while (i <= num) {
    if ((i & num) > 0) {
      powers.push(i);
    }
    i <<= 1;
  }
  return powers;
}
