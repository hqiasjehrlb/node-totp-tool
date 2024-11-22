# TOTP-Tool

## Install

```shell
npm i totp-tool
```

## Usage

```javascript
const totp = require('totp-tool');

// The generated uri is for generate scanable QR code
// The secret is base32 encoded key for generate TOTP token
const { uri, secret } = totp.genSecret('MyApplication','UserAccount');

// The token is 6 digits TOTP token
const token = totp.genToken(secret);

// Will return object when token is correct, return null when token incorrect.
const chk = totp.verifyToken(secret, token);
```
