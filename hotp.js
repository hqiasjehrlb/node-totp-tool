const crypto = require('crypto');

module.exports.genHOTP = genHOTP;

/**
 * @param {string} key 
 * @param {number} counter 
 */
function genHOTP (key, counter) {
  const digest = crypto.createHmac('sha1', Buffer.from(key))
    .update(Buffer.from(intToBytes(counter)))
    .digest('hex');
  const h = hexToBytes(digest);
  const offset = h[19] & 0xf;
  const v = `${((h[offset] & 0x7f) << 24 |
    (h[offset + 1] & 0xff) << 16 |
    (h[offset + 2] & 0xff) << 8 |
    (h[offset + 3] & 0xff)) % 1000000}`;
  return Array(7 - v.length).join('0') + v;
}

/**
 * @param {number} num 
 */
function intToBytes (num) {
  const bytes = [];
  for (let i = 7; i >= 0; i--) {
    bytes[i] = num & (255);
    num = num >> 8;
  }
  return bytes;
}

/**
 * @param {string} hex  
 */
function hexToBytes (hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c +=2) {
    bytes.push(parseInt(hex.substring(c, c + 2), 16));
  }
  return bytes;
}
