const { URL } = require('url');
const crypto = require('crypto');

const { encode: b32Encode, decode: b32Decode } = require('./base32');
const { genTOTP, verifyTOTP } = require('./totp');

module.exports.genSecret = genSecret;
module.exports.genToken = genToken;
module.exports.verifyToken = verifyToken;

/**
 * @param {string} appName 
 * @param {string} account 
 */
function genSecret (appName, account) {
  const bin = crypto.randomBytes(20);
  const secret = b32Encode(bin)
    .toString()
    .replace(/=*$/, '');
  const uri = new URL('otpauth://totp');
  uri.pathname = [
    encodeURIComponent(appName),
    encodeURIComponent(account)
  ].join(':');
  const q = [
    '?secret=', secret,
    '&issuer=', encodeURIComponent(appName)
  ].join('');
  return {
    secret,
    uri: [uri.toString(), q].join('')
  };
}

/**
 * @param {string} secret base32 encoded string
 */
function genToken (secret) {
  return genTOTP(b32Decode(secret));
}

/**
 * @param {string} secret 
 * @param {string} token 
 * @param {number} window 
 */
function verifyToken (secret, token, window = 0) {
  return verifyTOTP(token, b32Decode(secret), window);
}