module.exports.encode = encode;
module.exports.decode = decode;

const charTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const byteTable = [
  0xff, 0xff, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
  0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
  0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
  0x17, 0x18, 0x19, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
  0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
  0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
  0x17, 0x18, 0x19, 0xff, 0xff, 0xff, 0xff, 0xff
];

/**
 * @param {Buffer|string} plain 
 */
function encode (plain) {
  if (!Buffer.isBuffer(plain) && typeof plain !== 'string') {
    throw new TypeError('base32.encode only takes Buffer or string as parameter');
  }
  const buf = Buffer.isBuffer(plain) ? plain : Buffer.from(plain);
  let i = 0;
  let j = 0;
  let shiftIndex = 0;
  let digit = 0;
  const encoded = Buffer.alloc(quintetCount(buf) * 8);

  for (; i < buf.length; j++) {
    const curr = buf[i];
    if (shiftIndex > 3) {
      digit = curr & (0xff >> shiftIndex);
      shiftIndex = (shiftIndex + 5) % 8;
      digit = (digit << shiftIndex) | ((i + 1 < buf.length) ? buf[i + 1] : 0) >> (8 - shiftIndex);
      i++;
    } else {
      digit = (curr >> (8 - (shiftIndex + 5))) & 0x1f;
      shiftIndex = (shiftIndex + 5) % 8;
      if (shiftIndex === 0) {
        i++;
      }
    }
    encoded[j] = charTable.charCodeAt(digit);
  }

  for (i = j; i < encoded.length; i++) {
    encoded[i] = 0x3d;
  }
  return encoded;
}

/**
 * @param {Buffer|string} encoded 
 */
function decode (encoded) {
  if (!Buffer.isBuffer(encoded) && typeof encoded !== 'string') {
    throw new TypeError('base32.decode only takes Buffer or string as parameter');
  }
  const buf = Buffer.isBuffer(encoded) ? encoded : Buffer.from(encoded);
  let shiftIndex = 0;
  let plainDigit = 0;
  let plainChar;
  let plainPos = 0;
  const decoded = Buffer.alloc(Math.ceil(buf.length * 5 / 8));
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0x3d) {
      break;
    }
    const encodedByte = buf[i] - 0x30;
    if (encodedByte < byteTable.length) {
      plainDigit = byteTable[encodedByte];
      if (shiftIndex <= 3) {
        shiftIndex = (shiftIndex + 5) % 8;
        if (shiftIndex === 0) {
          plainChar |= plainDigit;
          decoded[plainPos] = plainChar;
          plainPos++;
          plainChar = 0;
        } else {
          plainChar |= 0xff & (plainDigit << (8 - shiftIndex));
        }
      } else {
        shiftIndex = (shiftIndex + 5) % 8;
        plainChar |= 0xff & (plainDigit >>> shiftIndex);
        decoded[plainPos] = plainChar;
        plainPos++;
        plainChar = 0xff & (plainDigit << (8 - shiftIndex));
      }
    } else {
      throw new Error('Invalid input - it is not base32 encoded string');
    }
  }
  return decoded.subarray(0, plainPos);
}

/**
 * @param {Buffer} buf 
 */
function quintetCount (buf) {
  const quintets = Math.floor(buf.length / 5);
  return buf.length % 5 === 0 ? quintets : quintets + 1;
}
