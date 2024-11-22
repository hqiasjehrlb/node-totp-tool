const { genHOTP } = require('./hotp');

module.exports.genTOTP = genTOTP;
module.exports.verifyTOTP = verifyTOTP;

/**
 * @param {string} key 
 */
function genTOTP (key) {
  const counter = getCounter();
  return genHOTP(key, counter);
}

/**
 * @param {string} token 
 * @param {string} key 
 * @param {number} window should be integer, 1 window = ± 30 sec.
 */
function verifyTOTP (token, key, window) {
  const counter = getCounter();
  for (let i = counter - window; i <= counter + window; i++) {
    if (genHOTP(key, i) === token) {
      return { delta: i - counter };
    }
  }
  return null;
}

function getCounter () {
  return Math.floor((Date.now() / 1000) / 30);
}
